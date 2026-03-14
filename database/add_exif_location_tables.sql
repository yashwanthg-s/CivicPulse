-- Add EXIF location columns to complaints table
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS exif_latitude DECIMAL(10, 8) COMMENT 'GPS latitude extracted from EXIF metadata';
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS exif_longitude DECIMAL(10, 8) COMMENT 'GPS longitude extracted from EXIF metadata';
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS capture_timestamp DATETIME COMMENT 'Photo capture timestamp from EXIF metadata';
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS location_source ENUM('EXIF', 'MANUAL', 'SYSTEM_DEFAULT') DEFAULT 'SYSTEM_DEFAULT' COMMENT 'Source of location data';
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS location_validation_status ENUM('EXIF_EXTRACTED', 'MANUAL_ENTRY', 'VALIDATED', 'DISCREPANCY_MINOR', 'DISCREPANCY_MAJOR', 'ADMIN_APPROVED') COMMENT 'Validation status of location data';
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS location_discrepancy_flag BOOLEAN DEFAULT FALSE COMMENT 'Flag for major location discrepancies';
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS confidence_score INT DEFAULT 85 COMMENT 'Confidence score for EXIF location (0-100)';

-- Create indexes for EXIF location columns
CREATE INDEX IF NOT EXISTS idx_location_source ON complaints(location_source);
CREATE INDEX IF NOT EXISTS idx_location_validation_status ON complaints(location_validation_status);
CREATE INDEX IF NOT EXISTS idx_location_discrepancy_flag ON complaints(location_discrepancy_flag);
CREATE INDEX IF NOT EXISTS idx_exif_location ON complaints(exif_latitude, exif_longitude);

-- Location Review Queue Table
CREATE TABLE IF NOT EXISTS location_review_queue (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  reason VARCHAR(255) NOT NULL COMMENT 'Reason for review (e.g., LOCATION_DISCREPANCY)',
  priority ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
  reviewed_by INT COMMENT 'Admin user ID who reviewed',
  reviewed_at TIMESTAMP NULL,
  action_taken VARCHAR(255) COMMENT 'Action taken (APPROVED, REJECTED, CORRECTED)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_complaint_id (complaint_id),
  INDEX idx_priority (priority),
  INDEX idx_reviewed_at (reviewed_at),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- EXIF Metadata Archive Table
CREATE TABLE IF NOT EXISTS exif_metadata_archive (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  raw_exif_json JSON COMMENT 'Raw EXIF data as JSON',
  gps_latitude DECIMAL(10, 8),
  gps_longitude DECIMAL(10, 8),
  gps_altitude DECIMAL(10, 2),
  gps_dop DECIMAL(5, 2) COMMENT 'Dilution of Precision for confidence calculation',
  camera_make VARCHAR(255),
  camera_model VARCHAR(255),
  iso_speed INT,
  focal_length DECIMAL(8, 2),
  f_number DECIMAL(5, 2),
  exposure_time VARCHAR(50),
  datetime_original DATETIME,
  datetime_digitized DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_complaint_id (complaint_id),
  INDEX idx_gps_location (gps_latitude, gps_longitude),
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);
