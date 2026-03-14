# Requirements Document: EXIF Location Extraction for Offline Complaint Reporting

## Introduction

This feature enables the complaint reporting platform to extract GPS location data from image EXIF metadata, allowing users to submit complaints with accurate location information even when they captured photos offline. When citizens take photos offline and upload them later, the GPS coordinates embedded in the image metadata are used as the complaint location, ensuring location accuracy independent of upload timing or network availability.

## Glossary

- **EXIF Metadata**: Exchangeable Image File Format data embedded in image files containing technical information like GPS coordinates, capture timestamp, camera settings
- **GPS Coordinates**: Latitude and longitude values in decimal format representing a geographic location
- **Decimal Format**: GPS coordinates expressed as decimal degrees (e.g., 12.9716° N, 77.5946° E) rather than degrees/minutes/seconds
- **Location Source**: The origin of the location data (EXIF, manual entry, or system default)
- **Location Discrepancy**: The distance difference between EXIF-extracted location and manually entered location
- **Confidence Indicator**: A visual representation of the reliability of the EXIF location data
- **Offline Complaint**: A complaint submitted with photos captured when the user had no internet connectivity
- **Complaint**: A report of a civic issue (pothole, streetlight, garbage, etc.) submitted by a citizen
- **System**: The complaint reporting platform including frontend, backend, and database components
- **EXIF_Parser**: The backend service responsible for extracting EXIF metadata from uploaded images
- **Location_Validator**: The backend service responsible for validating and comparing location data
- **Complaint_Database**: The persistent storage system for complaint records and metadata
- **Map_Display**: The frontend component showing the complaint location on an interactive map

## Requirements

### Requirement 1: Extract GPS Coordinates from EXIF Metadata

**User Story:** As a citizen, I want the system to automatically extract the GPS location from my photo's metadata, so that my complaint is filed at the correct location without manual entry.

#### Acceptance Criteria

1. WHEN an image file is uploaded to the system, THE EXIF_Parser SHALL extract the GPSLatitude and GPSLongitude values from the image metadata
2. WHEN GPSLatitude and GPSLongitude are present in the EXIF metadata, THE EXIF_Parser SHALL convert them from degrees/minutes/seconds format to decimal format
3. WHEN the EXIF metadata contains GPS coordinates, THE EXIF_Parser SHALL store the extracted latitude and longitude with a precision of at least 6 decimal places (approximately 0.11 meters accuracy)
4. WHEN an image file lacks EXIF GPS data, THE EXIF_Parser SHALL return a null value for GPS coordinates and continue processing without error
5. WHEN multiple images are uploaded for a single complaint, THE EXIF_Parser SHALL extract GPS coordinates from each image and use the first valid GPS coordinate set as the primary location

### Requirement 2: Extract Photo Capture Timestamp from EXIF Metadata

**User Story:** As a system administrator, I want to know when the photo was actually taken, so that I can verify the complaint timeline and detect potential fraud.

#### Acceptance Criteria

1. WHEN an image file is uploaded, THE EXIF_Parser SHALL extract the DateTimeOriginal value from the EXIF metadata
2. WHEN DateTimeOriginal is present in the EXIF metadata, THE EXIF_Parser SHALL parse it into a standardized ISO 8601 timestamp format
3. WHEN DateTimeOriginal is not available, THE EXIF_Parser SHALL attempt to extract the DateTime field as a fallback
4. WHEN neither DateTimeOriginal nor DateTime is available, THE EXIF_Parser SHALL record the file upload timestamp as the capture timestamp
5. THE EXIF_Parser SHALL store the capture timestamp with timezone information when available in the EXIF metadata

### Requirement 3: Support Offline Complaint Submission with EXIF Location

**User Story:** As a citizen without internet access, I want to take photos of civic issues and submit complaints later with the correct location, so that my complaint is accurately recorded even if I upload it from a different location.

#### Acceptance Criteria

