# Design Document: EXIF Location Extraction for Offline Complaint Reporting

## Overview

The EXIF Location Extraction feature enables the complaint reporting platform to automatically extract GPS coordinates and capture timestamps from image metadata. This allows citizens to submit complaints with accurate location information even when photos were captured offline. The system validates extracted locations against manually entered locations to detect potential fraud, flagging suspicious discrepancies for admin review.

### Key Design Goals

1. **Automatic Location Detection**: Extract GPS data from image EXIF metadata without user intervention
2. **Offline Support**: Enable accurate location capture independent of upload timing or network availability
3. **Fraud Detection**: Identify suspicious location discrepancies between EXIF and manual entries
4. **User Confidence**: Display confidence indicators based on GPS accuracy data
5. **Admin Oversight**: Provide tools for reviewing and correcting flagged complaints
6. **Data Integrity**: Maintain precision and accuracy throughout extraction, storage, and retrieval

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  • ComplaintForm (image upload)                                  │
│  • LocationDisplay (map with EXIF/manual pins)                   │
│  • ConfidenceIndicator (GPS accuracy visualization)              │
│  • ManualLocationSelector (fallback map interface)               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        Backend Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  • EXIF Parser Service (extract metadata)                        │
│  • Location Validator Service (compare & validate)               │
│  • Complaint Controller (orchestrate flow)                       │
│  • Admin Review Service (manage flagged complaints)              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Database Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  • complaints (extended schema with EXIF fields)                 │
│  • location_review_queue (flagged complaints)                    │
│  • exif_metadata_archive (full EXIF data storage)                │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Image Upload
    ↓
EXIF Parser Service
    ├─ Extract GPS coordinates (DMS → decimal)
    ├─ Extract capture timestamp
    ├─ Extract camera metadata
    └─ Validate coordinate ranges
    ↓
Location Validator Service
    ├─ Check if manual location provided
    ├─ Calculate Haversine distance (if both exist)
    ├─ Assign validation status
    └─ Set discrepancy flag (if distance > 500m)
    ↓
Complaint Creation
    ├─ Store EXIF data in complaints table
    ├─ Store full metadata in archive
    └─ Add to review queue (if flagged)
    ↓
Frontend Display
    ├─ Show EXIF location on map
    ├─ Display confidence indicator
    └─ Prompt for manual adjustment (if needed)
