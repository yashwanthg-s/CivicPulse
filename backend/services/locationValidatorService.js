const db = require('../config/database');

class LocationValidatorService {
  /**
   * Validate location data by comparing EXIF and manual coordinates
   * @param {Object} exifCoords - EXIF coordinates {latitude, longitude}
   * @param {Object} manualCoords - Manual coordinates {latitude, longitude}
   * @returns {Promise<Object>} Validation result
   */
  static async validateLocationData(exifCoords, manualCoords) {
    try {
      // Case 1: Only EXIF data
      if (exifCoords && !manualCoords) {
        return {
          validationStatus: 'EXIF_EXTRACTED',
          discrepancyFlag: false,
          distance: null,
          reason: 'Location extracted from EXIF metadata'
        };
      }

      // Case 2: Only manual data
      if (!exifCoords && manualCoords) {
        return {
          validationStatus: 'MANUAL_ENTRY',
          discrepancyFlag: false,
          distance: null,
          reason: 'Location manually entered by user'
        };
      }

      // Case 3: Both EXIF and manual data
      if (exifCoords && manualCoords) {
        const distance = this.calculateHaversineDistance(
          exifCoords.latitude,
          exifCoords.longitude,
          manualCoords.latitude,
          manualCoords.longitude
        );

        const validationStatus = this.assignValidationStatus(distance);
        const discrepancyFlag = validationStatus === 'DISCREPANCY_MAJOR';

        return {
          validationStatus,
          discrepancyFlag,
          distance,
          reason: this.getValidationReason(validationStatus, distance)
        };
      }

      // Case 4: No location data
      return {
        validationStatus: null,
        discrepancyFlag: false,
        distance: null,
        reason: 'No location data available'
      };
    } catch (error) {
      console.error('Error validating location data:', error.message);
      throw error;
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {number} lat1 - Latitude 1
   * @param {number} lon1 - Longitude 1
   * @param {number} lat2 - Latitude 2
   * @param {number} lon2 - Longitude 2
   * @returns {number} Distance in meters
   */
  static calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees
   * @returns {number} Radians
   */
  static toRad(degrees) {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Assign validation status based on distance
   * @param {number} distance - Distance in meters
   * @returns {string} Validation status
   */
  static assignValidationStatus(distance) {
    if (distance < 100) {
      return 'VALIDATED';
    } else if (distance < 500) {
      return 'DISCREPANCY_MINOR';
    } else {
      return 'DISCREPANCY_MAJOR';
    }
  }

  /**
   * Get human-readable validation reason
   * @param {string} status - Validation status
   * @param {number} distance - Distance in meters
   * @returns {string} Reason text
   */
  static getValidationReason(status, distance) {
    switch (status) {
      case 'VALIDATED':
        return `Location verified: EXIF and manual locations match within 100m (${Math.round(distance)}m apart)`;
      case 'DISCREPANCY_MINOR':
        return `Minor location discrepancy: EXIF and manual locations differ by ${Math.round(distance)}m (100-500m range)`;
      case 'DISCREPANCY_MAJOR':
        return `Major location discrepancy: EXIF and manual locations differ by ${Math.round(distance)}m (>500m). Flagged for review.`;
      default:
        return 'Location validation status unknown';
    }
  }

  /**
   * Create review queue entry for flagged complaint
   * @param {number} complaintId - Complaint ID
   * @param {string} reason - Reason for review
   * @returns {Promise<Object>} Review queue entry
   */
  static async createReviewQueueEntry(complaintId, reason) {
    try {
      const query = `
        INSERT INTO location_review_queue (complaint_id, reason, priority, created_at)
        VALUES (?, ?, 'MEDIUM', NOW())
      `;
      const result = await db.query(query, [complaintId, reason]);
      return {
        id: result.insertId,
        complaintId,
        reason,
        priority: 'MEDIUM',
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error creating review queue entry:', error.message);
      throw error;
    }
  }

  /**
   * Get review queue entries
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Review queue entries
   */
  static async getReviewQueue(filters = {}) {
    try {
      let query = `
        SELECT lrq.*, c.id as complaint_id, c.title, c.description, 
               c.latitude, c.longitude, c.exif_latitude, c.exif_longitude,
               c.image_path, c.category, c.priority, c.status
        FROM location_review_queue lrq
        JOIN complaints c ON lrq.complaint_id = c.id
        WHERE lrq.reviewed_at IS NULL
      `;

      const params = [];

      if (filters.priority) {
        query += ` AND lrq.priority = ?`;
        params.push(filters.priority);
      }

      query += ` ORDER BY lrq.priority DESC, lrq.created_at ASC`;

      const results = await db.query(query, params);
      return results;
    } catch (error) {
      console.error('Error fetching review queue:', error.message);
      throw error;
    }
  }

  /**
   * Approve location for a complaint
   * @param {number} complaintId - Complaint ID
   * @param {number} adminId - Admin user ID
   * @returns {Promise<Object>} Updated complaint
   */
  static async approveLocation(complaintId, adminId) {
    try {
      // Update complaint validation status
      await db.query(
        `UPDATE complaints SET location_validation_status = 'ADMIN_APPROVED' WHERE id = ?`,
        [complaintId]
      );

      // Update review queue entry
      await db.query(
        `UPDATE location_review_queue 
         SET reviewed_by = ?, reviewed_at = NOW(), action_taken = 'APPROVED'
         WHERE complaint_id = ? AND reviewed_at IS NULL`,
        [adminId, complaintId]
      );

      return { success: true, action: 'APPROVED' };
    } catch (error) {
      console.error('Error approving location:', error.message);
      throw error;
    }
  }

  /**
   * Reject complaint due to location issues
   * @param {number} complaintId - Complaint ID
   * @param {number} adminId - Admin user ID
   * @param {string} reason - Rejection reason
   * @returns {Promise<Object>} Updated complaint
   */
  static async rejectComplaint(complaintId, adminId, reason) {
    try {
      // Update complaint status
      await db.query(
        `UPDATE complaints SET status = 'rejected' WHERE id = ?`,
        [complaintId]
      );

      // Update review queue entry
      await db.query(
        `UPDATE location_review_queue 
         SET reviewed_by = ?, reviewed_at = NOW(), action_taken = 'REJECTED'
         WHERE complaint_id = ? AND reviewed_at IS NULL`,
        [adminId, complaintId]
      );

      return { success: true, action: 'REJECTED' };
    } catch (error) {
      console.error('Error rejecting complaint:', error.message);
      throw error;
    }
  }

  /**
   * Correct location for a complaint
   * @param {number} complaintId - Complaint ID
   * @param {number} newLatitude - New latitude
   * @param {number} newLongitude - New longitude
   * @param {number} adminId - Admin user ID
   * @returns {Promise<Object>} Updated complaint
   */
  static async correctLocation(complaintId, newLatitude, newLongitude, adminId) {
    try {
      // Update complaint location
      await db.query(
        `UPDATE complaints 
         SET latitude = ?, longitude = ?, location_validation_status = 'ADMIN_APPROVED'
         WHERE id = ?`,
        [newLatitude, newLongitude, complaintId]
      );

      // Update review queue entry
      await db.query(
        `UPDATE location_review_queue 
         SET reviewed_by = ?, reviewed_at = NOW(), action_taken = 'CORRECTED'
         WHERE complaint_id = ? AND reviewed_at IS NULL`,
        [adminId, complaintId]
      );

      return { success: true, action: 'CORRECTED' };
    } catch (error) {
      console.error('Error correcting location:', error.message);
      throw error;
    }
  }
}

module.exports = LocationValidatorService;
