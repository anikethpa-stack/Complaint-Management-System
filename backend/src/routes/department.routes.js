const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Representative specific endpoints protected by JWT and role check
router.get(
  '/complaints', 
  authenticate, 
  authorize('Department Representative'), 
  departmentController.getDepartmentComplaints
);

router.put(
  '/complaints/:id/status', 
  authenticate, 
  authorize('Department Representative'), 
  departmentController.updateComplaintStatus
);

module.exports = router;
