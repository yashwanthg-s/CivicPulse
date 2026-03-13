const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const notificationService = {
  /**
   * Get notifications for a user
   */
  async getNotifications(userId) {
    try {
      const response = await fetch(`${API_URL}/notifications?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      return await response.json();
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId) {
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      return await response.json();
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    try {
      const response = await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      return await response.json();
    } catch (error) {
      console.error('Mark all as read error:', error);
      throw error;
    }
  },

  /**
   * Get resolution notifications for a citizen
   */
  async getResolutionNotifications(userId) {
    try {
      const response = await fetch(`${API_URL}/notifications/resolution?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resolution notifications');
      }

      return await response.json();
    } catch (error) {
      console.error('Get resolution notifications error:', error);
      throw error;
    }
  },

  /**
   * Mark a resolution notification as read
   */
  async markResolutionNotificationAsRead(notificationId) {
    try {
      const response = await fetch(`${API_URL}/notifications/resolution/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark resolution notification as read');
      }

      return await response.json();
    } catch (error) {
      console.error('Mark resolution notification as read error:', error);
      throw error;
    }
  },
};
