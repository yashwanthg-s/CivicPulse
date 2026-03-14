# EXIF Location Extraction - Testing Guide

## System Status: ✅ READY FOR TESTING

Backend server is running on port 5003 with all EXIF features deployed.

## Test Scenarios

### Test 1: EXIF Extraction with GPS Photo

**Objective:** Verify EXIF GPS coordinates are extracted from photo metadata

**Steps:**
1. Use a smartphone with GPS enabled
2. Open camera app and capture a photo of a civic issue
3. Ensure location services are enabled
4. Open complaint form in the app
5. Capture the photo using the app's camera
6. Observe the location display

**Expected Results:**
- ✓ EXIF location automatically displays on map
- ✓ Confidence indicator shows (e.g., 92% - High Confidence)
- ✓ Coordinates display in decimal format (e.g., 13.0827, 80.2707)
- ✓ Blue pin shows EXIF location
- ✓ Submit button enabled

**Pass Criteria:**
- Location extracted without manual entry
- Confidence score calculated correctly
- Map displays correctly

---

### Test 2: Manual Location Fallback

**Objective:** Verify manual location selector works when EXIF GPS missing

**Steps:**
1. Use a photo without GPS metadata (or disable GPS)
2. Open complaint form
3. Capture photo without GPS
4. Observe location selector

**Expected Results:**
- ✓ Manual location selector appears
- ✓ Interactive map displays
- ✓ Can click on map to select location
- ✓ "Use Current Location" button works
- ✓ Selected coordinates display

**Pass Criteria:**
- Manual location selector appears when EXIF missing
- Location can be selected on map
- Complaint can be submitted with manual location

---

### Test 3: Location Discrepancy Detection

**Objective:** Verify system detects and flags location discrepancies

**Steps:**
1. Upload photo with EXIF GPS: 13.0827°N, 80.2707°E
2. Manually enter location: 13.0900°N, 80.2800°E (>500m away)
3. Submit complaint
4. Check admin dashboard

**Expected Results:**
- ✓ Complaint created successfully
- ✓ Complaint appears in location review queue
- ✓ location_discrepancy_flag = true
- ✓ location_validation_status = 'DISCREPANCY_MAJOR'
- ✓ Admin notified of discrepancy

**Pass Criteria:**
- Discrepancy detected correctly
- Complaint flagged for review
- Admin can see flagged complaint

---

### Test 4: Admin Location Review

**Objective:** Verify admin can review and approve/reject flagged locations

**Steps:**
1. Create flagged complaint (from Test 3)
2. Login as admin
3. Navigate to location review queue
4. Select flagged complaint
5. View both locations on map
6. Test approve action

**Expected Results:**
- ✓ Flagged complaint appears in queue
- ✓ Both EXIF and manual locations show on map
- ✓ Blue pin = EXIF location
- ✓ Red pin = Manual location
- ✓ Distance shown between locations
- ✓ Approve button works
- ✓ Complaint removed from queue after approval

**Pass Criteria:**
- Admin can view flagged complaints
- Map displays both locations correctly
- Approve action updates complaint status

---

### Test 5: Confidence Score Calculation

**Objective:** Verify confidence scores are calculated based on GPS DOP

**Steps:**
1. Capture photos with different GPS quality:
   - Good GPS (DOP < 2): Should show ≥90% (Green)
   - Moderate GPS (DOP 2-5): Should show 70-89% (Yellow)
   - Poor GPS (DOP > 5): Should show <70% (Red)
2. Upload each photo
3. Observe confidence indicator

**Expected Results:**
- ✓ Confidence score calculated correctly
- ✓ Color coding matches score:
  - Green: ≥90%
  - Yellow: 70-89%
  - Red: <70%
- ✓ Default 85% when DOP not available

**Pass Criteria:**
- Confidence scores accurate
- Color coding correct
- Visual indicator clear

---

### Test 6: Timestamp Extraction

**Objective:** Verify photo capture timestamp is extracted from EXIF

**Steps:**
1. Capture photo with GPS and timestamp
2. Upload complaint
3. Check database for capture_timestamp

**Expected Results:**
- ✓ capture_timestamp stored in database
- ✓ Timestamp matches photo capture time
- ✓ Format: ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)
- ✓ Timezone information preserved

**Pass Criteria:**
- Timestamp extracted correctly
- Stored in correct format
- Matches actual photo capture time

---

### Test 7: Camera Metadata Extraction

**Objective:** Verify camera metadata is archived

**Steps:**
1. Capture photo with smartphone
2. Upload complaint
3. Check exif_metadata_archive table

**Expected Results:**
- ✓ Camera make stored (e.g., "Apple")
- ✓ Camera model stored (e.g., "iPhone 14")
- ✓ ISO speed stored
- ✓ Focal length stored
- ✓ F-number stored
- ✓ Exposure time stored

**Pass Criteria:**
- Camera metadata extracted
- Stored in archive table
- All fields populated correctly

---

### Test 8: Multi-Image Handling

**Objective:** Verify system handles multiple images correctly

**Steps:**
1. Upload complaint with multiple images
2. First image has GPS: 13.0827, 80.2707
3. Second image has GPS: 13.0900, 80.2800
4. Submit complaint

