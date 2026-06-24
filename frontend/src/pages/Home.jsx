import React, { useContext, useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

/**
 * AnimatedCounter component for the stats count-up animation on load
 */
const AnimatedCounter = ({ target, duration = 1500, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(target);
    if (isNaN(end)) {
      return;
    }
    if (end === 0) return;

    const totalMilliseconds = duration;
    const stepTime = 30; // 30ms intervals
    const totalSteps = totalMilliseconds / stepTime;
    const increment = end / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target, duration]);

  const isDecimal = target.toString().includes('.');
  const displayValue = isDecimal ? count.toFixed(1) : Math.floor(count);

  return (
    <span>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};

/**
 * Public Landing Page of the Grievance Portal
 */
const Home = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalStudents: 12450,
    resolutionRate: 99.4,
    avgTurnaround: 36,
    secureS3: true
  });

  // Fetch real-time statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/auth/stats');
        if (res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.warn('Could not fetch real-time stats, using fallback:', err.message);
      }
    };
    fetchStats();
  }, []);

  // If user is already authenticated, redirect them directly to their corresponding dashboard
  if (user) {
    if (user.role === 'Student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'Department Representative') return <Navigate to="/department/dashboard" replace />;
    if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
  }

  // Smooth scroll handler
  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-wrapper">
      {/* Premium Sticky Header Navbar */}
      <nav className="landing-navbar">
        <div className="container d-flex align-items-center justify-content-between">
          <a href="#" className="landing-navbar-brand text-decoration-none">
            <i className="bi bi-shield-check text-success"></i>
            <span>EduGrievance</span>
          </a>
          
          <div className="d-none d-md-flex align-items-center gap-2">
            <button onClick={() => handleScrollTo('hero')} className="btn landing-navbar-link text-decoration-none bg-transparent border-0">Home</button>
            <button onClick={() => handleScrollTo('workflow')} className="btn landing-navbar-link text-decoration-none bg-transparent border-0">Workflow</button>
            <button onClick={() => handleScrollTo('features')} className="btn landing-navbar-link text-decoration-none bg-transparent border-0">Features</button>
            <button onClick={() => handleScrollTo('tech')} className="btn landing-navbar-link text-decoration-none bg-transparent border-0">Technology</button>
            <button onClick={() => handleScrollTo('faq')} className="btn landing-navbar-link text-decoration-none bg-transparent border-0">FAQs</button>
          </div>

          <div>
            <Link to="/login" className="btn landing-navbar-btn text-decoration-none">
              <i className="bi bi-box-arrow-in-right me-2"></i>Login Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div id="hero" className="container py-5">
        <div className="row align-items-center justify-content-center py-5">
          {/* Left Column: Mockup illustration */}
          <div className="col-lg-6 mb-5 mb-lg-0 order-2 order-lg-1">
            <div className="hero-mockup-wrapper">
              <div className="hero-mockup-frame">
                {/* Browser tab layout mock */}
                <div className="bg-light px-3 py-2 border-bottom d-flex align-items-center gap-1">
                  <div className="bg-danger rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                  <div className="bg-warning rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                  <div className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                  <div className="ms-2 bg-white px-2 py-0.5 rounded text-muted fs-9 border" style={{ fontSize: '10px' }}>
                    edugrievance.inst/dashboard
                  </div>
                </div>
                <img 
                  src="/dashboard_mockup.png" 
                  alt="EduGrievance Dashboard Mockup" 
                  className="hero-mockup-img img-fluid"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Title, Subtitle and CTA buttons */}
          <div className="col-lg-6 ps-lg-5 order-1 order-lg-2 mb-5 mb-lg-0 text-center text-lg-start">
            <div className="badge bg-success-subtle border border-success-subtle text-success px-3 py-2 rounded-pill text-uppercase tracking-wider mb-3 fs-8 fw-semibold">
              HEI Grievance Management System
            </div>
            <h1 className="display-4 fw-extrabold mb-3 font-heading text-dark">
              Voice Your Concerns.<br />
              <span className="hero-gradient">Track Resolutions in Real-Time.</span>
            </h1>
            <p className="lead text-muted mb-4">
              A secure, transparent, and cloud-integrated portal for Higher Education Institutions. Empowering students, faculty, and administrative boards with real-time grievance delegation, tracking, and closure.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
              <Link to="/login" className="btn btn-premium-primary text-center px-4 py-3">
                <i className="bi bi-box-arrow-in-right me-2"></i> Log In to Portal
              </Link>
              <Link to="/register" className="btn btn-premium-secondary text-center px-4 py-3">
                <i className="bi bi-person-plus me-2"></i> Student Registration
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Stats Banner Section */}
      <div className="container mb-5">
        <div className="row stats-banner py-4 text-center px-3 px-md-0 g-4">
          <div className="col-md-3 col-6">
            <h2 className="display-5 fw-extrabold stats-counter-value mb-1">
              <AnimatedCounter target={stats.totalStudents} suffix="+" />
            </h2>
            <div className="text-muted fs-8 text-uppercase tracking-wider fw-semibold">Active Students Supported</div>
          </div>
          <div className="col-md-3 col-6">
            <h2 className="display-5 fw-extrabold stats-counter-value mb-1">
              <AnimatedCounter target={stats.resolutionRate} suffix="%" />
            </h2>
            <div className="text-muted fs-8 text-uppercase tracking-wider fw-semibold">Grievance Resolution Index</div>
          </div>
          <div className="col-md-3 col-6">
            <h2 className="display-5 fw-extrabold stats-counter-value mb-1">
              <AnimatedCounter target={stats.avgTurnaround} prefix="< " suffix=" Hrs" />
            </h2>
            <div className="text-muted fs-8 text-uppercase tracking-wider fw-semibold">Avg Turnaround Period</div>
          </div>
          <div className="col-md-3 col-6">
            <h2 className="display-5 fw-extrabold stats-counter-value mb-1">100%</h2>
            <div className="text-muted fs-8 text-uppercase tracking-wider fw-semibold">AWS S3 Cloud Secured</div>
          </div>
        </div>
      </div>

      {/* Connected Workflow Timeline Section */}
      <div id="workflow" className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-extrabold font-heading text-dark">Simplified Grievance Redressal Workflow</h2>
          <p className="text-muted col-lg-7 mx-auto">
            Our cloud pipeline ensures structured coordination between students, institutional admins, and representatives.
          </p>
        </div>

        <div className="timeline-section">
          <div className="timeline-row">
            
            <div className="timeline-step-col">
              <div className="timeline-bubble timeline-bubble-active">
                <i className="bi bi-file-earmark-plus"></i>
              </div>
              <h5 className="fw-bold mb-2 text-dark">1. File Complaint</h5>
              <p className="text-muted fs-7 px-3">
                Students register issues, uploading supporting PDFs/images securely to AWS S3.
              </p>
            </div>

            <div className="timeline-step-col">
              <div className="timeline-bubble">
                <i className="bi bi-diagram-3"></i>
              </div>
              <h5 className="fw-bold mb-2 text-dark">2. Admin Assignment</h5>
              <p className="text-muted fs-7 px-3">
                Admins evaluate ticket severity, mapping routing logs to specific departments.
              </p>
            </div>

            <div className="timeline-step-col">
              <div className="timeline-bubble">
                <i className="bi bi-chat-left-text"></i>
              </div>
              <h5 className="fw-bold mb-2 text-dark">3. Action & Update</h5>
              <p className="text-muted fs-7 px-3">
                Representatives execute solutions, logging real-time status alerts via AWS SNS.
              </p>
            </div>

            <div className="timeline-step-col">
              <div className="timeline-bubble">
                <i className="bi bi-shield-check-fill"></i>
              </div>
              <h5 className="fw-bold mb-2 text-dark">4. Secure Closure</h5>
              <p className="text-muted fs-7 px-3">
                Admins perform final audits on resolved tickets and archive official records.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Features Grid Section */}
      <div id="features" className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-extrabold font-heading text-dark">Key Grievance Redressal Spheres</h2>
          <p className="text-muted col-lg-7 mx-auto">
            Providing comprehensive oversight across crucial educational domains to ensure zero interruption in academic progression.
          </p>
        </div>

        <div className="row g-4">
          <div className="col-lg-3 col-md-6">
            <div className="feature-card">
              <div className="feature-icon-wrapper bg-success-subtle text-success">
                <i className="bi bi-journal-bookmark"></i>
              </div>
              <h5 className="fw-bold mb-2 text-dark">Academic & Curricular</h5>
              <p className="text-muted fs-7 mb-0">
                Attendance recording updates, faculty evaluation discrepancies, examination grading disputes, and internal score reviews.
              </p>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="feature-card">
              <div className="feature-icon-wrapper bg-success-subtle text-success">
                <i className="bi bi-building-gear"></i>
              </div>
              <h5 className="fw-bold mb-2 text-dark">Infrastructure & Labs</h5>
              <p className="text-muted fs-7 mb-0">
                Classroom power issues, laboratory equipment failures, projector setup glitches, and hostel dining or sanitary audits.
              </p>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="feature-card">
              <div className="feature-icon-wrapper bg-success-subtle text-success">
                <i className="bi bi-briefcase"></i>
              </div>
              <h5 className="fw-bold mb-2 text-dark">Placements & Career</h5>
              <p className="text-muted fs-7 mb-0">
                Internship onboarding details, interview scheduling conflicts, resource drives, library clearances, and training queries.
              </p>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="feature-card">
              <div className="feature-icon-wrapper bg-success-subtle text-success">
                <i className="bi bi-people"></i>
              </div>
              <h5 className="fw-bold mb-2 text-dark">Admin Operations</h5>
              <p className="text-muted fs-7 mb-0">
                Tuition fee receipt delays, student ID card issuances, scholarship document verifications, and bus/transport scheduling.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Tech Badges Section */}
      <div id="tech" className="tech-badges-section text-center mb-5">
        <div className="container">
          <h6 className="text-muted text-uppercase tracking-wider fw-bold mb-4" style={{ fontSize: '0.8rem' }}>
            Production-Ready Architecture Integrated With
          </h6>
          <div className="row g-3 justify-content-center align-items-center">
            <div className="col-lg-2 col-md-4 col-6">
              <div className="tech-badge-card justify-content-center">
                <i className="bi bi-cloud-arrow-up tech-badge-icon"></i>
                <span className="fw-semibold text-dark">AWS S3</span>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6">
              <div className="tech-badge-card justify-content-center">
                <i className="bi bi-database tech-badge-icon"></i>
                <span className="fw-semibold text-dark">AWS RDS</span>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6">
              <div className="tech-badge-card justify-content-center">
                <i className="bi bi-bell-fill tech-badge-icon"></i>
                <span className="fw-semibold text-dark">AWS SNS</span>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6">
              <div className="tech-badge-card justify-content-center">
                <i className="bi bi-shield-lock-fill tech-badge-icon"></i>
                <span className="fw-semibold text-dark">JWT Auth</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div id="faq" className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <h2 className="text-center fw-extrabold mb-5 font-heading text-dark">Frequently Asked Questions</h2>
            <div className="accordion" id="landingFaqAccordion">
              
              <div className="accordion-item bg-white border-light mb-3 rounded-4 shadow-sm overflow-hidden">
                <h2 className="accordion-header" id="faq1">
                  <button className="accordion-button collapsed fw-bold rounded-4 bg-white text-dark" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFaq1">
                    How secure is the grievance attachment upload system?
                  </button>
                </h2>
                <div id="collapseFaq1" className="accordion-collapse collapse" data-bs-parent="#landingFaqAccordion">
                  <div className="accordion-body text-muted fs-7 bg-white">
                    All evidence attachments (such as reports, files, or images) are stored directly inside securely provisioned Amazon S3 buckets with strict IAM policies and AES-256 server-side encryption.
                  </div>
                </div>
              </div>

              <div className="accordion-item bg-white border-light mb-3 rounded-4 shadow-sm overflow-hidden">
                <h2 className="accordion-header" id="faq2">
                  <button className="accordion-button collapsed fw-bold rounded-4 bg-white text-dark" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFaq2">
                    What is the routing pipeline for filed tickets?
                  </button>
                </h2>
                <div id="collapseFaq2" className="accordion-collapse collapse" data-bs-parent="#landingFaqAccordion">
                  <div className="accordion-body text-muted fs-7 bg-white">
                    Once a ticket is registered by a student, the Administrative board reviews its parameters and routes it to the designated Department Representative (e.g., Academic, Hostel, Infrastructure) for investigation and resolution logs.
                  </div>
                </div>
              </div>

              <div className="accordion-item bg-white border-light mb-3 rounded-4 shadow-sm overflow-hidden">
                <h2 className="accordion-header" id="faq3">
                  <button className="accordion-button collapsed fw-bold rounded-4 bg-white text-dark" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFaq3">
                    How will I be notified of updates?
                  </button>
                </h2>
                <div id="collapseFaq3" className="accordion-collapse collapse" data-bs-parent="#landingFaqAccordion">
                  <div className="accordion-body text-muted fs-7 bg-white">
                    Our system leverages Amazon Simple Notification Service (SNS) to automatically broadcast status updates directly to registered emails when a representative posts resolution logs or escalates the ticket.
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Professional Project Footer */}
      <footer className="landing-footer" id="footer">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-5 col-md-12">
              <div className="footer-logo">
                <i className="bi bi-shield-check text-success me-2"></i>EduGrievance
              </div>
              <p className="text-muted fs-7 mb-4">
                A cloud-driven Higher Education Grievance Management portal built as an engineering/MCA presentation-ready project. Integrates AWS S3 file hosting, AWS RDS database, AWS SNS notifications, and secure JWT-based identity management.
              </p>
              <div className="d-flex gap-3 text-muted">
                <a href="#" className="text-muted"><i className="bi bi-github fs-5"></i></a>
                <a href="#" className="text-muted"><i className="bi bi-linkedin fs-5"></i></a>
                <a href="#" className="text-muted"><i className="bi bi-globe fs-5"></i></a>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 col-6">
              <h6 className="fw-bold mb-3 text-dark">Portal Links</h6>
              <ul className="list-unstyled">
                <li><button onClick={() => handleScrollTo('hero')} className="btn footer-link bg-transparent border-0 text-start p-0">Home</button></li>
                <li><button onClick={() => handleScrollTo('workflow')} className="btn footer-link bg-transparent border-0 text-start p-0">Workflow Timeline</button></li>
                <li><button onClick={() => handleScrollTo('features')} className="btn footer-link bg-transparent border-0 text-start p-0">Grievance Spheres</button></li>
                <li><button onClick={() => handleScrollTo('faq')} className="btn footer-link bg-transparent border-0 text-start p-0">FAQs</button></li>
              </ul>
            </div>

            <div className="col-lg-4 col-md-6">
              <h6 className="fw-bold mb-3 text-dark">Project Presentation Metadata</h6>
              <div className="text-muted fs-7 mb-2">
                <strong>Project:</strong> Grievance Redressal Portal
              </div>
              <div className="text-muted fs-7 mb-2">
                <strong>Stack:</strong> React, Node.js, Express, MySQL (RDS), AWS S3/SNS
              </div>
              <div className="text-muted fs-7">
                <strong>Presentation Mode:</strong> Active Staging
              </div>
            </div>
          </div>
          <hr className="my-4 border-light-subtle" />
          <div className="row align-items-center justify-content-between g-2">
            <div className="col-md-6 text-center text-md-start text-muted fs-8">
              &copy; {new Date().getFullYear()} EduGrievance Portal. All rights reserved.
            </div>
            <div className="col-md-6 text-center text-md-end text-muted fs-8">
              Designed with Premium Emerald-Green Aesthetics.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

