import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

/**
 * Main console page for Administrators
 */
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('complaints');
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering values for complaints tab
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Rep register form values
  const [repName, setRepName] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [repPassword, setRepPassword] = useState('');
  const [repDeptId, setRepDeptId] = useState('');
  const [repPhone, setRepPhone] = useState('');
  const [repError, setRepError] = useState('');
  const [repSuccess, setRepSuccess] = useState('');

  // Dept creation form values
  const [newDeptName, setNewDeptName] = useState('');
  const [deptError, setDeptError] = useState('');
  const [deptSuccess, setDeptSuccess] = useState('');

  // Fetch metrics and records
  const loadData = async () => {
    setLoading(true);
    try {
      const complaintsRes = await api.get('/admin/complaints');
      setComplaints(complaintsRes.data);

      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data);

      const deptsRes = await api.get('/admin/departments');
      setDepartments(deptsRes.data);
    } catch (err) {
      setError('Could not retrieve console datasets.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

      setRepSuccess('Department Representative registered successfully!');
      setRepName('');
      setRepEmail('');
      setRepPassword('');
      setRepDeptId('');
      setRepPhone('');
      
      // Reload users list
      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data);
    } catch (err) {
      setRepError(err.response?.data?.error || 'Failed to create representative user.');
    }
  };

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
      setDeptSuccess('Department registered successfully!');
      setNewDeptName('');
      
      // Reload departments list
      const deptsRes = await api.get('/admin/departments');
      setDepartments(deptsRes.data);
    } catch (err) {
      setDeptError(err.response?.data?.error || 'Failed to register department.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert('Failed to delete user account.');
    }
  };

  // Filter complaints list dynamically
  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = statusFilter === '' || c.status === statusFilter;
    const matchesPriority = priorityFilter === '' || c.priority === priorityFilter;
    const matchesDept = deptFilter === '' || c.department_id === parseInt(deptFilter, 10);
    return matchesStatus && matchesPriority && matchesDept;
  });

  const getMetric = (status) => complaints.filter(c => c.status === status).length;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-2">
      {/* Overview Headings */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="glass-card p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center">
            <div>
              <h2 className="text-white mb-1 font-heading">System Administration Console</h2>
              <p className="text-muted mb-0">System-wide monitoring, ticket routing, and identity management workspace.</p>
            </div>
            <div className="mt-3 mt-md-0">
              <Link to="/admin/analytics" className="btn btn-premium-primary">
                <i className="bi bi-pie-chart-fill me-2"></i> View System Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 p-3 mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
        </div>
      )}

      {/* Tabs controllers */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="glass-card p-2">
            <ul className="nav nav-pills nav-fill">
              <li className="nav-item">
                <button 
                  className={`nav-link text-white py-3 fs-6 font-heading ${activeTab === 'complaints' ? 'bg-primary' : ''}`}
                  onClick={() => setActiveTab('complaints')}
                >
                  <i className="bi bi-chat-left-text-fill me-2"></i> Grievances ({complaints.length})
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link text-white py-3 fs-6 font-heading ${activeTab === 'reps' ? 'bg-primary' : ''}`}
                  onClick={() => setActiveTab('reps')}
                >
                  <i className="bi bi-people-fill me-2"></i> Representatives ({users.filter(u => u.role === 'Department Representative').length})
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link text-white py-3 fs-6 font-heading ${activeTab === 'departments' ? 'bg-primary' : ''}`}
                  onClick={() => setActiveTab('departments')}
                >
                  <i className="bi bi-building me-2"></i> Departments ({departments.length})
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 1. Complaints Tab */}
      {activeTab === 'complaints' && (
        <div className="row fade-in">
          <div className="col-12">
            <div className="glass-card p-4">
              <h4 className="text-white mb-4">Grievance Routing & Status Tracking</h4>

              {/* Filters row */}
              <div className="row g-3 mb-4">
                <div className="col-6 col-md-4">
                  <label className="form-label text-muted fs-8 text-uppercase">Filter Status</label>
                  <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending Assignment</option>
                    <option value="Assigned">Assigned to Dept</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div className="col-6 col-md-4">
                  <label className="form-label text-muted fs-8 text-uppercase">Filter Priority</label>
                  <select className="form-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                    <option value="">All Priorities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label text-muted fs-8 text-uppercase">Filter Department</label>
                  <select className="form-select" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                    <option value="">All Departments</option>
                    {departments.map(d => (
                      <option value={d.id} key={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredComplaints.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-search fs-1 mb-3 d-block text-secondary"></i>
                  <p className="mb-0">No complaints match your active filters.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                    <thead>
                      <tr className="text-muted border-secondary">
                        <th scope="col" style={{ width: '80px' }}>ID</th>
                        <th scope="col">Title</th>
                        <th scope="col">Student Submitter</th>
                        <th scope="col">Department Area</th>
                        <th scope="col">Priority</th>
                        <th scope="col">Status</th>
                        <th scope="col" className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComplaints.map(c => (
                        <tr key={c.id} className="border-secondary">
                          <td className="fw-semibold text-primary">#{c.id}</td>
                          <td>
                            <div className="fw-bold text-white mb-0">{c.title}</div>
                            <span className="text-muted fs-8">{c.category}</span>
                          </td>
                          <td>
                            <div className="text-white fs-7 mb-0">{c.student_name}</div>
                            <small className="text-muted">{c.student_email}</small>
                          </td>
                          <td>
                            <span className="text-light">{c.department_name || 'Awaiting Routing'}</span>
                          </td>
                          <td>
                            <span className={`badge ${
                              c.priority === 'Critical' ? 'bg-danger text-white' :
                              c.priority === 'High' ? 'bg-warning text-dark' :
                              c.priority === 'Medium' ? 'bg-primary text-white' : 'bg-secondary text-white'
                            } fs-8`}>{c.priority}</span>
                          </td>
                          <td>
                            <span className={`badge badge-status badge-status-${
                              c.status === 'Pending' ? 'pending' :
                              c.status === 'Assigned' ? 'assigned' :
                              c.status === 'In Progress' ? 'progress' :
                              c.status === 'Resolved' ? 'resolved' : 'closed'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="text-end">
                            <Link to={`/complaints/${c.id}`} className="btn btn-outline-primary btn-sm rounded-pill px-3">
                              <i className="bi bi-gear-fill me-1"></i> Manage
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

      {/* 2. Representatives Tab */}
      {activeTab === 'reps' && (
        <div className="row fade-in">
          {/* Representative Registration Form */}
          <div className="col-lg-4 mb-4">
            <div className="glass-card p-4">
              <h5 className="text-white mb-4">Register Representative</h5>

              {repError && <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 p-3 fs-8 mb-4">{repError}</div>}
              {repSuccess && <div className="alert alert-success border-0 bg-success bg-opacity-10 text-success rounded-3 p-3 fs-8 mb-4">{repSuccess}</div>}

              <form onSubmit={handleCreateRep}>
                <div className="mb-3">
                  <label className="form-label text-muted fs-8 text-uppercase">Full Name *</label>
                  <input type="text" className="form-control form-control-sm" value={repName} onChange={(e) => setRepName(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted fs-8 text-uppercase">Email Address *</label>
                  <input type="email" className="form-control form-control-sm" value={repEmail} onChange={(e) => setRepEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted fs-8 text-uppercase">Password *</label>
                  <input type="password" className="form-control form-control-sm" value={repPassword} onChange={(e) => setRepPassword(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted fs-8 text-uppercase">Phone</label>
                  <input type="text" className="form-control form-control-sm" value={repPhone} onChange={(e) => setRepPhone(e.target.value)} />
                </div>
                <div className="mb-4">
                  <label className="form-label text-muted fs-8 text-uppercase">Assigned Department *</label>
                  <select className="form-select" value={repDeptId} onChange={(e) => setRepDeptId(e.target.value)} required>
                    <option value="">-- Choose Department --</option>
                    {departments.map(d => (
                      <option value={d.id} key={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-premium-primary btn-sm w-100">
                  <i className="bi bi-person-plus-fill me-1"></i> Register Representative
                </button>
              </form>
            </div>
          </div>

          {/* Representatives List */}
          <div className="col-lg-8">
            <div className="glass-card p-4">
              <h5 className="text-white mb-4">Department Representative Log</h5>
              
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                  <thead>
                    <tr className="text-muted border-secondary">
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Department</th>
                      <th scope="col">Phone</th>
                      <th scope="col" className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.role === 'Department Representative').map(u => (
                      <tr key={u.id} className="border-secondary">
                        <td className="text-white fw-bold">{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className="badge bg-secondary">{u.department_name}</span>
                        </td>
                        <td className="text-muted">{u.phone || 'N/A'}</td>
                        <td className="text-end">
                          <button onClick={() => handleDeleteUser(u.id)} className="btn btn-outline-danger btn-sm rounded-pill px-3">
                            <i className="bi bi-trash"></i> Delete
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

      {/* 3. Departments Tab */}
      {activeTab === 'departments' && (
        <div className="row fade-in">
          {/* Department Registration Form */}
          <div className="col-lg-4 mb-4">
            <div className="glass-card p-4">
              <h5 className="text-white mb-4">Register Department</h5>

              {deptError && <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 p-3 fs-8 mb-4">{deptError}</div>}
              {deptSuccess && <div className="alert alert-success border-0 bg-success bg-opacity-10 text-success rounded-3 p-3 fs-8 mb-4">{deptSuccess}</div>}

              <form onSubmit={handleCreateDept}>
                <div className="mb-4">
                  <label className="form-label text-muted fs-8 text-uppercase">Department Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Finance Support"
                    value={newDeptName} 
                    onChange={(e) => setNewDeptName(e.target.value)} 
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-premium-primary btn-sm w-100">
                  <i className="bi bi-plus-circle-fill me-1"></i> Add Department
                </button>
              </form>
            </div>
          </div>

          {/* Department List */}
          <div className="col-lg-8">
            <div className="glass-card p-4">
              <h5 className="text-white mb-4">Configured Departments</h5>

              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                  <thead>
                    <tr className="text-muted border-secondary">
                      <th scope="col" style={{ width: '80px' }}>Dept ID</th>
                      <th scope="col">Department Name</th>
                      <th scope="col">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map(d => (
                      <tr key={d.id} className="border-secondary">
                        <td className="fw-semibold text-primary">#{d.id}</td>
                        <td className="text-white fw-bold">{d.name}</td>
                        <td className="text-muted fs-7">
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

    </div>
  );
};

export default AdminDashboard;
