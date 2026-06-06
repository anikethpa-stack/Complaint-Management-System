const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Apply Admin role-guard middleware to all routes in this file
router.use(authenticate, authorize('Admin'));

// Complaints management
router.get('/complaints', adminController.getAllComplaints);
router.post('/assign', adminController.assignComplaint);
router.put('/escalate', adminController.escalateComplaint);
router.put('/close', adminController.closeComplaint);
router.get('/analytics', adminController.getAnalytics);

// User Management (Reps, Students)
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createRep);
router.delete('/users/:id', adminController.deleteUser);

// Department management
router.get('/departments', adminController.getDepartments);
router.post('/departments', adminController.createDepartment);

module.exports = router;
