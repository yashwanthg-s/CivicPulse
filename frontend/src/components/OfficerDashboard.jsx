import React, { useState, useEffect } from 'react';
import { complaintService } from '../services/complaintService';
import { locationService } from '../services/locationService';
import { CategoryNotificationBells } from './CategoryNotificationBells';
import { CategoryHistory } from './CategoryHistory';
import PriorityQueueDashboard from './PriorityQueueDashboard';
import '../styles/OfficerDashboard.css';

export const OfficerDashboard = ({ userId }) => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'infrastructure'
  });
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [resolutionMode, setResolutionMode] = useState(false);
  const [afterImage, setAfterImage] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submittingResolution, setSubmittingResolution] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPriorityQueue, setShowPriorityQueue] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [filters]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const filterParams = { 
        role: 'officer',
        category: filters.category
      };
      if (filters.status !== 'all') filterParams.status = filters.status;

      const data = await complaintService.getComplaints(filterParams);
      setComplaints(data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    }
    setLoading(false);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateMessage('');
    setUpdateStatus('');
  };

  const handleNotificationClick = async (complaintId) => {
    try {
      const complaint = complaints.find(c => c.id === complaintId);
      if (complaint) {
        handleSelectComplaint(complaint);
      } else {
        // Complaint not in current list, refresh and try again
        console.log('Complaint not in list, refreshing...');
        await fetchComplaints();
        const refreshedComplaints = await complaintService.getComplaints({ 
          role: 'officer',
          category: filters.category
        });
        setComplaints(refreshedComplaints);
        const refreshedComplaint = refreshedComplaints.find(c => c.id === complaintId);
        if (refreshedComplaint) {
          handleSelectComplaint(refreshedComplaint);
        }
      }
    } catch (error) {
      console.error('Failed to open complaint from notification:', error);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplaint || !updateStatus) return;

    try {
      await complaintService.updateComplaintStatus(
        selectedComplaint.id,
        updateStatus,
        updateMessage
      );

      await fetchComplaints();
      setSelectedComplaint(null);
      setUpdateMessage('');
      setUpdateStatus('');
    } catch (error) {
      console.error('Failed to update complaint:', error);
    }
  };

  const handleResolveComplaint = async () => {
    if (!selectedComplaint || !afterImage) {
      alert('Please upload the after image showing completed work');
      return;
    }

    setSubmittingResolution(true);
    try {
      const afterBase64 = typeof afterImage === 'string' 
        ? afterImage 
        : await fileToBase64(afterImage);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5003/api'}/complaints/${selectedComplaint.id}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          officer_id: userId,
          after_image: afterBase64,
          resolution_notes: resolutionNotes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to resolve complaint');
      }

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Complaint resolved successfully!\n\nClick "View History" to see all resolved complaints.');
        
        // Refresh complaints list
        await fetchComplaints();
        
        // Force refresh history by toggling showHistory
        setShowHistory(false);
        setTimeout(() => {
          setShowHistory(true);
        }, 100);
        
        setSelectedComplaint(null);
        setResolutionMode(false);
        setAfterImage(null);
        setResolutionNotes('');
      }
    } catch (error) {
      console.error('Failed to resolve complaint:', error);
      alert('Failed to resolve complaint: ' + error.message);
    } finally {
      setSubmittingResolution(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAfterImageChange = (e) => {
    const file = e.target.files[0];
    setAfterImage(file);
  };

  const handleViewLocation = (complaint) => {
    const mapsUrl = locationService.generateMapsUrl(
      complaint.latitude,
      complaint.longitude
    );
    window.open(mapsUrl, '_blank');
  };

  const getStatusBadgeClass = (status) => {
    return `badge badge-${status}`;
  };

  return (
    <div className="officer-dashboard-container">
      <div className="dashboard-header">
        <h1>👮 Officer Dashboard</h1>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="category-filter">Category:</label>
          <select
            id="category-filter"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="infrastructure">Infrastructure</option>
            <option value="sanitation">Sanitation</option>
            <option value="traffic">Traffic</option>
            <option value="safety">Safety</option>
            <option value="utilities">Utilities</option>
          </select>
        </div>

        <div className="filter-group filter-group-with-icon">
          <div className="notification-bell-section">
            <CategoryNotificationBells 
              userId={userId}
              selectedCategory={filters.category}
              onNotificationClick={handleNotificationClick}
            />
          </div>
          <button
            onClick={fetchComplaints}
            className="btn btn-secondary"
            title="Refresh complaints list"
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => setShowPriorityQueue(!showPriorityQueue)}
            className={`btn ${showPriorityQueue ? 'btn-secondary' : 'btn-primary'}`}
          >
            {showPriorityQueue ? '📋 Active Complaints' : '📊 Priority Queue'}
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`btn ${showHistory ? 'btn-secondary' : 'btn-primary'}`}
          >
            {showHistory ? '📋 Active Complaints' : '📜 View History'}
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {showPriorityQueue ? (
          <PriorityQueueDashboard selectedCategory={filters.category} />
        ) : showHistory ? (
          <CategoryHistory userId={userId} selectedCategory={filters.category} />
        ) : (
          <>
            {/* Complaints List */}
            <div className="complaints-list">
              <h2>Assigned Complaints ({complaints.length})</h2>
              {loading ? (
                <p>Loading complaints...</p>
              ) : complaints.length === 0 ? (
                <p>No assigned complaints. Waiting for admin to assign emergency cases.</p>
              ) : (
                <div className="list">
                  {complaints.map(complaint => (
                    <div
                      key={complaint.id}
                      className={`complaint-item ${selectedComplaint?.id === complaint.id ? 'active' : ''}`}
                      onClick={() => handleSelectComplaint(complaint)}
                    >
                      <div className="complaint-header">
                        <h3>{complaint.title}</h3>
                        <div className="badges">
                          <span className={getStatusBadgeClass(complaint.status)}>
                            {complaint.status}
                          </span>
                          {complaint.duplicate_count > 1 && (
                            <span className="badge badge-duplicate" title={`${complaint.duplicate_count} similar complaints`}>
                              🔄 {complaint.duplicate_count}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="complaint-meta">
                        📍 {complaint.latitude ? parseFloat(complaint.latitude).toFixed(6) : 'N/A'}, {complaint.longitude ? parseFloat(complaint.longitude).toFixed(6) : 'N/A'}
                      </p>
                      <p className="complaint-meta">
                        📅 {complaint.date} {complaint.time}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Complaint Details */}
            {selectedComplaint && (
              <div className="complaint-details">
                <h2>Complaint Details</h2>

                {/* Image */}
                <div className="detail-section">
                  <h3>📸 Captured Image</h3>
                  <img
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5003'}${selectedComplaint.image_path}`}
                    alt="Complaint evidence"
                    className="complaint-image"
                  />
                </div>

                {/* Title and Description */}
                <div className="detail-section">
                  <h3>Title</h3>
                  <p>{selectedComplaint.title}</p>
                  <h3>Description</h3>
                  <p>{selectedComplaint.description}</p>
                </div>

                {/* Location */}
                <div className="detail-section">
                  <h3>📍 Location</h3>
                  <p>
                    <strong>Latitude:</strong> {selectedComplaint.latitude || 'N/A'}
                  </p>
                  <p>
                    <strong>Longitude:</strong> {selectedComplaint.longitude || 'N/A'}
                  </p>
                  {selectedComplaint.latitude && selectedComplaint.longitude && (
                    <button
                      onClick={() => handleViewLocation(selectedComplaint)}
                      className="btn btn-secondary"
                    >
                      🗺️ View on Google Maps
                    </button>
                  )}
                </div>

                {/* Date and Time */}
                <div className="detail-section">
                  <h3>📅 Date & Time</h3>
                  <p>
                    <strong>Date:</strong> {selectedComplaint.date}
                  </p>
                  <p>
                    <strong>Time:</strong> {selectedComplaint.time}
                  </p>
                </div>

                {/* Category and Status */}
                <div className="detail-section">
                  <p>
                    <strong>Category:</strong> {selectedComplaint.category}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedComplaint.status}
                  </p>
                </div>

                {/* Update Status */}
                <div className="detail-section update-section">
                  <h3>Update Status</h3>
                  
                  {selectedComplaint.status === 'resolved' ? (
                    <div style={{ 
                      padding: '20px', 
                      backgroundColor: '#e8f5e9', 
                      borderRadius: '8px',
                      border: '2px solid #4caf50',
                      textAlign: 'center'
                    }}>
                      <h4 style={{ color: '#2e7d32', margin: '0 0 10px 0' }}>✅ Complaint Resolved</h4>
                      <p style={{ color: '#558b2f', margin: '0' }}>
                        This complaint has been resolved and is now final. No further updates are allowed.
                      </p>
                      <p style={{ color: '#558b2f', margin: '10px 0 0 0', fontSize: '0.9rem' }}>
                        Resolved by: {selectedComplaint.resolved_by || 'Officer'} on {selectedComplaint.resolved_at || 'N/A'}
                      </p>
                    </div>
                  ) : !resolutionMode ? (
                    <>
                      <div className="form-group">
                        <label htmlFor="new-status">New Status:</label>
                        <select
                          id="new-status"
                          value={updateStatus}
                          onChange={(e) => setUpdateStatus(e.target.value)}
                        >
                          <option value="">Select status...</option>
                          <option value="submitted">🔴 Open</option>
                          <option value="under_review">🟡 Assigned</option>
                          <option value="in_progress">🟠 In Progress</option>
                          <option value="resolved">🟢 Resolved</option>
                          <option value="rejected">❌ Rejected</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="update-message">Message:</label>
                        <textarea
                          id="update-message"
                          value={updateMessage}
                          onChange={(e) => setUpdateMessage(e.target.value)}
                          placeholder="Add a message for the citizen..."
                          rows="3"
                        />
                      </div>

                      {updateStatus === 'resolved' ? (
                        <button
                          onClick={() => setResolutionMode(true)}
                          className="btn btn-success"
                        >
                          📸 Upload Resolution Images
                        </button>
                      ) : (
                        <button
                          onClick={handleUpdateStatus}
                          disabled={!updateStatus}
                          className="btn btn-primary"
                        >
                          ✓ Update Status
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <h4>📸 Work Progress Documentation</h4>
                      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
                        Upload an image showing the completed work to mark this complaint as resolved.
                      </p>

                      {/* STEP 1: CITIZEN'S ORIGINAL IMAGE */}
                      <div className="resolution-step">
                        <div className="step-header">
                          <span className="step-number">1️⃣</span>
                          <h5>ORIGINAL ISSUE - Citizen's Photo</h5>
                          <span className="step-complete">✓ Auto-displayed</span>
                        </div>
                        <p className="step-description">
                          This is the original complaint image from the citizen
                        </p>
                        <div className="image-preview">
                          <img 
                            src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5003'}${selectedComplaint.image_path}`}
                            alt="Original complaint" 
                            style={{ maxWidth: '250px', marginTop: '10px', borderRadius: '6px' }}
                          />
                        </div>
                      </div>

                      {/* STEP 2: AFTER WORK */}
                      <div className="resolution-step">
                        <div className="step-header">
                          <span className="step-number">2️⃣</span>
                          <h5>COMPLETED WORK - Your Photo</h5>
                          {afterImage && <span className="step-complete">✓ Complete</span>}
                        </div>
                        <p className="step-description">
                          Take a photo showing the issue AFTER you have completed the work
                        </p>
                        <div className="form-group">
                          <label htmlFor="after-image">📷 Upload Image (After Work):</label>
                          <input
                            id="after-image"
                            type="file"
                            accept="image/*"
                            onChange={handleAfterImageChange}
                            className="file-input"
                          />
                          {afterImage && (
                            <div className="image-preview">
                              <img 
                                src={URL.createObjectURL(afterImage)} 
                                alt="After" 
                                style={{ maxWidth: '250px', marginTop: '10px', borderRadius: '6px' }}
                              />
                              <p style={{ fontSize: '0.85rem', color: '#28a745', marginTop: '8px', fontWeight: '600' }}>
                                ✓ After image uploaded
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* STEP 3: NOTES */}
                      <div className="resolution-step">
                        <div className="step-header">
                          <span className="step-number">3️⃣</span>
                          <h5>WORK NOTES (Optional)</h5>
                        </div>
                        <p className="step-description">
                          Describe what you did to resolve the issue
                        </p>
                        <div className="form-group">
                          <label htmlFor="resolution-notes">📝 Work Description:</label>
                          <textarea
                            id="resolution-notes"
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            placeholder="Example: Fixed pothole with asphalt, smoothed edges, cleaned area..."
                            rows="3"
                          />
                        </div>
                      </div>

                      {/* PROGRESS INDICATOR */}
                      <div className="progress-indicator">
                        <div className="progress-item complete">
                          <span>Original Image</span>
                        </div>
                        <div className={`progress-item ${afterImage ? 'complete' : 'pending'}`}>
                          <span>After Image</span>
                        </div>
                      </div>

                      {/* SUBMIT SECTION */}
                      <div className="button-group">
                        <button
                          onClick={handleResolveComplaint}
                          disabled={!afterImage || submittingResolution}
                          className="btn btn-success"
                          title={!afterImage ? 'After image is required' : ''}
                        >
                          {submittingResolution ? '⏳ Submitting...' : '✓ Submit Resolution'}
                        </button>
                        <button
                          onClick={() => {
                            setResolutionMode(false);
                            setAfterImage(null);
                            setResolutionNotes('');
                          }}
                          className="btn btn-secondary"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;
