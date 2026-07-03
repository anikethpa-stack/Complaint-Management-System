import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

/**
 * Route guard restricting access to authenticated users with permitted roles
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  // Show a loading indicator during session validation
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 style-loading">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if user is unauthenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to correct dashboard if role matches are invalid
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'Student') {
      return <Navigate to="/student/dashboard" replace />;
    } else if (user.role === 'Department Representative') {
      return <Navigate to="/department/dashboard" replace />;
    } else if (user.role === 'Admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