```

### Integration Points

1. **ComplaintForm Component**: Receives image upload, triggers EXIF extraction
2. **Image Upload Middleware**: Passes image to EXIF parser before storage
3. **Complaint Model**: Extended with new EXIF fields
4. **Admin Dashboard**: Displays flagged complaints in review queue
5. **Officer Dashboard**: Shows location validation status for assigned complaints

---

## Components and Interfaces

### Backend Services

#### EXIF Parser Service

**Purpose**: Extract and validate GPS coordinates and timestamps from image metadata

**Key Methods**:
- `extractExifData(imagePath)` → ExifData object
- `convertDmsToDecimal(degrees, minutes, seconds, hemisphere)` → decimal coordinate
- `validateCoordinates(latitude, longitude)` → boolean
- `extractTimestamp(exifData)` → ISO 8601 timestamp
- `getConfidenceScore(dopValue)` → percentage (0-100)

**Supported Formats**: JPEG, PNG, HEIC/HEIF, WebP

**Error Handling**:
- Missing EXIF data → returns null, continues processing
- Invalid coordinates → rejects with error, logs issue
- Corrupted files → catches error, logs, returns null
- Unsupported formats → returns null gracefully

#### Location Validator Service

**Purpose**: Compare EXIF and manual locations, assign validation status

**Key Methods**:
- `validateLocationData(exifCoords, manualCoords)` → ValidationResult
- `calculateHaversineDistance(lat1, lon1, lat2, lon2)` → distance in meters
- `assignValidationStatus(distance)` → status enum
- `setDiscrepancyFlag(status)` → boolean
- `createReviewQueueEntry(complaintId, reason)` → void

**Validation Status Values**:
- `EXIF_EXTRACTED`: Only EXIF data available
- `MANUAL_ENTRY`: Only manual data provided
- `VALIDATED`: Both exist, distance < 100m
- `DISCREPANCY_MINOR`: Both exist, distance 100-500m
- `DISCREPANCY_MAJOR`: Both exist, distance > 500m
- `ADMIN_APPROVED`: Admin has reviewed and approved

#### Admin Review Service

**Purpose**: Manage flagged complaints and admin actions

**Key Methods**:
- `getReviewQueue()` → array of flagged complaints
- `approveLocation(complaintId)` → updates status to ADMIN_APPROVED
- `rejectComplaint(complaintId, reason)` → marks as rejected
- `correctLocation(complaintId, newLat, newLon)` → updates location

### Frontend Components

#### LocationDisplay Component

**Props**:
- `exifLatitude`: number (nullable)
- `exifLongitude`: number (nullable)
- `manualLatitude`: number (nullable)
- `manualLongitude`: number (nullable)
- `confidenceScore`: number (0-100)
- `onLocationChange`: callback function
- `validationStatus`: string

**Features**:
- Interactive map (Leaflet)
- Dual pins: blue for EXIF, red for manual
- Real-time coordinate display
- Draggable manual pin
- Confidence indicator with color coding

#### ConfidenceIndicator Component

**Props**:
- `score`: number (0-100)
- `dopValue`: number (nullable)

**Display Logic**:
- 90-100%: Green, "High Confidence"
- 70-89%: Yellow, "Medium Confidence"
- 0-69%: Red, "Low Confidence"

#### ManualLocationSelector Component

**Props**:
- `onLocationSelected`: callback with {lat, lon}
- `initialCenter`: {lat, lon} (user location or city center)
- `zoom`: number (default 18)

**Features**:
- Map centered on user location or default
- Click to select location
- Displays selected coordinates
- Enables/disables submit button based on selection

---

## Data Models

### Database Schema Extensions

```sql
-- New fields added to complaints table
ALTER TABLE complaints ADD COLUMN (
  exif_latitude DECIMAL(10, 8) COMMENT 'GPS latitude from EXIF',
  exif_longitude DECIMAL(10, 8) COMMENT 'GPS longitude from EXIF',
  capture_timestamp DATETIME COMMENT 'Photo capture time from EXIF',
  location_source ENUM('EXIF', 'MANUAL', 'SYSTEM_DEFAULT') DEFAULT 'MANUAL',
  location_validation_status ENUM(
    'EXIF_EXTRACTED',
    'MANUAL_ENTRY',
    'VALIDATED',
    'DISCREPANCY_MINOR',
    'DISCREPANCY_MAJOR',
    'ADMIN_APPROVED'
  ) DEFAULT 'MANUAL_ENTRY',
  location_discrepancy_flag BOOLEAN DEFAULT FALSE,
  INDEX idx_location_source (location_source),
  INDEX idx_validation_status (location_validation_status),
  INDEX idx_discrepancy_flag (location_discrepancy_flag),
  INDEX idx_exif_location (exif_latitude, exif_longitude)
);

