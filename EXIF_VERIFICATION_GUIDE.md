# EXIF Data Verification Guide

## ✅ How to Verify EXIF Extraction is Working

After you submit a complaint with a GPS-enabled photo, use these methods to verify the data was saved correctly.

---

## Method 1: Automated Verification Script

### Run the verification script:
```bash
cd backend
node verify-exif-data.js
```

### Expected Output:
```
🔍 Verifying EXIF Data in Database...

1️⃣  Fetching latest complaint with EXIF data...

✅ Found complaint with EXIF data:

   Complaint ID: 5
   Title: Garbage Pile-up in Residential Area
   Category: sanitation
   Priority: medium

📍 Location Information:
   EXIF Latitude: 13.0742015
   EXIF Longitude: 77.439617
   Manual Latitude: 13.0742015
   Manual Longitude: 77.439617
   Location Source: EXIF
   Confidence Score: 85%
   Capture Timestamp: 2024-03-14T10:30:00.000Z

2️⃣  Checking EXIF metadata archive...

✅ EXIF metadata found:

   Camera Make: Apple
   Camera Model: iPhone 14
   ISO Speed: 100
   Focal Length: 4.2
   Exposure Time: 1/120

3️⃣  Checking location review queue...

✅ No location discrepancies detected

📊 VERIFICATION SUMMARY:

✅ EXIF Location Extraction: SUCCESS
✅ Confidence Score: 85%
✅ Location Source: EXIF
✅ Database Storage: SUCCESS

🎉 EXIF feature is working correctly!
```

---

## Method 2: Manual Database Query

### Query 1: Check Complaint with EXIF Data
```sql
SELECT id, title, exif_latitude, exif_longitude, 
       location_source, confidence_score, capture_timestamp,
       category, priority
FROM complaints 
WHERE exif_latitude IS NOT NULL 
ORDER BY id DESC LIMIT 1;
```

**Expected columns:**
- `id`: Complaint ID
- `title`: Your complaint title
- `exif_latitude`: GPS latitude from photo (e.g., 13.0742015)
- `exif_longitude`: GPS longitude from photo (e.g., 77.439617)
- `location_source`: Should be "EXIF"
- `confidence_score`: 70-95 (depending on GPS quality)
- `capture_timestamp`: Photo capture time

---

### Query 2: Check EXIF Metadata Archive
```sql
SELECT id, complaint_id, camera_make, camera_model, 
       iso_speed, focal_length, exposure_time
FROM exif_metadata_archive 
WHERE complaint_id = [YOUR_COMPLAINT_ID];
```

**Expected data:**
- `camera_make`: Camera manufacturer (e.g., "Apple")
- `camera_model`: Camera model (e.g., "iPhone 14")
- `iso_speed`: ISO sensitivity
- `focal_length`: Focal length in mm
- `exposure_time`: Shutter speed

---

### Query 3: Check Location Review Queue
```sql
SELECT id, complaint_id, reason, priority, reviewed_at
FROM location_review_queue 
WHERE complaint_id = [YOUR_COMPLAINT_ID];
```

**Expected:**
- If no rows: Location is valid (no discrepancy)
- If rows exist: Location flagged for review (discrepancy detected)

---

### Query 4: Check All Complaints with EXIF Data
```sql
SELECT id, title, exif_latitude, exif_longitude, 
       location_source, confidence_score
FROM complaints 
WHERE exif_latitude IS NOT NULL;
```

**Shows all complaints with EXIF data**

---

## Method 3: Check Backend Logs

### Watch for these messages in backend logs:

```
✓ EXIF GPS extracted: 13.0742015, 77.439617
✓ Capture timestamp extracted: 2024-03-14T10:30:00Z
✓ Camera metadata extracted: Apple iPhone 14
✓ Location validation completed
✓ Complaint created successfully
```

---

## Method 4: Check Frontend Console

### Open browser console (F12) and look for:

```javascript
✓ EXIF GPS extracted: {latitude: 13.0742015, longitude: 77.439617, dop: 5}
✓ Auto-detected: Category=sanitation, Priority=medium
```

---

## Verification Checklist

After submitting a complaint with GPS photo:

- [ ] Complaint created successfully (ID shown)
- [ ] Run verification script: `node verify-exif-data.js`
- [ ] Check database queries above
- [ ] Verify EXIF latitude/longitude saved
- [ ] Verify location_source = "EXIF"
- [ ] Verify confidence_score between 70-95
- [ ] Verify capture_timestamp saved
- [ ] Check EXIF metadata archive has camera info
- [ ] Confirm no location discrepancies (empty review queue)

---

## Expected Values

### For Your Test Photo:
```
EXIF Latitude: 13.0742015
EXIF Longitude: 77.439617
Location Source: EXIF
Confidence Score: 70-95% (depending on GPS quality)
Category: sanitation (auto-detected)
Priority: medium (auto-detected)
```

---

## Troubleshooting Verification

### Issue: Verification script shows "No complaints with EXIF data found"
**Solution:**
1. Make sure you submitted a complaint
2. Make sure the photo had GPS metadata
3. Check if complaint was created: `SELECT * FROM complaints ORDER BY id DESC LIMIT 1;`
4. Check backend logs for errors

### Issue: EXIF data shows NULL values
**Solution:**
1. Photo may not have GPS metadata
2. Check if photo format is supported (JPEG, PNG, HEIC, WebP)
3. Try uploading a different photo with GPS
4. Check backend logs for EXIF extraction errors

### Issue: Confidence score is very low (< 50%)
**Solution:**
1. This is normal if GPS quality is poor
2. GPS DOP value in photo is high
3. Try a photo taken in open area (better GPS signal)
4. Confidence will improve with better GPS data

### Issue: Location source shows "MANUAL" instead of "EXIF"
**Solution:**
1. Photo didn't have GPS metadata
2. EXIF extraction failed
3. Manual location selector was used instead
4. Check backend logs for EXIF extraction errors

---

## Quick Verification Steps

### Step 1: Submit Complaint
1. Upload photo with GPS
2. Fill form with sample data
3. Click Submit
4. Note the Complaint ID

### Step 2: Run Verification Script
```bash
cd backend
node verify-exif-data.js
```

### Step 3: Check Output
- ✅ Should show "EXIF Location Extraction: SUCCESS"
- ✅ Should show confidence score 70-95%
- ✅ Should show location_source = "EXIF"

### Step 4: Manual Database Check
```sql
SELECT * FROM complaints 
WHERE id = [YOUR_COMPLAINT_ID];
```

---

## Success Indicators ✅

**EXIF feature working if:**
- ✅ Complaint created with ID
- ✅ exif_latitude and exif_longitude have values
- ✅ location_source = "EXIF"
- ✅ confidence_score between 70-95
- ✅ capture_timestamp has value
- ✅ EXIF metadata archive has camera info
- ✅ No errors in backend logs

**Problems if:**
- ❌ exif_latitude/longitude are NULL
- ❌ location_source = "MANUAL"
- ❌ confidence_score is 0 or very low
- ❌ EXIF metadata archive is empty
- ❌ Backend logs show errors

---

## Database Schema Reference

### Complaints Table (EXIF columns):
```sql
exif_latitude DECIMAL(10, 8)
exif_longitude DECIMAL(10, 8)
capture_timestamp DATETIME
location_source VARCHAR(50)
location_validation_status VARCHAR(50)
confidence_score INT
```

### EXIF Metadata Archive Table:
```sql
id INT PRIMARY KEY
complaint_id INT
camera_make VARCHAR(255)
camera_model VARCHAR(255)
iso_speed INT
focal_length DECIMAL(10, 2)
exposure_time VARCHAR(50)
created_at TIMESTAMP
```

### Location Review Queue Table:
```sql
id INT PRIMARY KEY
complaint_id INT
reason TEXT
priority VARCHAR(50)
reviewed_at TIMESTAMP
```

---

## Next Steps After Verification

1. ✅ Verify EXIF data saved correctly
2. ✅ Test with multiple photos (with and without GPS)
3. ✅ Test location discrepancy detection
4. ✅ Test admin review interface
5. ✅ Check confidence score accuracy
6. ✅ Monitor backend logs

---

## Support

If verification fails:
1. Check backend logs: `node server.js` output
2. Check browser console: F12 → Console
3. Run verification script: `node verify-exif-data.js`
4. Check database directly with SQL queries
5. Verify photo has GPS metadata (use online EXIF viewer)

