import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

/**
 * Common Layout component providing navigation and sidebar frames tailored to roles
 */
const Layout = ({ children }) => {
  const { user, logout, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [profileForm, setProfileForm] = React.useState({
    college: user?.college || '',
    branch: user?.branch || '',
    semester_year: user?.semester_year || '',
    degree: user?.degree || '',
    phone: user?.phone || '',
    name: user?.name || ''
  });
  const [submitError, setSubmitError] = React.useState('');
  const [submitLoading, setSubmitLoading] = React.useState(false);

  // Sync state if user changes
  React.useEffect(() => {
    if (user) {
      setProfileForm({
        college: user.college || '',
        branch: user.branch || '',
        semester_year: user.semester_year || '',
        degree: user.degree || '',
        phone: user.phone || '',
        name: user.name || ''
      });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitLoading(true);
    
    if (!profileForm.college || !profileForm.branch || !profileForm.semester_year || !profileForm.degree || !profileForm.name) {
      setSubmitError('Please fill in all required academic profile fields.');
      setSubmitLoading(false);
      return;
    }

    const res = await updateProfile(profileForm);
    setSubmitLoading(false);
    if (!res.success) {
      setSubmitError(res.error);
    }
  };

  // If the user isn't logged in, don't wrap layout elements around children
  if (!user) {
    return <div className="fade-in">{children}</div>;
  }

  const isProfileIncomplete = user.role === 'Student' && (!user.college || !user.branch || !user.semester_year || !user.degree);

  if (isProfileIncomplete) {
    return (
      <div className="profile-overlay fade-in">
        <div className="profile-card">
          <div className="text-center mb-4">
            <i className="bi bi-person-badge text-primary display-4 mb-2 d-inline-block"></i>
            <h3 className="font-heading fw-bold text-dark mb-1">Complete Student Profile</h3>
            <p className="text-muted fs-7">Welcome to GrievancePortal. Please fill in your academic details to access your portal desk.</p>
          </div>

          {submitError && (
            <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger p-3 fs-8 mb-3" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i> {submitError}
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label text-muted fs-8 text-uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Your Full Name"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted fs-8 text-uppercase mb-1">College/Institution *</label>
                <select 
                  className="form-select"
                  value={profileForm.college}
                  onChange={(e) => setProfileForm({ ...profileForm, college: e.target.value })}
                  required
                >
                  <option value="">-- Select College --</option>
                  <option value="School of Engineering & Technology">School of Engineering & Technology</option>
                  <option value="School of Computer Sciences">School of Computer Sciences</option>
                  <option value="School of Business Management">School of Business Management</option>
                  <option value="School of Liberal Arts & Sciences">School of Liberal Arts & Sciences</option>
                  <option value="Institute of Applied Sciences">Institute of Applied Sciences</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted fs-8 text-uppercase mb-1">Degree Program *</label>
                <select 
                  className="form-select"
                  value={profileForm.degree}
                  onChange={(e) => setProfileForm({ ...profileForm, degree: e.target.value })}
                  required
                >
                  <option value="">-- Select Degree --</option>
                  <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                  <option value="M.Tech">M.Tech (Master of Technology)</option>
                  <option value="BCA">BCA (Bachelor of Computer Apps)</option>
                  <option value="MCA">MCA (Master of Computer Apps)</option>
                  <option value="B.Sc">B.Sc (Bachelor of Science)</option>
                  <option value="MBA">MBA (Master of Business Admin)</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted fs-8 text-uppercase mb-1">Department / Branch *</label>
                <select 
                  className="form-select"
                  value={profileForm.branch}
                  onChange={(e) => setProfileForm({ ...profileForm, branch: e.target.value })}
                  required
                >
                  <option value="">-- Select Branch --</option>
                  <option value="Computer Science Engineering">Computer Science Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Data Science & AI">Data Science & AI</option>
                  <option value="General Management">General Management</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted fs-8 text-uppercase mb-1">Semester / Year *</label>
                <select 
                  className="form-select"
                  value={profileForm.semester_year}
                  onChange={(e) => setProfileForm({ ...profileForm, semester_year: e.target.value })}
                  required
                >
                  <option value="">-- Select Sem/Year --</option>
                  <option value="1st Semester / 1st Year">1st Sem / 1st Yr</option>
                  <option value="2nd Semester / 1st Year">2nd Sem / 1st Yr</option>
                  <option value="3rd Semester / 2nd Year">3rd Sem / 2nd Yr</option>
                  <option value="4th Semester / 2nd Year">4th Sem / 2nd Yr</option>
                  <option value="5th Semester / 3rd Year">5th Sem / 3rd Yr</option>
                  <option value="6th Semester / 3rd Year">6th Sem / 3rd Yr</option>
                  <option value="7th Semester / 4th Year">7th Sem / 4th Yr</option>
                  <option value="8th Semester / 4th Year">8th Sem / 4th Yr</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label text-muted fs-8 text-uppercase mb-1">Contact Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div className="mt-4 d-flex justify-content-between gap-3">
              <button type="button" className="btn btn-outline-secondary w-50" onClick={handleLogout}>
                <i className="bi bi-box-arrow-left me-1"></i> Exit Portal
              </button>
              <button type="submit" className="btn btn-premium-primary w-50" disabled={submitLoading}>
                {submitLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span> Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-1"></i> Submit Details
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
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
                   style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)' }}>
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
            {/* Sidebar Status Widget to fill out vertical space */}
            <div className="sidebar-status-widget text-center fade-in">
              <span className="d-block text-white-50 fs-8 mb-1">
                <i className="bi bi-shield-lock-fill text-success me-1"></i> HEI Secure Session
              </span>
              <small className="text-muted d-block fs-9 text-uppercase">Role: {user.role}</small>
              <div className="d-flex align-items-center justify-content-center mt-2 gap-1 fs-9 text-white-50">
                <span className="rounded-circle bg-success d-inline-block animate-pulse" style={{ width: '6px', height: '6px' }}></span>
                System: <span className="text-success fw-bold">Online</span>
              </div>
            </div>
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
