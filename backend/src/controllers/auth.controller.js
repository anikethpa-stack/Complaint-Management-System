const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db.config');
const { logInfo, logError } = require('../services/cloudwatch.service');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_123456789';

/**
 * Register a new Student
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Simple validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required fields.' });
  }

  try {
    // Check if user already exists
    const existingUsers = await db.query('SELECT id FROM Users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'A user with this email address already exists.' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user (defaults to role 'Student')
    const result = await db.query(
      'INSERT INTO Users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, 'Student', phone || null]
    );

    logInfo('User Registration Successful', { email, role: 'Student', userId: result.insertId });

    return res.status(201).json({
      message: 'Student registration completed successfully.',
      userId: result.insertId
    });
  } catch (error) {
    logError('User Registration Error', { email, error: error.message });
    return res.status(500).json({ error: 'Server error during user registration.' });
  }
};

/**
 * Authenticate User (Student, Rep, Admin)
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required fields.' });
  }

  try {
    // Find user in DB
    const users = await db.query(
      'SELECT id, name, email, password_hash, role, department_id FROM Users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      logError('Authentication Failure - User Not Found', { email });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      logError('Authentication Failure - Incorrect Password', { email });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Sign JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department_id: user.department_id
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    logInfo('User Login Successful', { email, role: user.role, userId: user.id });

    return res.json({
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department_id: user.department_id
      }
    });
  } catch (error) {
    logError('Authentication Server Error', { email, error: error.message });
    return res.status(500).json({ error: 'Server error during login authentication.' });
  }
};
