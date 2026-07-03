import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Importing Page Components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GoogleSimulation from './pages/GoogleSimulation';
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
        <Routes>
          {/* Public Routes - No Layout wrapper */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login/google-simulation" element={<GoogleSimulation />} />

          {/* Student Protected Routes - wrapped in Layout */}
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <Layout>
                  <StudentDashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/submit" 
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <Layout>
                  <SubmitComplaint />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/history" 
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <Layout>
                  <ComplaintHistory />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Department Representative Protected Routes */}
          <Route 
            path="/department/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['Department Representative']}>
                <Layout>
                  <DepartmentDashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Admin Protected Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/analytics" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Layout>
                  <AnalyticsDashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Shared Protected Detail Route */}
          <Route 
            path="/complaints/:id" 
            element={
              <ProtectedRoute allowedRoles={['Student', 'Department Representative', 'Admin']}>
                <Layout>
                  <ComplaintDetails />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Redirect fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
