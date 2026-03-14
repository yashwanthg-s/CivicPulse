# Test EXIF Location Extraction - Upload Photo Method

## Simple Steps (3 minutes)

### Step 1: Get a Photo with GPS
You need a photo that has GPS metadata embedded in it. Options:
- Use a photo from your smartphone (taken with GPS enabled)
- Download a sample photo with EXIF data
- Use any photo from your phone's gallery

### Step 2: Open the App
1. Open browser: `http://localhost:5173`
2. Login to the app

### Step 3: Go to Complaint Form
1. Click "Submit Complaint" or "📝 New Complaint"
2. You should see the complaint form

### Step 4: Upload Photo (NOT Capture)
1. Look for "Upload Photo" or file input button
2. Click to open file picker
3. Select your photo from your computer
4. Photo uploads

### Step 5: Watch for EXIF Extraction
After uploading, you should see:

**If photo HAS GPS metadata:**
```
✓ EXIF location automatically displays
✓ Blue pin on map showing location
✓ Confidence indicator (e.g., "92% - High Confidence")
✓ Coordinates shown (e.g., "13.0827, 80.2707")
✓ No manual entry needed
```

**If photo has NO GPS metadata:**
```
✓ Message: "GPS data not found in photo"
✓ Manual location selector appears
✓ Interactive map shows
✓ Click on map to select location
✓ Coordinates display as you click
```

### Step 6: Fill Complaint Details
1. Title: "Broken Streetlight" (example)
2. Description: "Light is broken near bus stop"
3. Category: Auto-filled or select manually
4. Priority: Select if needed

### Step 7: Submit
1. Click "✓ Submit Complaint"
2. Should see: "✓ Complaint submitted successfully! ID: [number]"

---

## What Happens Behind the Scenes

1. **Photo Uploaded** → Sent to backend
2. **EXIF Extraction** → Backend reads GPS from photo metadata
3. **Location Validation** → System validates coordinates
4. **Confidence Score** → Calculated based on GPS quality
5. **Display** → Location shows on map with confidence indicator
6. **Database** → Complaint saved with EXIF location

---

## Testing Scenarios

### Scenario 1: Photo WITH GPS (Best Case)
**Setup:**
- Use smartphone photo taken with GPS enabled
- Photo has location metadata

**Expected Result:**
- ✅ Location auto-fills from EXIF
- ✅ Confidence indicator shows
- ✅ Blue pin on map
- ✅ No manual entry needed
- ✅ Complaint submits successfully

**Verify in Database:**
```sql
SELECT id, title, exif_latitude, exif_longitude, 
       location_source, confidence_score 
FROM complaints 
WHERE exif_latitude IS NOT NULL 
ORDER BY id DESC LIMIT 1;
```

Should show:
- exif_latitude: [GPS latitude]
- exif_longitude: [GPS longitude]
- location_source: EXIF
- confidence_score: [85-100]

---

### Scenario 2: Photo WITHOUT GPS (Fallback)
**Setup:**
- Use photo without GPS metadata
- Or disable GPS before taking photo

**Expected Result:**
- ✅ Manual location selector appears
- ✅ Interactive map shows
- ✅ Click on map to select location
- ✅ Coordinates display
- ✅ Complaint submits with manual location

**Verify in Database:**
```sql
SELECT id, title, latitude, longitude, 
       location_source, location_validation_status 
FROM complaints 
WHERE location_source = 'MANUAL' 
ORDER BY id DESC LIMIT 1;
```

Should show:
- latitude: [Your selected latitude]
- longitude: [Your selected longitude]
- location_source: MANUAL
- location_validation_status: MANUAL_ENTRY

---

### Scenario 3: Location Discrepancy (Admin Test)
**Setup:**
1. Upload photo with EXIF GPS: 13.0827, 80.2707
2. Manually enter location: 13.0900, 80.2800 (>500m away)
3. Submit complaint

**Expected Result:**
- ✅ Complaint created
- ✅ Appears in location review queue
- ✅ Admin can see both locations on map

**Verify in Database:**
```sql
SELECT * FROM location_review_queue 
WHERE reviewed_at IS NULL 
ORDER BY id DESC LIMIT 1;
```

Should show:
- complaint_id: [Your complaint ID]
- reason: [Location discrepancy message]
- priority: MEDIUM
- reviewed_at: NULL (not yet reviewed)

---

## Troubleshooting

