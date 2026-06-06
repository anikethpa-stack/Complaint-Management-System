import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

/**
 * Public Landing Page of the Grievance Portal
 */
const Home = () => {
  const { user } = useContext(AuthContext);

  // If user is already authenticated, redirect them directly to their corresponding dashboard
  if (user) {
    if (user.role === 'Student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'Department Representative') return <Navigate to="/department/dashboard" replace />;
    if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="container py-5">
      {/* Hero Welcome banner */}
      <div className="row align-items-center justify-content-center min-vh-75 text-center text-lg-start py-5">
        <div className="col-lg-6 mb-5 mb-lg-0">
          <div className="badge bg-primary px-3 py-2 rounded-pill text-uppercase tracking-wider mb-3 fs-8">
            HEI Grievance Management
          </div>
          <h1 className="display-4 fw-extrabold text-white mb-3 font-heading">
            Voice Your Concerns.<br />
            <span className="hero-gradient">Track Resolutions in Real-Time.</span>
          </h1>
          <p className="lead text-muted mb-4">
            A secured, transparent cloud-integrated portal for higher education institutions to register, delegate, and resolve academic and infrastructural grievances efficiently.
          </p>
          <div className="d-flex flex-column flex-sm-row gap-3">
            <Link to="/login" className="btn btn-premium-primary text-center px-4 py-3">
              <i className="bi bi-box-arrow-in-right me-2"></i> Log In to Portal
            </Link>
            <Link to="/register" className="btn btn-premium-secondary text-center px-4 py-3">
              <i className="bi bi-person-plus me-2"></i> Student Registration
            </Link>
          </div>
        </div>

        <div className="col-lg-6 text-center">
          <div className="glass-card p-5 d-inline-block text-start" style={{ maxWidth: '480px' }}>
            <h4 className="text-white mb-4">Complaint Workflow</h4>
            
            <div className="d-flex mb-4">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                <strong className="fs-5">1</strong>
              </div>
              <div>
                <h6 className="text-white mb-1">File complaint</h6>
                <p className="text-muted fs-7 mb-0">Students submit details with PDF or image files uploaded securely to AWS S3.</p>
              </div>
            </div>

            <div className="d-flex mb-4">
              <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                <strong className="fs-5">2</strong>
              </div>
              <div>
                <h6 className="text-white mb-1">Administrative assignment</h6>
                <p className="text-muted fs-7 mb-0">System admins evaluate severity, map to departments, and assign responsibilities.</p>
              </div>
            </div>

            <div className="d-flex mb-4">
              <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                <strong className="fs-5">3</strong>
              </div>
              <div>
                <h6 className="text-white mb-1">Investigation & update</h6>
                <p className="text-muted fs-7 mb-0">Representatives resolve issues, logging comments with automated email notifications via AWS SNS.</p>
              </div>
            </div>

            <div className="d-flex">
              <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                <strong className="fs-5">4</strong>
              </div>
              <div>
                <h6 className="text-white mb-1">Official closure</h6>
                <p className="text-muted fs-7 mb-0">Admins review status reports and formally close tickets, keeping audits clean.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Showcase */}
      <div className="row text-center mt-5 pt-4">
        <h2 className="text-white mb-5">Supported Grievance Spheres</h2>
        
        <div className="col-md-4 mb-4">
          <div className="glass-card p-4 h-100">
            <i className="bi bi-book-half text-primary display-5 mb-3 d-block"></i>
            <h5 className="text-white mb-2">Academic & Curriculum</h5>
            <p className="text-muted fs-7 mb-0">Attendance issues, faculty performance feedbacks, exam evaluations, and internal marks issues.</p>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="glass-card p-4 h-100">
            <i className="bi bi-building text-secondary display-5 mb-3 d-block"></i>
            <h5 className="text-white mb-2">Infrastructures</h5>
            <p className="text-muted fs-7 mb-0">Power failures, laboratory equipment glitches, projector failures, and hostel water/food audits.</p>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="glass-card p-4 h-100">
            <i className="bi bi-briefcase text-success display-5 mb-3 d-block"></i>
            <h5 className="text-white mb-2">Placements & Careers</h5>
            <p className="text-muted fs-7 mb-0">Internship training, placement scheduling problems, resource drives, and library access restrictions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
