import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

/**
 * Redesigned Login Component with HEI Admin restrictions & Quick Demonstration panel
 */
const Login = () => {
  const { login, loginWithGoogle, user } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // Handle URL notifications (e.g. session expired, registration successful)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('message') === 'session_expired') {
      setMessage('Your session has expired. Please log in again.');
    } else if (searchParams.get('registered') === 'true') {
      setMessage('Registration successful! Please log in with your credentials.');
    }
  }, [location]);

  // If already logged in, route to appropriate landing page
  useEffect(() => {
    if (user) {
      if (user.role === 'Student') navigate('/student/dashboard');
      else if (user.role === 'Department Representative') navigate('/department/dashboard');
      else if (user.role === 'Admin') navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const isGoogleConfigured = !!(
    import.meta.env.VITE_GOOGLE_CLIENT_ID &&
    import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your_google_client_id' &&
    import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your_google_oauth_client_id' &&
    import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'mock_client_id' &&
    import.meta.env.VITE_GOOGLE_CLIENT_ID.trim() !== ''
  );

  // Google Login callbacks
  const handleGoogleResponse = async (response) => {
    setGoogleLoading(true);
    setError('');
    const result = await loginWithGoogle(response.credential);
    setGoogleLoading(false);
    if (!result.success) {
      setError(result.error);
    }
  };

  useEffect(() => {
    /* global google */
    if (isGoogleConfigured && window.google) {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse
      });
      google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { theme: "outline", size: "large", width: "100%" }
      );
    }
  }, [isGoogleConfigured]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 py-5">
      <div className="w-100 animate-fade-in" style={{ maxWidth: '480px' }}>
        <div className="mb-4 text-start">
          <Link to="/" className="text-dark text-decoration-none fs-7 fw-semibold bg-white p-2 px-3 rounded-pill border shadow-sm d-inline-flex align-items-center">
            <i className="bi bi-arrow-left me-2 text-primary"></i> Back to Home
          </Link>
        </div>

        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none">
            <i className="bi bi-shield-fill-check text-primary display-4 glow-text mb-2 d-inline-block"></i>
            <h3 className="text-dark font-heading fw-bold">Grievance Portal</h3>
          </Link>
          <p className="text-muted">Sign in to report or resolve collegiate complaints</p>
        </div>

        <div className="glass-card p-4 bg-white border">
          <h4 className="text-dark font-heading mb-4 text-center">Account Log In</h4>

          {error && (
            <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 p-3 fs-7 mb-4 d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-octagon-fill fs-5 me-2"></i>
              <div>{error}</div>
            </div>
          )}

          {message && (
            <div className="alert alert-info border-0 bg-info bg-opacity-10 text-info rounded-3 p-3 fs-7 mb-4 d-flex align-items-center" role="alert">
              <i className="bi bi-info-circle-fill fs-5 me-2"></i>
              <div>{message}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-muted fs-8 text-uppercase fw-bold">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 text-muted">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control border-start-0"
                  placeholder="name@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label text-muted fs-8 text-uppercase fw-bold">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 text-muted">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control border-start-0"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-premium-primary w-100 py-3 mb-3 d-flex align-items-center justify-content-center"
              disabled={loading || googleLoading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Verifying Account...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2"></i> Access Account
                </>
              )}
            </button>
          </form>

          {/* Google SSO block */}
          {isGoogleConfigured && (
            <div id="googleSignInDiv" className="w-100 mb-3 d-flex justify-content-center"></div>
          )}

          <div className="text-center mt-3 border-top border-light pt-3">
            <span className="text-muted fs-7">New student? </span>
            <Link to="/register" className="text-primary text-decoration-none fs-7 fw-semibold">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
