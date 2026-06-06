import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

/**
 * Dashboard landing view for authenticated Students
 */
const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch student complaints on mount
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await api.get('/complaints');
        setComplaints(response.data);
      } catch (err) {
        setError('Could not retrieve your complaint log. Try refreshing the page.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // Compute status summary metrics
  const getMetric = (status) => complaints.filter(c => c.status === status).length;
  
  const metrics = [
    { title: 'Total Filed', count: complaints.length, icon: 'bi-list-ul', bg: 'bg-primary' },
    { title: 'Pending Approval', count: getMetric('Pending'), icon: 'bi-hourglass-split', bg: 'bg-warning' },
    { title: 'In Investigation', count: getMetric('In Progress') + getMetric('Assigned'), icon: 'bi-search', bg: 'bg-info' },
    { title: 'Resolved Issues', count: getMetric('Resolved'), icon: 'bi-check2-circle', bg: 'bg-success' },
    { title: 'Closed Tickets', count: getMetric('Closed'), icon: 'bi-lock', bg: 'bg-secondary' }
  ];

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
      {/* Welcome Banner */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="glass-card p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center">
            <div>
              <h2 className="text-white mb-1 font-heading">Student Workspace</h2>
              <p className="text-muted mb-0">Hello, <strong className="text-white">{user?.name}</strong>. Here is the status of your active grievances.</p>
            </div>
            <div className="mt-3 mt-md-0">
              <Link to="/student/submit" className="btn btn-premium-primary">
                <i className="bi bi-plus-lg me-2"></i> File New Grievance
              </Link>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 p-3 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
        </div>
      )}

      {/* Metrics Row */}
      <div className="row mb-4">
        {metrics.map((m, idx) => (
          <div className="col-6 col-lg mb-3" key={idx}>
            <div className="glass-card p-3 h-100 metric-card d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block fs-8 text-uppercase mb-1">{m.title}</span>
                <h3 className="text-white mb-0 fw-bold">{m.count}</h3>
              </div>
              <div className={`rounded-circle d-flex align-items-center justify-content-center text-white ${m.bg}`} style={{ width: '45px', height: '45px', opacity: 0.85 }}>
                <i className={`bi ${m.icon} fs-4`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="row">
        <div className="col-12">
          <div className="glass-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="text-white mb-0">Recent Grievance Submissions</h4>
              <Link to="/student/history" className="text-primary text-decoration-none fs-7 fw-semibold">
                View All History <i className="bi bi-arrow-right-short"></i>
              </Link>
            </div>

            {complaints.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-folder-x fs-1 mb-3 d-block text-secondary"></i>
                <p className="mb-0">You have not registered any grievances yet.</p>
                <Link to="/student/submit" className="text-primary text-decoration-none fw-semibold fs-7 mt-2 d-inline-block">
                  Submit your first complaint
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                  <thead>
                    <tr className="text-muted border-secondary">
                      <th scope="col" style={{ width: '80px' }}>ID</th>
                      <th scope="col">Grievance Details</th>
                      <th scope="col">Department</th>
                      <th scope="col">Priority</th>
                      <th scope="col">Current Status</th>
                      <th scope="col">Filed Date</th>
                      <th scope="col" className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.slice(0, 5).map((c) => (
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
                            <i className="bi bi-eye"></i> View Detail
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
    </div>
  );
};

export default StudentDashboard;
