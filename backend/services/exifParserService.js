const piexifjs = require('piexifjs');
const fs = require('fs');
const path = require('path');

class ExifParserService {
  /**
   * Extract EXIF data from image buffer (for base64 images)
   * @param {Buffer} buffer - Image buffer
   * @returns {Promise<Object>} Extracted EXIF data
   */
  static async extractExifFromBuffer(buffer) {
    try {
      const binaryString = buffer.toString('binary');
      const exifData = piexifjs.load(binaryString);

      return {
        gps: this.extractGPS(exifData),
        timestamp: this.extractTimestamp(exifData),
        camera: this.extractCameraMetadata(exifData),
        raw: exifData
      };
    } catch (error) {
      console.error('Error extracting EXIF from buffer:', error.message);
      return {
        gps: null,
        timestamp: null,
        camera: null,
        raw: null,
        error: error.message
      };
    }
  }

  /**
   * Extract EXIF data from image file
   * @param {string} imagePath - Path to image file
   * @returns {Promise<Object>} Extracted EXIF data
   */
  static async extractExifData(imagePath) {
    try {
      // Read image file
      const imageBuffer = fs.readFileSync(imagePath);
      const binaryString = imageBuffer.toString('binary');

      // Parse EXIF data
      const exifData = piexifjs.load(binaryString);

      return {
        gps: this.extractGPS(exifData),
        timestamp: this.extractTimestamp(exifData),
        camera: this.extractCameraMetadata(exifData),
        raw: exifData
      };
    } catch (error) {
      console.error(`Error extracting EXIF from ${imagePath}:`, error.message);
      return {
        gps: null,
        timestamp: null,
        camera: null,
        raw: null,
        error: error.message
      };
    }
  }

  /**
   * Extract GPS coordinates from EXIF data
   * @param {Object} exifData - EXIF data object
   * @returns {Object|null} GPS coordinates in decimal format
   */
  static extractGPS(exifData) {
    try {
      if (!exifData.GPS) {
        return null;
      }

      const gps = exifData.GPS;
      const gpsLatitude = gps[piexifjs.GPSIFD.GPSLatitude];
      const gpsLongitude = gps[piexifjs.GPSIFD.GPSLongitude];
      const gpsLatitudeRef = gps[piexifjs.GPSIFD.GPSLatitudeRef];
      const gpsLongitudeRef = gps[piexifjs.GPSIFD.GPSLongitudeRef];
      const gpsDOP = gps[piexifjs.GPSIFD.GPSDOP];

      if (!gpsLatitude || !gpsLongitude) {
        return null;
      }

      const latitude = this.convertDmsToDecimal(
        gpsLatitude[0][0] / gpsLatitude[0][1],
        gpsLatitude[1][0] / gpsLatitude[1][1],
        gpsLatitude[2][0] / gpsLatitude[2][1],
        gpsLatitudeRef ? String.fromCharCode(...gpsLatitudeRef) : 'N'
      );

      const longitude = this.convertDmsToDecimal(
        gpsLongitude[0][0] / gpsLongitude[0][1],
        gpsLongitude[1][0] / gpsLongitude[1][1],
        gpsLongitude[2][0] / gpsLongitude[2][1],
        gpsLongitudeRef ? String.fromCharCode(...gpsLongitudeRef) : 'E'
      );

      // Validate coordinates
      if (!this.validateCoordinates(latitude, longitude)) {
        return null;
      }

      return {
        latitude: parseFloat(latitude.toFixed(8)),
        longitude: parseFloat(longitude.toFixed(8)),
        dop: gpsDOP ? gpsDOP[0] / gpsDOP[1] : null
      };
    } catch (error) {
      console.error('Error extracting GPS from EXIF:', error.message);
      return null;
    }
  }

