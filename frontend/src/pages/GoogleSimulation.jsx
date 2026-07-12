import React, { useState } from 'react';

const GoogleSimulation = () => {
  const [step, setStep] = useState(1); // 1: Account Chooser, 2: Custom Email Input, 3: Password/Login, 4: Loading/Signing In
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customName, setCustomName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const mockAccounts = [
    { name: 'Aniketh', email: 'anikethpa411@gmail.com', role: 'HEI Administrator', avatar: 'A', bg: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)' },
    { name: 'Abdullah', email: 'abdullah2003shoaib@gmail.com', role: 'HEI Administrator', avatar: 'A', bg: 'linear-gradient(135deg, #34A853 0%, #FBBC05 100%)' },
    { name: 'Srikanth', email: 'srikanthsriko@gmail.com', role: 'HEI Administrator', avatar: 'S', bg: 'linear-gradient(135deg, #EA4335 0%, #4285F4 100%)' },
    { name: 'Demo Student', email: 'student@college.edu', role: 'Grievant Scholar', avatar: 'D', bg: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)' }
  ];

  const handleSelectAccount = (selectedEmail, selectedName) => {
    setLoading(true);
    setStep(4);
    setTimeout(() => {
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'GOOGLE_SIGNIN_SUCCESS',
            credential: JSON.stringify({
              email: selectedEmail,
              name: selectedName
            })
          },
          window.location.origin
        );
        window.close();
      }
    }, 1500);
  };

  const handleCustomNext = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Enter an email address');
      return;
    }
    if (!email.includes('@')) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleCustomLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setStep(4);
    
    const inferredName = customName || email.split('@')[0]
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    setTimeout(() => {
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'GOOGLE_SIGNIN_SUCCESS',
            credential: JSON.stringify({
              email: email.trim(),
              name: inferredName
            })
          },
          window.location.origin
        );
        window.close();
      }
    }, 1500);
  };

  return (
    <div className="google-sim-body d-flex align-items-center justify-content-center py-4">
      {/* Dynamic Styling Overrides for Premium Aesthetic */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        
        .google-sim-body {
          font-family: 'Outfit', sans-serif;
          background: radial-gradient(circle at 15% 15%, rgba(66, 133, 244, 0.06) 0%, transparent 45%),
                      radial-gradient(circle at 85% 85%, rgba(52, 168, 83, 0.06) 0%, transparent 45%),
                      radial-gradient(circle at 50% 50%, rgba(251, 188, 5, 0.04) 0%, transparent 60%),
                      #fdfdfd;
          min-height: 100vh;
          overflow: hidden;
        }

        .google-sim-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
          border-radius: 20px;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
          width: 440px;
          min-height: 520px;
        }

        .google-sim-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 24px 60px rgba(66, 133, 244, 0.08);
        }

        .logo-container {
          position: relative;
          display: inline-block;
          margin-bottom: 24px;
        }

        .logo-ring {
          position: absolute;
          top: -6px;
          left: -6px;
          width: 52px;
          height: 52px;
          border: 2px solid transparent;
          border-radius: 50%;
          border-top-color: #4285F4;
          animation: spin 3s linear infinite;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .google-sim-card:hover .logo-ring {
          opacity: 0.5;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .account-tile {
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(0, 0, 0, 0.04);
          border-radius: 14px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          margin-bottom: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 14px 16px;
          width: 100%;
          text-align: left;
        }

        .account-tile:hover {
          background: #ffffff;
          transform: scale(1.02);
          border-color: rgba(66, 133, 244, 0.25);
          box-shadow: 0 8px 20px rgba(66, 133, 244, 0.06);
        }

        .account-tile:active {
          transform: scale(0.99);
        }

        .avatar-gradient {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          color: white;
          font-weight: 600;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 14px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }

        .custom-input-group {
          position: relative;
          margin-bottom: 20px;
        }

        .custom-input {
          border: 1.5px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          padding: 16px 14px;
          width: 100%;
          font-size: 15px;
          transition: all 0.2s ease;
          background: rgba(255, 255, 255, 0.8);
          outline: none;
        }

        .custom-input:focus {
          border-color: #4285F4;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(66, 133, 244, 0.1);
        }

        .custom-btn-primary {
          background: #4285F4;
          color: white;
          border: none;
          border-radius: 24px;
          padding: 10px 24px;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(66, 133, 244, 0.15);
        }

        .custom-btn-primary:hover {
          background: #357ae8;
          box-shadow: 0 6px 16px rgba(66, 133, 244, 0.25);
          transform: translateY(-1px);
        }

        .custom-btn-primary:active {
          transform: translateY(0);
        }

        .custom-btn-outline {
          background: transparent;
          color: #4285F4;
          border: none;
          font-weight: 500;
          font-size: 14px;
          padding: 8px 16px;
          border-radius: 20px;
          transition: all 0.2s ease;
        }

        .custom-btn-outline:hover {
          background: rgba(66, 133, 244, 0.05);
          color: #357ae8;
        }

        .google-spinner {
          width: 50px;
          height: 50px;
          animation: rotate-spinner 2s linear infinite;
        }

        .google-spinner circle {
          stroke-dasharray: 1, 150;
          stroke-dashoffset: 0;
          stroke-linecap: round;
          animation: dash-spinner 1.5s ease-in-out infinite;
        }

        @keyframes rotate-spinner {
          100% { transform: rotate(360deg); }
        }

        @keyframes dash-spinner {
          0% {
            stroke-dasharray: 1, 150;
            stroke-dashoffset: 0;
            stroke: #4285F4;
          }
          25% {
            stroke: #EA4335;
          }
          50% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -35;
            stroke: #FBBC05;
          }
          75% {
            stroke: #34A853;
          }
          100% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -124;
            stroke: #4285F4;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="google-sim-card p-4 d-flex flex-column justify-content-between">
        
        {/* Top Branding Section */}
        <div className="text-center mt-2">
          <div className="logo-container">
            <div className="logo-ring"></div>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 48 48" style={{ position: 'relative', zIndex: 2 }}>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24c0-1.61-.15-3.16-.42-4.69H24v8.89h12.63C36.1 30.72 32.73 34 28.53 36.28l7.56 5.86c4.41-4.07 7.41-10.06 7.41-18.14z"/>
              <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.56-5.86c-2.1.14-4.38.67-8.33.67-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
          </div>
        </div>

        {/* STEP 1: Premium Account Chooser */}
        {step === 1 && (
          <div className="animate-fade-in flex-grow-1 d-flex flex-column justify-content-between">
            <div className="text-center mb-4">
              <h4 className="text-dark fw-normal mb-1">Choose an account</h4>
              <p className="text-secondary fs-7">to continue to <span className="fw-semibold text-primary">Grievance Portal</span></p>
            </div>

            <div className="flex-grow-1 mb-3" style={{ overflowY: 'auto', maxHeight: '280px', paddingRight: '4px' }}>
              {mockAccounts.map((acc, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectAccount(acc.email, acc.name)}
                  className="account-tile"
                >
                  <div className="avatar-gradient" style={{ background: acc.bg }}>
                    {acc.avatar}
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold text-dark fs-7">{acc.name}</div>
                    <div className="text-secondary fs-8">{acc.email}</div>
                  </div>
                  <span className="badge bg-light text-secondary border border-light-subtle fs-9 px-2 py-1 rounded-pill">
                    {acc.role.split(' ')[0]}
                  </span>
                </button>
              ))}

              <button
                onClick={() => setStep(2)}
                className="account-tile"
                style={{ background: 'rgba(0,0,0,0.01)', borderStyle: 'dashed' }}
              >
                <div className="avatar-gradient bg-light border border-secondary border-opacity-25 text-secondary">
                  <i className="bi bi-person-plus-fill"></i>
                </div>
                <div className="flex-grow-1">
                  <div className="fw-semibold text-dark fs-7">Use another account</div>
                  <div className="text-muted fs-8">Test with a custom credentials</div>
                </div>
              </button>
            </div>
            
            <p className="text-center text-muted fs-9 mb-0 px-2 mt-auto">
              Selecting an Administrator account immediately grants administrative privileges. Custom credentials can register new Student profiles dynamically.
            </p>
          </div>
        )}

        {/* STEP 2: Use another account (Custom Email) */}
        {step === 2 && (
          <div className="animate-fade-in flex-grow-1 d-flex flex-column justify-content-between" style={{ minHeight: '380px' }}>
            <div className="text-center mb-4">
              <h4 className="text-dark fw-normal mb-1">Sign in</h4>
              <p className="text-secondary fs-7">with your Google Account</p>
            </div>

            <div className="flex-grow-1">
              <form onSubmit={handleCustomNext}>
                <div className="custom-input-group">
                  <input
                    type="email"
                    className="custom-input"
                    placeholder="Email or phone"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    autoFocus
                    required
                  />
                  {error && <div className="text-danger fs-8 mt-1 ms-2"><i className="bi bi-exclamation-circle me-1"></i>{error}</div>}
                </div>

                <div className="custom-input-group">
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="Full Name (Optional)"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                </div>

                <p className="text-secondary fs-8 px-1">
                  To log in as a sandbox administrator, provide one of the pre-configured administrator email addresses.
                </p>
              </form>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-auto pt-3">
              <button
                type="button"
                className="custom-btn-outline"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                type="button"
                className="custom-btn-primary"
                onClick={handleCustomNext}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Password Input */}
        {step === 3 && (
          <div className="animate-fade-in flex-grow-1 d-flex flex-column justify-content-between" style={{ minHeight: '380px' }}>
            <div className="text-center mb-4">
              <h4 className="text-dark fw-normal mb-1">Welcome</h4>
              <div className="d-inline-flex align-items-center bg-light border border-light-subtle rounded-pill px-3 py-1.5 mt-2">
                <i className="bi bi-person-circle text-primary me-2"></i>
                <span className="text-dark fs-8 font-monospace">{email}</span>
              </div>
            </div>

            <div className="flex-grow-1">
              <form onSubmit={handleCustomLogin}>
                <div className="custom-input-group">
                  <input
                    type="password"
                    className="custom-input"
                    id="simPasswordInput"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <div className="form-check mb-4 ms-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showPasswordCheck"
                    onChange={(e) => {
                      const input = document.getElementById('simPasswordInput');
                      if (input) {
                        input.type = e.target.checked ? 'text' : 'password';
                      }
                    }}
                  />
                  <label className="form-check-label text-secondary fs-8" htmlFor="showPasswordCheck">
                    Show password
                  </label>
                </div>
              </form>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-auto pt-3">
              <button
                type="button"
                className="custom-btn-outline"
                onClick={() => setStep(2)}
              >
                Back
              </button>
              <button
                type="button"
                className="custom-btn-primary"
                onClick={handleCustomLogin}
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Loading Screen */}
        {step === 4 && (
          <div className="animate-fade-in d-flex flex-column align-items-center justify-content-center flex-grow-1" style={{ minHeight: '350px' }}>
            <svg className="google-spinner mb-4" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle>
            </svg>
            <h5 className="text-dark fw-normal mb-1">Authenticating</h5>
            <p className="text-secondary fs-7">Verifying identity secure keys...</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default GoogleSimulation;
