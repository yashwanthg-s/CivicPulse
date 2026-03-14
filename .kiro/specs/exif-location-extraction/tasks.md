# Implementation Plan: EXIF Location Extraction for Offline Complaint Reporting

## Overview

This implementation plan breaks down the EXIF Location Extraction feature into discrete, incremental coding tasks. The feature enables automatic GPS coordinate extraction from image metadata, offline complaint submission with accurate location data, and fraud detection through location validation. Tasks are organized by component (database schema, backend services, frontend components, validation logic) with integrated testing at each step.

## Tasks

- [ ] 1. Database Schema Updates
  - [ ] 1.1 Create database migration for complaints table extensions
    - Add exif_latitude, exif_longitude, capture_timestamp columns
    - Add location_source, location_validation_status, location_discrepancy_flag columns
    - Create indexes on location_source, location_validation_status, location_discrepancy_flag, and exif_location
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ] 1.2 Create location_review_queue table
    - Define schema with complaint_id, reason, priority, reviewed_by, reviewed_at, action_taken fields
    - Add foreign key constraint to complaints table
    - Create indexes on complaint_id, priority, reviewed_at
    - _Requirements: 6.1, 6.2_

  - [ ] 1.3 Create exif_metadata_archive table
    - Define schema with complaint_id, raw_exif_json, GPS fields, camera metadata fields
    - Add foreign key constraint to complaints table
    - Create index on complaint_id
    - _Requirements: 10.1, 14.1, 14.2, 14.3, 14.4_

  - [ ]* 1.4 Write property test for database schema round-trip
    - **Property 6: EXIF Location Storage and Retrieval**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 10.1, 10.2, 10.3, 10.4, 10.5, 15.1, 15.4**

- [ ] 2. EXIF Parser Service - Core Extraction
  - [ ] 2.1 Create EXIF parser service with image format support
    - Implement extractExifData(imagePath) method
    - Add support for JPEG, PNG, HEIC/HEIF, WebP formats
    - Implement error handling for corrupted files and missing EXIF data
    - Use piexifjs or similar library for EXIF parsing
    - _Requirements: 1.1, 1.4, 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ] 2.2 Implement GPS coordinate extraction from EXIF metadata
    - Extract GPSLatitude and GPSLongitude from EXIF data
    - Parse degrees/minutes/seconds format
    - Store raw DMS values and hemisphere indicators
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 2.3 Write property test for EXIF GPS extraction accuracy
    - **Property 1: EXIF GPS Extraction Accuracy**
    - **Validates: Requirements 1.1, 1.3, 15.1, 15.3**

  - [ ] 2.4 Implement DMS to decimal coordinate conversion
    - Create convertDmsToDecimal(degrees, minutes, seconds, hemisphere) function
    - Apply correct sign based on hemisphere (N/S for latitude, E/W for longitude)
    - Validate output is within valid ranges (lat: [-90, 90], lon: [-180, 180])
    - _Requirements: 1.2, 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ]* 2.5 Write property test for DMS to decimal conversion
    - **Property 2: DMS to Decimal Conversion Correctness**
    - **Validates: Requirements 1.2, 12.1, 12.2, 12.4, 12.5**

  - [ ] 2.6 Implement coordinate validation logic
    - Create validateCoordinates(latitude, longitude) function
    - Reject coordinates outside valid ranges
    - Return validation errors for invalid data
    - _Requirements: 12.4, 12.5_

  - [ ]* 2.7 Write property test for coordinate validation ranges
    - **Property 20: Coordinate Validation Ranges**
    - **Validates: Requirements 12.4, 12.5**

- [ ] 3. EXIF Parser Service - Timestamp and Metadata
  - [ ] 3.1 Implement timestamp extraction from EXIF metadata
    - Extract DateTimeOriginal field from EXIF
    - Parse into ISO 8601 format
    - Implement fallback to DateTime field if DateTimeOriginal missing
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.2 Implement timestamp fallback handling
    - Use file upload timestamp when neither DateTimeOriginal nor DateTime available
    - Preserve timezone information when available
    - _Requirements: 2.3, 2.4_

  - [ ]* 3.3 Write property test for timestamp extraction and format conversion
    - **Property 3: Timestamp Extraction and Format Conversion**
    - **Validates: Requirements 2.1, 2.2, 2.3, 15.2**

  - [ ]* 3.4 Write property test for fallback timestamp handling
    - **Property 4: Fallback Timestamp Handling**
    - **Validates: Requirements 2.3, 2.4**

  - [ ] 3.5 Implement camera metadata extraction
    - Extract camera model, make, ISO speed, focal length, f-number, exposure time
    - Store in ExifData object structure
    - Handle missing metadata gracefully
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [ ] 3.6 Implement GPS accuracy (DOP) extraction
    - Extract GPS DOP (Dilution of Precision) value from EXIF
    - Store for confidence score calculation
    - _Requirements: 8.2, 8.3_