1. WHEN a complaint is submitted with images containing EXIF GPS data, THE System SHALL use the EXIF-extracted location as the complaint location
2. WHEN a complaint is submitted with EXIF location data, THE Complaint_Database SHALL store the location_source field as "EXIF"
3. WHEN a complaint is submitted with EXIF location data, THE System SHALL record the capture_timestamp from the EXIF metadata in the complaint record
4. WHEN a complaint is submitted with EXIF location data, THE System SHALL store both exif_latitude and exif_longitude in the complaint record
5. WHEN a complaint is submitted with EXIF location data, THE System SHALL mark the location_validation_status as "EXIF_EXTRACTED" in the complaint record

### Requirement 4: Allow Manual Location Adjustment When EXIF Data is Missing

**User Story:** As a citizen without GPS-enabled photos, I want to manually select the complaint location on a map, so that I can still submit an accurate complaint.

#### Acceptance Criteria

1. WHEN an uploaded image lacks EXIF GPS data, THE Map_Display SHALL prompt the user to manually select a location on the map
2. WHEN a user manually selects a location on the map, THE System SHALL accept the manually entered latitude and longitude values
3. WHEN a user manually selects a location, THE Complaint_Database SHALL store the location_source field as "MANUAL"
4. WHEN a user manually selects a location, THE System SHALL mark the location_validation_status as "MANUAL_ENTRY" in the complaint record
5. WHEN a user manually selects a location, THE System SHALL allow the user to proceed with complaint submission without requiring EXIF data

### Requirement 5: Validate Location Accuracy by Comparing EXIF GPS with Manual Entry

**User Story:** As a system administrator, I want to detect when users manually enter a location that differs significantly from the photo's GPS data, so that I can flag potentially fraudulent complaints.

#### Acceptance Criteria

1. WHEN a complaint contains both EXIF GPS coordinates and manually entered coordinates, THE Location_Validator SHALL calculate the distance between the two locations using the Haversine formula
2. WHEN the distance between EXIF and manual locations is less than 100 meters, THE Location_Validator SHALL mark the location_validation_status as "VALIDATED"
3. WHEN the distance between EXIF and manual locations is between 100 and 500 meters, THE Location_Validator SHALL mark the location_validation_status as "DISCREPANCY_MINOR"
4. WHEN the distance between EXIF and manual locations is greater than 500 meters, THE Location_Validator SHALL mark the location_validation_status as "DISCREPANCY_MAJOR" and set location_discrepancy_flag to true
5. WHEN location_discrepancy_flag is set to true, THE System SHALL add the complaint to an admin review queue for manual verification

### Requirement 6: Flag Complaints for Review if Location Discrepancy is Too Large

**User Story:** As an officer, I want to be alerted to complaints with suspicious location data, so that I can investigate potential fraud before responding.

#### Acceptance Criteria

1. WHEN a complaint has location_discrepancy_flag set to true, THE System SHALL create a review flag in the complaint record with reason "LOCATION_DISCREPANCY"
2. WHEN a complaint is flagged for location discrepancy, THE System SHALL add it to the admin dashboard review queue with priority "MEDIUM"
3. WHEN a complaint is flagged for location discrepancy, THE System SHALL display both the EXIF location and manual location on the admin dashboard map
4. WHEN an admin reviews a flagged complaint, THE System SHALL allow the admin to approve the location, reject the complaint, or manually correct the location
5. WHEN an admin approves a flagged complaint, THE System SHALL update the location_validation_status to "ADMIN_APPROVED" and remove the review flag

### Requirement 7: Display Detected Location on Interactive Map

**User Story:** As a citizen, I want to see the detected location on a map before submitting my complaint, so that I can verify it is correct.

#### Acceptance Criteria

