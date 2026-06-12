const db = require('../config/db.config');
const bcrypt = require('bcrypt');
const { sendNotification } = require('../services/sns.service');

/**
 * Fetch all complaints with filters
 * GET /api/admin/complaints
 */
exports.getAllComplaints = async (req, res) => {
  const { status, priority, department_id, category } = req.query;
  let queryStr = `
    SELECT c.id, c.title, c.description, c.category, c.priority, c.status, c.created_at, c.evidence_url,
           s.name AS student_name, s.email AS student_email,
           d.name AS department_name
    FROM Complaints c
    JOIN Users s ON c.student_id = s.id
    LEFT JOIN Departments d ON c.department_id = d.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    queryStr += ' AND c.status = ?';
    params.push(status);
  }
  if (priority) {
    queryStr += ' AND c.priority = ?';
    params.push(priority);
  }
  if (department_id) {
    queryStr += ' AND c.department_id = ?';
    params.push(parseInt(department_id, 10));
  }
  if (category) {
    queryStr += ' AND c.category = ?';
    params.push(category);
  }

  queryStr += ' ORDER BY c.created_at DESC';

  try {
    const complaints = await db.query(queryStr, params);
    return res.json(complaints);
  } catch (error) {
    console.error('Admin Fetch All Complaints Error', { error: error.message });
    return res.status(500).json({ error: 'Server error while fetching complaints.' });
  }
};

/**
 * Assign complaint to a department and set priority
 * POST /api/admin/assign
 */
exports.assignComplaint = async (req, res) => {
  const { complaint_id, department_id, priority } = req.body;
  const adminId = req.user.id;

  if (!complaint_id || !department_id) {
    return res.status(400).json({ error: 'Complaint ID and Department ID are required.' });
  }

  try {
    // 1. Fetch current status of complaint
    const currentList = await db.query('SELECT status, title, student_id FROM Complaints WHERE id = ?', [complaint_id]);
    if (currentList.length === 0) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }
    const complaint = currentList[0];
    const originalStatus = complaint.status;

    // Fetch department name
    const deptList = await db.query('SELECT name FROM Departments WHERE id = ?', [department_id]);
    if (deptList.length === 0) {
      return res.status(404).json({ error: 'Department not found.' });
    }
    const departmentName = deptList[0].name;

    // 2. Update status to 'Assigned' and link to department
    const updateParams = [department_id, 'Assigned'];
    let updateQuery = 'UPDATE Complaints SET department_id = ?, status = ?';
    
    if (priority) {
      updateQuery += ', priority = ?';
      updateParams.push(priority);
    }
    
    updateQuery += ' WHERE id = ?';
    updateParams.push(complaint_id);

    await db.query(updateQuery, updateParams);

    // 3. Write to Audit Updates Log
    const remarks = `Complaint assigned to department "${departmentName}"${priority ? ` with priority "${priority}"` : ''} by administrator.`;
    await db.query(
      'INSERT INTO ComplaintUpdates (complaint_id, user_id, status_from, status_to, remarks) VALUES (?, ?, ?, ?, ?)',
      [complaint_id, adminId, originalStatus, 'Assigned', remarks]
    );

    // 4. Create internal notifications
    // Notify Student
    await db.query(
      'INSERT INTO Notifications (user_id, message) VALUES (?, ?)',
      [complaint.student_id, `Your complaint #${complaint_id} has been assigned to the ${departmentName} Department.`]
    );

    // Notify Department Representatives
    const reps = await db.query('SELECT id FROM Users WHERE role = ? AND department_id = ?', ['Department Representative', department_id]);
    for (const rep of reps) {
      await db.query(
        'INSERT INTO Notifications (user_id, message) VALUES (?, ?)',
        [rep.id, `A new complaint #${complaint_id} has been assigned to your department.`]
      );
    }

    console.log('Admin Action - Assign Complaint', { complaint_id, department_id, priority });

    // 5. Send SNS Alert to Student
    const studentUser = await db.query('SELECT name, email FROM Users WHERE id = ?', [complaint.student_id]);
    if (studentUser.length > 0) {
      const student = studentUser[0];
      const subject = `Complaint Assigned Notice: #${complaint_id}`;
      const emailBody = `Dear ${student.name},\n\n` +
        `Your complaint is now assigned to the ${departmentName} Department.\n\n` +
        `Complaint Reference: #${complaint_id}\n` +
        `Title: ${complaint.title}\n` +
        `Current Status: Assigned\n\n` +
        `The designated department representative will start working on it shortly.\n\n` +
        `Regards,\n` +
        `Student Grievance & Complaint Management System`;
      
      sendNotification(subject, emailBody);
    }

    return res.json({
      message: `Complaint assigned to ${departmentName} successfully.`,
      complaint_id
    });
  } catch (error) {
    console.error('Admin Assign Complaint Error', { complaint_id, error: error.message });
    return res.status(500).json({ error: 'Server error while assigning complaint.' });
  }
};

