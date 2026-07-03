import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

/**
 * Grievance Submission Form Page for Students
 */
const SubmitComplaint = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sphere, setSphere] = useState(''); // Department category (Academic, Infrastructure, etc.)
  const [category, setCategory] = useState(''); // Subcategory
  const [priority, setPriority] = useState('Medium');
  const [evidence, setEvidence] = useState(null);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Mapping of department spheres to specific issue subcategories
  const subcategoryMapping = {
    'Academic': ['Attendance Issues', 'Faculty Issues', 'Internal Marks', 'Examination Issues'],
    'Infrastructure': ['Classroom Problems', 'Electrical Issues', 'Projector Issues', 'Laboratory Issues'],
    'Hostel': ['Water Problems', 'Food Complaints', 'Maintenance Requests', 'WiFi Issues'],
    'Library': ['Missing Books', 'Library Access Issues'],
    'Placement': ['Internship Support', 'Placement Training', 'Interview Scheduling']
  };

  const handleSphereChange = (e) => {
    const selectedSphere = e.target.value;
    setSphere(selectedSphere);
    setCategory(''); // Reset subcategory when department sphere changes
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit. Please upload a smaller file.');
      e.target.value = null; // Clear input
      setEvidence(null);
      return;
    }

    // Validate extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'docx'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      setError('Unsupported file type. Only JPG, PNG, PDF, and DOCX are allowed.');
      e.target.value = null; // Clear input
      setEvidence(null);
      return;
    }

    setError('');
    setEvidence(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !sphere || !category) {
      setError('Please fill out all required fields.');
      return;
    }

    // Using FormData for multipart file uploads
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category); // We save the specific subcategory issue in the database
    formData.append('priority', priority);
    if (evidence) {
      formData.append('evidence', evidence);
    }

    setLoading(true);

    try {
      await api.post('/complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/student/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit grievance. Please verify configurations and try again.';
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-2">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-8">
          <div className="mb-4">
            <Link to="/student/dashboard" className="text-primary text-decoration-none fs-7 fw-semibold">
              <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
            </Link>
          </div>

          <div className="glass-card p-4">
            <div className="border-bottom border-secondary pb-3 mb-4">
              <h3 className="text-white mb-1 font-heading">Submit Grievance</h3>
              <p className="text-muted mb-0">Provide details about your complaint. Fields marked with (*) are required.</p>
            </div>

            {error && (
              <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 p-3 mb-4" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Title input */}
              <div className="mb-3">
                <label className="form-label text-muted fs-8 text-uppercase">Grievance Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Summarize your issue (e.g. Projector not working in Room 302)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  maxLength={100}
                  required
                />
              </div>

              {/* Category Dropdowns */}
              <div className="row mb-3">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="form-label text-muted fs-8 text-uppercase">Department Sphere *</label>
                  <select
                    className="form-select"
                    value={sphere}
                    onChange={handleSphereChange}
                    disabled={loading}
                    required
                  >
                    <option value="">-- Select Area --</option>
                    {Object.keys(subcategoryMapping).map((key) => (
                      <option value={key} key={key}>{key}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted fs-8 text-uppercase">Issue Specifics *</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={!sphere || loading}
                    required
                  >
                    <option value="">-- Choose Category --</option>
                    {sphere && subcategoryMapping[sphere].map((sub) => (
                      <option value={sub} key={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority and Evidence Row */}
              <div className="row mb-3">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="form-label text-muted fs-8 text-uppercase">Priority Level</label>
                  <select
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    disabled={loading}
                  >
                    <option value="Low">Low (No workflow impact)</option>
                    <option value="Medium">Medium (General feedback)</option>
                    <option value="High">High (Immediate attention)</option>
                    <option value="Critical">Critical (Disrupting education/amenities)</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted fs-8 text-uppercase">Upload Evidence (Optional)</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                    disabled={loading}
                    accept=".jpg,.jpeg,.png,.pdf,.docx"
                  />
                  <div className="form-text text-muted fs-9 mt-1">
                    Accepted Formats: JPG, PNG, PDF, DOCX (Max size: 5MB)
                  </div>
                </div>
              </div>

              {/* Description box */}
              <div className="mb-4">
                <label className="form-label text-muted fs-8 text-uppercase">Detailed Description *</label>
                <textarea
                  className="form-control"
                  rows="6"
                  placeholder="Explain your grievance in detail. Mention dates, locations, and previous discussions if any..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  required
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-3">
                <Link to="/student/dashboard" className="btn btn-premium-secondary py-3 px-4">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-premium-primary py-3 px-5 d-flex align-items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Submitting Grievance...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-fill me-2"></i> Submit Complaint
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitComplaint;
