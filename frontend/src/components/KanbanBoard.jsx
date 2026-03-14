import React, { useState, useEffect } from 'react';
import '../styles/KanbanBoard.css';

export const KanbanBoard = () => {
  const [kanbanData, setKanbanData] = useState({
    open: [],
    assigned: [],
    in_progress: [],
    resolved: [],
    verified: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);

  useEffect(() => {
    fetchKanbanData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchKanbanData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchKanbanData = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';
      const response = await fetch(`${apiUrl}/admin/kanban`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch kanban data: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setKanbanData(result.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Kanban fetch error:', err);
      setError(err.message || 'Failed to fetch kanban data');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: '#dc3545',
      high: '#fd7e14',
      medium: '#ffc107',
      low: '#28a745'
    };
    return colors[priority] || '#6c757d';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Garbage': '🗑️',
      'Road Damage': '🛣️',
      'Water Leakage': '💧',
      'Streetlight': '💡',
      'Other': '📋'
    };
    return icons[category] || '📋';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDragStart = (e, card, status) => {
    setDraggedCard({ card, fromStatus: status });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, toStatus) => {
    e.preventDefault();
    if (!draggedCard) return;

    const { card, fromStatus } = draggedCard;
    if (fromStatus === toStatus) {
      setDraggedCard(null);
      return;
    }

    // Update local state optimistically
    setKanbanData(prev => ({
      ...prev,
      [fromStatus]: prev[fromStatus].filter(c => c.id !== card.id),
      [toStatus]: [card, ...prev[toStatus]]
    }));

    // Update backend
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';
      const statusMap = {
        'open': 'submitted',
        'assigned': 'under_review',
        'in_progress': 'in_progress',
        'resolved': 'resolved',
        'verified': 'verified'
      };

      const response = await fetch(`${apiUrl}/complaints/${card.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          status: statusMap[toStatus],
          message: `Status updated to ${toStatus}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update complaint status');
      }

      // Refresh data to ensure consistency
      await fetchKanbanData();
    } catch (err) {
      console.error('Error updating complaint status:', err);
      // Revert optimistic update
      await fetchKanbanData();
    }

    setDraggedCard(null);
  };

  const Column = ({ status, title, cards }) => (
    <div className="kanban-column">
      <div className="column-header">
        <h3>{title}</h3>
        <span className="card-count">{cards.length}</span>
      </div>
      <div
        className="column-content"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
      >
        {cards.length === 0 ? (
          <div className="empty-column">No complaints</div>
        ) : (
          cards.map(card => (
            <div
              key={card.id}
              className="complaint-card"
              draggable
              onDragStart={(e) => handleDragStart(e, card, status)}
              onClick={() => setSelectedCard(card)}
            >
              <div className="card-header">
                <span className="category-icon">{getCategoryIcon(card.category)}</span>
                <span
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(card.priority) }}
                >
                  {card.priority}
                </span>
              </div>
              <div className="card-title">{card.title}</div>
              <div className="card-category">{card.category}</div>
              <div className="card-location">
                📍 {parseFloat(card.latitude)?.toFixed(4)}, {parseFloat(card.longitude)?.toFixed(4)}
              </div>
              <div className="card-time">{formatDate(card.created_at)}</div>
              {card.assigned_worker_id && (
                <div className="card-worker">👤 Worker ID: {card.assigned_worker_id}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (loading) {
    return <div className="kanban-loading">⏳ Loading Kanban board...</div>;
  }

  if (error) {
    return <div className="kanban-error">⚠️ {error}</div>;
  }

  return (
    <div className="kanban-board-container">
      <div className="kanban-header">
        <h2>📊 Complaint Kanban Board</h2>
        <button onClick={fetchKanbanData} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>

      <div className="kanban-board">
        <Column status="open" title="🔴 Open" cards={kanbanData.open} />
        <Column status="assigned" title="🟡 Assigned" cards={kanbanData.assigned} />
        <Column status="in_progress" title="🟠 In Progress" cards={kanbanData.in_progress} />
        <Column status="resolved" title="🟢 Resolved" cards={kanbanData.resolved} />
        {/* Verified column removed per user request */}
      </div>

      {selectedCard && (
        <div className="card-modal" onClick={() => setSelectedCard(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedCard(null)}>✕</button>
            <h3>{selectedCard.title}</h3>
            <div className="modal-details">
              {selectedCard.image_path && (
                <div className="modal-image">
                  <strong>📸 Complaint Image:</strong>
                  <img 
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5003'}${selectedCard.image_path}`}
                    alt="Complaint" 
                    onError={(e) => {
                      console.error('Image failed to load:', selectedCard.image_path);
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              )}
              <p><strong>ID:</strong> {selectedCard.id}</p>
              <p><strong>Category:</strong> {selectedCard.category}</p>
              <p><strong>Priority:</strong> {selectedCard.priority}</p>
              <p><strong>Status:</strong> {selectedCard.status}</p>
              <p><strong>Location:</strong> {selectedCard.latitude}, {selectedCard.longitude}</p>
              <p><strong>Description:</strong> {selectedCard.description}</p>
              <p><strong>Created:</strong> {formatDate(selectedCard.created_at)}</p>
              {selectedCard.assigned_worker_id && (
                <p><strong>Assigned Worker:</strong> {selectedCard.assigned_worker_id}</p>
              )}
              {selectedCard.before_image_path && (
                <div className="modal-image">
                  <strong>📸 Before Resolution:</strong>
                  <img 
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5003'}${selectedCard.before_image_path}`}
                    alt="Before" 
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              )}
              {selectedCard.after_image_path && (
                <div className="modal-image">
                  <strong>📸 After Resolution:</strong>
                  <img 
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5003'}${selectedCard.after_image_path}`}
                    alt="After" 
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
