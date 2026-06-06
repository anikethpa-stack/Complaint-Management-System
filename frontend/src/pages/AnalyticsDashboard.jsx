import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

/**
 * Analytics View displaying KPI metric cards and custom CSS bar chart vectors
 */
const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/admin/analytics');
        setData(response.data);
      } catch (err) {
        setError('Could not retrieve system metrics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

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
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error || 'No analytics datasets compiled yet.'}
        </div>
        <Link to="/admin/dashboard" className="btn btn-outline-primary rounded-pill px-3">
          Back to Admin Console
        </Link>
      </div>
    );
  }

  const { total, statusCounts, departmentCounts, categoryCounts, priorityCounts } = data;

  // Helper to retrieve status count
  const getStatusCount = (statusName) => {
    const found = statusCounts.find(s => s.status === statusName);
    return found ? found.count : 0;
  };

  const pending = getStatusCount('Pending');
  const assigned = getStatusCount('Assigned');
  const inProgress = getStatusCount('In Progress');
  const resolved = getStatusCount('Resolved');
  const closed = getStatusCount('Closed');

  const resolutionRate = total > 0 ? (((resolved + closed) / total) * 100).toFixed(0) : 0;

  // Find maximum count for normalising bar heights
  const maxDeptCount = departmentCounts.length > 0 ? Math.max(...departmentCounts.map(d => d.count)) : 1;
  const maxPriorityCount = priorityCounts.length > 0 ? Math.max(...priorityCounts.map(p => p.count)) : 1;
  const maxCategoryCount = categoryCounts.length > 0 ? Math.max(...categoryCounts.map(c => c.count)) : 1;

  return (
    <div className="container-fluid py-2">
      {/* Back button */}
      <div className="mb-4">
        <Link to="/admin/dashboard" className="text-primary text-decoration-none fs-7 fw-semibold">
          <i className="bi bi-arrow-left me-1"></i> Back to Control Console
        </Link>
      </div>

      {/* Greeting Banner */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="glass-card p-4">
            <h2 className="text-white mb-1 font-heading">Portal Performance Metrics</h2>
            <p className="text-muted mb-0">System performance graphs, issue distributions, and department workloads.</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="glass-card p-3 metric-card text-start">
            <span className="text-muted d-block fs-8 text-uppercase mb-1">Total Grievances</span>
            <h2 className="text-white mb-2 fw-bold">{total}</h2>
            <div className="progress bg-secondary" style={{ height: '6px' }}>
              <div className="progress-bar bg-primary" role="progressbar" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="glass-card p-3 metric-card text-start">
            <span className="text-muted d-block fs-8 text-uppercase mb-1">Pending Assignment</span>
            <h2 className="text-warning mb-2 fw-bold">{pending}</h2>
            <div className="progress bg-secondary" style={{ height: '6px' }}>
              <div className="progress-bar bg-warning" role="progressbar" style={{ width: total > 0 ? `${(pending / total) * 100}%` : '0%' }}></div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="glass-card p-3 metric-card text-start">
            <span className="text-muted d-block fs-8 text-uppercase mb-1">Active (In Investigation)</span>
            <h2 className="text-info mb-2 fw-bold">{assigned + inProgress}</h2>
            <div className="progress bg-secondary" style={{ height: '6px' }}>
              <div className="progress-bar bg-info" role="progressbar" style={{ width: total > 0 ? `${((assigned + inProgress) / total) * 100}%` : '0%' }}></div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="glass-card p-3 metric-card text-start">
            <span className="text-muted d-block fs-8 text-uppercase mb-1">Resolution Index</span>
            <h2 className="text-success mb-2 fw-bold">{resolutionRate}%</h2>
            <div className="progress bg-secondary" style={{ height: '6px' }}>
              <div className="progress-bar bg-success" role="progressbar" style={{ width: `${resolutionRate}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main charts row */}
      <div className="row mb-4">
        {/* Department workloads chart (Vertical Bars) */}
        <div className="col-lg-7 mb-4">
          <div className="glass-card p-4 h-100">
            <h4 className="text-white mb-4"><i className="bi bi-bar-chart-fill me-2 text-primary"></i> Complaints by Department</h4>

            {departmentCounts.length === 0 ? (
              <p className="text-muted py-5 text-center">No department datasets available.</p>
            ) : (
              <div className="d-flex align-items-end justify-content-around mt-5 pt-3" style={{ height: '240px' }}>
                {departmentCounts.map((dept, idx) => {
                  const percentHeight = (dept.count / maxDeptCount) * 180; // Scale to fit max height 180px
                  return (
                    <div className="d-flex flex-column align-items-center text-center" key={idx} style={{ width: '16%' }}>
                      {/* Bar Count Badge */}
                      <span className="text-white fw-bold fs-7 mb-2">{dept.count}</span>
                      
                      {/* Styled Bar */}
                      <div 
                        className="bg-primary rounded-top" 
                        style={{ 
                          height: `${Math.max(percentHeight, 10)}px`, 
                          width: '100%', 
                          background: 'linear-gradient(to top, #6366f1, #a855f7)',
                          boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)'
                        }}
                      ></div>
                      
                      {/* Label */}
                      <span className="text-muted fs-8 mt-2 text-truncate w-100" title={dept.department}>{dept.department}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Priority workload (Horizontal Bars) */}
        <div className="col-lg-5 mb-4">
          <div className="glass-card p-4 h-100">
            <h4 className="text-white mb-4"><i className="bi bi-ui-checks-grid me-2 text-secondary"></i> Complaints by Priority</h4>

            {priorityCounts.length === 0 ? (
              <p className="text-muted py-5 text-center">No priority records filed.</p>
            ) : (
              <div className="d-flex flex-column gap-4 justify-content-center h-75">
                {priorityCounts.map((item, idx) => {
                  const percentWidth = (item.count / maxPriorityCount) * 100;
                  const colors = {
                    'Critical': 'bg-danger',
                    'High': 'bg-warning',
                    'Medium': 'bg-primary',
                    'Low': 'bg-secondary'
                  };
                  return (
                    <div key={idx}>
                      <div className="d-flex justify-content-between text-white fs-7 mb-1 font-heading">
                        <span>{item.priority}</span>
                        <strong className="text-muted">{item.count} tickets</strong>
                      </div>
                      <div className="progress bg-dark bg-opacity-50" style={{ height: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div 
                          className={`progress-bar ${colors[item.priority] || 'bg-info'}`} 
                          role="progressbar" 
                          style={{ width: `${percentWidth}%`, borderRadius: '50px' }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category breakdown (Full Width) */}
      <div className="row">
        <div className="col-12">
          <div className="glass-card p-4">
            <h4 className="text-white mb-4"><i className="bi bi-tag-fill me-2 text-info"></i> Specific Category Frequencies</h4>

            {categoryCounts.length === 0 ? (
              <p className="text-muted py-5 text-center">No categories recorded yet.</p>
            ) : (
              <div className="row g-3">
                {categoryCounts.map((cat, idx) => {
                  const widthPercent = (cat.count / maxCategoryCount) * 100;
                  return (
                    <div className="col-md-6" key={idx}>
                      <div className="bg-dark bg-opacity-20 p-3 rounded border border-secondary">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-white fw-bold">{cat.category}</span>
                          <span className="text-primary">{cat.count} ticket(s)</span>
                        </div>
                        <div className="progress bg-secondary" style={{ height: '6px' }}>
                          <div className="progress-bar bg-info" role="progressbar" style={{ width: `${widthPercent}%` }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
