import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

/**
 * Details view showing single complaint particulars, full audit log,
 * and context actions for Students, Department Reps, and Admins.
 */
const ComplaintDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // Rep action fields
  const [repStatus, setRepStatus] = useState('');
  const [repRemarks, setRepRemarks] = useState('');

  // Admin action fields
  const [departments, setDepartments] = useState([]);
  const [adminDeptId, setAdminDeptId] = useState('');
  const [adminPriority, setAdminPriority] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');

  const fetchDetails = async () => {
    try {
      const response = await api.get(`/complaints/${id}`);
      setData(response.data);
      // Prepopulate forms
      setRepStatus(response.data.complaint.status === 'Assigned' ? 'In Progress' : response.data.complaint.status);
      setAdminPriority(response.data.complaint.priority);
      setAdminDeptId(response.data.complaint.department_id || '');
    } catch (err) {
      setError('Could not retrieve complaint details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    
    // Fetch departments list if user is Admin
    if (user?.role === 'Admin') {
      api.get('/admin/departments')
        .then(res => setDepartments(res.data))
        .catch(err => console.error('Error fetching departments:', err));
    }
  }, [id, user]);

  const handleRepSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    if (!repRemarks) {
      setActionError('Please enter remarks/resolution notes.');
      return;
    }

    setActionLoading(true);
    try {
      await api.put(`/department/complaints/${id}/status`, {
        status: repStatus,
        remarks: repRemarks
      });
      setRepRemarks('');
      await fetchDetails();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to update complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminAssign = async (e) => {
    e.preventDefault();
    setActionError('');
    if (!adminDeptId) {
      setActionError('Please select a department.');
      return;
    }

    setActionLoading(true);
    try {
      await api.post('/admin/assign', {
        complaint_id: id,
        department_id: adminDeptId,
        priority: adminPriority
      });
      await fetchDetails();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to assign complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminEscalate = async (e) => {
    e.preventDefault();
    setActionError('');
    if (!adminRemarks) {
      setActionError('Please enter escalation reason/remarks.');
      return;
    }

    setActionLoading(true);
    try {
      await api.put('/admin/escalate', {
        complaint_id: id,
        priority: adminPriority,
        remarks: adminRemarks
      });
      setAdminRemarks('');
      await fetchDetails();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to update priority.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminClose = async (e) => {
    e.preventDefault();
    setActionError('');
    if (!adminRemarks) {
      setActionError('Please provide closing summary remarks.');
      return;
    }

    setActionLoading(true);
    try {
      await api.put('/admin/close', {
        complaint_id: id,
        remarks: adminRemarks
      });
      setAdminRemarks('');
      await fetchDetails();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to close complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container-fluid py-2">
        <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 p-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error || 'Complaint not found.'}
        </div>
        <Link to="/" className="btn btn-outline-primary rounded-pill px-3">
          Back to Home
        </Link>
      </div>
    );
  }

  const { complaint, updates } = data;

  return (
    <div className="container-fluid py-2">
      {/* Navigation link */}
      <div className="mb-4">
        <Link 
          to={user?.role === 'Student' ? '/student/dashboard' : user?.role === 'Admin' ? '/admin/dashboard' : '/department/dashboard'} 
          className="text-primary text-decoration-none fs-7 fw-semibold"
        >
          <i className="bi bi-arrow-left me-1"></i> Back to Workspace
        </Link>
      </div>

      <div className="row">
        {/* Left Column: Complaint Details */}
        <div className="col-lg-7 mb-4">
          <div className="glass-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <span className="text-primary fw-bold fs-6">Grievance Ticket #{complaint.id}</span>
                <h2 className="text-white mt-1 mb-2 font-heading">{complaint.title}</h2>
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <span className="badge bg-secondary">{complaint.category}</span>
                  <span className={`badge ${
                    complaint.priority === 'Critical' ? 'bg-danger text-white' :
                    complaint.priority === 'High' ? 'bg-warning text-dark' :
                    complaint.priority === 'Medium' ? 'bg-primary text-white' : 'bg-secondary text-white'
                  }`}>{complaint.priority} Priority</span>
                </div>
              </div>
              <span className={`badge badge-status badge-status-${
                complaint.status === 'Pending' ? 'pending' :
                complaint.status === 'Assigned' ? 'assigned' :
                complaint.status === 'In Progress' ? 'progress' :
                complaint.status === 'Resolved' ? 'resolved' : 'closed'
              } fs-7`}>
                {complaint.status}
              </span>
            </div>

            {/* Meta values */}
            <div className="row bg-dark bg-opacity-40 rounded-3 p-3 g-3 mb-4">
              <div className="col-6 col-sm-4">
                <span className="text-muted d-block fs-8 text-uppercase">Filed By</span>
                <strong className="text-light">{complaint.student_name}</strong>
              </div>
              <div className="col-6 col-sm-4">
                <span className="text-muted d-block fs-8 text-uppercase">Department</span>
                <strong className="text-light">{complaint.department_name || 'Awaiting Routing'}</strong>
              </div>
              <div className="col-12 col-sm-4">
                <span className="text-muted d-block fs-8 text-uppercase">Filed Date</span>
                <strong className="text-light">{new Date(complaint.created_at).toLocaleString()}</strong>
              </div>
              {user?.role !== 'Student' && (
                <>
                  <div className="col-6 col-sm-4">
                    <span className="text-muted d-block fs-8 text-uppercase">Student Email</span>
                    <a href={`mailto:${complaint.student_email}`} className="text-primary text-decoration-none">{complaint.student_email}</a>
                  </div>
                  <div className="col-6 col-sm-4">
                    <span className="text-muted d-block fs-8 text-uppercase">Student Phone</span>
                    <strong className="text-light">{complaint.student_phone || 'N/A'}</strong>
                  </div>
                </>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <h5 className="text-white mb-2">Detailed Description</h5>
              <p className="text-muted fs-7 bg-dark bg-opacity-20 p-3 rounded-3 border border-secondary" style={{ whiteSpace: 'pre-wrap' }}>
                {complaint.description}
              </p>
            </div>

            {/* Evidence File */}
            {complaint.evidence_url && (
              <div className="mb-4">
                <h5 className="text-white mb-2">Evidence Attachment</h5>
                <div className="glass-card p-3 d-flex align-items-center justify-content-between border-secondary">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-file-earmark-check-fill text-primary display-6 me-3"></i>
                    <div>
                      <span className="text-white d-block fs-7 font-heading">Evidence Attachment Uploaded</span>
                      <small className="text-muted fs-8">Securely hosted on Amazon S3</small>
                    </div>
                  </div>
                  <a href={complaint.evidence_url} target="_blank" rel="noreferrer" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                    <i className="bi bi-download me-1"></i> View Document
                  </a>
                </div>
              </div>
            )}

            {/* Role-Based Action Forms */}
            {actionError && (
              <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 p-3 fs-8 mb-4">
                <i className="bi bi-exclamation-triangle-fill me-2"></i> {actionError}
              </div>
            )}

            {/* 1. Department Representative Actions */}
            {user?.role === 'Department Representative' && complaint.status !== 'Closed' && (
              <div className="border-top border-secondary pt-4 mt-4">
                <h5 className="text-white mb-3">Update Investigation Status</h5>
                <form onSubmit={handleRepSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted fs-8 text-uppercase">Status State</label>
                      <select 
                        className="form-select" 
                        value={repStatus} 
                        onChange={(e) => setRepStatus(e.target.value)}
                        disabled={actionLoading}
                      >
                        <option value="In Progress">In Progress (Investigating)</option>
                        <option value="Resolved">Resolved (Resolution Found)</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted fs-8 text-uppercase">Resolution / Remarks Notes *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Detail findings, actions taken, or instructions for the student..."
                      value={repRemarks}
                      onChange={(e) => setRepRemarks(e.target.value)}
                      disabled={actionLoading}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-premium-primary btn-sm" disabled={actionLoading}>
                    {actionLoading && <span className="spinner-border spinner-border-sm me-2"></span>}
                    Submit Findings
                  </button>
                </form>
              </div>
            )}

            {/* 2. Administrator Actions */}
            {user?.role === 'Admin' && (
              <div className="border-top border-secondary pt-4 mt-4">
                <h5 className="text-white mb-3">Administrator Control Desk</h5>
                
                {/* Tabbed Action Layout */}
                <div className="accordion accordion-dark" id="adminActionsAccordion">
                  
                  {/* Action 1: Routing & Assignment */}
                  <div className="accordion-item bg-transparent border-secondary mb-2 rounded-3">
                    <h2 className="accordion-header" id="headingAssign">
                      <button className="accordion-button collapsed bg-dark bg-opacity-50 text-white border-0" type="button" data-bs-toggle="collapse" data-bs-target="#collapseAssign">
                        <i className="bi bi-signpost-split me-2 text-primary"></i> Assign Department Route
                      </button>
                    </h2>
                    <div id="collapseAssign" className="accordion-collapse collapse" data-bs-parent="#adminActionsAccordion">
                      <div className="accordion-body bg-dark bg-opacity-20">
                        <form onSubmit={handleAdminAssign}>
                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label text-muted fs-8 text-uppercase">Target Department</label>
                              <select className="form-select" value={adminDeptId} onChange={(e) => setAdminDeptId(e.target.value)} required>
                                <option value="">-- Choose Department --</option>
                                {departments.map(d => (
                                  <option value={d.id} key={d.id}>{d.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted fs-8 text-uppercase">Reset Priority</label>
                              <select className="form-select" value={adminPriority} onChange={(e) => setAdminPriority(e.target.value)}>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                              </select>
                            </div>
                          </div>
                          <button type="submit" className="btn btn-premium-primary btn-sm" disabled={actionLoading}>
                            Confirm Department Assignment
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Action 2: Escalations */}
                  <div className="accordion-item bg-transparent border-secondary mb-2 rounded-3">
                    <h2 className="accordion-header" id="headingEscalate">
                      <button className="accordion-button collapsed bg-dark bg-opacity-50 text-white border-0" type="button" data-bs-toggle="collapse" data-bs-target="#collapseEscalate">
                        <i className="bi bi-arrow-up-circle me-2 text-warning"></i> Escalate Ticket Severity
                      </button>
                    </h2>
                    <div id="collapseEscalate" className="accordion-collapse collapse" data-bs-parent="#adminActionsAccordion">
                      <div className="accordion-body bg-dark bg-opacity-20">
                        <form onSubmit={handleAdminEscalate}>
                          <div className="mb-3">
                            <label className="form-label text-muted fs-8 text-uppercase">New Severity Priority</label>
                            <select className="form-select mb-3" value={adminPriority} onChange={(e) => setAdminPriority(e.target.value)}>
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                              <option value="Critical">Critical</option>
                            </select>
                            <label className="form-label text-muted fs-8 text-uppercase">Escalation Justification *</label>
                            <textarea 
                              className="form-control" 
                              rows="2" 
                              placeholder="Reasoning for setting new severity level..."
                              value={adminRemarks}
                              onChange={(e) => setAdminRemarks(e.target.value)}
                              required
                            ></textarea>
                          </div>
                          <button type="submit" className="btn btn-warning btn-sm fw-bold" disabled={actionLoading}>
                            Escalate Priority Level
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Action 3: Closures */}
                  {complaint.status !== 'Closed' && (
                    <div className="accordion-item bg-transparent border-secondary mb-2 rounded-3">
                      <h2 className="accordion-header" id="headingClose">
                        <button className="accordion-button collapsed bg-dark bg-opacity-50 text-white border-0" type="button" data-bs-toggle="collapse" data-bs-target="#collapseClose">
                          <i className="bi bi-x-circle me-2 text-danger"></i> Formal Complaint Closure
                        </button>
                      </h2>
                      <div id="collapseClose" className="accordion-collapse collapse" data-bs-parent="#adminActionsAccordion">
                        <div className="accordion-body bg-dark bg-opacity-20">
                          <form onSubmit={handleAdminClose}>
                            <div className="mb-3">
                              <label className="form-label text-muted fs-8 text-uppercase">Closure Audit Summary *</label>
                              <textarea 
                                className="form-control" 
                                rows="3" 
                                placeholder="Formal notes stating why this grievance is being closed. This will be sent to the student..."
                                value={adminRemarks}
                                onChange={(e) => setAdminRemarks(e.target.value)}
                                required
                              ></textarea>
                            </div>
                            <button type="submit" className="btn btn-danger btn-sm fw-bold" disabled={actionLoading}>
                              Close Ticket Officially
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Update Timeline Log */}
        <div className="col-lg-5">
          <div className="glass-card p-4 h-100">
            <h4 className="text-white mb-4">Grievance Audit Trail</h4>

            {updates.length === 0 ? (
              <p className="text-muted fs-7">No timeline remarks generated yet.</p>
            ) : (
              <div className="timeline-trail ps-3 ms-2">
                {updates.map((u, idx) => (
                  <div key={u.id} className={`timeline-item ${u.status_to === 'Closed' ? 'timeline-item-closed' : u.status_to === 'Resolved' ? 'timeline-item-resolved' : ''}`}>
                    <div className="timeline-marker"></div>
                    <div className="mb-1 d-flex flex-wrap align-items-center justify-content-between">
                      <span className="badge bg-secondary fs-8">
                        {u.status_from === u.status_to ? u.status_to : `${u.status_from} → ${u.status_to}`}
                      </span>
                      <small className="text-muted fs-8">
                        {new Date(u.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                    
                    <div className="bg-dark bg-opacity-40 p-3 rounded border border-secondary">
                      <div className="fs-7 text-white mb-1" style={{ whiteSpace: 'pre-wrap' }}>
                        "{u.remarks}"
                      </div>
                      <div className="text-primary text-end fs-8 fw-semibold">
                        — {u.updater_name} ({u.updater_role})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
