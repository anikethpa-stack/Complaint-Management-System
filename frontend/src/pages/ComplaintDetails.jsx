import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

/**
 * Redesigned Details View for Student Grievance tickets
 */
const ComplaintDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Actions
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Rep status fields
  const [repStatus, setRepStatus] = useState('');
  const [repRemarks, setRepRemarks] = useState('');

  // Admin action fields
  const [departments, setDepartments] = useState([]);
  const [adminDeptId, setAdminDeptId] = useState('');
  const [adminPriority, setAdminPriority] = useState('');
  const [adminRemarksState, setAdminRemarksState] = useState('');
  const [adminStatus, setAdminStatus] = useState('');
  const [adminStatusRemarks, setAdminStatusRemarks] = useState('');

  const fetchDetails = async () => {
    try {
      const isUrlAdmin = user?.role === 'Admin';
      const response = await api.get(isUrlAdmin ? `/admin/complaints/${id}` : `/complaints/${id}`);
      
      let detailsData = response.data;
      
      // Compatibility mapper for legacy student/rep snake_case responses
      if (!isUrlAdmin) {
        const rawComp = response.data.complaint;
        detailsData = {
          complaint: {
            complaintId: rawComp.id,
            studentId: rawComp.student_id,
            title: rawComp.title,
            category: rawComp.category,
            description: rawComp.description,
            priority: rawComp.priority,
            status: rawComp.status,
            departmentId: rawComp.department_id,
            department: rawComp.department_name,
            attachmentUrl: rawComp.evidence_url,
            adminRemarks: rawComp.admin_remarks || null,
            assignedBy: rawComp.assigned_by || null,
            assignedDate: rawComp.assigned_date || null,
            resolvedDate: rawComp.resolved_date || null,
            createdAt: rawComp.created_at,
            updatedAt: rawComp.updated_at,
            studentName: rawComp.student_name,
            studentEmail: rawComp.student_email,
            studentPhone: rawComp.student_phone,
            studentCollege: rawComp.student_college,
            studentBranch: rawComp.student_branch,
            assignedByName: rawComp.assigned_by_name
          },
          updates: response.data.updates.map(u => ({
            id: u.id,
            complaintId: u.complaint_id,
            userId: u.user_id,
            statusFrom: u.status_from,
            statusTo: u.status_to,
            remarks: u.remarks,
            createdAt: u.created_at,
            updaterName: u.updater_name,
            updaterRole: u.updater_role
          }))
        };
      }

      setData(detailsData);
      setRepStatus(detailsData.complaint.status === 'Assigned' ? 'In Progress' : detailsData.complaint.status);
      setAdminStatus(detailsData.complaint.status);
      setAdminPriority(detailsData.complaint.priority || 'Medium');
      setAdminDeptId(detailsData.complaint.departmentId || '');
      setAdminRemarksState(detailsData.complaint.adminRemarks || '');
    } catch (err) {
      setError('Could not retrieve complaint records.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    if (user?.role === 'Admin') {
      api.get('/admin/departments')
        .then(res => setDepartments(res.data))
        .catch(err => console.error('Error fetching departments:', err));
    }
  }, [id, user]);

  const handleRepSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
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
      setActionSuccess('Status updated successfully!');
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
    setActionSuccess('');
    if (!adminDeptId) {
      setActionError('Please select a department.');
      return;
    }

    setActionLoading(true);
    try {
      await api.patch(`/admin/complaints/${id}/assign`, {
        departmentId: adminDeptId,
        priority: adminPriority
      });
      setActionSuccess('Department assigned and priority updated successfully!');
      await fetchDetails();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to route complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminStatusUpdate = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    if (!adminStatusRemarks) {
      setActionError('Status update remarks are required.');
      return;
    }

    setActionLoading(true);
    try {
      await api.patch(`/admin/complaints/${id}/status`, {
        status: adminStatus,
        remarks: adminStatusRemarks
      });
      setActionSuccess('Status updated successfully!');
      setAdminStatusRemarks('');
      await fetchDetails();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to change status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminRemarksSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    setActionLoading(true);
    try {
      await api.patch(`/admin/complaints/${id}/remarks`, {
        adminRemarks: adminRemarksState
      });
      setActionSuccess('Admin comments updated successfully!');
      await fetchDetails();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to post remarks.');
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
      <div className="container py-3">
        <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 p-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error || 'Record not found.'}
        </div>
        <Link to="/" className="btn btn-outline-primary rounded-pill px-3">
          Back to Home
        </Link>
      </div>
    );
  }

  const { complaint, updates } = data;

  return (
    <div className="container py-2">
      <div className="mb-4">
        <Link 
          to={user?.role === 'Student' ? '/student/dashboard' : user?.role === 'Admin' ? '/admin/dashboard' : '/department/dashboard'} 
          className="btn btn-premium-secondary py-2 px-3 fs-7 fw-bold"
        >
          <i className="bi bi-arrow-left me-1"></i> Back to Workspace
        </Link>
      </div>

      {actionError && (
        <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 p-3 mb-4 fs-7">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="alert alert-success border-0 bg-success bg-opacity-10 text-success rounded-3 p-3 mb-4 fs-7">
          <i className="bi bi-check-circle-fill me-2"></i> {actionSuccess}
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Complaint Details */}
        <div className="col-lg-7">
          <div className="glass-card p-4 bg-white">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <span className="text-primary fw-bold fs-7">Grievance Reference #{complaint.complaintId}</span>
                <h3 className="text-dark font-heading mt-1 mb-2 fs-4">{complaint.title}</h3>
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
                complaint.status === 'Under Review' ? 'review' :
                complaint.status === 'Assigned' ? 'assigned' :
                complaint.status === 'In Progress' ? 'progress' :
                complaint.status === 'Resolved' ? 'resolved' : 'closed'
              } fs-7`}>
                {complaint.status}
              </span>
            </div>

            {/* Profile Meta Cards */}
            <div className="row bg-light rounded-3 p-3 g-3 mb-4 border">
              <div className="col-6 col-sm-4">
                <span className="text-muted d-block fs-8 text-uppercase">Filed By</span>
                <strong className="text-dark fs-7">{complaint.studentName}</strong>
              </div>
              <div className="col-6 col-sm-4">
                <span className="text-muted d-block fs-8 text-uppercase">Department Route</span>
                <strong className="text-dark fs-7">{complaint.department || 'Unassigned'}</strong>
              </div>
              <div className="col-12 col-sm-4">
                <span className="text-muted d-block fs-8 text-uppercase">Filed Date</span>
                <strong className="text-dark fs-7">{new Date(complaint.createdAt).toLocaleString()}</strong>
              </div>
              {user?.role !== 'Student' && (
                <>
                  <div className="col-6 col-sm-4">
                    <span className="text-muted d-block fs-8 text-uppercase">Student Email</span>
                    <a href={`mailto:${complaint.studentEmail}`} className="text-primary text-decoration-none fs-7">{complaint.studentEmail}</a>
                  </div>
                  <div className="col-6 col-sm-4">
                    <span className="text-muted d-block fs-8 text-uppercase">Student Phone</span>
                    <strong className="text-dark fs-7">{complaint.studentPhone || 'N/A'}</strong>
                  </div>
                </>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <h5 className="text-dark mb-2 font-heading fs-6">Detailed Description</h5>
              <div className="text-muted fs-7 bg-light p-3 rounded-3 border" style={{ whiteSpace: 'pre-wrap' }}>
                {complaint.description}
              </div>
            </div>

            {/* Evidence attachment */}
            {complaint.attachmentUrl && (
              <div className="mb-4">
                <h5 className="text-dark mb-2 font-heading fs-6">Evidence Attachment</h5>
                <div className="glass-card p-3 border bg-light bg-opacity-35">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-file-earmark-check-fill text-primary display-6 me-3"></i>
                      <div>
                        <span className="text-dark d-block fs-7 font-heading">Attachment Uploaded</span>
                        <small className="text-muted fs-8">Securely hosted on Amazon S3</small>
                      </div>
                    </div>
                    <a href={complaint.attachmentUrl} target="_blank" rel="noreferrer" className="btn btn-premium-primary py-1 px-3 fs-8">
                      <i className="bi bi-eye-fill me-1"></i> Open In New Tab
                    </a>
                  </div>
                  {/\.(jpg|jpeg|png|webp|gif|svg)/i.test(complaint.attachmentUrl) && (
                    <div className="text-center mt-2 border rounded-3 p-2 bg-white" style={{ maxHeight: '350px', overflow: 'hidden' }}>
                      <img 
                        src={complaint.attachmentUrl} 
                        alt="Evidence Attachment Preview" 
                        style={{ maxWidth: '100%', maxHeight: '330px', objectFit: 'contain' }} 
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admin remarks text */}
            {complaint.adminRemarks && (
              <div className="mb-4 border-top pt-3">
                <h5 className="text-dark mb-2 font-heading fs-6">Administrator Comments</h5>
                <div className="text-dark bg-info bg-opacity-10 border border-info border-opacity-30 p-3 rounded-3 fs-7">
                  {complaint.adminRemarks}
                </div>
              </div>
            )}

            {/* ROLE-BASED ACTIONS */}

            {/* 1. Department Representative Actions */}
            {user?.role === 'Department Representative' && complaint.status !== 'Closed' && (
              <div className="border-top pt-4 mt-4">
                <h5 className="text-dark font-heading mb-3 fs-6">Department Redressal Desk</h5>
                <form onSubmit={handleRepSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted fs-8 text-uppercase fw-bold">Investigation Status</label>
                      <select 
                        className="form-select" 
                        value={repStatus} 
                        onChange={(e) => setRepStatus(e.target.value)}
                        disabled={actionLoading}
                      >
                        <option value="In Progress">In Progress (Investigating)</option>
                        <option value="Resolved">Resolved (Resolution Posted)</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted fs-8 text-uppercase fw-bold">Resolution & Actions Taken Remarks *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Detail findings, investigations, or resolution guidelines for the student..."
                      value={repRemarks}
                      onChange={(e) => setRepRemarks(e.target.value)}
                      disabled={actionLoading}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-premium-primary btn-sm px-4" disabled={actionLoading}>
                    {actionLoading && <span className="spinner-border spinner-border-sm me-2"></span>}
                    Submit Actions Update
                  </button>
                </form>
              </div>
            )}

            {/* 2. Admin Desk Actions */}
            {user?.role === 'Admin' && (
              <div className="border-top pt-4 mt-4">
                <h5 className="text-dark font-heading mb-3 fs-6">Administrative Control Workspace</h5>
                
                <div className="accordion" id="adminActionsAccordion">
                  
                  {/* Action 1: Routing & Assignment */}
                  <div className="accordion-item bg-transparent border-light mb-2 rounded-3 border">
                    <h2 className="accordion-header" id="headingAssign">
                      <button className="accordion-button collapsed bg-light text-dark fs-7 fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseAssign">
                        <i className="bi bi-signpost-split-fill me-2 text-primary"></i> Route Department & Priority
                      </button>
                    </h2>
                    <div id="collapseAssign" className="accordion-collapse collapse" data-bs-parent="#adminActionsAccordion">
                      <div className="accordion-body bg-light bg-opacity-30">
                        <form onSubmit={handleAdminAssign}>
                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label className="form-label text-muted fs-8 text-uppercase fw-bold">Target Department Route</label>
                              <select className="form-select" value={adminDeptId} onChange={(e) => setAdminDeptId(e.target.value)} required>
                                <option value="">-- Select Route --</option>
                                {departments.map(d => (
                                  <option value={d.id} key={d.id}>{d.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted fs-8 text-uppercase fw-bold">Priority Severity</label>
                              <select className="form-select" value={adminPriority} onChange={(e) => setAdminPriority(e.target.value)}>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                              </select>
                            </div>
                          </div>
                          <button type="submit" className="btn btn-premium-primary btn-sm px-4" disabled={actionLoading}>
                            Apply Route Parameters
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Action 2: Unified Status Update */}
                  <div className="accordion-item bg-transparent border-light mb-2 rounded-3 border">
                    <h2 className="accordion-header" id="headingStatus">
                      <button className="accordion-button collapsed bg-light text-dark fs-7 fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseStatus">
                        <i className="bi bi-exclamation-triangle-fill me-2 text-warning"></i> Audit Status Transition
                      </button>
                    </h2>
                    <div id="collapseStatus" className="accordion-collapse collapse" data-bs-parent="#adminActionsAccordion">
                      <div className="accordion-body bg-light bg-opacity-30">
                        <form onSubmit={handleAdminStatusUpdate}>
                          <div className="mb-3">
                            <label className="form-label text-muted fs-8 text-uppercase fw-bold">Set State</label>
                            <select className="form-select mb-3" value={adminStatus} onChange={(e) => setAdminStatus(e.target.value)}>
                              <option value="Pending">Pending</option>
                              <option value="Under Review">Under Review</option>
                              <option value="Assigned">Assigned</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                              <option value="Closed">Closed</option>
                            </select>
                            <label className="form-label text-muted fs-8 text-uppercase fw-bold">Status Update Remarks / Audit Trail Entry *</label>
                            <textarea 
                              className="form-control" 
                              rows="2" 
                              placeholder="Justification or actions taken detail for this status shift..."
                              value={adminStatusRemarks}
                              onChange={(e) => setAdminStatusRemarks(e.target.value)}
                              required
                            ></textarea>
                          </div>
                          <button type="submit" className="btn btn-premium-primary btn-sm px-4" disabled={actionLoading}>
                            Execute Status Change
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Action 3: Comments & Remarks */}
                  <div className="accordion-item bg-transparent border-light mb-2 rounded-3 border">
                    <h2 className="accordion-header" id="headingRemarks">
                      <button className="accordion-button collapsed bg-light text-dark fs-7 fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseRemarks">
                        <i className="bi bi-chat-left-text-fill me-2 text-info"></i> Edit Portal Comments
                      </button>
                    </h2>
                    <div id="collapseRemarks" className="accordion-collapse collapse" data-bs-parent="#adminActionsAccordion">
                      <div className="accordion-body bg-light bg-opacity-30">
                        <form onSubmit={handleAdminRemarksSubmit}>
                          <div className="mb-3">
                            <label className="form-label text-muted fs-8 text-uppercase fw-bold">Admin Remarks Comments</label>
                            <textarea 
                              className="form-control" 
                              rows="3" 
                              placeholder="Write a formal comment for student reference..."
                              value={adminRemarksState}
                              onChange={(e) => setAdminRemarksState(e.target.value)}
                            ></textarea>
                          </div>
                          <button type="submit" className="btn btn-premium-primary btn-sm px-4" disabled={actionLoading}>
                            Save Comments
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Timeline Log */}
        <div className="col-lg-5">
          <div className="glass-card p-4 bg-white h-100">
            <h4 className="text-dark font-heading mb-4 fs-6">Grievance Audit Trail History</h4>

            {updates.length === 0 ? (
              <p className="text-muted fs-7">No audits generated.</p>
            ) : (
              <div className="timeline-trail ps-3 ms-2">
                {updates.map((u) => (
                  <div key={u.id} className={`timeline-item ${u.statusTo === 'Closed' ? 'timeline-item-closed' : u.statusTo === 'Resolved' ? 'timeline-item-resolved' : ''}`}>
                    <div className="timeline-marker"></div>
                    <div className="mb-1 d-flex flex-wrap align-items-center justify-content-between">
                      <span className="badge bg-secondary fs-8">
                        {u.statusFrom === u.statusTo ? u.statusTo : `${u.statusFrom} → ${u.statusTo}`}
                      </span>
                      <small className="text-muted fs-8">
                        {new Date(u.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                    
                    <div className="bg-light p-3 rounded border">
                      <div className="fs-7 text-dark mb-1" style={{ whiteSpace: 'pre-wrap' }}>
                        "{u.remarks}"
                      </div>
                      <div className="text-primary text-end fs-8 fw-bold">
                        — {u.updaterName} ({u.updaterRole})
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
