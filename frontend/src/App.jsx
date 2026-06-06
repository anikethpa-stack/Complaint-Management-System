import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Importing Page Components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import ComplaintHistory from './pages/ComplaintHistory';
import ComplaintDetails from './pages/ComplaintDetails';
import DepartmentDashboard from './pages/DepartmentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

import './App.css';

/**
 * Main application routing configuration
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Protected Routes */}
            <Route 
              path="/student/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/submit" 
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <SubmitComplaint />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/history" 
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <ComplaintHistory />
                </ProtectedRoute>
              } 
            />

            {/* Department Representative Protected Routes */}
            <Route 
              path="/department/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['Department Representative']}>
                  <DepartmentDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Admin Protected Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/analytics" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AnalyticsDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Shared Protected Detail Route */}
            <Route 
              path="/complaints/:id" 
              element={
                <ProtectedRoute allowedRoles={['Student', 'Department Representative', 'Admin']}>
                  <ComplaintDetails />
                </ProtectedRoute>
              } 
            />

            {/* Redirect fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
