/**
 * Location Verification Service
 * Verifies if officer's resolution location matches citizen's complaint location
 */

class LocationVerificationService {
  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {number} lat1 - Citizen's latitude
   * @param {number} lon1 - Citizen's longitude
   * @param {number} lat2 - Officer's latitude
   * @param {number} lon2 - Officer's longitude
   * @returns {number} Distance in kilometers
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees
   * @returns {number} Radians
   */
  static toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Verify if two locations match within tolerance
   * @param {number} citizenLat - Citizen's latitude
   * @param {number} citizenLon - Citizen's longitude
   * @param {number} officerLat - Officer's latitude
   * @param {number} officerLon - Officer's longitude
   * @param {number} toleranceKm - Tolerance in kilometers (default: 0.1 km = 100 meters)
   * @returns {Object} Verification result
   */
  static verifyLocation(citizenLat, citizenLon, officerLat, officerLon, toleranceKm = 0.1) {
    try {
      // Validate coordinates
      if (!this.validateCoordinates(citizenLat, citizenLon)) {
        return {
          verified: false,
          distance: null,
          reason: 'Invalid citizen coordinates'
        };
      }

      if (!this.validateCoordinates(officerLat, officerLon)) {
        return {
          verified: false,
          distance: null,
          reason: 'Invalid officer coordinates'
        };
      }

      // Calculate distance
      const distance = this.calculateDistance(citizenLat, citizenLon, officerLat, officerLon);

      // Check if within tolerance
      const verified = distance <= toleranceKm;

      return {
        verified,
        distance: parseFloat(distance.toFixed(6)),
        tolerance: toleranceKm,
        reason: verified 
          ? `Location verified (${distance.toFixed(3)} km from complaint location)`
          : `Location mismatch (${distance.toFixed(3)} km from complaint location, tolerance: ${toleranceKm} km)`
      };
    } catch (error) {
      console.error('Error verifying location:', error.message);
      return {
        verified: false,
        distance: null,
        reason: `Verification error: ${error.message}`
      };
    }
  }

  /**
   * Validate GPS coordinates are within valid ranges
   * @param {number} latitude
   * @param {number} longitude
   * @returns {boolean} True if valid
   */
  static validateCoordinates(latitude, longitude) {
    return (
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180 &&
      latitude !== null &&
      latitude !== undefined &&
      longitude !== null &&
      longitude !== undefined
    );
  }

  /**
   * Get verification status badge
   * @param {boolean} verified
   * @returns {string} Badge text
   */
  static getVerificationBadge(verified) {
    return verified ? '✅ Verified' : '⚠️ Not Verified';
  }

  /**
   * Get verification color
   * @param {boolean} verified
   * @returns {string} Color code
   */
  static getVerificationColor(verified) {
    return verified ? '#4caf50' : '#ff9800'; // Green for verified, Orange for not verified
  }

  /**
   * Format distance for display
   * @param {number} distance - Distance in kilometers
   * @returns {string} Formatted distance
   */
  static formatDistance(distance) {
    if (distance === null || distance === undefined) {
      return 'N/A';
    }
    if (distance < 0.001) {
      return `${(distance * 1000).toFixed(1)} m`; // Show in meters if less than 1 meter
    }
    return `${distance.toFixed(3)} km`;
  }

  /**
   * Get verification details for display
   * @param {Object} verificationResult
   * @returns {Object} Formatted details
   */
  static getVerificationDetails(verificationResult) {
    return {
      badge: this.getVerificationBadge(verificationResult.verified),
      color: this.getVerificationColor(verificationResult.verified),
      distance: this.formatDistance(verificationResult.distance),
      tolerance: this.formatDistance(verificationResult.tolerance),
      reason: verificationResult.reason,
      verified: verificationResult.verified
    };
  }
}

module.exports = LocationVerificationService;