1. WHEN EXIF GPS coordinates are successfully extracted, THE Map_Display SHALL render the location as a map pin on an interactive map
2. WHEN the map is displayed, THE Map_Display SHALL center the map view on the detected location with a zoom level of 18
3. WHEN EXIF location is displayed, THE Map_Display SHALL show a visual indicator (e.g., blue pin) to distinguish it from manually entered locations
4. WHEN a user manually adjusts the map pin, THE System SHALL update the displayed coordinates in real-time
5. WHEN the map is displayed, THE Map_Display SHALL show the current coordinates (latitude, longitude) in decimal format below the map

### Requirement 8: Display Confidence Indicator for EXIF Location Accuracy

**User Story:** As a citizen, I want to know how reliable the detected location is, so that I can decide whether to adjust it manually.

#### Acceptance Criteria

1. WHEN EXIF GPS coordinates are extracted, THE Map_Display SHALL display a confidence indicator showing the reliability of the location
2. WHEN the EXIF data includes GPS accuracy information (DOP value), THE System SHALL calculate confidence as (100 - DOP) and display it as a percentage
3. WHEN GPS accuracy information is not available in EXIF data, THE System SHALL display a default confidence level of 85%
4. WHEN confidence is 90% or higher, THE Map_Display SHALL display the indicator in green with label "High Confidence"
5. WHEN confidence is between 70% and 89%, THE Map_Display SHALL display the indicator in yellow with label "Medium Confidence"
6. WHEN confidence is below 70%, THE Map_Display SHALL display the indicator in red with label "Low Confidence"

### Requirement 9: Prompt for Manual Location Selection if EXIF Data is Missing

**User Story:** As a citizen with a photo that has no GPS data, I want to be prompted to select a location, so that I can still submit my complaint accurately.

#### Acceptance Criteria

1. WHEN an image is uploaded without EXIF GPS data, THE System SHALL display a message "GPS data not found in photo. Please select the location on the map."
2. WHEN the user sees the missing GPS prompt, THE Map_Display SHALL display a map centered on the user's current location (if available) or a default city center
3. WHEN the user clicks on the map to select a location, THE System SHALL capture the clicked coordinates and display them
4. WHEN the user has selected a manual location, THE System SHALL enable the complaint submission button
5. WHEN the user has not selected a manual location and no EXIF data exists, THE System SHALL disable the complaint submission button and display "Location required to submit complaint"

### Requirement 10: Store EXIF Metadata in Complaint Database

**User Story:** As a system administrator, I want to store all extracted EXIF metadata with each complaint, so that I can audit location data and investigate discrepancies.

#### Acceptance Criteria

1. THE Complaint_Database SHALL include the field exif_latitude to store the extracted GPS latitude value
2. THE Complaint_Database SHALL include the field exif_longitude to store the extracted GPS longitude value
3. THE Complaint_Database SHALL include the field capture_timestamp to store the photo capture time from EXIF metadata
4. THE Complaint_Database SHALL include the field location_source to store the origin of location data (EXIF, MANUAL, or SYSTEM_DEFAULT)
5. THE Complaint_Database SHALL include the field location_validation_status to track validation state (EXIF_EXTRACTED, MANUAL_ENTRY, VALIDATED, DISCREPANCY_MINOR, DISCREPANCY_MAJOR, ADMIN_APPROVED)
6. THE Complaint_Database SHALL include the field location_discrepancy_flag (boolean) to mark complaints requiring admin review

### Requirement 11: Parse EXIF Data from Multiple Image Formats

**User Story:** As a citizen, I want to submit complaints with photos from any camera or phone, so that I can use any device to report issues.

#### Acceptance Criteria

1. WHEN an image in JPEG format is uploaded, THE EXIF_Parser SHALL extract EXIF metadata from the JPEG file
2. WHEN an image in PNG format is uploaded, THE EXIF_Parser SHALL extract EXIF metadata if present in the PNG file
3. WHEN an image in HEIC/HEIF format is uploaded, THE EXIF_Parser SHALL extract EXIF metadata from the HEIC/HEIF file
4. WHEN an image format does not support EXIF metadata, THE EXIF_Parser SHALL return null for EXIF data and continue processing
5. WHEN EXIF extraction fails due to file corruption, THE EXIF_Parser SHALL log the error and continue processing without crashing