/**
 * Escalate priority level & log remarks
 * PUT /api/admin/escalate
 */
exports.escalateComplaint = async (req, res) => {
  const { complaint_id, priority, remarks } = req.body;
  const adminId = req.user.id;

  if (!complaint_id || !priority || !remarks) {
    return res.status(400).json({ error: 'Complaint ID, priority, and escalation remarks are required.' });
  }

  try {
    const list = await db.query('SELECT status, priority, student_id, title FROM Complaints WHERE id = ?', [complaint_id]);
    if (list.length === 0) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }
    const complaint = list[0];
    const oldPriority = complaint.priority;

    // Update DB
    await db.query('UPDATE Complaints SET priority = ? WHERE id = ?', [priority, complaint_id]);

    // Save history audit trail
    const auditRemarks = `Priority escalated from "${oldPriority}" to "${priority}". Reason: ${remarks}`;
    await db.query(
      'INSERT INTO ComplaintUpdates (complaint_id, user_id, status_from, status_to, remarks) VALUES (?, ?, ?, ?, ?)',
      [complaint_id, adminId, complaint.status, complaint.status, auditRemarks]
    );

    // Notify Student
    await db.query(
      'INSERT INTO Notifications (user_id, message) VALUES (?, ?)',
      [complaint.student_id, `The priority of your complaint #${complaint_id} was updated to "${priority}".`]
    );

    console.log('Admin Action - Escalate Complaint Priority', { complaint_id, from: oldPriority, to: priority });

    // Send SNS email update
    const studentUser = await db.query('SELECT name, email FROM Users WHERE id = ?', [complaint.student_id]);
    if (studentUser.length > 0) {
      const student = studentUser[0];
      const subject = `Complaint Escalation Alert: #${complaint_id}`;
      const emailBody = `Dear ${student.name},\n\n` +
        `Your complaint priority has been escalated by the administrator.\n\n` +
        `Complaint Reference: #${complaint_id}\n` +
        `Title: ${complaint.title}\n` +
        `New Priority Level: ${priority}\n` +
        `Administrator Remarks: "${remarks}"\n\n` +
        `Regards,\n` +
        `Student Grievance & Complaint Management System`;
      
      sendNotification(subject, emailBody);
    }

    return res.json({
      message: `Complaint priority escalated to ${priority} successfully.`,
      complaint_id
    });
  } catch (error) {
    console.error('Admin Escalate Complaint Error', { complaint_id, error: error.message });
    return res.status(500).json({ error: 'Server error while escalating complaint.' });
  }
};

/**
 * Close a complaint (must be resolved first, or close directly)
 * PUT /api/admin/close
 */
exports.closeComplaint = async (req, res) => {
  const { complaint_id, remarks } = req.body;
  const adminId = req.user.id;

  if (!complaint_id || !remarks) {
    return res.status(400).json({ error: 'Complaint ID and closing remarks are required.' });
  }

  try {
    const list = await db.query('SELECT status, student_id, title FROM Complaints WHERE id = ?', [complaint_id]);
    if (list.length === 0) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }
    const complaint = list[0];
    const originalStatus = complaint.status;

    // Set status to Closed
    await db.query('UPDATE Complaints SET status = ? WHERE id = ?', ['Closed', complaint_id]);

    // Log update audit trail
    await db.query(
      'INSERT INTO ComplaintUpdates (complaint_id, user_id, status_from, status_to, remarks) VALUES (?, ?, ?, ?, ?)',
      [complaint_id, adminId, originalStatus, 'Closed', remarks]
    );

    // Notify Student
    await db.query(
      'INSERT INTO Notifications (user_id, message) VALUES (?, ?)',
      [complaint.student_id, `Your complaint #${complaint_id} has been officially closed by the administrator.`]
    );

    console.log('Admin Action - Close Complaint', { complaint_id, adminId });

    // Send SNS email alert
    const studentUser = await db.query('SELECT name, email FROM Users WHERE id = ?', [complaint.student_id]);
    if (studentUser.length > 0) {
      const student = studentUser[0];
      const subject = `Complaint Closed: #${complaint_id}`;
      const emailBody = `Dear ${student.name},\n\n` +
        `Your complaint has been marked as CLOSED by the administrator.\n\n` +
        `Complaint Reference: #${complaint_id}\n` +
        `Title: ${complaint.title}\n` +
        `Resolution Remarks: "${remarks}"\n\n` +
        `If you have any further grievances, please submit a new ticket in the portal.\n\n` +
        `Regards,\n` +
        `Student Grievance & Complaint Management System`;
      
      sendNotification(subject, emailBody);
    }

    return res.json({
      message: 'Complaint closed successfully.',
      complaint_id
    });
  } catch (error) {
    console.error('Admin Close Complaint Error', { complaint_id, error: error.message });
    return res.status(500).json({ error: 'Server error while closing complaint.' });
  }
};

/**
 * Fetch Analytics Dashboard data
 * GET /api/admin/analytics
 */
