const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaint.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Submit complaint (requires file parsing upload) and fetch history (Students only)
router.post(
  '/', 
  authenticate, 
  authorize('Student'), 
  upload.single('evidence'), 
  complaintController.createComplaint
);

router.get(
  '/', 
  authenticate, 
  authorize('Student'), 
  complaintController.getStudentComplaints
);

// Fetch detailed grievance history (Shared between Student, Rep, Admin - validated in controller)
router.get(
  '/:id', 
  authenticate, 
  authorize('Student', 'Department Representative', 'Admin'), 
  complaintController.getComplaintById
);

module.exports = router;
