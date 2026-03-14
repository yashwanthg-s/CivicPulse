import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/LocationReviewQueue.css';

export const LocationReviewQueue = () => {
  const [reviewQueue, setReviewQueue] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [map, setMap] = useState(null);
  const [mapContainer, setMapContainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    fetchReviewQueue();
  }, []);

  const fetchReviewQueue = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5003/api'}/admin/location-review-queue`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReviewQueue(data.queue || []);
      }
    } catch (error) {
      console.error('Error fetching review queue:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapContainer || !selectedComplaint) return;

    const mapInstance = L.map(mapContainer).setView([13.0827, 80.2707], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(mapInstance);

    setMap(mapInstance);

    return () => {
      mapInstance.remove();
    };
  }, [mapContainer, selectedComplaint]);

  useEffect(() => {
    if (!map || !selectedComplaint) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add EXIF location marker (blue)
    if (selectedComplaint.exif_latitude && selectedComplaint.exif_longitude) {
      L.marker([selectedComplaint.exif_latitude, selectedComplaint.exif_longitude], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      })
        .bindPopup('📍 EXIF Location')
        .addTo(map);

      map.setView([selectedComplaint.exif_latitude, selectedComplaint.exif_longitude], 15);
    }

    // Add manual location marker (red)
    if (selectedComplaint.latitude && selectedComplaint.longitude) {
      L.marker([selectedComplaint.latitude, selectedComplaint.longitude], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      })
        .bindPopup('📍 Manual Location')
        .addTo(map);
    }
  }, [map, selectedComplaint]);

  const handleApproveLocation = async () => {
    try {
      setActionInProgress(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5003/api'}/admin/approve-location/${selectedComplaint.complaint_id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        alert('Location approved successfully');
        setSelectedComplaint(null);
        fetchReviewQueue();
      }
    } catch (error) {
      console.error('Error approving location:', error);
      alert('Failed to approve location');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleRejectComplaint = async () => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      setActionInProgress(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5003/api'}/admin/reject-complaint/${selectedComplaint.complaint_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ reason })
        }
      );

      if (response.ok) {
        alert('Complaint rejected successfully');
        setSelectedComplaint(null);
        fetchReviewQueue();
      }
    } catch (error) {
      console.error('Error rejecting complaint:', error);
      alert('Failed to reject complaint');
    } finally {
      setActionInProgress(false);
    }
  };

  if (loading) {
    return <div className="location-review-queue">Loading review queue...</div>;
  }

  return (
    <div className="location-review-queue">
      <h2>📍 Location Review Queue</h2>

      {reviewQueue.length === 0 ? (
        <div className="empty-queue">
          <p>✓ No complaints pending location review</p>
        </div>
      ) : (
        <div className="review-container">
          <div className="queue-list">
            <h3>Flagged Complaints ({reviewQueue.length})</h3>
            {reviewQueue.map((complaint) => (
              <div
                key={complaint.complaint_id}
                className={`queue-item ${selectedComplaint?.complaint_id === complaint.complaint_id ? 'active' : ''}`}
                onClick={() => setSelectedComplaint(complaint)}
              >
                <div className="queue-item-header">
                  <strong>ID: {complaint.complaint_id}</strong>
                  <span className={`priority-badge priority-${complaint.priority?.toLowerCase()}`}>
                    {complaint.priority}
                  </span>
                </div>
                <p className="queue-item-title">{complaint.title}</p>
                <p className="queue-item-reason">{complaint.reason}</p>
                <p className="queue-item-date">
                  Flagged: {new Date(complaint.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>

          {selectedComplaint && (
            <div className="complaint-details">
              <h3>Complaint Details</h3>

              <div className="map-container" ref={setMapContainer} style={{ height: '300px' }} />

              <div className="details-section">
                <h4>Complaint Information</h4>
                <p>
                  <strong>ID:</strong> {selectedComplaint.complaint_id}
                </p>
                <p>
                  <strong>Title:</strong> {selectedComplaint.title}
                </p>
                <p>
                  <strong>Description:</strong> {selectedComplaint.description}
                </p>
                <p>
                  <strong>Category:</strong> {selectedComplaint.category}
                </p>
                <p>
                  <strong>Priority:</strong> {selectedComplaint.priority}
                </p>
              </div>

              <div className="details-section">
                <h4>Location Discrepancy</h4>
                <p>
                  <strong>EXIF Location:</strong>
                  <br />
                  {selectedComplaint.exif_latitude?.toFixed(6)}, {selectedComplaint.exif_longitude?.toFixed(6)}
                </p>
                <p>
                  <strong>Manual Location:</strong>
                  <br />
                  {selectedComplaint.latitude?.toFixed(6)}, {selectedComplaint.longitude?.toFixed(6)}
                </p>
                <p>
                  <strong>Reason:</strong> {selectedComplaint.reason}
                </p>
              </div>

              <div className="action-buttons">
                <button
                  onClick={handleApproveLocation}
                  disabled={actionInProgress}
                  className="btn btn-success"
                >
                  ✓ Approve Location
                </button>
                <button
                  onClick={handleRejectComplaint}
                  disabled={actionInProgress}
                  className="btn btn-danger"
                >
                  ✗ Reject Complaint
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