exports.getAnalytics = async (req, res) => {
  try {
    // Total numbers
    const totalResult = await db.query('SELECT COUNT(*) AS total FROM Complaints');
    const total = totalResult[0].total;

    // Status breakdown
    const statusCounts = await db.query('SELECT status, COUNT(*) AS count FROM Complaints GROUP BY status');
    
    // Department breakdown
    const departmentCounts = await db.query(
      `SELECT COALESCE(d.name, 'Unassigned') AS department, COUNT(c.id) AS count 
       FROM Complaints c 
       LEFT JOIN Departments d ON c.department_id = d.id 
       GROUP BY c.department_id, d.name`
    );

    // Category breakdown
    const categoryCounts = await db.query('SELECT category, COUNT(*) AS count FROM Complaints GROUP BY category');

    // Priority breakdown
    const priorityCounts = await db.query('SELECT priority, COUNT(*) AS count FROM Complaints GROUP BY priority');

    return res.json({
      total,
      statusCounts,
      departmentCounts,
      categoryCounts,
      priorityCounts
    });
  } catch (error) {
    console.error('Admin Analytics Fetch Error', { error: error.message });
    return res.status(500).json({ error: 'Server error while retrieving analytics data.' });
  }
};

/**
 * Fetch list of students and department representatives
 * GET /api/admin/users
 */
exports.getUsers = async (req, res) => {
  const { role } = req.query;
  let sql = `
    SELECT u.id, u.name, u.email, u.role, u.phone, u.created_at,
           d.name AS department_name
    FROM Users u
    LEFT JOIN Departments d ON u.department_id = d.id
    WHERE u.role != 'Admin'
  `;
  const params = [];

  if (role) {
    sql += ' AND u.role = ?';
    params.push(role);
  }

  sql += ' ORDER BY u.created_at DESC';

  try {
    const users = await db.query(sql, params);
    return res.json(users);
  } catch (error) {
    console.error('Admin Fetch Users Error', { error: error.message });
    return res.status(500).json({ error: 'Server error while fetching users.' });
  }
};

/**
 * Create a new Department Representative
 * POST /api/admin/users
 */
exports.createRep = async (req, res) => {
  const { name, email, password, department_id, phone } = req.body;

  if (!name || !email || !password || !department_id) {
    return res.status(400).json({ error: 'Name, email, password, and department ID are required.' });
  }

  try {
    // Verify department exists
    const depts = await db.query('SELECT id FROM Departments WHERE id = ?', [department_id]);
    if (depts.length === 0) {
      return res.status(404).json({ error: 'Department not found.' });
    }

    // Check if email already registered
    const existing = await db.query('SELECT id FROM Users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'A user with this email address already exists.' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await db.query(
      'INSERT INTO Users (name, email, password_hash, role, department_id, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, 'Department Representative', department_id, phone || null]
    );

    console.log('Admin Created Department Representative', { email, departmentId: department_id, creator: req.user.id });

    return res.status(201).json({
      message: 'Department Representative user created successfully.',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Admin Create Representative Error', { email, error: error.message });
    return res.status(500).json({ error: 'Server error while creating representative.' });
  }
};

/**
 * Delete a user (Student or Rep)
 * DELETE /api/admin/users/:id
 */
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    // Verify user is not Admin
    const userList = await db.query('SELECT role FROM Users WHERE id = ?', [userId]);
    if (userList.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (userList[0].role === 'Admin') {
      return res.status(400).json({ error: 'Administrator accounts cannot be deleted.' });
    }

    await db.query('DELETE FROM Users WHERE id = ?', [userId]);
    console.log('Admin Deleted User Account', { targetUserId: userId, actionBy: req.user.id });

    return res.json({ message: 'User account deleted successfully.' });
  } catch (error) {
    console.error('Admin Delete User Error', { targetUserId: userId, error: error.message });
    return res.status(500).json({ error: 'Server error while deleting user.' });
  }
};

/**
 * Fetch Departments
 * GET /api/admin/departments
 */
exports.getDepartments = async (req, res) => {
  try {
    const departments = await db.query('SELECT * FROM Departments ORDER BY name ASC');
    return res.json(departments);
  } catch (error) {
    console.error('Admin Fetch Departments Error', { error: error.message });
    return res.status(500).json({ error: 'Server error while fetching departments.' });
  }
};

/**
 * Create a new Department
 * POST /api/admin/departments
 */
exports.createDepartment = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Department name is required.' });
  }

  try {
    const existing = await db.query('SELECT id FROM Departments WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'A department with this name already exists.' });
    }

    const result = await db.query('INSERT INTO Departments (name) VALUES (?)', [name]);
    console.log('Admin Created Department', { departmentName: name, creator: req.user.id });

    return res.status(201).json({
      message: 'Department created successfully.',
      departmentId: result.insertId,
      name
    });
  } catch (error) {
    console.error('Admin Create Department Error', { name, error: error.message });
    return res.status(500).json({ error: 'Server error while creating department.' });
  }
};