**Expected Results:**
- ✓ First image's GPS used as primary location
- ✓ Second image's GPS ignored
- ✓ Complaint created with first image's location
- ✓ All images stored

**Pass Criteria:**
- First valid GPS used
- Subsequent GPS ignored
- All images stored correctly

---

### Test 9: Offline Submission

**Objective:** Verify offline complaint submission works

**Steps:**
1. Disable internet connection
2. Capture photo with GPS
3. Fill complaint form
4. Submit complaint (should queue)
5. Enable internet
6. Verify complaint syncs with EXIF location

**Expected Results:**
- ✓ Complaint queued offline
- ✓ EXIF location preserved
- ✓ Syncs when online
- ✓ Correct location used (not upload location)

**Pass Criteria:**
- Offline submission works
- EXIF location preserved
- Correct location after sync

---

### Test 10: Error Handling

**Objective:** Verify system handles errors gracefully

**Steps:**
1. Upload corrupted image
2. Upload image without EXIF
3. Upload image with invalid GPS
4. Test with missing image

**Expected Results:**
- ✓ Corrupted image: Error message, submission allowed
- ✓ No EXIF: Manual location selector shown
- ✓ Invalid GPS: Rejected, error message
- ✓ Missing image: Error message

**Pass Criteria:**
- Errors handled gracefully
- User-friendly error messages
- System doesn't crash

---

## Test Data

### Sample GPS Coordinates
- **Chennai, India:** 13.0827°N, 80.2707°E
- **Bangalore, India:** 12.9716°N, 77.5946°E
- **Hyderabad, India:** 17.3850°N, 78.4867°E

### Distance Thresholds
- **< 100m:** VALIDATED (Green)
- **100-500m:** DISCREPANCY_MINOR (Yellow)
- **> 500m:** DISCREPANCY_MAJOR (Red - Flagged)

### Confidence Thresholds
- **≥ 90%:** High Confidence (Green)
- **70-89%:** Medium Confidence (Yellow)
- **< 70%:** Low Confidence (Red)

---

## Testing Checklist

### Pre-Testing
- [ ] Backend server running on port 5003
- [ ] Database migration completed
- [ ] Frontend components deployed
- [ ] Test devices with GPS enabled
- [ ] Admin account created

### Test Execution
- [ ] Test 1: EXIF Extraction - PASS/FAIL
- [ ] Test 2: Manual Fallback - PASS/FAIL
- [ ] Test 3: Discrepancy Detection - PASS/FAIL
- [ ] Test 4: Admin Review - PASS/FAIL
- [ ] Test 5: Confidence Score - PASS/FAIL
- [ ] Test 6: Timestamp Extraction - PASS/FAIL
- [ ] Test 7: Camera Metadata - PASS/FAIL
- [ ] Test 8: Multi-Image - PASS/FAIL
- [ ] Test 9: Offline Submission - PASS/FAIL
- [ ] Test 10: Error Handling - PASS/FAIL

### Post-Testing
- [ ] All tests passed
- [ ] No critical issues
- [ ] Performance acceptable
- [ ] User experience good
- [ ] Ready for production

---

## Monitoring During Testing

### Backend Logs
```bash
tail -f backend/server.log
```

Look for:
- ✓ EXIF GPS extracted
- ✓ Location validation completed
- ✓ Complaint created successfully
- ⚠️ Any errors or warnings

### Database Queries
```sql
-- Check EXIF data
SELECT * FROM complaints WHERE exif_latitude IS NOT NULL LIMIT 5;

-- Check flagged complaints
SELECT * FROM location_review_queue WHERE reviewed_at IS NULL;

-- Check EXIF archive
SELECT * FROM exif_metadata_archive LIMIT 5;
```

### Browser Console
- Check for JavaScript errors
- Monitor network requests
- Check API responses

---

## Troubleshooting

### EXIF not extracting
- Verify photo has GPS metadata
- Check backend logs for errors
- Try different image format
- Verify piexifjs installed

### Location not displaying on map
- Check Leaflet library loaded
- Verify coordinates are valid
- Check browser console for errors
- Verify map container has height

### Discrepancy not detected
- Verify distance > 500m
- Check location_validation_status
- Verify both EXIF and manual locations present
- Check database for entries

### Admin review queue empty
- Create flagged complaint first
- Verify location_discrepancy_flag = true
- Check admin user role
- Verify authentication token valid

---

## Success Criteria

✅ **All tests pass**
✅ **No critical errors**
✅ **Performance acceptable**
✅ **User experience good**
✅ **Ready for production**

---

## Test Report Template

```
Test Date: _______________
Tester: _______________
Device: _______________
OS: _______________

Test Results:
- Test 1: PASS / FAIL
- Test 2: PASS / FAIL
- Test 3: PASS / FAIL
- Test 4: PASS / FAIL
- Test 5: PASS / FAIL
- Test 6: PASS / FAIL
- Test 7: PASS / FAIL
- Test 8: PASS / FAIL
- Test 9: PASS / FAIL
- Test 10: PASS / FAIL

Issues Found:
1. _______________
2. _______________
3. _______________

Overall Status: PASS / FAIL

Comments:
_______________________________________________________________________________
```

---

**Ready to Test:** YES ✅
**Backend Status:** RUNNING ✅
**Database Status:** READY ✅
**Frontend Status:** READY ✅
