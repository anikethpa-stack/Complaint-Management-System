const db = require('../config/db.config');
const { uploadToS3 } = require('../services/s3.service');
const { sendNotification } = require('../services/sns.service');

/**
 * Submit a new complaint
 * POST /api/complaints
 */
exports.createComplaint = async (req, res) => {
  const { title, description, category, priority } = req.body;
  const studentId = req.user.id;
  const studentName = req.user.name;

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

    // 4. Send SNS Email notification
    const subject = `New Complaint Registered: #${complaintId}`;
    const emailBody = `Dear ${studentName},\n\n` +
      `Your complaint has been successfully registered in the portal.\n\n` +
      `Complaint Reference: #${complaintId}\n` +
      `Title: ${title}\n` +
      `Category: ${category}\n` +
      `Priority: ${complaintPriority}\n` +
      `Current Status: Pending\n\n` +
      `You can track the progress of your complaint in your Student Dashboard.\n\n` +
      `Regards,\n` +
      `Student Grievance & Complaint Management System`;

    // Send async and don't block response
    sendNotification(subject, emailBody);

    return res.status(201).json({
      message: 'Complaint submitted successfully.',
      complaintId,
      evidenceUrl
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

    return res.json({
      complaint,
      updates
    });
  } catch (error) {
    console.error('Fetch Complaint Details Error', { complaintId, userId, error: error.message });
    return res.status(500).json({ error: 'Server error while retrieving complaint details.' });
  }
};