- [ ] 4. EXIF Parser Service - Multi-Image and Error Handling
  - [ ] 4.1 Implement multi-image GPS selection logic
    - Extract GPS from all uploaded images
    - Use first valid GPS coordinate set as primary location
    - Ignore subsequent images
    - _Requirements: 1.5_

  - [ ]* 4.2 Write property test for multi-image GPS selection
    - **Property 5: Multiple Image GPS Selection**
    - **Validates: Requirements 1.5**

  - [ ] 4.3 Implement comprehensive error handling
    - Catch and log file corruption errors
    - Return null for missing EXIF data without crashing
    - Handle unsupported formats gracefully
    - Implement timeout (5 seconds) for extraction operations
    - _Requirements: 1.4, 11.5_

  - [ ]* 4.4 Write property test for corrupted file handling
    - **Property 22: Corrupted File Handling**
    - **Validates: Requirements 11.5**

  - [ ]* 4.5 Write property test for multi-format EXIF support
    - **Property 21: Multi-Format EXIF Support**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**

- [ ] 5. Checkpoint - EXIF Parser Service Complete
  - Ensure all EXIF extraction tests pass, ask the user if questions arise.

- [ ] 6. Location Validator Service - Core Validation
  - [ ] 6.1 Create location validator service
    - Implement validateLocationData(exifCoords, manualCoords) method
    - Handle cases with only EXIF, only manual, or both coordinates
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 13.1, 13.2, 13.3_

  - [ ] 6.2 Implement Haversine distance calculation
    - Create calculateHaversineDistance(lat1, lon1, lat2, lon2) function
    - Use Earth radius of 6,371,000 meters
    - Return distance in meters
    - _Requirements: 5.1_

  - [ ]* 6.3 Write property test for Haversine distance calculation
    - **Property 8: Haversine Distance Calculation**
    - **Validates: Requirements 5.1**

  - [ ] 6.4 Implement validation status assignment logic
    - Create assignValidationStatus(distance) function
    - Return "VALIDATED" for distance < 100m
    - Return "DISCREPANCY_MINOR" for distance 100-500m
    - Return "DISCREPANCY_MAJOR" for distance > 500m
    - _Requirements: 5.2, 5.3, 5.4, 13.3_

  - [ ]* 6.5 Write property test for validation status assignment
    - **Property 9: Location Validation Status Assignment**
    - **Validates: Requirements 5.2, 5.3, 5.4, 13.3**

- [ ] 7. Location Validator Service - Discrepancy Flagging and Review Queue
  - [ ] 7.1 Implement discrepancy flag setting logic
    - Create setDiscrepancyFlag(validationStatus) function
    - Set flag to true for "DISCREPANCY_MAJOR" status
    - Set flag to false for "VALIDATED" or "DISCREPANCY_MINOR"
    - _Requirements: 5.5, 13.4, 13.5_

  - [ ]* 7.2 Write property test for discrepancy flag setting
    - **Property 10: Discrepancy Flag Setting**
    - **Validates: Requirements 5.4, 5.5, 13.4, 13.5**

  - [ ] 7.3 Implement review queue entry creation
    - Create createReviewQueueEntry(complaintId, reason) function
    - Add entry to location_review_queue table
    - Set priority to "MEDIUM" for location discrepancies
    - _Requirements: 6.1, 6.2_

  - [ ]* 7.4 Write property test for review queue addition
    - **Property 11: Review Queue Addition**
    - **Validates: Requirements 6.1, 6.2**

  - [ ] 7.5 Implement EXIF-only and manual-only status assignment
    - Assign "EXIF_EXTRACTED" when only EXIF data present
    - Assign "MANUAL_ENTRY" when only manual data present
    - _Requirements: 13.1, 13.2_

- [ ] 8. Checkpoint - Location Validator Service Complete
  - Ensure all location validation tests pass, ask the user if questions arise.

