import React, { useState, useEffect } from 'react';
import '../styles/PriorityQueueDashboard.css';

const PriorityQueueDashboard = ({ selectedCategory = 'infrastructure' }) => {
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filterLevel, setFilterLevel] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

  useEffect(() => {
    fetchQueueData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchQueueData, 30000);
    return () => clearInterval(interval);
  }, [selectedCategory, filterLevel]);

  const fetchQueueData = async () => {
    try {
      setLoading(true);

      // Fetch queue
      let queueUrl = `${API_URL}/priority-queue/department/${selectedCategory}`;
      const queueResponse = await fetch(queueUrl);
      const queueData = await queueResponse.json();

      // Fetch stats
      const statsUrl = `${API_URL}/priority-queue/department/${selectedCategory}/stats`;
      const statsResponse = await fetch(statsUrl);
      const statsData = await statsResponse.json();

      if (queueData.success) {
        let complaints = queueData.queue;

        // Apply filter
        if (filterLevel !== 'all') {
          complaints = complaints.filter(c => {
            const level = getPriorityLevel(c.priority_score);
            return level === filterLevel;
          });
        }

        // Apply sort
        if (sortBy === 'priority') {
          complaints.sort((a, b) => b.priority_score - a.priority_score);
        } else if (sortBy === 'sla') {
          complaints.sort((a, b) => {
            const aHours = b.hours_remaining || 999;
            const bHours = a.hours_remaining || 999;
            return aHours - bHours;
          });
        } else if (sortBy === 'time') {
          complaints.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }

        setQueue(complaints);
      }

      if (statsData.stats) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error fetching queue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityLevel = (score) => {
    if (score >= 200) return 'critical';
    if (score >= 150) return 'high';
    if (score >= 100) return 'medium';
    return 'low';
  };

  const getPriorityColor = (score) => {
    if (score >= 200) return '#d32f2f'; // Red
    if (score >= 150) return '#f57c00'; // Orange
    if (score >= 100) return '#fbc02d'; // Yellow
    return '#388e3c'; // Green
  };

  const getSLAStatus = (slaDeadline) => {
    if (!slaDeadline) return 'unknown';
    const now = new Date();
    const deadline = new Date(slaDeadline);
    const hoursRemaining = (deadline - now) / (1000 * 60 * 60);

    if (hoursRemaining < 0) return 'overdue';
    if (hoursRemaining < 6) return 'urgent';
    return 'on_track';
  };

  const getSLAStatusColor = (status) => {
    switch (status) {
      case 'overdue':
        return '#d32f2f';
      case 'urgent':
        return '#f57c00';
      case 'on_track':
        return '#388e3c';
      default:
        return '#999';
    }
  };

  const formatTimeRemaining = (slaDeadline) => {
    if (!slaDeadline) return 'N/A';
    const now = new Date();
    const deadline = new Date(slaDeadline);
    const hoursRemaining = (deadline - now) / (1000 * 60 * 60);

    if (hoursRemaining < 0) {
      return `${Math.abs(Math.floor(hoursRemaining))}h overdue`;
    }
    if (hoursRemaining < 1) {
      const minutes = Math.floor(hoursRemaining * 60);
      return `${minutes}m remaining`;
    }
    return `${Math.floor(hoursRemaining)}h remaining`;
  };

  const getScoreBreakdown = (complaint) => {
    return {
      severity: complaint.severity_score || 0,
      cluster: complaint.cluster_score || 0,
      location: complaint.location_score || 0,
      sla: complaint.sla_score || 0
    };
  };

  return (
    <div className="priority-queue-dashboard">
      <div className="queue-header">
        <h2>📊 Priority Queue - {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}</h2>
        <button onClick={fetchQueueData} className="btn btn-refresh">
          🔄 Refresh
        </button>
      </div>

      {/* Queue Statistics */}
      {stats && (
        <div className="queue-stats">
          <div className="stat-card stat-total">
            <div className="stat-value">{stats.total_complaints}</div>
            <div className="stat-label">Total Complaints</div>
          </div>
          <div className="stat-card stat-critical">
            <div className="stat-value">{stats.critical_count}</div>
            <div className="stat-label">🔴 Critical</div>
          </div>
          <div className="stat-card stat-high">
            <div className="stat-value">{stats.high_count}</div>
            <div className="stat-label">🟠 High</div>
          </div>
          <div className="stat-card stat-medium">
            <div className="stat-value">{stats.medium_count}</div>
            <div className="stat-label">🟡 Medium</div>
          </div>
          <div className="stat-card stat-low">
            <div className="stat-value">{stats.low_count}</div>
            <div className="stat-label">🟢 Low</div>
          </div>
          <div className="stat-card stat-avg">
            <div className="stat-value">{Math.round(stats.avg_priority_score)}</div>
            <div className="stat-label">Avg Priority</div>
          </div>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="queue-controls">
        <div className="control-group">
          <label>Filter by Priority:</label>
          <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
            <option value="all">All Levels</option>
            <option value="critical">🔴 Critical</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>

        <div className="control-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="priority">Priority Score</option>
            <option value="sla">SLA Time Remaining</option>
            <option value="time">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Queue List */}
      <div className="queue-list">
        {loading ? (
          <div className="loading">Loading queue...</div>
        ) : queue.length === 0 ? (
          <div className="empty-state">
            <p>No complaints in this priority level</p>
          </div>
        ) : (
          <div className="complaints-container">
            {queue.map((complaint, index) => {
              const priorityLevel = getPriorityLevel(complaint.priority_score);
              const slaStatus = getSLAStatus(complaint.sla_deadline);
              const breakdown = getScoreBreakdown(complaint);

              return (
                <div
                  key={complaint.id}
                  className={`queue-item ${priorityLevel} ${slaStatus} ${
                    selectedComplaint?.id === complaint.id ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedComplaint(complaint)}
                  style={{
                    borderLeftColor: getPriorityColor(complaint.priority_score)
                  }}
                >
                  {/* Queue Position */}
                  <div className="queue-position">
                    <span className="position-number">#{index + 1}</span>
                  </div>

                  {/* Main Content */}
                  <div className="queue-item-content">
                    <div className="item-header">
                      <h3>{complaint.title}</h3>
                      <div className="priority-badges">
                        <span
                          className="badge priority-badge"
                          style={{ backgroundColor: getPriorityColor(complaint.priority_score) }}
                        >
                          {priorityLevel.toUpperCase()}
                        </span>
                        {complaint.duplicate_count > 1 && (
                          <span className="badge duplicate-badge">
                            🔄 {complaint.duplicate_count}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="item-description">{complaint.description.substring(0, 100)}...</p>

                    <div className="item-meta">
                      <span className="meta-item">
                        📍 {complaint.latitude ? parseFloat(complaint.latitude).toFixed(4) : 'N/A'}, {complaint.longitude ? parseFloat(complaint.longitude).toFixed(4) : 'N/A'}
                      </span>
                      <span className="meta-item">
                        📅 {complaint.date} {complaint.time}
                      </span>
                      <span className="meta-item">
                        ⏱️ {complaint.hours_elapsed || 0}h pending
                      </span>
                    </div>
                  </div>

                  {/* Priority Score */}
                  <div className="priority-score-box">
                    <div className="score-main">{complaint.priority_score}</div>
                    <div className="score-label">Priority</div>
                  </div>

                  {/* SLA Status */}
                  <div className="sla-status-box">
                    <div
                      className="sla-indicator"
                      style={{ backgroundColor: getSLAStatusColor(slaStatus) }}
                    />
                    <div className="sla-time">{formatTimeRemaining(complaint.sla_deadline)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Complaint Details Panel */}
      {selectedComplaint && (
        <div className="complaint-details-panel">
          <div className="panel-header">
            <h3>Complaint Details</h3>
            <button
              onClick={() => setSelectedComplaint(null)}
              className="btn-close"
            >
              ✕
            </button>
          </div>

          <div className="panel-content">
            {/* Title and Description */}
            <div className="detail-section">
              <h4>Title</h4>
              <p>{selectedComplaint.title}</p>
              <h4>Description</h4>
              <p>{selectedComplaint.description}</p>
            </div>

            {/* Priority Score Breakdown */}
            <div className="detail-section">
              <h4>Priority Score Breakdown</h4>
              <div className="score-breakdown">
                <div className="breakdown-item">
                  <span className="breakdown-label">Severity</span>
                  <div className="breakdown-bar">
                    <div
                      className="breakdown-fill"
                      style={{
                        width: `${selectedComplaint.severity_score}%`,
                        backgroundColor: '#d32f2f'
                      }}
                    />
                  </div>
                  <span className="breakdown-value">{selectedComplaint.severity_score}</span>
                </div>

                <div className="breakdown-item">
                  <span className="breakdown-label">Cluster Size</span>
                  <div className="breakdown-bar">
                    <div
                      className="breakdown-fill"
                      style={{
                        width: `${selectedComplaint.cluster_score}%`,
                        backgroundColor: '#f57c00'
                      }}
                    />
                  </div>
                  <span className="breakdown-value">{selectedComplaint.cluster_score}</span>
                </div>

                <div className="breakdown-item">
                  <span className="breakdown-label">Location</span>
                  <div className="breakdown-bar">
                    <div
                      className="breakdown-fill"
                      style={{
                        width: `${selectedComplaint.location_score}%`,
                        backgroundColor: '#fbc02d'
                      }}
                    />
                  </div>
                  <span className="breakdown-value">{selectedComplaint.location_score}</span>
                </div>

                <div className="breakdown-item">
                  <span className="breakdown-label">SLA Delay</span>
                  <div className="breakdown-bar">
                    <div
                      className="breakdown-fill"
                      style={{
                        width: `${selectedComplaint.sla_score}%`,
                        backgroundColor: '#388e3c'
                      }}
                    />
                  </div>
                  <span className="breakdown-value">{selectedComplaint.sla_score}</span>
                </div>

                <div className="breakdown-total">
                  <span className="total-label">Total Priority Score</span>
                  <span className="total-value">{selectedComplaint.priority_score}</span>
                </div>
              </div>
            </div>

            {/* SLA Information */}
            <div className="detail-section">
              <h4>SLA Information</h4>
              <p>
                <strong>Deadline:</strong> {new Date(selectedComplaint.sla_deadline).toLocaleString()}
              </p>
              <p>
                <strong>Time Remaining:</strong> {formatTimeRemaining(selectedComplaint.sla_deadline)}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                <span
                  style={{
                    color: getSLAStatusColor(getSLAStatus(selectedComplaint.sla_deadline)),
                    fontWeight: 'bold'
                  }}
                >
                  {getSLAStatus(selectedComplaint.sla_deadline).toUpperCase()}
                </span>
              </p>
            </div>

            {/* Location */}
            <div className="detail-section">
              <h4>Location</h4>
              <p>
                <strong>Latitude:</strong> {selectedComplaint.latitude || 'N/A'}
              </p>
              <p>
                <strong>Longitude:</strong> {selectedComplaint.longitude || 'N/A'}
              </p>
            </div>

            {/* Citizen Info */}
            {selectedComplaint.citizen_name && (
              <div className="detail-section">
                <h4>Citizen Information</h4>
                <p>
                  <strong>Name:</strong> {selectedComplaint.citizen_name}
                </p>
                {selectedComplaint.citizen_phone && (
                  <p>
                    <strong>Phone:</strong> {selectedComplaint.citizen_phone}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriorityQueueDashboard;