  /**
   * Convert DMS (Degrees, Minutes, Seconds) to decimal format
   * @param {number} degrees
   * @param {number} minutes
   * @param {number} seconds
   * @param {string} hemisphere - N, S, E, W
   * @returns {number} Decimal coordinate
   */
  static convertDmsToDecimal(degrees, minutes, seconds, hemisphere) {
    let decimal = degrees + minutes / 60 + seconds / 3600;

    if (hemisphere === 'S' || hemisphere === 'W') {
      decimal = -decimal;
    }

    return decimal;
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
      longitude <= 180
    );
  }

  /**
   * Extract timestamp from EXIF data
   * @param {Object} exifData - EXIF data object
   * @returns {Object|null} Timestamp data
   */
  static extractTimestamp(exifData) {
    try {
      let timestamp = null;
      let source = null;

      // Try DateTimeOriginal first
      if (exifData['0th'] && exifData['0th'][piexifjs.ImageIFD.DateTime]) {
        const datetimeOriginal = exifData['0th'][piexifjs.ImageIFD.DateTime];
        timestamp = this.parseExifDateTime(datetimeOriginal);
        source = 'DateTimeOriginal';
      }

      // Fallback to DateTime
      if (!timestamp && exifData['0th'] && exifData['0th'][piexifjs.ImageIFD.DateTime]) {
        const datetime = exifData['0th'][piexifjs.ImageIFD.DateTime];
        timestamp = this.parseExifDateTime(datetime);
        source = 'DateTime';
      }

      return {
        timestamp,
        source,
        iso8601: timestamp ? new Date(timestamp).toISOString() : null
      };
    } catch (error) {
      console.error('Error extracting timestamp from EXIF:', error.message);
      return null;
    }
  }

  /**
   * Parse EXIF datetime string to Date object
   * @param {string} datetimeString - EXIF datetime string (YYYY:MM:DD HH:MM:SS)
   * @returns {Date|null} Parsed date
   */
  static parseExifDateTime(datetimeString) {
    try {
      if (!datetimeString) return null;
      const parts = datetimeString.split(' ');
      const dateParts = parts[0].split(':');
      const timeParts = parts[1].split(':');

      return new Date(
        parseInt(dateParts[0]),
        parseInt(dateParts[1]) - 1,
        parseInt(dateParts[2]),
        parseInt(timeParts[0]),
        parseInt(timeParts[1]),
        parseInt(timeParts[2])
      );
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract camera metadata from EXIF data
   * @param {Object} exifData - EXIF data object
   * @returns {Object|null} Camera metadata
   */
  static extractCameraMetadata(exifData) {
    try {
      const metadata = {};

      if (exifData['0th']) {
        const ifd0 = exifData['0th'];

        // Camera make and model
        if (ifd0[piexifjs.ImageIFD.Make]) {
          metadata.make = this.bytesToString(ifd0[piexifjs.ImageIFD.Make]);
        }
        if (ifd0[piexifjs.ImageIFD.Model]) {
          metadata.model = this.bytesToString(ifd0[piexifjs.ImageIFD.Model]);
        }
      }

      if (exifData['Exif']) {
        const exif = exifData['Exif'];

        // ISO Speed
        if (exif[piexifjs.ExifIFD.ISOSpeedRatings]) {
          metadata.isoSpeed = exif[piexifjs.ExifIFD.ISOSpeedRatings];
        }

        // Focal Length
        if (exif[piexifjs.ExifIFD.FocalLength]) {
          const fl = exif[piexifjs.ExifIFD.FocalLength];
          metadata.focalLength = fl[0] / fl[1];
        }

        // F-Number
        if (exif[piexifjs.ExifIFD.FNumber]) {
          const fn = exif[piexifjs.ExifIFD.FNumber];
          metadata.fNumber = fn[0] / fn[1];
        }

        // Exposure Time
        if (exif[piexifjs.ExifIFD.ExposureTime]) {
          const et = exif[piexifjs.ExifIFD.ExposureTime];
          metadata.exposureTime = `1/${Math.round(et[1] / et[0])}`;
        }
      }

      return Object.keys(metadata).length > 0 ? metadata : null;
    } catch (error) {
      console.error('Error extracting camera metadata:', error.message);
      return null;
    }
  }

  /**
   * Convert byte array to string
   * @param {Array} bytes - Byte array
   * @returns {string} String value
   */
  static bytesToString(bytes) {
    if (typeof bytes === 'string') return bytes;
    return String.fromCharCode(...bytes).replace(/\0/g, '');
  }

  /**
   * Calculate confidence score based on GPS DOP
   * @param {number} dop - Dilution of Precision value
   * @returns {number} Confidence score (0-100)
   */
  static calculateConfidenceScore(dop) {
    if (!dop) return 85; // Default confidence when DOP not available

    // DOP < 2 = excellent, 2-5 = good, 5-10 = moderate, > 10 = poor
    // Better formula: lower DOP = higher confidence
    let score;
    if (dop <= 2) {
      score = 95; // Excellent
    } else if (dop <= 5) {
      score = 85; // Good
    } else if (dop <= 10) {
      score = 70; // Moderate
    } else {
      score = Math.max(40, 100 - (dop * 2)); // Poor, but not below 40%
    }
    
    score = Math.max(0, Math.min(100, score)); // Clamp to 0-100
    return Math.round(score);
  }
}

module.exports = ExifParserService;