- [ ] 9. Complaint Controller Integration
  - [ ] 9.1 Update complaint creation flow to extract EXIF data
    - Integrate EXIF parser service into complaint submission
    - Extract EXIF data before storing complaint
    - Handle EXIF extraction errors gracefully
    - _Requirements: 1.1, 1.4, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 9.2 Integrate location validation into complaint creation
    - Call location validator after EXIF extraction
    - Store validation results in complaint record
    - Add flagged complaints to review queue
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2_

  - [ ] 9.3 Store EXIF metadata in archive table
    - Save raw EXIF JSON to exif_metadata_archive
    - Store parsed GPS, camera, and timestamp data
    - Link archive entry to complaint via complaint_id
    - _Requirements: 10.1, 14.1, 14.2, 14.3, 14.4_

  - [ ] 9.4 Update complaint model with new EXIF fields
    - Add exif_latitude, exif_longitude, capture_timestamp fields
    - Add location_source, location_validation_status, location_discrepancy_flag fields
    - Implement getters/setters for EXIF data
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 10. Confidence Score Calculation
  - [ ] 10.1 Implement confidence score calculation
    - Create calculateConfidenceScore(dopValue) function
    - Calculate as (100 - DOP) when DOP available
    - Return default 85% when DOP not available
    - Ensure result is between 0-100
    - _Requirements: 8.2, 8.3_

  - [ ]* 10.2 Write property test for confidence score calculation
    - **Property 16: Confidence Score Calculation**
    - **Validates: Requirements 8.2, 8.3**

- [ ] 11. Frontend - Location Display Component
  - [ ] 11.1 Create LocationDisplay component with map integration
    - Render interactive map using Leaflet
    - Display EXIF location with blue pin
    - Display manual location with red pin (if both exist)
    - Center map on EXIF coordinates with zoom level 18
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

  - [ ] 11.2 Implement real-time coordinate updates
    - Enable draggable manual location pin
    - Update displayed coordinates in real-time as pin is dragged
    - Call onLocationChange callback with updated coordinates
    - _Requirements: 7.4_

  - [ ] 11.3 Display coordinates in decimal format
    - Show latitude and longitude below map
    - Format to 6 decimal places
    - Update in real-time during manual adjustment
    - _Requirements: 7.5_

  - [ ]* 11.4 Write property test for map display with EXIF coordinates
    - **Property 13: Map Display with EXIF Coordinates**
    - **Validates: Requirements 7.1, 7.2, 7.5**

  - [ ]* 11.5 Write property test for visual distinction of location sources
    - **Property 14: Visual Distinction of Location Sources**
    - **Validates: Requirements 7.3**

  - [ ]* 11.6 Write property test for real-time coordinate updates
    - **Property 15: Real-Time Coordinate Updates**
    - **Validates: Requirements 7.4**

- [ ] 12. Frontend - Confidence Indicator Component
  - [ ] 12.1 Create ConfidenceIndicator component
    - Display confidence score as percentage
    - Implement color coding: green (≥90%), yellow (70-89%), red (<70%)
    - Display appropriate label: "High Confidence", "Medium Confidence", "Low Confidence"
    - _Requirements: 8.1, 8.4, 8.5, 8.6_

  - [ ]* 12.2 Write property test for confidence indicator color coding
    - **Property 17: Confidence Indicator Color Coding**
    - **Validates: Requirements 8.4, 8.5, 8.6**

- [ ] 13. Frontend - Manual Location Selector Component
  - [ ] 13.1 Create ManualLocationSelector component
    - Render interactive map centered on user location or default city center
    - Allow click-to-select location functionality
    - Display selected coordinates
    - Call onLocationSelected callback with {lat, lon}
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 9.1, 9.2, 9.3_

  - [ ] 13.2 Implement missing EXIF GPS prompt
    - Display message "GPS data not found in photo. Please select the location on the map."
    - Show map centered on user location or default
    - Prompt user to select location
    - _Requirements: 4.1, 9.1_

  - [ ]* 13.3 Write property test for missing EXIF GPS prompt
    - **Property 18: Missing EXIF GPS Prompt**
    - **Validates: Requirements 4.1, 9.1**

- [ ] 14. Frontend - Complaint Form Integration
  - [ ] 14.1 Integrate EXIF extraction into ComplaintForm component
    - Call EXIF parser when image is uploaded
    - Display LocationDisplay component with extracted coordinates
    - Display ConfidenceIndicator component
    - _Requirements: 1.1, 1.4, 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.2, 8.1_

  - [ ] 14.2 Implement manual location selection fallback
    - Show ManualLocationSelector when EXIF data missing
    - Allow user to select location on map
    - Store manual coordinates
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 9.1, 9.2, 9.3_

  - [ ] 14.3 Implement submit button enable/disable logic
    - Enable submit button when location is available (EXIF or manual)
    - Disable submit button when no location available
    - Display "Location required to submit complaint" message when disabled
    - _Requirements: 9.4, 9.5_

  - [ ]* 14.4 Write property test for manual location selection enables submission
    - **Property 19: Manual Location Selection Enables Submission**
    - **Validates: Requirements 9.4, 9.5**

