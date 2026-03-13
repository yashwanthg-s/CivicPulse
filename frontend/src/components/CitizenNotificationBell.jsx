import React, { useState, useEffect, useRef } from 'react';
import { notificationService } from '../services/notificationService';
import '../styles/CitizenNotificationBell.css';

export const CitizenNotificationBell = ({ userId, onNotificationClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch resolution notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getResolutionNotifications(userId);
      if (response.success) {
        setNotifications(response.notifications);
        setUnreadCount(response.unread_count);
      }
    } catch (error) {
      console.error('Failed to fetch resolution notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markResolutionNotificationAsRead(notificationId);
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    
    // Close dropdown
    setIsOpen(false);
    
    // Notify parent component to navigate to history and open complaint
    if (onNotificationClick) {
      onNotificationClick(notification.complaint_id);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="citizen-notification-bell-container" ref={dropdownRef}>
      <button className="citizen-notification-bell-btn" onClick={handleBellClick}>
        🔔
        {unreadCount > 0 && (
          <span className="citizen-notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="citizen-notification-dropdown">
          <div className="citizen-notification-header">
            <h3>✅ Resolutions</h3>
          </div>

          <div className="citizen-notification-list">
            {loading ? (
              <div className="citizen-notification-loading">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="citizen-notification-empty">
                <p>No resolution notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`citizen-notification-item ${!notification.is_read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="citizen-notification-content">
                    <div className="citizen-notification-title">
                      {notification.complaint_title}
                    </div>
                    <div className="citizen-notification-message">
                      {notification.message}
                    </div>
                    <div className="citizen-notification-meta">
                      <span className="citizen-notification-time">
                        {formatTime(notification.created_at)}
                      </span>
                    </div>
                  </div>
                  {!notification.is_read && (
                    <div className="citizen-notification-unread-dot"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