### Issue: Photo uploads but location doesn't show
**Possible Causes:**
- Photo doesn't have GPS metadata
- GPS data is corrupted
- Backend not extracting properly

**Solution:**
1. Check backend logs for errors
2. Try different photo with GPS
3. Verify photo has EXIF data (use online EXIF viewer)
4. Check browser console for errors

### Issue: Manual location selector doesn't appear
**Possible Causes:**
- Photo has GPS (so manual selector not shown)
- Frontend component not loading
- Browser error

**Solution:**
1. Use photo without GPS
2. Check browser console (F12)
3. Refresh page
4. Try different browser

### Issue: Complaint won't submit
**Possible Causes:**
- Missing required fields
- Location not selected
- Backend error

**Solution:**
1. Fill all required fields
2. Ensure location is selected (EXIF or manual)
3. Check for error messages
4. Check backend logs

### Issue: Backend not extracting EXIF
**Possible Causes:**
- piexifjs not installed
- Photo format not supported
- EXIF data corrupted

**Solution:**
1. Verify piexifjs installed: `npm list piexifjs`
2. Try different photo format (JPEG, PNG)
3. Check backend logs for errors
4. Verify photo has valid EXIF data

---

## How to Check if Photo Has GPS

### Online EXIF Viewer:
1. Go to: https://exif.tools/ or similar
2. Upload your photo
3. Look for GPS coordinates
4. If present, photo has GPS metadata

### Command Line (if available):
```bash
exiftool photo.jpg | grep GPS
```

Should show GPS coordinates if present.

---

## Database Verification

### Check EXIF Data Stored:
```sql
-- See all complaints with EXIF data
SELECT id, title, exif_latitude, exif_longitude, 
       capture_timestamp, confidence_score 
FROM complaints 
WHERE exif_latitude IS NOT NULL;

-- See EXIF metadata archive
SELECT id, complaint_id, camera_make, camera_model, 
       iso_speed, focal_length 
FROM exif_metadata_archive;

-- See flagged complaints
SELECT * FROM location_review_queue 
WHERE reviewed_at IS NULL;
```

---

## Backend Logs to Watch

When you upload a photo, watch backend logs for:

```
✓ EXIF GPS extracted: 13.0827, 80.2707
✓ Capture timestamp extracted: 2024-03-14T10:30:00Z
✓ Camera metadata extracted: Apple iPhone 14
✓ Location validation completed
✓ Complaint created successfully
```

---

## Testing Checklist

- [ ] Have a photo with GPS metadata
- [ ] Backend running on port 5003
- [ ] Frontend running on port 5173
- [ ] Can access complaint form
- [ ] Can upload photo
- [ ] Location displays (EXIF or manual)
- [ ] Can fill complaint details
- [ ] Can submit complaint
- [ ] Complaint created successfully
- [ ] Data visible in database

---

## Quick Test Flow

```
1. Get photo with GPS
   ↓
2. Open app at localhost:5173
   ↓
3. Go to complaint form
   ↓
4. Upload photo
   ↓
5. See EXIF location auto-fill
   ↓
6. Fill complaint details
   ↓
7. Submit complaint
   ↓
8. See success message
   ↓
9. Verify in database
```

---

## Success Indicators ✅

- Location auto-fills from photo
- Confidence indicator shows percentage
- Map displays with pin
- Complaint submits without errors
- ID number returned
- Data appears in database

---

## Problem Indicators ❌

- Location doesn't appear
- Error messages in form
- Photo upload fails
- Map not loading
- Submission fails
- No data in database

---

## Next Steps After Testing

1. ✅ Test with multiple photos
2. ✅ Test location discrepancy detection
3. ✅ Test admin review interface
4. ✅ Check database for saved data
5. ✅ Monitor backend logs
6. ✅ Check browser console for errors

---

## Admin Testing

### To Test Admin Features:
1. Login as admin user
2. Go to Admin Dashboard
3. Look for "Location Review Queue"
4. Should see flagged complaints (if any)
5. Click on complaint to view details
6. See both EXIF and manual locations on map
7. Test approve/reject/correct buttons

---

## Summary

**To test EXIF extraction with photo upload:**

1. ✅ Get photo with GPS metadata
2. ✅ Open app at http://localhost:5173
3. ✅ Go to complaint form
4. ✅ Upload photo
5. ✅ Watch for EXIF location or manual selector
6. ✅ Fill details and submit
7. ✅ Verify complaint created

**That's it!** The system automatically extracts EXIF data if available.

---

**Ready to test?** Start with Step 1 above!
