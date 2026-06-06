const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Public authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
