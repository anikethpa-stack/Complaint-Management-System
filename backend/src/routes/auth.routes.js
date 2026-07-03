const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);
router.get('/stats', authController.getPublicStats);

// Protected profile updates
router.put('/update-profile', authenticate, authController.updateProfile);

module.exports = router;
