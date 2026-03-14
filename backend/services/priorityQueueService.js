const db = require('../config/database');

class PriorityQueueService {
  /**
   * Get priority queue for a specific department
   * Returns complaints sorted by priority score
   */
  static async getDepartmentQueue(department, status = null) {
    try {
      let query = `
        SELECT 
          c.id,
          c.title,
          c.description,
          c.category,
          c.department,
          c.status,
          c.severity_score,
          c.cluster_score,
          c.location_score,
          c.sla_score,
          c.priority_score,
          c.queue_position,
          c.sla_deadline,
          c.created_at,
          c.latitude,
          c.longitude,
          c.image_path,
          c.date,
          c.time,
          CASE 
            WHEN c.priority_score >= 200 THEN 'critical'
            WHEN c.priority_score >= 150 THEN 'high'
            WHEN c.priority_score >= 100 THEN 'medium'
            ELSE 'low'
          END AS priority_level,
          CASE 
            WHEN c.sla_deadline < NOW() THEN 'overdue'
            WHEN c.sla_deadline < DATE_ADD(NOW(), INTERVAL 6 HOUR) THEN 'urgent'
            ELSE 'on_track'
          END AS sla_status,
          TIMESTAMPDIFF(HOUR, c.created_at, NOW()) as hours_elapsed,
          TIMESTAMPDIFF(HOUR, NOW(), c.sla_deadline) as hours_remaining,
          (SELECT COUNT(*) FROM complaint_cluster_members ccm 
           JOIN complaint_clusters cc ON ccm.cluster_id = cc.id 
           WHERE cc.primary_complaint_id = c.id OR ccm.complaint_id = c.id) as duplicate_count,
          u.name as citizen_name,
          u.phone as citizen_phone
        FROM complaints c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.department = ?
          AND c.status IN ('submitted', 'under_review', 'in_progress')
      `;

      const params = [department];

      if (status) {
        query += ` AND c.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY c.priority_score DESC, c.created_at ASC`;

      const [complaints] = await db.query(query, params);
      return complaints;
    } catch (error) {
      console.error('Error fetching department queue:', error);
      throw error;
    }
  }

  /**
   * Get priority queue statistics for a department
   */
  static async getDepartmentQueueStats(department) {
    try {
      const query = `
        SELECT 
          department,
          total_complaints,
          critical_count,
          high_count,
          medium_count,
          low_count,
          avg_priority_score,
          last_updated
        FROM department_queues
        WHERE department = ?
      `;

      const [stats] = await db.query(query, [department]);
      return stats[0] || null;
    } catch (error) {
      console.error('Error fetching queue stats:', error);
      throw error;
    }
  }

  /**
   * Get all department queues with stats
   */
  static async getAllDepartmentQueues() {
    try {
      const query = `
        SELECT 
          department,
          total_complaints,
          critical_count,
          high_count,
          medium_count,
          low_count,
          avg_priority_score,
          last_updated
        FROM department_queues
        ORDER BY total_complaints DESC
      `;

      const [stats] = await db.query(query);
      return stats;
    } catch (error) {
      console.error('Error fetching all queues:', error);
      throw error;
    }
  }

  /**
   * Get top N complaints by priority for a department
   */
  static async getTopComplaints(department, limit = 10) {
    try {
      const query = `
        SELECT 
          c.id,
          c.title,
          c.description,
          c.category,
          c.priority_score,
          c.queue_position,
          c.severity_score,
          c.cluster_score,
          c.location_score,
          c.sla_score,
          CASE 
            WHEN c.priority_score >= 200 THEN 'critical'
            WHEN c.priority_score >= 150 THEN 'high'
            WHEN c.priority_score >= 100 THEN 'medium'
            ELSE 'low'
          END AS priority_level,
          CASE 
            WHEN c.sla_deadline < NOW() THEN 'overdue'
            WHEN c.sla_deadline < DATE_ADD(NOW(), INTERVAL 6 HOUR) THEN 'urgent'
            ELSE 'on_track'
          END AS sla_status,
          TIMESTAMPDIFF(HOUR, NOW(), c.sla_deadline) as hours_remaining
        FROM complaints c
        WHERE c.department = ?
          AND c.status IN ('submitted', 'under_review', 'in_progress')
        ORDER BY c.priority_score DESC, c.created_at ASC
        LIMIT ?
      `;

      const [complaints] = await db.query(query, [department, limit]);
      return complaints;
    } catch (error) {
      console.error('Error fetching top complaints:', error);
      throw error;
    }
  }

  /**
   * Get complaints by priority level
   */
  static async getComplaintsByPriorityLevel(department, priorityLevel) {
    try {
      let scoreRange = { min: 0, max: 100 };

      switch (priorityLevel) {
        case 'critical':
          scoreRange = { min: 200, max: 999 };
          break;
        case 'high':
          scoreRange = { min: 150, max: 199 };
          break;
        case 'medium':
          scoreRange = { min: 100, max: 149 };
          break;
        case 'low':
          scoreRange = { min: 0, max: 99 };
          break;
      }

      const query = `
        SELECT 
          c.id,
          c.title,
          c.description,
          c.category,
          c.priority_score,
          c.queue_position,
          c.severity_score,
          c.cluster_score,
          c.location_score,
          c.sla_score,
          c.status,
          c.created_at,
          CASE 
            WHEN c.sla_deadline < NOW() THEN 'overdue'
            WHEN c.sla_deadline < DATE_ADD(NOW(), INTERVAL 6 HOUR) THEN 'urgent'
            ELSE 'on_track'
          END AS sla_status
        FROM complaints c
        WHERE c.department = ?
          AND c.priority_score >= ?
          AND c.priority_score < ?
          AND c.status IN ('submitted', 'under_review', 'in_progress')
        ORDER BY c.priority_score DESC, c.created_at ASC
      `;

      const [complaints] = await db.query(query, [
        department,
        scoreRange.min,
        scoreRange.max + 1
      ]);
      return complaints;
    } catch (error) {
      console.error('Error fetching complaints by priority level:', error);
      throw error;
    }
  }

  /**
   * Get overdue complaints
   */
  static async getOverdueComplaints(department = null) {
    try {
      let query = `
        SELECT 
          c.id,
          c.title,
          c.description,
          c.category,
          c.department,
          c.priority_score,
          c.queue_position,
          c.sla_deadline,
          TIMESTAMPDIFF(HOUR, c.sla_deadline, NOW()) as hours_overdue,
          c.status,
          c.created_at
        FROM complaints c
        WHERE c.sla_deadline < NOW()
          AND c.status IN ('submitted', 'under_review', 'in_progress')
      `;

      const params = [];

      if (department) {
        query += ` AND c.department = ?`;
        params.push(department);
      }

      query += ` ORDER BY c.sla_deadline ASC`;

      const [complaints] = await db.query(query, params);
      return complaints;
    } catch (error) {
      console.error('Error fetching overdue complaints:', error);
      throw error;
    }
  }

  /**
   * Get urgent complaints (within 6 hours of SLA deadline)
   */
  static async getUrgentComplaints(department = null) {
    try {
      let query = `
        SELECT 
          c.id,
          c.title,
          c.description,
          c.category,
          c.department,
          c.priority_score,
          c.queue_position,
          c.sla_deadline,
          TIMESTAMPDIFF(HOUR, NOW(), c.sla_deadline) as hours_remaining,
          c.status,
          c.created_at
        FROM complaints c
        WHERE c.sla_deadline < DATE_ADD(NOW(), INTERVAL 6 HOUR)
          AND c.sla_deadline > NOW()
          AND c.status IN ('submitted', 'under_review', 'in_progress')
      `;

      const params = [];

      if (department) {
        query += ` AND c.department = ?`;
        params.push(department);
      }

      query += ` ORDER BY c.sla_deadline ASC`;

      const [complaints] = await db.query(query, params);
      return complaints;
    } catch (error) {
      console.error('Error fetching urgent complaints:', error);
      throw error;
    }
  }

  /**
   * Recalculate priority for a specific complaint
   */
  static async recalculatePriority(complaintId) {
    try {
      const query = `CALL calculate_complaint_priority(?)`;
      await db.query(query, [complaintId]);
      
      // Get the updated complaint
      const [complaint] = await db.query(
        `SELECT * FROM complaints WHERE id = ?`,
        [complaintId]
      );
      
      return complaint[0];
    } catch (error) {
      console.error('Error recalculating priority:', error);
      throw error;
    }
  }

  /**
   * Update queue positions for a department
   */
  static async updateQueuePositions(department) {
    try {
      const query = `CALL update_queue_positions(?)`;
      await db.query(query, [department]);
      
      // Return updated stats
      return this.getDepartmentQueueStats(department);
    } catch (error) {
      console.error('Error updating queue positions:', error);
      throw error;
    }
  }

  /**
   * Get priority score breakdown for a complaint
   */
  static async getPriorityBreakdown(complaintId) {
    try {
      const query = `
        SELECT 
          id,
          title,
          category,
          severity_score,
          cluster_score,
          location_score,
          sla_score,
          priority_score,
          queue_position,
          sla_deadline,
          TIMESTAMPDIFF(HOUR, created_at, NOW()) as hours_elapsed,
          TIMESTAMPDIFF(HOUR, NOW(), sla_deadline) as hours_remaining,
          CASE 
            WHEN priority_score >= 200 THEN 'critical'
            WHEN priority_score >= 150 THEN 'high'
            WHEN priority_score >= 100 THEN 'medium'
            ELSE 'low'
          END AS priority_level
        FROM complaints
        WHERE id = ?
      `;

      const [complaint] = await db.query(query, [complaintId]);
      return complaint[0] || null;
    } catch (error) {
      console.error('Error fetching priority breakdown:', error);
      throw error;
    }
  }

  /**
   * Get priority score history for a complaint
   */
  static async getPriorityHistory(complaintId, limit = 10) {
    try {
      const query = `
        SELECT 
          severity_score,
          cluster_score,
          location_score,
          sla_score,
          total_priority_score,
          queue_position,
          calculated_at
        FROM priority_score_history
        WHERE complaint_id = ?
        ORDER BY calculated_at DESC
        LIMIT ?
      `;

      const [history] = await db.query(query, [complaintId, limit]);
      return history;
    } catch (error) {
      console.error('Error fetching priority history:', error);
      throw error;
    }
  }

  /**
   * Get queue analytics for dashboard
   */
  static async getQueueAnalytics(department = null) {
    try {
      let query = `
        SELECT 
          CASE 
            WHEN priority_score >= 200 THEN 'critical'
            WHEN priority_score >= 150 THEN 'high'
            WHEN priority_score >= 100 THEN 'medium'
            ELSE 'low'
          END AS priority_level,
          COUNT(*) as count,
          AVG(priority_score) as avg_score,
          MIN(priority_score) as min_score,
          MAX(priority_score) as max_score,
          AVG(TIMESTAMPDIFF(HOUR, created_at, NOW())) as avg_hours_pending
        FROM complaints
        WHERE status IN ('submitted', 'under_review', 'in_progress')
      `;

      const params = [];

      if (department) {
        query += ` AND department = ?`;
        params.push(department);
      }

      query += ` GROUP BY priority_level ORDER BY priority_score DESC`;

      const [analytics] = await db.query(query, params);
      return analytics;
    } catch (error) {
      console.error('Error fetching queue analytics:', error);
      throw error;
    }
  }

  /**
   * Get complaints approaching SLA deadline
   */
  static async getApproachingSLAComplaints(hoursThreshold = 24, department = null) {
    try {
      let query = `
        SELECT 
          c.id,
          c.title,
          c.description,
          c.category,
          c.department,
          c.priority_score,
          c.sla_deadline,
          TIMESTAMPDIFF(HOUR, NOW(), c.sla_deadline) as hours_remaining,
          c.status,
          c.created_at
        FROM complaints c
        WHERE c.sla_deadline BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? HOUR)
          AND c.status IN ('submitted', 'under_review', 'in_progress')
      `;

      const params = [hoursThreshold];

      if (department) {
        query += ` AND c.department = ?`;
        params.push(department);
      }

      query += ` ORDER BY c.sla_deadline ASC`;

      const [complaints] = await db.query(query, params);
      return complaints;
    } catch (error) {
      console.error('Error fetching approaching SLA complaints:', error);
      throw error;
    }
  }
}

module.exports = PriorityQueueService;