### Requirement 12: Handle Edge Cases in GPS Coordinate Conversion

**User Story:** As a system administrator, I want the system to handle unusual GPS data correctly, so that location extraction is reliable across all devices.

#### Acceptance Criteria

1. WHEN GPS coordinates are in degrees/minutes/seconds format, THE EXIF_Parser SHALL convert them to decimal format using the formula: decimal = degrees + (minutes/60) + (seconds/3600)
2. WHEN GPS hemisphere indicators (N/S/E/W) are present, THE EXIF_Parser SHALL apply the correct sign to the decimal coordinate (negative for S and W)
3. WHEN GPS coordinates are already in decimal format, THE EXIF_Parser SHALL accept them without conversion
4. WHEN GPS latitude value is outside the range [-90, 90], THE EXIF_Parser SHALL reject the coordinate as invalid
5. WHEN GPS longitude value is outside the range [-180, 180], THE EXIF_Parser SHALL reject the coordinate as invalid

### Requirement 13: Implement Location Validation Logic

**User Story:** As a system administrator, I want the system to validate location data automatically, so that I can identify suspicious complaints without manual review.

#### Acceptance Criteria

1. WHEN a complaint contains only EXIF location data, THE Location_Validator SHALL mark the location_validation_status as "EXIF_EXTRACTED"
2. WHEN a complaint contains only manual location data, THE Location_Validator SHALL mark the location_validation_status as "MANUAL_ENTRY"
3. WHEN a complaint contains both EXIF and manual location data, THE Location_Validator SHALL compare them and set the appropriate validation status
4. WHEN location_validation_status is set to "DISCREPANCY_MAJOR", THE Location_Validator SHALL automatically set location_discrepancy_flag to true
5. WHEN location_validation_status is set to "VALIDATED" or "DISCREPANCY_MINOR", THE Location_Validator SHALL set location_discrepancy_flag to false

### Requirement 14: Pretty Print EXIF Metadata for Admin Review

**User Story:** As an admin, I want to see all extracted EXIF metadata in a readable format, so that I can verify the data and debug issues.

#### Acceptance Criteria

1. THE System SHALL provide a formatted display of all extracted EXIF metadata including GPS coordinates, capture timestamp, camera model, and ISO settings
2. WHEN an admin views a complaint detail page, THE System SHALL display the EXIF metadata in a collapsible section
3. WHEN EXIF metadata is displayed, THE System SHALL show GPS coordinates in both decimal and degrees/minutes/seconds formats
4. WHEN EXIF metadata is displayed, THE System SHALL show the capture timestamp in both the original format and ISO 8601 format
5. WHEN EXIF metadata is incomplete or missing, THE System SHALL display "No EXIF data available" instead of showing empty fields

### Requirement 15: Round-Trip Property for Location Data

**User Story:** As a developer, I want to ensure location data integrity, so that extracted and stored locations can be verified as accurate.

#### Acceptance Criteria

1. FOR ALL valid EXIF GPS coordinates, extracting the coordinates, storing them in the database, and retrieving them SHALL produce coordinates with the same decimal precision (6 decimal places)
2. FOR ALL valid capture timestamps, extracting the timestamp from EXIF, storing it in the database, and retrieving it SHALL produce a timestamp representing the same moment in time
3. WHEN location data is extracted, stored, and retrieved, THE System SHALL verify that the retrieved coordinates match the extracted coordinates within 0.000001 decimal degrees (approximately 0.1 meters)
4. WHEN a complaint is created with EXIF location data, THE System SHALL verify that querying the database returns the same location_source, exif_latitude, and exif_longitude values