- [ ] 15. Admin Review Service
  - [ ] 15.1 Create admin review service
    - Implement getReviewQueue() method to fetch flagged complaints
    - Implement approveLocation(complaintId) method
    - Implement rejectComplaint(complaintId, reason) method
    - Implement correctLocation(complaintId, newLat, newLon) method
    - _Requirements: 6.3, 6.4, 6.5_

  - [ ] 15.2 Implement location approval workflow
    - Update location_validation_status to "ADMIN_APPROVED"
    - Remove entry from location_review_queue
    - Log admin action
    - _Requirements: 6.5_

  - [ ]* 15.3 Write property test for admin location approval
    - **Property 12: Admin Location Approval**
    - **Validates: Requirements 6.5**

- [ ] 16. Admin Dashboard Integration
  - [ ] 16.1 Add location review queue display to admin dashboard
    - Display flagged complaints in review queue
    - Show EXIF and manual locations on map
    - Display discrepancy reason and priority
    - _Requirements: 6.3_

  - [ ] 16.2 Implement admin location correction interface
    - Allow admin to view complaint details with EXIF metadata
    - Display GPS coordinates in decimal and DMS formats
    - Display capture timestamp in original and ISO 8601 formats
    - Display all camera metadata
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [ ] 16.3 Implement missing EXIF metadata display
    - Display "No EXIF data available" when EXIF data missing
    - Show available metadata fields
    - _Requirements: 14.5_

  - [ ]* 16.4 Write property test for EXIF metadata display completeness
    - **Property 25: EXIF Metadata Display Completeness**
    - **Validates: Requirements 14.1, 14.2, 14.3, 14.4**

  - [ ]* 16.5 Write property test for missing EXIF metadata handling
    - **Property 26: Missing EXIF Metadata Handling**
    - **Validates: Requirements 14.5**

- [ ] 17. Offline Support Verification
  - [ ] 17.1 Verify offline complaint submission with EXIF location
    - Test complaint creation with EXIF-extracted location
    - Verify location_source is set to "EXIF"
    - Verify capture_timestamp is stored correctly
    - Verify exif_latitude and exif_longitude are stored
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 17.2 Write property test for offline support with EXIF location
    - **Property 6: EXIF Location Storage and Retrieval**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 10.1, 10.2, 10.3, 10.4, 10.5, 15.1, 15.4**

  - [ ] 17.3 Verify manual location fallback for missing EXIF
    - Test complaint creation with manual location only
    - Verify location_source is set to "MANUAL"
    - Verify location_validation_status is set to "MANUAL_ENTRY"
    - Verify submission succeeds without EXIF data
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [ ]* 17.4 Write property test for manual location acceptance and storage
    - **Property 7: Manual Location Acceptance and Storage**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5**

- [ ] 18. Checkpoint - Frontend and Admin Integration Complete
  - Ensure all frontend and admin integration tests pass, ask the user if questions arise.

- [ ] 19. End-to-End Integration Tests
  - [ ] 19.1 Test complete flow: EXIF extraction → validation → storage
    - Upload image with EXIF GPS data
    - Verify EXIF extraction succeeds
    - Verify location validation runs
    - Verify complaint is stored with all EXIF fields
    - Verify metadata is archived
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ] 19.2 Test location discrepancy detection and review queue
    - Submit complaint with both EXIF and manual locations > 500m apart
    - Verify location_discrepancy_flag is set to true
    - Verify complaint is added to review queue
    - Verify admin can view flagged complaint
    - _Requirements: 5.4, 5.5, 6.1, 6.2, 6.3_

  - [ ] 19.3 Test admin location approval workflow
    - Retrieve flagged complaint from review queue
    - Admin approves location
    - Verify location_validation_status updated to "ADMIN_APPROVED"
    - Verify complaint removed from review queue
    - _Requirements: 6.4, 6.5_

  - [ ] 19.4 Test offline submission with manual location fallback
    - Upload image without EXIF GPS data
    - Verify prompt for manual location selection
    - User selects location on map
    - Verify complaint submission succeeds
    - Verify location_source is "MANUAL"
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 19.5 Test confidence indicator display
    - Submit complaint with EXIF GPS data including DOP value
    - Verify confidence score calculated correctly
    - Verify confidence indicator displays with correct color and label
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 20. Final Checkpoint - All Tests Pass
  - Ensure all property tests, unit tests, and integration tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across all valid inputs
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end workflows
- Database migrations should be run before backend service deployment
- Frontend components depend on backend services being available
- All EXIF extraction operations should have 5-second timeout
- Confidence scores should be calculated and displayed for all EXIF GPS data
- Location validation should run automatically for all complaints with both EXIF and manual locations
