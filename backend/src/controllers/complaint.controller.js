const db = require('../config/db.config');
const { uploadToS3, generatePresignedUrl } = require('../services/s3.service');
const { subscribeEmail, sendNotification } = require('../services/sns.service');

/**
 * Submit a new complaint
 * POST /api/complaints
 */
exports.createComplaint = async (req, res) => {
  const { title, description, category, priority } = req.body;
  const studentId = req.user.id;
  const studentName = req.user.name;
  const studentEmail = req.user.email;

  if (!title || !description || !category) {
    return res.status(400).json({ error: 'Title, description, and category are required.' });
  }

  let evidenceUrl = null;

  try {
    // 1. Upload evidence file to S3 if attached
    if (req.file) {
      console.log('File upload request received', { filename: req.file.originalname, studentId });
      evidenceUrl = await uploadToS3(req.file);
      console.log('File uploaded to S3 successfully', { evidenceUrl, studentId });
    }

    // 2. Insert complaint into MySQL Database
    const complaintPriority = priority || 'Medium';
    const result = await db.query(
      'INSERT INTO Complaints (title, description, category, priority, status, student_id, evidence_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, category, complaintPriority, 'Pending', studentId, evidenceUrl]
    );
    const complaintId = result.insertId;

    // 3. Log initial status update in ComplaintUpdates (audit log)
    await db.query(
      'INSERT INTO ComplaintUpdates (complaint_id, user_id, status_from, status_to, remarks) VALUES (?, ?, ?, ?, ?)',
      [complaintId, studentId, 'Pending', 'Pending', 'Complaint successfully submitted by the student.']
    );

    // Create notifications for the user
    await db.query(
      'INSERT INTO Notifications (user_id, message) VALUES (?, ?)',
      [studentId, `Your complaint #${complaintId} "${title}" has been successfully submitted.`]
    );

    console.log('Complaint Registered Successfully', { complaintId, studentId, priority: complaintPriority });

    // Fetch system admins to register subscription
    const admins = await db.query("SELECT email FROM Users WHERE role = 'Admin'");

    // Set up AWS SNS Subscriptions with filter policies asynchronously
    subscribeEmail(studentEmail, { email: [studentEmail] });
    if (admins.length > 0) {
      for (const admin of admins) {
        subscribeEmail(admin.email, { role: ['Admin'] });
      }
    } else {
      subscribeEmail('admin@college.edu', { role: ['Admin'] });
    }

    // 4. Send SNS Email notification to Student (targeted)
    const subject = `New Complaint Registered: #${complaintId}`;
    const emailBody = `Dear ${studentName},\n\n` +
      `Your complaint has been successfully registered in the portal.\n\n` +
      `Complaint Reference: #${complaintId}\n` +
      `Title: ${title}\n` +
      `Category: ${category}\n` +
      `Current Status: Pending\n\n` +
      `You can track the progress of your complaint in your Student Dashboard.\n\n` +
      `Regards,\n` +
      `Student Grievance & Complaint Management System`;

    sendNotification(subject, emailBody, { email: studentEmail });

    // 5. Send SNS Email notification to Admin (targeted)
    const adminSubject = `ALERT: New Complaint Registered: #${complaintId}`;
    const adminEmailBody = `Dear System Administrator,\n\n` +
      `A new complaint has been registered in the student grievance portal and requires review.\n\n` +
      `Complaint Details:\n` +
      `Reference: #${complaintId}\n` +
      `Student Name: ${studentName} (${studentEmail})\n` +
      `Title: ${title}\n` +
      `Category: ${category}\n` +
      `Priority (Requested): ${complaintPriority}\n` +
      `Current Status: Pending\n\n` +
      `Please log in to the admin dashboard to review, set priority, and assign this complaint.\n\n` +
      `Regards,\n` +
      `Student Grievance & Complaint Management System`;

    sendNotification(adminSubject, adminEmailBody, { role: 'Admin' });

    let clientEvidenceUrl = null;
    if (evidenceUrl) {
      clientEvidenceUrl = await generatePresignedUrl(evidenceUrl);
    }

    return res.status(201).json({
      message: 'Complaint submitted successfully.',
      complaintId,
      evidenceUrl: clientEvidenceUrl
    });
  } catch (error) {
    console.error('Complaint Creation Error', { studentId, error: error.message });
    return res.status(500).json({ error: 'Server error while submitting complaint.' });
  }
};

/**
 * Fetch complaint history for the logged-in Student
 * GET /api/complaints
 */
exports.getStudentComplaints = async (req, res) => {
  const studentId = req.user.id;

  try {
    const complaints = await db.query(
      `SELECT c.id, c.title, c.category, c.priority, c.status, c.created_at, c.evidence_url,
              d.name AS department_name 
       FROM Complaints c 
       LEFT JOIN Departments d ON c.department_id = d.id 
       WHERE c.student_id = ? 
       ORDER BY c.created_at DESC`,
      [studentId]
    );

    // Generate pre-signed URL for each complaint's evidence_url if it exists
    for (const complaint of complaints) {
      if (complaint.evidence_url) {
        complaint.evidence_url = await generatePresignedUrl(complaint.evidence_url);
      }
    }

    return res.json(complaints);
  } catch (error) {
    console.error('Fetch Student Complaints Error', { studentId, error: error.message });
    return res.status(500).json({ error: 'Server error while fetching complaints.' });
  }
};

/**
 * Get details & updates timeline of a specific complaint
 * GET /api/complaints/:id
 */
exports.getComplaintById = async (req, res) => {
  const complaintId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;
  const userDeptId = req.user.department_id;

  try {
    // Fetch base complaint details along with student details
    const complaints = await db.query(
      `SELECT c.*, d.name AS department_name, s.name AS student_name, s.email AS student_email, s.phone AS student_phone
       FROM Complaints c 
       LEFT JOIN Departments d ON c.department_id = d.id 
       JOIN Users s ON c.student_id = s.id 
       WHERE c.id = ?`,
      [complaintId]
    );

    if (complaints.length === 0) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const complaint = complaints[0];

    // Authorization checks
    if (userRole === 'Student' && complaint.student_id !== userId) {
      return res.status(403).json({ error: 'Access denied. You are not authorized to view this complaint.' });
    }

    if (userRole === 'Department Representative' && complaint.department_id !== userDeptId) {
      return res.status(403).json({ error: 'Access denied. This complaint is not assigned to your department.' });
    }

    // Fetch complaint status timeline / updates history
    const updates = await db.query(
      `SELECT cu.id, cu.status_from, cu.status_to, cu.remarks, cu.created_at,
              u.name AS updater_name, u.role AS updater_role
       FROM ComplaintUpdates cu
       JOIN Users u ON cu.user_id = u.id
       WHERE cu.complaint_id = ?
       ORDER BY cu.created_at ASC`,
      [complaintId]
    );

    if (complaint.evidence_url) {
      complaint.evidence_url = await generatePresignedUrl(complaint.evidence_url);
    }

    return res.json({
      complaint,
      updates
    });
  } catch (error) {
    console.error('Fetch Complaint Details Error', { complaintId, userId, error: error.message });
    return res.status(500).json({ error: 'Server error while retrieving complaint details.' });
  }
};
