import React, { useState, useEffect } from 'react';
import '../styles/CategoryNotificationBells.css';

export const CategoryNotificationBells = ({ userId, selectedCategory, onNotificationClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const categoryIcons = {
    infrastructure: { icon: '🏗️', label: 'Infrastructure' },
    sanitation: { icon: '🧹', label: 'Sanitation' },
    traffic: { icon: '🚦', label: 'Traffic' },
    safety: { icon: '⚠️', label: 'Safety' },
    utilities: { icon: '💧', label: 'Utilities' }
  };

  // Fetch notifications for selected category only
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5003/api'}/notifications/category?userId=${userId}&category=${selectedCategory}`,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (selectedCategory) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [userId, selectedCategory]);

  const handleMarkAsRead = async (complaintId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5003/api'}/notifications/category/${complaintId}/read?userId=${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n.complaint_id === complaintId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5003/api'}/notifications/category/mark-all-read?userId=${userId}&category=${selectedCategory}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Only render if there's a selected category
  if (!selectedCategory || !categoryIcons[selectedCategory]) {
    return null;
  }

  const category = categoryIcons[selectedCategory];

  return (
    <div className="category-notification-bells">
      <div className="notification-bell-container">
        <button
          className={`notification-bell ${unreadCount > 0 ? 'has-unread' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          title={category.label}
        >
          <span className="bell-icon">{category.icon}</span>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </button>

        {isOpen && (
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>{category.label}</h3>
              {unreadCount > 0 && (
                <button
                  className="mark-all-read-btn"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="no-notifications">
                  <p>No {category.label.toLowerCase()} notifications</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                    onClick={() => {
                      // Navigate to complaint
                      if (onNotificationClick) {
                        onNotificationClick(notification.complaint_id);
                      }
                      // Mark as read
                      handleMarkAsRead(notification.complaint_id);
                      // Close dropdown
                      setIsOpen(false);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.description}</p>
                      <small>{notification.submitted_by}</small>
                    </div>
                    <div className="notification-time">
                      <small>{notification.time_ago}</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
