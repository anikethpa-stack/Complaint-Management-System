import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

/**
 * Registration Component for Students
 */
const Register = () => {
  const { registerStudent, user } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'Student') navigate('/student/dashboard');
      else if (user.role === 'Department Representative') navigate('/department/dashboard');
      else if (user.role === 'Admin') navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Field checks
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const result = await registerStudent(name, email, password, phone);
    setLoading(false);

    if (result.success) {
      navigate('/login?registered=true');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 py-5">
      <div className="w-100" style={{ maxWidth: '480px' }}>
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none">
            <i className="bi bi-shield-fill-exclamation text-primary display-4 glow-text mb-2 d-inline-block"></i>
            <h3 className="text-white font-heading fw-bold">Grievance Portal</h3>
          </Link>
          <p className="text-muted">Create a student account to file complaints</p>
        </div>

        <div className="glass-card p-4">
          <h4 className="text-white mb-4 text-center">Student Registration</h4>

          {error && (
            <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 p-3 fs-7 mb-4 d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-octagon-fill fs-5 me-2"></i>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-muted fs-8 text-uppercase">Full Name *</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 text-muted" style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label text-muted fs-8 text-uppercase">College Email Address *</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 text-muted" style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control border-start-0"
                  placeholder="johndoe@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label text-muted fs-8 text-uppercase">Phone Number</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 text-muted" style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <i className="bi bi-phone"></i>
                </span>
                <input
                  type="tel"
                  className="form-control border-start-0"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label text-muted fs-8 text-uppercase">Password *</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 text-muted" style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control border-start-0"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label text-muted fs-8 text-uppercase">Confirm Password *</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 text-muted" style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <i className="bi bi-shield-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control border-start-0"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-premium-primary w-100 py-3 mb-3 d-flex align-items-center justify-content-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting Registration...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus me-2"></i> Register Account
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-3">
            <span className="text-muted fs-7">Already have an account? </span>
            <Link to="/login" className="text-primary text-decoration-none fs-7 fw-semibold">
              Log in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
