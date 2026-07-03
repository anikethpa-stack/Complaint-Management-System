import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';

/**
 * Redesigned Administrative Dashboard Workspace (AWS Console/SaaS style)
 */
const AdminDashboard = () => {
  const location = useLocation();
  
  // Get active tab from URL query params
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'dashboard';

  // State values
  const [dashboardData, setDashboardData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Department creation
  const [newDeptName, setNewDeptName] = useState('');
  const [deptError, setDeptError] = useState('');
  const [deptSuccess, setDeptSuccess] = useState('');

  // Representatives creation/view (kept under Settings or secondary layout log)
  const [reps, setReps] = useState([]);
  const [repName, setRepName] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [repPassword, setRepPassword] = useState('');
  const [repDeptId, setRepDeptId] = useState('');
  const [repPhone, setRepPhone] = useState('');
  const [repError, setRepError] = useState('');
  const [repSuccess, setRepSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch dashboard metrics
      const dashboardRes = await api.get('/admin/dashboard');
      setDashboardData(dashboardRes.data);

      // 2. Fetch all complaints
      const complaintsRes = await api.get('/admin/complaints');
      setComplaints(complaintsRes.data);

      // 3. Fetch departments
      const deptsRes = await api.get('/admin/departments');
      setDepartments(deptsRes.data);

      // 4. Fetch representatives for settings
      const usersRes = await api.get('/admin/users');
      setReps(usersRes.data.filter(u => u.role === 'Department Representative'));
    } catch (err) {
      setError('Failed to load administrative dataset. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleCreateDept = async (e) => {
    e.preventDefault();
    setDeptError('');
    setDeptSuccess('');

    if (!newDeptName) {
      setDeptError('Department name is required.');
      return;
    }

    try {
      await api.post('/admin/departments', { name: newDeptName });
      setDeptSuccess('Department added successfully!');
      setNewDeptName('');
      
      const deptsRes = await api.get('/admin/departments');
      setDepartments(deptsRes.data);
    } catch (err) {
      setDeptError(err.response?.data?.error || 'Failed to register department.');
    }
  };

  const handleCreateRep = async (e) => {
    e.preventDefault();
    setRepError('');
    setRepSuccess('');

    if (!repName || !repEmail || !repPassword || !repDeptId) {
      setRepError('Please fill out all required fields.');
      return;
    }

    try {
      await api.post('/admin/users', {
        name: repName,
        email: repEmail,
        password: repPassword,
        department_id: repDeptId,
        phone: repPhone
      });

      setRepSuccess('Representative registered successfully!');
      setRepName('');
      setRepEmail('');
      setRepPassword('');
      setRepDeptId('');
      setRepPhone('');

      const usersRes = await api.get('/admin/users');
      setReps(usersRes.data.filter(u => u.role === 'Department Representative'));
    } catch (err) {
      setRepError(err.response?.data?.error || 'Failed to register representative.');
    }
  };

  const handleDeleteRep = async (repId) => {
    if (!window.confirm('Are you sure you want to delete this representative?')) return;
    try {
      await api.delete(`/admin/users/${repId}`);
      setReps(reps.filter(r => r.id !== repId));
    } catch (err) {
      alert('Failed to delete representative account.');
    }
  };

  // Perform backend-like client filtering
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = searchQuery === '' || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.complaintId.toString().includes(searchQuery);

    const matchesStatus = statusFilter === '' || c.status === statusFilter;
    const matchesPriority = priorityFilter === '' || c.priority === priorityFilter;
    const matchesDept = deptFilter === '' || c.departmentId === parseInt(deptFilter, 10);
    const matchesCategory = categoryFilter === '' || c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesDept && matchesCategory;
  });

  const uniqueCategories = Array.from(new Set(complaints.map(c => c.category).filter(Boolean)));

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    total: 0, pending: 0, underReview: 0, assigned: 0, inProgress: 0, resolved: 0, closed: 0
  };

  return (
    <div className="container-fluid py-2">
      {/* Console Welcome Banner */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="glass-card p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center">
            <div>
              <h2 className="mb-1 font-heading text-dark text-uppercase tracking-tight" style={{ fontSize: '1.5rem' }}>
                <i className="bi bi-clouds-fill text-primary me-2"></i> Grievance Console Desk
              </h2>
              <p className="text-muted mb-0 fs-7">AWS-enabled cloud infrastructure for university complaints redressal auditing.</p>
            </div>
            <div className="mt-3 mt-md-0 d-flex gap-2">
              <Link to="/admin/analytics" className="btn btn-premium-secondary py-2 fs-7">
                <i className="bi bi-bar-chart-line-fill me-1"></i> Full Analytics
              </Link>
              <button onClick={loadData} className="btn btn-premium-primary py-2 fs-7">
                <i className="bi bi-arrow-clockwise me-1"></i> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 p-3 mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
        </div>
      )}

      {/* METRICS CARDS ROW */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3 col-lg-2">
          <div className="glass-card p-3 text-center border-primary bg-white">
            <span className="text-muted d-block fs-8 text-uppercase tracking-wider">Total</span>
            <strong className="display-6 font-heading text-dark">{stats.total}</strong>
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <div className="glass-card p-3 text-center bg-white" style={{ borderLeft: '4px solid #F59E0B' }}>
            <span className="text-muted d-block fs-8 text-uppercase tracking-wider">Pending</span>
            <strong className="display-6 font-heading text-warning">{stats.pending}</strong>
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <div className="glass-card p-3 text-center bg-white" style={{ borderLeft: '4px solid #4DB6B8' }}>
            <span className="text-muted d-block fs-8 text-uppercase tracking-wider">Review</span>
            <strong className="display-6 font-heading text-primary">{stats.underReview}</strong>
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <div className="glass-card p-3 text-center bg-white" style={{ borderLeft: '4px solid #1F4E52' }}>
            <span className="text-muted d-block fs-8 text-uppercase tracking-wider">Assigned</span>
            <strong className="display-6 font-heading" style={{ color: '#1F4E52' }}>{stats.assigned}</strong>
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <div className="glass-card p-3 text-center bg-white" style={{ borderLeft: '4px solid #0EA5E9' }}>
            <span className="text-muted d-block fs-8 text-uppercase tracking-wider">Progress</span>
            <strong className="display-6 font-heading text-info">{stats.inProgress}</strong>
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <div className="glass-card p-3 text-center bg-white" style={{ borderLeft: '4px solid #3CA3A5' }}>
            <span className="text-muted d-block fs-8 text-uppercase tracking-wider">Resolved</span>
            <strong className="display-6 font-heading text-success">{stats.resolved}</strong>
          </div>
        </div>
      </div>

      {/* VIEW SWITCHER TABS CONTAINER */}
      {activeTab === 'dashboard' && (
        <div className="row g-4 fade-in">
          {/* Status distribution - Lightweight analytics */}
          <div className="col-lg-6">
            <div className="glass-card p-4 h-100 bg-white">
              <h4 className="text-dark font-heading mb-4 fs-6">Complaint Status Distribution</h4>
              <div className="d-flex flex-column gap-3">
                {[
                  { name: 'Pending Route', count: stats.pending, color: '#F59E0B' },
                  { name: 'Under Review', count: stats.underReview, color: '#4DB6B8' },
                  { name: 'Assigned to Dept', count: stats.assigned, color: '#1F4E52' },
                  { name: 'In Progress', count: stats.inProgress, color: '#0EA5E9' },
                  { name: 'Resolved Tickets', count: stats.resolved, color: '#3CA3A5' },
                  { name: 'Closed Tickets', count: stats.closed, color: '#6B7280' }
                ].map((item, idx) => {
                  const pct = stats.total > 0 ? ((item.count / stats.total) * 100).toFixed(0) : 0;
                  return (
                    <div key={idx}>
                      <div className="d-flex justify-content-between mb-1 fs-7">
                        <span className="fw-semibold text-dark">{item.name}</span>
                        <span className="text-muted">{item.count} complaints ({pct}%)</span>
                      </div>
                      <div className="custom-progress-container" style={{ height: '10px' }}>
                        <div className="custom-progress-bar" style={{ width: `${pct}%`, background: item.color }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Department Distribution bar graph */}
          <div className="col-lg-6">
            <div className="glass-card p-4 h-100 bg-white">
              <h4 className="text-dark font-heading mb-4 fs-6">Department Distribution</h4>
              {dashboardData?.departmentDistribution?.length === 0 ? (
                <p className="text-muted fs-7">No complaints assigned to departments yet.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {dashboardData?.departmentDistribution?.map((dept, idx) => {
                    const pct = stats.total > 0 ? ((dept.count / stats.total) * 100).toFixed(0) : 0;
                    return (
                      <div key={idx}>
                        <div className="d-flex justify-content-between mb-1 fs-7">
                          <span className="fw-semibold text-dark">{dept.department}</span>
                          <span className="text-muted">{dept.count} active</span>
                        </div>
                        <div className="custom-progress-container" style={{ height: '10px' }}>
                          <div className="custom-progress-bar" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Complaints widget */}
          <div className="col-12 mt-4">
            <div className="glass-card p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="text-dark font-heading mb-0 fs-6">Recent Submitted Complaints</h4>
                <Link to="/admin/dashboard?tab=complaints" className="text-primary text-decoration-none fs-7 fw-bold">View All</Link>
              </div>

              <div className="table-responsive">
                <table className="table align-middle mb-0" style={{ fontSize: '13px' }}>
                  <thead>
                    <tr className="text-muted border-bottom">
                      <th>ID</th>
                      <th>Title</th>
                      <th>Student</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData?.recentComplaints?.map(c => (
                      <tr key={c.complaintId} className="border-bottom">
                        <td className="fw-bold text-primary">#{c.complaintId}</td>
                        <td className="fw-semibold text-dark">{c.title}</td>
                        <td>{c.studentName}</td>
                        <td>{c.category}</td>
                        <td>
                          <span className={`badge badge-status badge-status-${
                            c.status === 'Pending' ? 'pending' :
                            c.status === 'Under Review' ? 'review' :
                            c.status === 'Assigned' ? 'assigned' :
                            c.status === 'In Progress' ? 'progress' :
                            c.status === 'Resolved' ? 'resolved' : 'closed'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <Link to={`/complaints/${c.complaintId}`} className="btn btn-outline-primary btn-sm rounded-pill py-0 px-2 fs-8">
                            Audit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPLAINTS TAB */}
      {activeTab === 'complaints' && (
        <div className="row fade-in">
          <div className="col-12">
            <div className="glass-card p-4 bg-white">
              <h4 className="text-dark font-heading mb-4 fs-6">Grievance Redressal Audit Board</h4>

              {/* Filters & Search Row */}
              <div className="row g-3 mb-4 align-items-end">
                <div className="col-md-4">
                  <label className="form-label text-muted fs-8 text-uppercase fw-bold">Search Keywords</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search ID, title, descriptions, or student name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label text-muted fs-8 text-uppercase fw-bold">Status</label>
                  <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label text-muted fs-8 text-uppercase fw-bold">Priority</label>
                  <select className="form-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                    <option value="">All Priorities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label text-muted fs-8 text-uppercase fw-bold">Department</label>
                  <select className="form-select" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                    <option value="">All Departments</option>
                    {departments.map(d => (
                      <option value={d.id} key={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label text-muted fs-8 text-uppercase fw-bold">Category</label>
                  <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="">All Categories</option>
                    {uniqueCategories.map((c, idx) => (
                      <option value={c} key={idx}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredComplaints.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-search fs-1 mb-3 d-block text-secondary"></i>
                  <p className="mb-0">No complaints matched your search filter parameters.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle" style={{ fontSize: '13.5px' }}>
                    <thead>
                      <tr className="text-muted border-bottom">
                        <th>ID</th>
                        <th>Title / Category</th>
                        <th>Student</th>
                        <th>Routed Dept</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th className="text-end">Manage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComplaints.map(c => (
                        <tr key={c.complaintId} className="border-bottom">
                          <td className="fw-bold text-primary">#{c.complaintId}</td>
                          <td>
                            <div className="fw-bold text-dark mb-0">{c.title}</div>
                            <small className="text-muted">{c.category}</small>
                          </td>
                          <td>
                            <div className="text-dark fw-bold mb-0">{c.studentName}</div>
                            <small className="text-muted d-block">{c.studentEmail}</small>
                            {c.studentCollege && (
                              <span className="badge bg-secondary p-1 mt-1 text-lowercase fs-9" style={{ textTransform: 'none' }}>
                                {c.studentCollege} ({c.studentBranch})
                              </span>
                            )}
                          </td>
                          <td>{c.department || <span className="text-muted fs-8">Not Assigned</span>}</td>
                          <td>
                            <span className={`badge ${
                              c.priority === 'Critical' ? 'bg-danger' :
                              c.priority === 'High' ? 'bg-warning text-dark' :
                              c.priority === 'Medium' ? 'bg-primary' : 'bg-secondary'
                            } fs-8`}>
                              {c.priority}
                            </span>
                          </td>
                          <td>
                            <span className={`badge badge-status badge-status-${
                              c.status === 'Pending' ? 'pending' :
                              c.status === 'Under Review' ? 'review' :
                              c.status === 'Assigned' ? 'assigned' :
                              c.status === 'In Progress' ? 'progress' :
                              c.status === 'Resolved' ? 'resolved' : 'closed'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="text-end">
                            <Link to={`/complaints/${c.complaintId}`} className="btn btn-premium-primary py-1 px-3 fs-8">
                              <i className="bi bi-gear-fill me-1"></i> Audit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DEPARTMENTS TAB */}
      {activeTab === 'departments' && (
        <div className="row fade-in">
          <div className="col-lg-4 mb-4">
            <div className="glass-card p-4 bg-white border">
              <h5 className="text-dark font-heading mb-4">Register Department Route</h5>

              {deptError && <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 p-3 fs-8 mb-4">{deptError}</div>}
              {deptSuccess && <div className="alert alert-success border-0 bg-success bg-opacity-10 text-success rounded-3 p-3 fs-8 mb-4">{deptSuccess}</div>}

              <form onSubmit={handleCreateDept}>
                <div className="mb-4">
                  <label className="form-label text-muted fs-8 text-uppercase fw-bold">Department Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Examinations Audit Board"
                    value={newDeptName} 
                    onChange={(e) => setNewDeptName(e.target.value)} 
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-premium-primary btn-sm w-100 py-2">
                  <i className="bi bi-plus-circle-fill me-1"></i> Add Department Route
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="glass-card p-4 bg-white">
              <h5 className="text-dark font-heading mb-4">Active Support Departments</h5>
              <div className="table-responsive">
                <table className="table align-middle" style={{ fontSize: '13.5px' }}>
                  <thead>
                    <tr className="text-muted border-bottom">
                      <th>Route ID</th>
                      <th>Department Name</th>
                      <th>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map(d => (
                      <tr key={d.id} className="border-bottom">
                        <td className="fw-semibold text-primary">#{d.id}</td>
                        <td className="text-dark fw-bold">{d.name}</td>
                        <td className="text-muted">
                          {new Date(d.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="row fade-in">
          <div className="col-12">
            <div className="glass-card p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="text-dark font-heading mb-1">Grievances Redressal Summary Log</h5>
                  <p className="text-muted mb-0 fs-7">Audit reports for committee presentations and performance monitoring.</p>
                </div>
                <button onClick={() => window.print()} className="btn btn-premium-primary">
                  <i className="bi bi-printer-fill me-1"></i> Print / Save PDF
                </button>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div className="border rounded p-3 bg-light text-center">
                    <small className="text-muted d-block">Overall Redressal Rate</small>
                    <strong className="fs-4 text-dark font-heading">
                      {stats.total > 0 ? (((stats.resolved + stats.closed) / stats.total) * 100).toFixed(0) : 0}%
                    </strong>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3 bg-light text-center">
                    <small className="text-muted d-block">Average Processing Duration</small>
                    <strong className="fs-4 text-dark font-heading">&lt; 36 Hours</strong>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3 bg-light text-center">
                    <small className="text-muted d-block">Configured Routes</small>
                    <strong className="fs-4 text-dark font-heading">{departments.length} Depts</strong>
                  </div>
                </div>
              </div>

              <h6 className="fw-bold text-dark border-bottom pb-2 mb-3 font-heading">Complete Grievance Audit Logs</h6>
              <div className="table-responsive">
                <table className="table align-middle table-sm text-start" style={{ fontSize: '12px' }}>
                  <thead>
                    <tr className="text-muted border-bottom">
                      <th>ID</th>
                      <th>Title</th>
                      <th>Student</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Date Filed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map(c => (
                      <tr key={c.complaintId} className="border-bottom">
                        <td>#{c.complaintId}</td>
                        <td className="fw-semibold text-dark">{c.title}</td>
                        <td>{c.studentName}</td>
                        <td>{c.department || 'Unassigned'}</td>
                        <td className="fw-bold">{c.status}</td>
                        <td className="text-muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="row g-4 fade-in">
          {/* Rep management views */}
          <div className="col-lg-4">
            <div className="glass-card p-4 bg-white">
              <h5 className="text-dark font-heading mb-4">Register Department Representative</h5>

              {repError && <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 p-3 fs-8 mb-4">{repError}</div>}
              {repSuccess && <div className="alert alert-success border-0 bg-success bg-opacity-10 text-success rounded-3 p-3 fs-8 mb-4">{repSuccess}</div>}

              <form onSubmit={handleCreateRep}>
                <div className="mb-3">
                  <label className="form-label text-muted fs-8 text-uppercase fw-bold">Full Name *</label>
                  <input type="text" className="form-control form-control-sm" value={repName} onChange={(e) => setRepName(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted fs-8 text-uppercase fw-bold">Email Address *</label>
                  <input type="email" className="form-control form-control-sm" value={repEmail} onChange={(e) => setRepEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted fs-8 text-uppercase fw-bold">Password *</label>
                  <input type="password" className="form-control form-control-sm" value={repPassword} onChange={(e) => setRepPassword(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted fs-8 text-uppercase fw-bold">Phone Number</label>
                  <input type="text" className="form-control form-control-sm" value={repPhone} onChange={(e) => setRepPhone(e.target.value)} />
                </div>
                <div className="mb-4">
                  <label className="form-label text-muted fs-8 text-uppercase fw-bold">Assigned Department Route *</label>
                  <select className="form-select form-select-sm" value={repDeptId} onChange={(e) => setRepDeptId(e.target.value)} required>
                    <option value="">-- Choose Route --</option>
                    {departments.map(d => (
                      <option value={d.id} key={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-premium-primary btn-sm w-100 py-2">
                  <i className="bi bi-person-plus-fill me-1"></i> Register Rep Account
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="glass-card p-4 bg-white">
              <h5 className="text-dark font-heading mb-4">Representative Accounts Directory</h5>
              <div className="table-responsive">
                <table className="table align-middle" style={{ fontSize: '13.5px' }}>
                  <thead>
                    <tr className="text-muted border-bottom">
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department Route</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reps.map(r => (
                      <tr key={r.id} className="border-bottom">
                        <td className="text-dark fw-bold">{r.name}</td>
                        <td>{r.email}</td>
                        <td>
                          <span className="badge bg-secondary text-lowercase" style={{ textTransform: 'none' }}>
                            {r.department_name}
                          </span>
                        </td>
                        <td className="text-end">
                          <button onClick={() => handleDeleteRep(r.id)} className="btn btn-outline-danger btn-sm rounded-pill px-2 py-0 fs-8">
                            <i className="bi bi-trash-fill"></i> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