-- New table for location review queue
CREATE TABLE location_review_queue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL UNIQUE,
  reason VARCHAR(100) NOT NULL,
  priority ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
  reviewed_by INT,
  reviewed_at TIMESTAMP NULL,
  action_taken VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_complaint_id (complaint_id),
  INDEX idx_priority (priority),
  INDEX idx_reviewed_at (reviewed_at),
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Archive table for full EXIF metadata
CREATE TABLE exif_metadata_archive (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  raw_exif_json JSON NOT NULL,
  gps_latitude DECIMAL(10, 8),
  gps_longitude DECIMAL(10, 8),
  gps_altitude DECIMAL(10, 2),
  gps_dop DECIMAL(5, 2),
  capture_timestamp DATETIME,
  camera_model VARCHAR(255),
  camera_make VARCHAR(255),
  iso_speed INT,
  focal_length DECIMAL(8, 2),
  f_number DECIMAL(4, 2),
  exposure_time VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_complaint_id (complaint_id),
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);
```

### ExifData Object Structure

```javascript
{
  gpsLatitude: {
    degrees: number,
    minutes: number,
    seconds: number,
    hemisphere: 'N' | 'S',
    decimal: number  // computed
  },
  gpsLongitude: {
    degrees: number,
    minutes: number,
    seconds: number,
    hemisphere: 'E' | 'W',
    decimal: number  // computed
  },
  gpsAltitude: number,
  gpsDop: number,  // Dilution of Precision
  dateTimeOriginal: string,  // ISO 8601
  dateTime: string,  // ISO 8601 (fallback)
  cameraModel: string,
  cameraMake: string,
  isoSpeed: number,
  focalLength: number,
  fNumber: number,
  exposureTime: string,
  hasGps: boolean,
  isValid: boolean,
  validationErrors: string[]
}
```

### ValidationResult Object

```javascript
{
  exifCoordinates: { lat: number, lon: number } | null,
  manualCoordinates: { lat: number, lon: number } | null,
  distance: number | null,  // meters
  validationStatus: string,
  discrepancyFlag: boolean,
  confidenceScore: number,  // 0-100
  requiresReview: boolean
}
```

---

## Key Algorithms

### GPS Coordinate Conversion (DMS to Decimal)

```javascript
function convertDmsToDecimal(degrees, minutes, seconds, hemisphere) {
  let decimal = degrees + (minutes / 60) + (seconds / 3600);
  
  // Apply hemisphere sign
  if (hemisphere === 'S' || hemisphere === 'W') {
    decimal = -decimal;
  }
  
  return decimal;
}
```

### Haversine Distance Calculation

```javascript
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // distance in meters
}
```

### Location Discrepancy Detection

```javascript
function assignValidationStatus(distance) {
  if (distance === null) {
    return 'EXIF_EXTRACTED'; // or 'MANUAL_ENTRY'
  }
  
  if (distance < 100) {
    return 'VALIDATED';
  } else if (distance < 500) {
    return 'DISCREPANCY_MINOR';
  } else {
    return 'DISCREPANCY_MAJOR';
  }
}
```

### Confidence Score Calculation

```javascript
function calculateConfidenceScore(dopValue) {
  if (dopValue === null || dopValue === undefined) {
    return 85; // default confidence
  }
  
  // DOP values typically range from 1 to 50
  // Lower DOP = higher accuracy
  const confidence = Math.max(0, Math.min(100, 100 - dopValue));
  return Math.round(confidence);
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: EXIF GPS Extraction Accuracy

For any image file with valid EXIF GPS metadata, extracting the GPS coordinates should produce latitude and longitude values that match the original EXIF data within 0.000001 decimal degrees precision.

**Validates: Requirements 1.1, 1.3, 15.1, 15.3**

### Property 2: DMS to Decimal Conversion Correctness

For any valid degrees/minutes/seconds GPS coordinate with hemisphere indicator, converting to decimal format using the formula `decimal = degrees + (minutes/60) + (seconds/3600)` and applying the correct sign should produce a coordinate within the valid range [-90, 90] for latitude or [-180, 180] for longitude.

**Validates: Requirements 1.2, 12.1, 12.2, 12.4, 12.5**

### Property 3: Timestamp Extraction and Format Conversion

For any image with DateTimeOriginal or DateTime EXIF field, extracting and converting to ISO 8601 format should produce a timestamp that represents the same moment in time as the original EXIF value.

**Validates: Requirements 2.1, 2.2, 2.3, 15.2**

### Property 4: Fallback Timestamp Handling

For any image without DateTimeOriginal but with DateTime field, the system should extract DateTime as a fallback. For images with neither field, the system should use the file upload timestamp without error.

**Validates: Requirements 2.3, 2.4**

### Property 5: Multiple Image GPS Selection

For any complaint with multiple images where at least one contains valid EXIF GPS data, the system should use the first valid GPS coordinate set as the primary location and ignore subsequent images.

**Validates: Requirements 1.5**

### Property 6: EXIF Location Storage and Retrieval

For any complaint created with EXIF location data, storing the complaint and retrieving it should return the same exif_latitude, exif_longitude, location_source, and capture_timestamp values.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 10.1, 10.2, 10.3, 10.4, 10.5, 15.4**

### Property 7: Manual Location Acceptance and Storage

For any manually selected location on the map, the system should accept the coordinates, store them with location_source as "MANUAL" and location_validation_status as "MANUAL_ENTRY", and allow complaint submission without EXIF data.

**Validates: Requirements 4.2, 4.3, 4.4, 4.5**

### Property 8: Haversine Distance Calculation

For any two valid geographic coordinates, calculating the Haversine distance should produce a non-negative value in meters that represents the great-circle distance between the points.

**Validates: Requirements 5.1**

### Property 9: Location Validation Status Assignment

For any complaint with both EXIF and manual coordinates, the system should assign validation status based on Haversine distance: "VALIDATED" if < 100m, "DISCREPANCY_MINOR" if 100-500m, "DISCREPANCY_MAJOR" if > 500m.

**Validates: Requirements 5.2, 5.3, 5.4, 13.3**

### Property 10: Discrepancy Flag Setting

For any complaint with location_validation_status set to "DISCREPANCY_MAJOR", the location_discrepancy_flag should be automatically set to true. For status "VALIDATED" or "DISCREPANCY_MINOR", the flag should be false.

**Validates: Requirements 5.4, 5.5, 13.4, 13.5**

### Property 11: Review Queue Addition

For any complaint with location_discrepancy_flag set to true, the system should add it to the location_review_queue with reason "LOCATION_DISCREPANCY" and priority "MEDIUM".

**Validates: Requirements 6.1, 6.2**

### Property 12: Admin Location Approval

For any flagged complaint that an admin approves, the system should update location_validation_status to "ADMIN_APPROVED" and remove the entry from the review queue.

**Validates: Requirements 6.5**

### Property 13: Map Display with EXIF Coordinates

For any complaint with successfully extracted EXIF GPS coordinates, the map should render a location pin centered at those coordinates with zoom level 18 and display coordinates in decimal format.

**Validates: Requirements 7.1, 7.2, 7.5**

### Property 14: Visual Distinction of Location Sources

For any complaint displayed on the admin map with both EXIF and manual locations, the EXIF location should be displayed with a blue pin and the manual location with a red pin.

**Validates: Requirements 7.3**

### Property 15: Real-Time Coordinate Updates

For any manual location adjustment on the map, the displayed coordinates should update in real-time as the user drags the pin.

**Validates: Requirements 7.4**

### Property 16: Confidence Score Calculation

For any EXIF GPS data with DOP value, the confidence score should be calculated as `(100 - DOP)` and displayed as a percentage. Without DOP, the default confidence should be 85%.

**Validates: Requirements 8.2, 8.3**

### Property 17: Confidence Indicator Color Coding

For any displayed confidence score, the indicator should be green with "High Confidence" label if ≥ 90%, yellow with "Medium Confidence" if 70-89%, and red with "Low Confidence" if < 70%.

**Validates: Requirements 8.4, 8.5, 8.6**

### Property 18: Missing EXIF GPS Prompt

For any image uploaded without EXIF GPS data, the system should display the message "GPS data not found in photo. Please select the location on the map." and prompt for manual location selection.

**Validates: Requirements 4.1, 9.1**

### Property 19: Manual Location Selection Enables Submission

For any complaint where the user has selected a manual location on the map, the complaint submission button should be enabled. If no location is selected and no EXIF data exists, the button should be disabled with message "Location required to submit complaint".

**Validates: Requirements 9.4, 9.5**

### Property 20: Coordinate Validation Ranges

For any GPS coordinate extraction, latitude values outside [-90, 90] and longitude values outside [-180, 180] should be rejected as invalid.

**Validates: Requirements 12.4, 12.5**

### Property 21: Multi-Format EXIF Support

For any image in JPEG, PNG, HEIC/HEIF, or WebP format, the system should extract EXIF metadata if present. For unsupported formats or missing EXIF data, the system should return null and continue processing without error.

**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**

### Property 22: Corrupted File Handling

For any corrupted image file, the EXIF parser should catch the error, log it, and return null without crashing the system.

**Validates: Requirements 11.5**

### Property 23: EXIF-Only Validation Status

For any complaint containing only EXIF location data without manual entry, the location_validation_status should be set to "EXIF_EXTRACTED".

**Validates: Requirements 13.1**

### Property 24: Manual-Only Validation Status

For any complaint containing only manual location data without EXIF data, the location_validation_status should be set to "MANUAL_ENTRY".

**Validates: Requirements 13.2**

### Property 25: EXIF Metadata Display Completeness

For any complaint with EXIF data, the admin detail page should display GPS coordinates in both decimal and degrees/minutes/seconds formats, capture timestamp in both original and ISO 8601 formats, and all available camera metadata.

**Validates: Requirements 14.1, 14.2, 14.3, 14.4**

### Property 26: Missing EXIF Metadata Handling

For any complaint without EXIF data, the system should display "No EXIF data available" instead of showing empty fields.

**Validates: Requirements 14.5**

---

## Error Handling

### EXIF Extraction Errors

| Error | Handling | User Impact |
|-------|----------|------------|
| Missing EXIF data | Return null, continue | Prompt for manual location |
| Invalid GPS coordinates | Reject, log error | Prompt for manual location |
| Corrupted file | Catch error, log, return null | Prompt for manual location |
| Unsupported format | Return null gracefully | Prompt for manual location |
| File too large | Reject before processing | Display error message |
| Missing timestamp | Use upload time as fallback | Proceed with fallback |

### Location Validation Errors

| Error | Handling | User Impact |
|-------|----------|------------|
| Both locations missing | Cannot validate | Require manual entry |
| Invalid Haversine input | Reject, log error | Flag for admin review |
| Database write failure | Rollback transaction | Display error, retry |
| Timezone parsing error | Use UTC | Proceed with UTC |

### Frontend Errors

| Error | Handling | User Impact |
|-------|----------|------------|
| Map initialization failure | Show fallback input | Allow manual coordinate entry |
| Geolocation denied | Use city center | Center map on default location |
| Network timeout | Retry with exponential backoff | Display loading state |
| Invalid manual coordinates | Validate on blur | Show validation error |

---

## Testing Strategy

### Unit Testing Approach

**EXIF Parser Tests**:
- Test DMS to decimal conversion with various hemisphere combinations
- Test coordinate validation for boundary values (±90, ±180)
- Test timestamp extraction with multiple EXIF field combinations
- Test handling of missing/corrupted EXIF data
- Test multi-format support (JPEG, PNG, HEIC, WebP)

**Location Validator Tests**:
- Test Haversine distance calculation against known values
- Test validation status assignment for distance thresholds
- Test discrepancy flag setting based on status
- Test handling of null coordinates

**Database Tests**:
- Test EXIF data storage and retrieval with precision verification
- Test location_source field values
- Test validation_status enum values
- Test review queue operations

**Frontend Tests**:
- Test map rendering with EXIF coordinates
- Test confidence indicator color coding
- Test manual location selection and coordinate capture
- Test real-time coordinate updates
- Test submit button enable/disable logic

### Property-Based Testing Approach

**Configuration**: Minimum 100 iterations per property test

**Property Test Suite**:

1. **Feature: exif-location-extraction, Property 1: EXIF GPS Extraction Accuracy**
   - Generate random valid EXIF GPS data
   - Extract coordinates
   - Verify precision matches original within 0.000001 degrees

2. **Feature: exif-location-extraction, Property 2: DMS to Decimal Conversion Correctness**
   - Generate random DMS coordinates with all hemisphere combinations
   - Convert to decimal
   - Verify result is within valid range and mathematically correct

3. **Feature: exif-location-extraction, Property 8: Haversine Distance Calculation**
   - Generate random coordinate pairs
   - Calculate distance
   - Verify result is non-negative and symmetric (distance A→B = distance B→A)

4. **Feature: exif-location-extraction, Property 9: Location Validation Status Assignment**
   - Generate coordinate pairs at various distances
   - Assign validation status
   - Verify status matches distance thresholds

5. **Feature: exif-location-extraction, Property 10: Discrepancy Flag Setting**
   - Generate validation statuses
   - Set discrepancy flag
   - Verify flag is true for DISCREPANCY_MAJOR, false otherwise

6. **Feature: exif-location-extraction, Property 6: EXIF Location Storage and Retrieval**
   - Generate random EXIF location data
   - Store in database
   - Retrieve and verify all fields match original

7. **Feature: exif-location-extraction, Property 16: Confidence Score Calculation**
   - Generate random DOP values
   - Calculate confidence
   - Verify result is 0-100 and formula is correct

8. **Feature: exif-location-extraction, Property 20: Coordinate Validation Ranges**
   - Generate invalid coordinates (lat > 90, lon > 180)
   - Attempt validation
   - Verify rejection

9. **Feature: exif-location-extraction, Property 21: Multi-Format EXIF Support**
   - Generate test images in multiple formats
   - Extract EXIF
   - Verify extraction succeeds for supported formats, returns null for unsupported

10. **Feature: exif-location-extraction, Property 22: Corrupted File Handling**
    - Generate corrupted image files
    - Attempt extraction
    - Verify system doesn't crash and returns null

### Integration Testing

- End-to-end complaint submission with EXIF location
- End-to-end complaint submission with manual location
- End-to-end complaint submission with both locations (validation flow)
- Admin review queue operations
- Location correction workflow

---

## Security Considerations

### EXIF Data Validation

- Validate all extracted coordinates are within valid ranges
- Reject coordinates with invalid hemisphere indicators
- Sanitize EXIF metadata before storage to prevent injection attacks
- Validate timestamp formats before parsing

### File Upload Security

- Enforce file size limits (max 10MB per image)
- Validate file MIME types (JPEG, PNG, HEIC, WebP only)
- Scan for malicious content before EXIF extraction
- Store uploaded files outside web root
- Use secure file naming (hash-based)

### Location Data Privacy

- Encrypt EXIF coordinates in transit (HTTPS only)
- Restrict EXIF metadata display to authorized users
- Implement audit logging for all location data access
- Allow users to opt-out of EXIF extraction
- Implement data retention policies for archived EXIF data

### Fraud Detection

- Flag complaints with location discrepancies > 500m
- Monitor for patterns of location manipulation
- Implement rate limiting on complaint submissions
- Cross-reference EXIF timestamps with submission times
- Alert admins to suspicious patterns

---

## Performance Considerations

### EXIF Extraction

- Use streaming for large files to minimize memory usage
- Cache EXIF parsing library in memory
- Implement timeout (5 seconds) for extraction operations
- Process images asynchronously to avoid blocking

### Database Queries

- Index on `location_validation_status` for review queue queries
- Index on `location_discrepancy_flag` for flagged complaint queries
- Index on `exif_latitude, exif_longitude` for location-based queries
- Partition `exif_metadata_archive` by date for archival queries

### Frontend Performance

- Lazy load map component only when needed
- Debounce coordinate updates during manual pin dragging
- Cache map tiles locally
- Minimize re-renders of confidence indicator

---

## Deployment Considerations

### Database Migration

1. Add new columns to `complaints` table (nullable initially)
2. Create `location_review_queue` table
3. Create `exif_metadata_archive` table
4. Create indexes on new columns
5. Backfill existing complaints with `location_source = 'MANUAL'`

### Rollout Strategy

1. Deploy backend services first
2. Enable EXIF extraction for new complaints only
3. Monitor error rates and performance
4. Gradually enable for existing complaint types
5. Deploy frontend changes after backend stabilization

### Monitoring

- Track EXIF extraction success rate
- Monitor Haversine distance calculation performance
- Alert on review queue growth
- Track confidence score distribution
- Monitor database query performance on new indexes

