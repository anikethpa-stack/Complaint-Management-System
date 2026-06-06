const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const complaintRoutes = require('./routes/complaint.routes');
const departmentRoutes = require('./routes/department.routes');
const adminRoutes = require('./routes/admin.routes');
const { logError } = require('./services/cloudwatch.service');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Configure specifically for client domain in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Student Grievance and Complaint Management API is active.',
    version: '1.0.0'
  });
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/department', departmentRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  logError('Unhandled Application Error', { 
    message: err.message, 
    path: req.path, 
    method: req.method 
  });
  
  const statusCode = err.status || 500;
  return res.status(statusCode).json({
    error: err.message || 'An unexpected error occurred on the server.'
  });
});

module.exports = app;
