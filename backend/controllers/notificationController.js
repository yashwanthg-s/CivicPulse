const pool = require('../config/database');

class NotificationController {
  /**
   * Get notifications for a user
   */
  static async getNotifications(req, res) {
    try {
      const userId = req.query.user_id || req.user?.id;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const connection = await pool.getConnection();
      try {
        // Get notifications from complaint_updates for this user's complaints
        const query = `
          SELECT 
            cu.id,
            cu.complaint_id,
            cu.message,
            cu.created_at,
            cu.is_read,
            c.title as complaint_title,
            c.status as complaint_status
          FROM complaint_updates cu
          JOIN complaints c ON cu.complaint_id = c.id
          WHERE c.user_id = ?
          ORDER BY cu.created_at DESC
          LIMIT 50
        `;
        
        const [notifications] = await connection.execute(query, [userId]);
        
        // Count unread notifications
        const unreadCount = notifications.filter(n => !n.is_read).length;
        
        res.json({
          success: true,
          count: notifications.length,
          unread_count: unreadCount,
          notifications
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error.message
      });
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      
      const connection = await pool.getConnection();
      try {
        await connection.execute(
          'UPDATE complaint_updates SET is_read = TRUE WHERE id = ?',
          [id]
        );
        
        res.json({
          success: true,
          message: 'Notification marked as read'
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message
      });
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(req, res) {
    try {
      const userId = req.body.user_id || req.user?.id;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const connection = await pool.getConnection();
      try {
        await connection.execute(`
          UPDATE complaint_updates cu
          JOIN complaints c ON cu.complaint_id = c.id
          SET cu.is_read = TRUE
          WHERE c.user_id = ? AND cu.is_read = FALSE
        `, [userId]);
        
        res.json({
          success: true,
          message: 'All notifications marked as read'
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: error.message
      });
    }
  }

  /**
   * Get officer notifications (assignments from admin)
   */
  static async getOfficerNotifications(req, res) {
    try {
      const officerId = req.query.officer_id || req.user?.id;
      
      if (!officerId) {
        return res.status(400).json({
          success: false,
          message: 'Officer ID is required'
        });
      }

      const connection = await pool.getConnection();
      try {
        // Get assignment notifications for this officer
        const query = `
          SELECT 
            oa.id,
            oa.complaint_id,
            oa.assigned_at,
            oa.is_read,
            c.title as complaint_title,
            c.priority,
            c.category,
            c.status as complaint_status,
            c.latitude,
            c.longitude,
            u.name as assigned_by_name
          FROM officer_assignments oa
          JOIN complaints c ON oa.complaint_id = c.id
          JOIN users u ON oa.assigned_by = u.id
          WHERE oa.officer_id = ?
          ORDER BY oa.assigned_at DESC
          LIMIT 50
        `;
        
        const [notifications] = await connection.execute(query, [officerId]);
        
        // Count unread notifications
        const unreadCount = notifications.filter(n => !n.is_read).length;
        
        res.json({
          success: true,
          count: notifications.length,
          unread_count: unreadCount,
          notifications
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get officer notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch officer notifications',
        error: error.message
      });
    }
  }

  /**
   * Mark officer notification as read
   */
  static async markOfficerNotificationAsRead(req, res) {
    try {
      const { id } = req.params;
      
      const connection = await pool.getConnection();
      try {
        await connection.execute(
          'UPDATE officer_assignments SET is_read = TRUE WHERE id = ?',
          [id]
        );
        
        res.json({
          success: true,
          message: 'Notification marked as read'
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Mark officer notification as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message
      });
    }
  }

  /**
   * Mark all officer notifications as read
   */
  static async markAllOfficerNotificationsAsRead(req, res) {
    try {
      const officerId = req.body.officer_id || req.user?.id;
      
      if (!officerId) {
        return res.status(400).json({
          success: false,
          message: 'Officer ID is required'
        });
      }

      const connection = await pool.getConnection();
      try {
        await connection.execute(
          'UPDATE officer_assignments SET is_read = TRUE WHERE officer_id = ? AND is_read = FALSE',
          [officerId]
        );
        
        res.json({
          success: true,
          message: 'All notifications marked as read'
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Mark all officer notifications as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: error.message
      });
    }
  }
  /**
   * Get officer notifications based on category (new complaints in their category)
   */
  static async getCategoryBasedNotifications(req, res) {
    try {
      const officerId = req.query.userId || req.query.officer_id || req.user?.id;
      const selectedCategory = req.query.category; // Get category from query params
      
      if (!officerId) {
        return res.status(400).json({
          success: false,
          message: 'Officer ID is required'
        });
      }

      const connection = await pool.getConnection();
      try {
        // Get categories assigned to this officer
        const [categories] = await connection.execute(`
          SELECT category FROM officer_categories 
          WHERE officer_id = ? AND is_active = TRUE
        `, [officerId]);

        let categoryList = [];
        
        // If no categories assigned, use all categories
        if (categories.length === 0) {
          categoryList = ['infrastructure', 'sanitation', 'traffic', 'safety', 'utilities'];
        } else {
          categoryList = categories.map(c => c.category);
        }
        
        // If a specific category is selected, filter to only that category
        if (selectedCategory) {
          categoryList = [selectedCategory];
        }

        // Get new complaints in officer's categories that haven't been marked as read
        const query = `
          SELECT 
            c.id as complaint_id,
            c.title,
            c.description,
            c.category,
            c.status as complaint_status,
            c.latitude,
            c.longitude,
            c.created_at,
            u.name as submitted_by,
            CASE WHEN cn.id IS NOT NULL THEN TRUE ELSE FALSE END as \`read\`
          FROM complaints c
          JOIN users u ON c.user_id = u.id
          LEFT JOIN category_notifications cn ON c.id = cn.complaint_id AND cn.officer_id = ?
          WHERE c.category IN (${categoryList.map(() => '?').join(',')})
          AND c.status = 'submitted'
          ORDER BY c.created_at DESC
          LIMIT 50
        `;
        
        const [notifications] = await connection.execute(query, [officerId, ...categoryList]);
        
        // Count unread notifications
        const unreadCount = notifications.filter(n => !n.read).length;
        
        // Format response to match frontend expectations
        const formattedNotifications = notifications.map(n => ({
          id: n.complaint_id,
          complaint_id: n.complaint_id,
          title: n.title,
          description: n.description,
          submitted_by: n.submitted_by,
          time_ago: new Date(n.created_at).toLocaleDateString(),
          read: n.read
        }));
        
        res.json({
          success: true,
          count: notifications.length,
          unreadCount: unreadCount,
          notifications: formattedNotifications
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get category-based notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category-based notifications',
        error: error.message
      });
    }
  }

  /**
   * Mark category notification as read
   */
  static async markCategoryNotificationAsRead(req, res) {
    try {
      const complaintId = req.params.complaintId;
      const officerId = req.query.userId || req.query.officer_id || req.body.officer_id || req.user?.id;
      
      if (!officerId || !complaintId) {
        return res.status(400).json({
          success: false,
          message: 'Officer ID and Complaint ID are required'
        });
      }

      const connection = await pool.getConnection();
      try {
        // Insert or update the notification read status
        await connection.execute(`
          INSERT INTO category_notifications (complaint_id, officer_id, is_read)
          VALUES (?, ?, TRUE)
          ON DUPLICATE KEY UPDATE is_read = TRUE
        `, [complaintId, officerId]);
        
        res.json({
          success: true,
          message: 'Notification marked as read'
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Mark category notification as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message
      });
    }
  }

  /**
   * Mark all category notifications as read for an officer
   */
  static async markAllCategoryNotificationsAsRead(req, res) {
    try {
      const officerId = req.query.userId || req.query.officer_id || req.body.officer_id || req.user?.id;
      const selectedCategory = req.query.category;
      
      if (!officerId) {
        return res.status(400).json({
          success: false,
          message: 'Officer ID is required'
        });
      }

      const connection = await pool.getConnection();
      try {
        // Get categories for this officer
        const [categories] = await connection.execute(`
          SELECT category FROM officer_categories 
          WHERE officer_id = ? AND is_active = TRUE
        `, [officerId]);

        if (categories.length === 0) {
          return res.json({
            success: true,
            message: 'No categories assigned'
          });
        }

        let categoryList = categories.map(c => c.category);
        
        // If a specific category is selected, filter to only that category
        if (selectedCategory && categoryList.includes(selectedCategory)) {
          categoryList = [selectedCategory];
        }

        // Mark all notifications as read for this officer's categories
        await connection.execute(`
          INSERT INTO category_notifications (complaint_id, officer_id, is_read)
          SELECT c.id, ?, TRUE
          FROM complaints c
          WHERE c.category IN (${categoryList.map(() => '?').join(',')})
          AND c.status = 'submitted'
          ON DUPLICATE KEY UPDATE is_read = TRUE
        `, [officerId, ...categoryList]);
        
        res.json({
          success: true,
          message: 'All notifications marked as read'
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Mark all category notifications as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: error.message
      });
    }
  }

  /**
   * Get resolution notifications for a citizen (when their complaints are resolved)
   */
  static async getResolutionNotifications(req, res) {
    try {
      const userId = req.query.user_id || req.user?.id;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const connection = await pool.getConnection();
      try {
        // Get resolution notifications for this citizen's complaints
        const query = `
          SELECT 
            cu.id,
            cu.complaint_id,
            cu.message,
            cu.created_at,
            cu.is_read,
            c.title as complaint_title,
            c.status as complaint_status
          FROM complaint_updates cu
          JOIN complaints c ON cu.complaint_id = c.id
          WHERE c.user_id = ? AND c.status = 'resolved'
          ORDER BY cu.created_at DESC
          LIMIT 50
        `;
        
        const [notifications] = await connection.execute(query, [userId]);
        
        // Count unread notifications
        const unreadCount = notifications.filter(n => !n.is_read).length;
        
        res.json({
          success: true,
          count: notifications.length,
          unread_count: unreadCount,
          notifications
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get resolution notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch resolution notifications',
        error: error.message
      });
    }
  }

  /**
   * Mark resolution notification as read
   */
  static async markResolutionNotificationAsRead(req, res) {
    try {
      const { id } = req.params;
      
      const connection = await pool.getConnection();
      try {
        await connection.execute(
          'UPDATE complaint_updates SET is_read = TRUE WHERE id = ?',
          [id]
        );
        
        res.json({
          success: true,
          message: 'Notification marked as read'
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Mark resolution notification as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message
      });
    }
  }
}

module.exports = NotificationController;
