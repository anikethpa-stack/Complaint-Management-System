import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

/**
 * Page displaying the comprehensive history of all student's complaints with filters
 */
const ComplaintHistory = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/complaints');
        setComplaints(response.data);
      } catch (err) {
        setError('Failed to fetch complaint logs. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Filter and Sort implementation
  const filteredComplaints = complaints
    .filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toString().includes(searchTerm);
      const matchesStatus = statusFilter === '' || c.status === statusFilter;
      const matchesPriority = priorityFilter === '' || c.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      return 0;
    });

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
      <div className="mb-4">
        <Link to="/student/dashboard" className="text-primary text-decoration-none fs-7 fw-semibold">
          <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
        </Link>
      </div>

      <div className="glass-card p-4">
        <div className="border-bottom border-secondary pb-3 mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center">
          <div>
            <h3 className="text-white mb-1 font-heading">Grievance Audit Log</h3>
            <p className="text-muted mb-0">List of all complaints filed by you under this account.</p>
          </div>
          <div className="mt-3 mt-sm-0">
            <Link to="/student/submit" className="btn btn-premium-primary btn-sm px-3 py-2">
              <i className="bi bi-plus-lg me-1"></i> New Grievance
            </Link>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 p-3 mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          </div>
        )}

        {/* Filter bar */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <label className="form-label text-muted fs-8 text-uppercase">Search</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 text-muted" style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by ID or Title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label text-muted fs-8 text-uppercase">Status</label>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label text-muted fs-8 text-uppercase">Priority</label>
            <select className="form-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label text-muted fs-8 text-uppercase">Sort By Date</label>
            <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest Filed First</option>
              <option value="oldest">Oldest Filed First</option>
            </select>
          </div>
        </div>

        {/* Complaints Table */}
        {filteredComplaints.length === 0 ? (
          <div className="text-center py-5 text-muted border border-secondary border-dashed rounded-3">
            <i className="bi bi-search fs-1 mb-3 d-block text-secondary"></i>
            <p className="mb-0">No complaints found matching your search or filters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
              <thead>
                <tr className="text-muted border-secondary">
                  <th scope="col" style={{ width: '80px' }}>ID</th>
                  <th scope="col">Title</th>
                  <th scope="col">Department Area</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Status</th>
                  <th scope="col">Date Filed</th>
                  <th scope="col" className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((c) => (
                  <tr key={c.id} className="border-secondary">
                    <td className="fw-semibold text-primary">#{c.id}</td>
                    <td>
                      <div className="fw-bold text-white mb-1">{c.title}</div>
                      <span className="text-muted fs-8">{c.category}</span>
                    </td>
                    <td>
                      <span className="text-light">{c.department_name || 'Awaiting Assignment'}</span>
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
                    <td className="text-muted fs-7">
                      {new Date(c.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="text-end">
                      <Link to={`/complaints/${c.id}`} className="btn btn-outline-primary btn-sm rounded-pill px-3">
                        <i className="bi bi-eye"></i> Details
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
  );
};

export default ComplaintHistory;
