import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

/**
 * Common Layout component providing navigation and sidebar frames tailored to roles
 */
const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // If the user isn't logged in, don't wrap layout elements around children
  if (!user) {
    return <div className="fade-in">{children}</div>;
  }

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="min-vh-100 d-flex flex-column fade-in">
      {/* Top Header Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark navbar-custom py-3 px-4 sticky-top">
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <i className="bi bi-shield-fill-exclamation text-primary fs-3 me-2"></i>
            <span className="fw-bold tracking-tight text-white font-heading">
              GrievancePortal <span className="fs-6 text-primary fw-light">HEI</span>
            </span>
          </Link>
          
          <div className="d-flex align-items-center">
            <div className="text-end me-3 d-none d-md-block">
              <span className="text-light d-block fs-7">Logged in as</span>
              <span className="text-primary fw-semibold fs-6">{user.name}</span>
            </div>
            
            <button className="btn btn-outline-danger btn-sm rounded-pill px-3 py-2" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i> Log Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Panel Wrapper */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar Navigation */}
        <aside className="sidebar-custom col-md-3 col-lg-2 d-none d-md-block p-3">
          <div className="sticky-top" style={{ top: '90px' }}>
            <div className="text-center py-3 mb-4 border-bottom border-secondary">
              <div className="bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                   style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>
                <i className="bi bi-person-fill fs-3"></i>
              </div>
              <h6 className="mb-0 text-truncate text-white px-1 fs-6">{user.name}</h6>
              <span className="badge bg-secondary mt-1 fs-8 text-uppercase tracking-wider">{user.role}</span>
            </div>

            <nav className="nav flex-column">
              {user.role === 'Student' && (
                <>
                  <Link to="/student/dashboard" className={`sidebar-link ${isActive('/student/dashboard')}`}>
                    <i className="bi bi-speedometer2"></i> Dashboard
                  </Link>
                  <Link to="/student/submit" className={`sidebar-link ${isActive('/student/submit')}`}>
                    <i className="bi bi-plus-circle"></i> File Grievance
                  </Link>
                  <Link to="/student/history" className={`sidebar-link ${isActive('/student/history')}`}>
                    <i className="bi bi-clock-history"></i> Track History
                  </Link>
                </>
              )}

              {user.role === 'Department Representative' && (
                <>
                  <Link to="/department/dashboard" className={`sidebar-link ${isActive('/department/dashboard')}`}>
                    <i className="bi bi-journal-check"></i> Assigned Worklist
                  </Link>
                </>
              )}

              {user.role === 'Admin' && (
                <>
                  <Link to="/admin/dashboard" className={`sidebar-link ${isActive('/admin/dashboard')}`}>
                    <i className="bi bi-kanban"></i> Portal Console
                  </Link>
                  <Link to="/admin/analytics" className={`sidebar-link ${isActive('/admin/analytics')}`}>
                    <i className="bi bi-bar-chart-line-fill"></i> Analytics metrics
                  </Link>
                </>
              )}
            </nav>
          </div>
        </aside>

        {/* Action Window Content */}
        <main className="flex-grow-1 p-4 overflow-hidden" style={{ minWidth: 0 }}>
          <div className="container-fluid p-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
