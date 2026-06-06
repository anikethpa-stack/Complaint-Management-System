const db = require('../config/db.config');
const { sendNotification } = require('../services/sns.service');
const { logInfo, logError } = require('../services/cloudwatch.service');

/**
 * Fetch complaints assigned to the representative's department
 * GET /api/department/complaints
 */
exports.getDepartmentComplaints = async (req, res) => {
  const departmentId = req.user.department_id;

  if (!departmentId) {
    return res.status(400).json({ error: 'Representative user is not associated with any department.' });
  }

  try {
    const complaints = await db.query(
      `SELECT c.id, c.title, c.description, c.category, c.priority, c.status, c.created_at, c.evidence_url,
              s.name AS student_name, s.email AS student_email
       FROM Complaints c
       JOIN Users s ON c.student_id = s.id
       WHERE c.department_id = ?
       ORDER BY c.created_at DESC`,
      [departmentId]
    );

    return res.json(complaints);
  } catch (error) {
    logError('Fetch Department Complaints Error', { departmentId, error: error.message });
    return res.status(500).json({ error: 'Server error while fetching department complaints.' });
  }
};

/**
 * Update complaint status & add remarks/resolution details
 * PUT /api/department/complaints/:id/status
 */
exports.updateComplaintStatus = async (req, res) => {
  const complaintId = req.params.id;
  const { status, remarks } = req.body;
  const repId = req.user.id;
  const repName = req.user.name;
  const departmentId = req.user.department_id;

  if (!status || !remarks) {
    return res.status(400).json({ error: 'Status and remarks are required fields.' });
  }

  // Validate allowed status transitions for department representatives
  const allowedStatuses = ['In Progress', 'Resolved'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ 
      error: `Representatives can only transition status to: ${allowedStatuses.join(', ')}.` 
    });
  }

  try {
    // 1. Fetch current complaint state and verify department ownership
    const complaints = await db.query(
      'SELECT status, department_id, student_id, title FROM Complaints WHERE id = ?',
      [complaintId]
    );

    if (complaints.length === 0) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const complaint = complaints[0];

    if (complaint.department_id !== departmentId) {
      return res.status(403).json({ error: 'Access denied. This complaint is not assigned to your department.' });
    }

    const originalStatus = complaint.status;

    // 2. Perform DB update
    await db.query(
      'UPDATE Complaints SET status = ? WHERE id = ?',
      [status, complaintId]
    );

    // 3. Add record to audit log
    await db.query(
      'INSERT INTO ComplaintUpdates (complaint_id, user_id, status_from, status_to, remarks) VALUES (?, ?, ?, ?, ?)',
      [complaintId, repId, originalStatus, status, remarks]
    );

    // 4. Create internal application notification for the student
    await db.query(
      'INSERT INTO Notifications (user_id, message) VALUES (?, ?)',
      [
        complaint.student_id, 
        `Your complaint #${complaintId} status has been updated to "${status}" by department representative ${repName}.`
      ]
    );

    logInfo('Complaint Status Updated by Representative', { 
      complaintId, 
      repId, 
      from: originalStatus, 
      to: status 
    });

    // 5. Send Email via SNS
    // First lookup Student Details
    const studentUser = await db.query('SELECT name, email FROM Users WHERE id = ?', [complaint.student_id]);
    if (studentUser.length > 0) {
      const student = studentUser[0];
      const subject = `Complaint Update Notice: #${complaintId}`;
      const emailBody = `Dear ${student.name},\n\n` +
        `Your complaint status has been updated by the department.\n\n` +
        `Complaint Reference: #${complaintId}\n` +
        `Title: ${complaint.title}\n` +
        `Updated Status: ${status}\n` +
        `Department Remarks: "${remarks}"\n\n` +
        `Regards,\n` +
        `Student Grievance & Complaint Management System`;
      
      sendNotification(subject, emailBody);
    }

    return res.json({
      message: `Complaint status updated to ${status} successfully.`,
      complaintId
    });
  } catch (error) {
    logError('Update Complaint Status Error', { complaintId, repId, error: error.message });
    return res.status(500).json({ error: 'Server error while updating complaint status.' });
  }
};
