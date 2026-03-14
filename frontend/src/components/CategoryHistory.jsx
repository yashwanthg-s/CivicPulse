import React, { useState, useEffect } from 'react';
import { complaintService } from '../services/complaintService';
import '../styles/CategoryHistory.css';

export const CategoryHistory = ({ userId, selectedCategory }) => {
  const [historyComplaints, setHistoryComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHistoryComplaint, setSelectedHistoryComplaint] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('resolved');

  const categoryIcons = {
    infrastructure: '🏗️',
    sanitation: '🧹',
    traffic: '🚦',
    safety: '⚠️',
    utilities: '💧'
  };

  const categoryLabels = {
    infrastructure: 'Infrastructure',
    sanitation: 'Sanitation',
    traffic: 'Traffic',
    safety: 'Safety',
    utilities: 'Utilities'
  };

  const statusLabels = {
    'submitted': '🔴 Open',
    'under_review': '🟡 Assigned',
    'in_progress': '🟠 In Progress',
    'resolved': '🟢 Resolved',
    'verified': '✅ Verified',
    'rejected': '❌ Rejected'
  };

  useEffect(() => {
    fetchCategoryHistory();
  }, [selectedCategory, selectedStatus]);

  const fetchCategoryHistory = async () => {
    setLoading(true);
    try {
      const filterParams = {
        role: 'officer',
        category: selectedCategory,
        status: selectedStatus
      };

      const data = await complaintService.getComplaints(filterParams);
      setHistoryComplaints(data);
      setSelectedHistoryComplaint(null);
    } catch (error) {
      console.error('Failed to fetch category history:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="category-history-container">
        <div className="history-header">
          <h2>{categoryIcons[selectedCategory]} {categoryLabels[selectedCategory]} History</h2>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p className="loading-text">Loading history...</p>
        </div>
      </div>
    );
  }

  if (historyComplaints.length === 0) {
    return (
      <div className="category-history-container">
        <div className="history-header">
          <h2>{categoryIcons[selectedCategory]} {categoryLabels[selectedCategory]} History</h2>
          <span className="history-count">0 {statusLabels[selectedStatus]}</span>
        </div>
        <div style={{ padding: '60px 20px', textAlign: 'center', background: 'white' }}>
          <p className="no-history">No complaints with status {statusLabels[selectedStatus]} in this category yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-history-container">
      <div className="history-header">
        <h2>{categoryIcons[selectedCategory]} {categoryLabels[selectedCategory]} History</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="history-count">{historyComplaints.length} {statusLabels[selectedStatus]}</span>
          <button 
            onClick={fetchCategoryHistory}
            style={{
              padding: '6px 12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
            title="Refresh history"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Status Filter Buttons */}
      <div className="status-filter-buttons">
        {Object.entries(statusLabels).map(([status, label]) => (
          <button
            key={status}
            className={`status-filter-btn ${selectedStatus === status ? 'active' : ''}`}
            onClick={() => setSelectedStatus(status)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="history-content">
        <div className="history-list">
          {historyComplaints.map(complaint => (
            <div
              key={complaint.id}
              className={`history-item ${selectedHistoryComplaint?.id === complaint.id ? 'active' : ''}`}
              onClick={() => setSelectedHistoryComplaint(complaint)}
            >
              <div className="history-item-header">
                <h4>{complaint.title}</h4>
                <span className={`status-badge ${complaint.status}`}>{statusLabels[complaint.status]}</span>
              </div>
              <p className="history-item-meta">
                📅 {complaint.date} {complaint.time}
              </p>
            </div>
          ))}
        </div>

        {selectedHistoryComplaint && (
          <div className="history-details">
            <h3>📋 Resolved Complaint Details</h3>

            <div className="detail-section">
              <h4>📌 Title</h4>
              <p>{selectedHistoryComplaint.title}</p>
            </div>

            <div className="detail-section">
              <h4>📝 Description</h4>
              <p>{selectedHistoryComplaint.description}</p>
            </div>

            <div className="detail-section">
              <h4>📸 Original Image</h4>
              <img
                src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5003'}${selectedHistoryComplaint.image_path}`}
                alt="Original complaint"
                className="history-image"
              />
            </div>

            <div className="detail-section">
              <h4>📅 Timeline</h4>
              <p>
                <strong>Submitted:</strong> {selectedHistoryComplaint.date} {selectedHistoryComplaint.time}
              </p>
              <p>
                <strong>Status:</strong> <span style={{ color: '#22863a', fontWeight: '600' }}>{statusLabels[selectedHistoryComplaint.status]}</span>
              </p>
            </div>

            <div className="detail-section">
              <h4>📍 Location</h4>
              <p>
                <strong>Latitude:</strong> {selectedHistoryComplaint.latitude}
              </p>
              <p>
                <strong>Longitude:</strong> {selectedHistoryComplaint.longitude}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryHistory;
