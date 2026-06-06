import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

/**
 * Dashboard landing view for Department Representatives
 */
const DepartmentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch department workload
  useEffect(() => {
    const fetchDepartmentWorkload = async () => {
      try {
        const response = await api.get('/department/complaints');
        setComplaints(response.data);
      } catch (err) {
        setError('Failed to fetch assigned complaints. Please reload.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentWorkload();
  }, []);

  const getMetric = (status) => complaints.filter(c => c.status === status).length;

  const metrics = [
    { title: 'Total Assigned', count: complaints.length, icon: 'bi-journal-text', bg: 'bg-primary' },
    { title: 'Investigating', count: getMetric('In Progress'), icon: 'bi-search', bg: 'bg-warning' },
    { title: 'Resolved Issues', count: getMetric('Resolved'), icon: 'bi-check-circle-fill', bg: 'bg-success' },
    { title: 'Closed / Archived', count: getMetric('Closed'), icon: 'bi-archive', bg: 'bg-secondary' }
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
      {/* Greeting Banner */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="glass-card p-4">
            <span className="badge bg-primary px-3 py-2 rounded-pill text-uppercase tracking-wider mb-2 fs-8">
              Department Representative Console
            </span>
            <h2 className="text-white mb-1 font-heading">Department Workload Desk</h2>
            <p className="text-muted mb-0">
              Responsible Area: <strong className="text-white">Academic / Placement / Infrastructure Support</strong>. You can view, comment, and resolve issues assigned to your team below.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 p-3 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
        </div>
      )}

      {/* KPI metrics row */}
      <div className="row mb-4">
        {metrics.map((m, idx) => (
          <div className="col-6 col-lg-3 mb-3" key={idx}>
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

      {/* Workload list */}
      <div className="row">
        <div className="col-12">
          <div className="glass-card p-4">
            <h4 className="text-white mb-4">Assigned Grievance Action Items</h4>

            {complaints.length === 0 ? (
              <div className="text-center py-5 text-muted border border-secondary border-dashed rounded-3">
                <i className="bi bi-patch-check fs-1 mb-3 d-block text-success"></i>
                <p className="mb-0">Excellent! No active complaints are currently assigned to your department.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                  <thead>
                    <tr className="text-muted border-secondary">
                      <th scope="col" style={{ width: '80px' }}>ID</th>
                      <th scope="col">Title</th>
                      <th scope="col">Category</th>
                      <th scope="col">Student Submitter</th>
                      <th scope="col">Severity</th>
                      <th scope="col">Status</th>
                      <th scope="col">Date Assigned</th>
                      <th scope="col" className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((c) => (
                      <tr key={c.id} className="border-secondary">
                        <td className="fw-semibold text-primary">#{c.id}</td>
                        <td>
                          <div className="fw-bold text-white mb-0">{c.title}</div>
                        </td>
                        <td>
                          <span className="text-light">{c.category}</span>
                        </td>
                        <td>
                          <div className="text-white font-heading fs-7 mb-0">{c.student_name}</div>
                          <a href={`mailto:${c.student_email}`} className="text-muted fs-8 text-decoration-none">{c.student_email}</a>
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
                            <i className="bi bi-pencil-square me-1"></i> Update Remarks
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

export default DepartmentDashboard;
