import React, { useContext, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

/**
 * Higher Education Institution Grievance Management System Redesigned Landing Page
 */
const Home = () => {
  const { user } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStage, setActiveStage] = useState(0);

  // If user is already authenticated, redirect them to their dashboard
  if (user) {
    if (user.role === 'Student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'Department Representative') return <Navigate to="/department/dashboard" replace />;
    if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
  }

  // Smooth scroll handler
  const handleScrollTo = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const workflowStages = [
    { icon: 'bi-file-earmark-plus-fill', title: 'Submit', desc: 'Student uploads supporting evidence files securely to AWS S3 storage.' },
    { icon: 'bi-search', title: 'Review', desc: 'Administration reviews the complaint and sets initial priority and classification.' },
    { icon: 'bi-share-fill', title: 'Assign', desc: 'Complaint is routed to the corresponding department representative.' },
    { icon: 'bi-gear-wide-connected', title: 'In Progress', desc: 'Department investigates the issue and implements corrective actions.' },
    { icon: 'bi-check-circle-fill', title: 'Resolve', desc: 'Resolution details are submitted and student is notified via AWS SNS.' },
    { icon: 'bi-archive-fill', title: 'Close', desc: 'Admin audits the final resolution before archiving the grievance record.' }
  ];

  const highlights = [
    { title: 'Secure Complaint Submission', desc: 'Students can submit complaints with detailed descriptions and supporting documents.' },
    { title: 'Role-Based Administration', desc: 'Administrators can review, manage, assign, and monitor complaints.' },
    { title: 'Department Assignment', desc: 'Complaints are routed to the appropriate department for resolution.' },
    { title: 'Real-Time Status Tracking', desc: 'Students can track complaint progress throughout the resolution lifecycle.' },
    { title: 'Cloud-Powered Infrastructure', desc: 'AWS services provide scalable storage and secure database management.' },
    { title: 'Transparent Resolution Workflow', desc: 'Every complaint follows a clearly defined review and closure process.' }
  ];

  const features = [
    { title: 'Secure Uploads', category: 'AWS S3 Storage', desc: 'Store complaint attachments securely in cloud storage.' },
    { title: 'Real-Time Notifications', category: 'AWS SNS Integration', desc: 'Send status updates and alerts.' },
    { title: 'Admin Dashboard', category: 'Complaint Monitoring', desc: 'Review and manage complaints efficiently.' },
    { title: 'Complaint Analytics', category: 'Insights and Reporting', desc: 'Visualize complaint categories and status distribution.' }
  ];

  const techStack = [
    { title: 'AWS RDS', desc: 'Managed Relational Database' },
    { title: 'AWS S3', desc: 'Secure File Storage' },
    { title: 'AWS SNS', desc: 'Notification Service' },
    { title: 'JWT Authentication', desc: 'Secure Access Control' },
    { title: 'MySQL', desc: 'Complaint Data Storage' },
    { title: 'React.js', desc: 'Frontend Framework' },
    { title: 'Node.js', desc: 'Backend Runtime' },
    { title: 'Express.js', desc: 'REST API Layer' }
  ];

  return (
    <div className="landing-wrapper">
      {/* Sticky Header Navigation */}
      <nav className="landing-navbar">
        <div className="container d-flex align-items-center justify-content-between">
          <a href="#" className="landing-navbar-brand text-decoration-none" onClick={() => handleScrollTo('hero')}>
            <i className="bi bi-shield-fill-check text-primary fs-3"></i>
            <span className="text-dark">EduGrievance</span>
          </a>

          {/* Desktop Navbar menu */}
          <div className="d-none d-lg-flex align-items-center gap-2">
            <button onClick={() => handleScrollTo('hero')} className="btn landing-navbar-link bg-transparent border-0">Home</button>
            <button onClick={() => handleScrollTo('features')} className="btn landing-navbar-link bg-transparent border-0">Features</button>
            <button onClick={() => handleScrollTo('workflow')} className="btn landing-navbar-link bg-transparent border-0">Workflow</button>
            <button onClick={() => handleScrollTo('departments')} className="btn landing-navbar-link bg-transparent border-0">Departments</button>
            <button onClick={() => handleScrollTo('tech')} className="btn landing-navbar-link bg-transparent border-0">Technology</button>
            <button onClick={() => handleScrollTo('faq')} className="btn landing-navbar-link bg-transparent border-0">FAQ</button>
            <button onClick={() => handleScrollTo('footer')} className="btn landing-navbar-link bg-transparent border-0">About</button>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Link to="/login" className="btn landing-navbar-btn text-decoration-none">
              <i className="bi bi-box-arrow-in-right me-1"></i> Login Dashboard
            </Link>
            
            {/* Mobile Hamburger toggle */}
            <button 
              className="btn btn-outline-secondary border-0 d-lg-none" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'} fs-4`}></i>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="bg-white border-top shadow-sm py-3 px-4 d-flex flex-column gap-2 d-lg-none fade-in">
            <button onClick={() => handleScrollTo('hero')} className="btn text-start landing-navbar-link bg-transparent border-0">Home</button>
            <button onClick={() => handleScrollTo('features')} className="btn text-start landing-navbar-link bg-transparent border-0">Features</button>
            <button onClick={() => handleScrollTo('workflow')} className="btn text-start landing-navbar-link bg-transparent border-0">Workflow</button>
            <button onClick={() => handleScrollTo('departments')} className="btn text-start landing-navbar-link bg-transparent border-0">Departments</button>
            <button onClick={() => handleScrollTo('tech')} className="btn text-start landing-navbar-link bg-transparent border-0">Technology</button>
            <button onClick={() => handleScrollTo('faq')} className="btn text-start landing-navbar-link bg-transparent border-0">FAQ</button>
            <button onClick={() => handleScrollTo('footer')} className="btn text-start landing-navbar-link bg-transparent border-0">About</button>
          </div>
        )}
      </nav>

      {/* Floating gradient shapes */}
      <div className="soft-blur-overlay"></div>
      <div className="soft-blur-overlay-right"></div>

      {/* Hero Section */}
      <div id="hero" className="container py-5 mt-3">
        <div className="row align-items-center justify-content-center py-4">
          
          {/* Left Column: Interactive Mockup illustration */}
          <div className="col-lg-6 mb-5 mb-lg-0 order-2 order-lg-1">
            <div className="hero-mockup-wrapper">
              <div className="hero-mockup-frame p-3 bg-white">
                <div className="border-bottom pb-2 mb-3 d-flex align-items-center gap-1">
                  <div className="bg-danger rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                  <div className="bg-warning rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                  <div className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                  <div className="ms-2 bg-light px-3 py-1 rounded text-muted" style={{ fontSize: '9px', width: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    edugrievance.university.edu/admin/dashboard
                  </div>
                </div>

                {/* Dashboard mock layout */}
                <div className="row g-2" style={{ pointerEvents: 'none' }}>
                  <div className="col-4">
                    <div className="bg-light p-2 rounded text-center border">
                      <small className="d-block text-muted" style={{ fontSize: '9px' }}>Total Complaints</small>
                      <strong className="text-dark font-heading fs-6">24</strong>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="bg-light p-2 rounded text-center border" style={{ borderColor: 'var(--color-primary)' }}>
                      <small className="d-block text-muted" style={{ fontSize: '9px' }}>Under Review</small>
                      <strong className="text-primary font-heading fs-6">6</strong>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="bg-light p-2 rounded text-center border">
                      <small className="d-block text-muted" style={{ fontSize: '9px' }}>Resolved</small>
                      <strong className="text-success font-heading fs-6">12</strong>
                    </div>
                  </div>

                  <div className="col-12 mt-2">
                    <div className="border rounded p-2 bg-light bg-opacity-30">
                      <small className="fw-semibold text-dark d-block mb-1" style={{ fontSize: '10px' }}>Grievance Pipeline Flow</small>
                      <div className="d-flex align-items-center justify-content-between p-1 bg-white border rounded" style={{ fontSize: '9px' }}>
                        <span>Student (File)</span>
                        <i className="bi bi-arrow-right text-primary"></i>
                        <span>Admin (Review)</span>
                        <i className="bi bi-arrow-right text-primary"></i>
                        <span>Dept Representative (Action)</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 mt-2">
                    <div className="border rounded p-2 bg-white">
                      <small className="fw-semibold text-dark d-block mb-1" style={{ fontSize: '10px' }}>Active Department Distribution</small>
                      <div className="d-flex align-items-center justify-content-between mb-1" style={{ fontSize: '8px' }}>
                        <span>Academic</span>
                        <span className="fw-bold">45%</span>
                      </div>
                      <div className="custom-progress-container mb-2" style={{ height: '6px' }}>
                        <div className="custom-progress-bar" style={{ width: '45%' }}></div>
                      </div>

                      <div className="d-flex align-items-center justify-content-between mb-1" style={{ fontSize: '8px' }}>
                        <span>Infrastructure</span>
                        <span className="fw-bold">30%</span>
                      </div>
                      <div className="custom-progress-container" style={{ height: '6px' }}>
                        <div className="custom-progress-bar" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Title and Subtitle */}
          <div className="col-lg-6 ps-lg-5 order-1 order-lg-2 mb-5 mb-lg-0 text-center text-lg-start">
            <div className="badge border px-3 py-2 rounded-pill text-uppercase tracking-wider mb-3 fs-8 fw-semibold" 
                 style={{ color: 'var(--color-secondary)', borderColor: 'var(--color-primary)', backgroundColor: 'var(--bg-secondary)' }}>
              <i className="bi bi-cloud-check-fill me-1"></i> University Portal Redefined
            </div>
            <h1 className="display-5 fw-extrabold mb-3 font-heading text-dark">
              Higher Education Institution<br />
              <span className="hero-gradient">Grievance Management System</span>
            </h1>
            <p className="lead text-muted mb-4 fs-6">
              A centralized cloud-based platform that enables students to submit grievances, track complaint progress, and receive transparent updates throughout the resolution process.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
              <Link to="/login" className="btn btn-premium-primary text-center px-4 py-3">
                <i className="bi bi-box-arrow-in-right me-2"></i> Login Dashboard
              </Link>
              <Link to="/register" className="btn btn-premium-secondary text-center px-4 py-3">
                <i className="bi bi-file-earmark-plus me-2"></i> Register Complaint
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Horizontal Timeline Redesign */}
      <div id="workflow" className="container py-5 border-top border-bottom border-light">
        <div className="text-center mb-5">
          <h2 className="fw-extrabold font-heading text-dark">Standard Redressal Workflow</h2>
          <p className="text-muted col-lg-7 mx-auto fs-7">
            Every ticket moves transparently through six stages with automated notifications and status tracking updates.
          </p>
        </div>

        <div className="timeline-section">
          <div className="timeline-row">
            {workflowStages.map((stage, idx) => (
              <div 
                key={idx} 
                className="timeline-step-col" 
                onMouseEnter={() => setActiveStage(idx)}
              >
                <div className={`timeline-bubble ${idx === activeStage ? 'timeline-bubble-active' : ''}`}>
                  <i className={`bi ${stage.icon}`}></i>
                </div>
                <h5 className="fw-bold mb-2 text-dark font-heading fs-6">{stage.title}</h5>
                <p className="text-muted fs-8 px-2">{stage.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Factual Highlights Section */}
      <div id="highlights" className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-extrabold font-heading text-dark">Platform Highlights</h2>
          <p className="text-muted col-lg-7 mx-auto fs-7">
            Key operational capabilities designed for accountability and governance in higher education institutions.
          </p>
        </div>

        <div className="row g-4">
          {highlights.map((h, idx) => (
            <div className="col-md-6 col-lg-4" key={idx}>
              <div className="glass-card p-4 h-100 border">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center bg-info bg-opacity-15 text-primary" style={{ width: '35px', height: '35px' }}>
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                  <h5 className="fw-bold mb-0 font-heading fs-6 text-dark">{h.title}</h5>
                </div>
                <p className="text-muted fs-7 mb-0">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div id="features" className="container py-5 bg-white bg-opacity-40 rounded-4 border p-4 mb-5">
        <div className="text-center mb-5">
          <h2 className="fw-extrabold font-heading text-dark">Operational Features</h2>
          <p className="text-muted col-lg-7 mx-auto fs-7">
            Core components built to handle file uploads, notification streams, console controls, and stats monitoring.
          </p>
        </div>

        <div className="row g-4">
          {features.map((f, idx) => (
            <div className="col-md-6" key={idx}>
              <div className="feature-card p-4 border bg-white">
                <span className="badge bg-secondary p-2 fs-9 mb-2 text-uppercase tracking-wide">{f.category}</span>
                <h4 className="fw-bold mb-2 font-heading fs-5 text-dark">{f.title}</h4>
                <p className="text-muted fs-7 mb-0">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack Section */}
      <div id="tech" className="tech-badges-section text-center mb-5">
        <div className="container">
          <h2 className="fw-extrabold font-heading text-dark mb-2">Technology Stack</h2>
          <p className="text-muted col-lg-7 mx-auto mb-4 fs-7">
            Built using industry-standard architectures to provide scalability, security, and performance.
          </p>
          <div className="row g-3 justify-content-center align-items-center">
            {techStack.map((tech, idx) => (
              <div className="col-6 col-md-4 col-lg-3" key={idx}>
                <div className="tech-badge-card text-start">
                  <div>
                    <strong className="text-dark d-block" style={{ fontSize: '13px' }}>{tech.title}</strong>
                    <span className="text-muted" style={{ fontSize: '10px' }}>{tech.desc}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Spheres Grid (Academic, Infrastructure, Hostel, Placement, etc.) */}
      <div id="departments" className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-extrabold font-heading text-dark">Support Departments</h2>
          <p className="text-muted col-lg-7 mx-auto fs-7">
            Grievances are directed to specialized academic and operational boards for fast redressal.
          </p>
        </div>

        <div className="row g-4">
          <div className="col-lg-3 col-md-6">
            <div className="glass-card p-4 border bg-white text-center">
              <i className="bi bi-book text-primary display-6 mb-3 d-inline-block"></i>
              <h5 className="fw-bold mb-2 text-dark font-heading fs-6">Academic</h5>
              <p className="text-muted fs-8 mb-0">Attendance, grading audits, faculty evaluations, and registration issues.</p>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="glass-card p-4 border bg-white text-center">
              <i className="bi bi-building text-primary display-6 mb-3 d-inline-block"></i>
              <h5 className="fw-bold mb-2 text-dark font-heading fs-6">Infrastructure</h5>
              <p className="text-muted fs-8 mb-0">Lab machinery, sanitary checks, power availability, and classroom maintenance.</p>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="glass-card p-4 border bg-white text-center">
              <i className="bi bi-house text-primary display-6 mb-3 d-inline-block"></i>
              <h5 className="fw-bold mb-2 text-dark font-heading fs-6">Hostel</h5>
              <p className="text-muted fs-8 mb-0">Dining complaints, room adjustments, warden reporting, and security checks.</p>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="glass-card p-4 border bg-white text-center">
              <i className="bi bi-briefcase text-primary display-6 mb-3 d-inline-block"></i>
              <h5 className="fw-bold mb-2 text-dark font-heading fs-6">Placement</h5>
              <p className="text-muted fs-8 mb-0">Interview routing, profile setup validation, and campus recruitments.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div id="faq" className="container py-5 border-top">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <h2 className="text-center fw-extrabold mb-4 font-heading text-dark">Frequently Asked Questions</h2>
            <div className="accordion" id="faqAccordion">
              
              <div className="accordion-item bg-white border-light mb-3 rounded-4 shadow-sm overflow-hidden border">
                <h2 className="accordion-header" id="faqHeading1">
                  <button className="accordion-button collapsed fw-bold rounded-4 bg-white text-dark fs-7" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFaq1">
                    How is complaint evidence securely handled?
                  </button>
                </h2>
                <div id="collapseFaq1" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                  <div className="accordion-body text-muted fs-8 bg-white">
                    Attachments are uploaded directly to securely configured AWS S3 buckets using signed URLs, providing encrypted cloud storage.
                  </div>
                </div>
              </div>

              <div className="accordion-item bg-white border-light mb-3 rounded-4 shadow-sm overflow-hidden border">
                <h2 className="accordion-header" id="faqHeading2">
                  <button className="accordion-button collapsed fw-bold rounded-4 bg-white text-dark fs-7" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFaq2">
                    How long does standard complaint assignment take?
                  </button>
                </h2>
                <div id="collapseFaq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                  <div className="accordion-body text-muted fs-8 bg-white">
                    Once submitted, admins route the complaint to the designated department within 24 hours of submission.
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Professional Footer */}
      <footer className="landing-footer" id="footer">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="footer-logo">
                <i className="bi bi-shield-fill-check text-primary me-2"></i>Higher Education Institution Grievance Portal
              </div>
              <p className="text-muted fs-7 mb-4">
                A cloud-enabled platform designed to streamline grievance handling, improve transparency, and support efficient complaint resolution within educational institutions.
              </p>
              <div className="d-flex gap-3 text-muted fs-7">
                <strong>Technology Stack:</strong> React.js • Node.js • MySQL • AWS RDS • AWS S3 • AWS SNS
              </div>
            </div>

            <div className="col-lg-3 col-md-6 col-6">
              <h6 className="fw-bold mb-3 text-dark font-heading">Quick Links</h6>
              <ul className="list-unstyled">
                <li><button onClick={() => handleScrollTo('hero')} className="btn footer-link bg-transparent border-0 text-start p-0">Home</button></li>
                <li><button onClick={() => handleScrollTo('features')} className="btn footer-link bg-transparent border-0 text-start p-0">Features</button></li>
                <li><button onClick={() => handleScrollTo('workflow')} className="btn footer-link bg-transparent border-0 text-start p-0">Workflow</button></li>
                <li><button onClick={() => handleScrollTo('departments')} className="btn footer-link bg-transparent border-0 text-start p-0">Departments</button></li>
              </ul>
            </div>

            <div className="col-lg-3 col-md-6">
              <h6 className="fw-bold mb-3 text-dark font-heading">Portal Details</h6>
              <div className="text-muted fs-7 mb-2">
                <strong>Project:</strong> HEI Grievance Redressal
              </div>
              <div className="text-muted fs-7 mb-2">
                <strong>Security:</strong> JWT & RBAC Enabled
              </div>
              <div className="text-muted fs-7">
                <strong>Database:</strong> AWS RDS MySQL Instance
              </div>
            </div>
          </div>
          <hr className="my-4 border-light-subtle" />
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center g-2 text-muted fs-8">
            <div>
              &copy; {new Date().getFullYear()} EduGrievance Portal. All rights reserved.
            </div>
            <div>
              Designed with Premium Aqua / Teal Cloud Aesthetics.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
