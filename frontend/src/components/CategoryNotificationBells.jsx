import React, { useState, useEffect } from 'react';
import '../styles/CategoryNotificationBells.css';

export const CategoryNotificationBells = ({ userId, selectedCategory, onNotificationClick }) => {
  const [notifications, setNotifications] = useState({
    infrastructure: [],
    sanitation: [],
    traffic: [],
    safety: [],
    utilities: []
  });
  const [unreadCounts, setUnreadCounts] = useState({
    infrastructure: 0,
    sanitation: 0,
    traffic: 0,
    safety: 0,
    utilities: 0
  });
  const [expandedCategory, setExpandedCategory] = useState(null);

  const categories = [
    { key: 'infrastructure', label: '🏗️ Infrastructure', icon: '🏗️' },
    { key: 'sanitation', label: '🧹 Sanitation', icon: '🧹' },
    { key: 'traffic', label: '🚦 Traffic', icon: '🚦' },
    { key: 'safety', label: '⚠️ Safety', icon: '⚠️' },
    { key: 'utilities', label: '💧 Utilities', icon: '💧' }
  ];

  // Fetch notifications for all categories
  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        const allNotifications = {};
        const allUnreadCounts = {};

        for (const category of categories) {
          const response = await fetch(
            `http://localhost:5000/api/notifications/category?userId=${userId}&category=${category.key}`,
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            allNotifications[category.key] = data.notifications || [];
            allUnreadCounts[category.key] = data.unreadCount || 0;
          }
        }

        setNotifications(allNotifications);
        setUnreadCounts(allUnreadCounts);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchAllNotifications();
    const interval = setInterval(fetchAllNotifications, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleMarkAsRead = async (category, notificationId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/category/${notificationId}/read`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        // Update local state
        setNotifications(prev => ({
          ...prev,
          [category]: prev[category].map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        }));
        setUnreadCounts(prev => ({
          ...prev,
          [category]: Math.max(0, prev[category] - 1)
        }));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async (category) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/category/mark-all-read?userId=${userId}&category=${category}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        setNotifications(prev => ({
          ...prev,
          [category]: prev[category].map(n => ({ ...n, read: true }))
        }));
        setUnreadCounts(prev => ({
          ...prev,
          [category]: 0
        }));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div className="category-notification-bells">
      {categories.map(category => (
        <div key={category.key} className="notification-bell-container">
          <button
            className={`notification-bell ${unreadCounts[category.key] > 0 ? 'has-unread' : ''}`}
            onClick={() => setExpandedCategory(expandedCategory === category.key ? null : category.key)}
            title={category.label}
          >
            <span className="bell-icon">{category.icon}</span>
            {unreadCounts[category.key] > 0 && (
              <span className="unread-badge">{unreadCounts[category.key]}</span>
            )}
          </button>

          {expandedCategory === category.key && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>{category.label}</h3>
                {unreadCounts[category.key] > 0 && (
                  <button
                    className="mark-all-read-btn"
                    onClick={() => handleMarkAllAsRead(category.key)}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notification-list">
                {notifications[category.key].length === 0 ? (
                  <div className="no-notifications">
                    <p>No {category.label.toLowerCase()} notifications</p>
                  </div>
                ) : (
                  notifications[category.key].map(notification => (
                    <div
                      key={notification.id}
                      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                      onClick={() => {
                        onNotificationClick(notification.complaint_id);
                        handleMarkAsRead(category.key, notification.id);
                      }}
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
      ))}
    </div>
  );
};
