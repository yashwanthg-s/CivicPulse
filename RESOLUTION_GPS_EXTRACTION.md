# Resolution Image GPS Extraction Feature

## Overview

When an officer uploads an after-work image to resolve a complaint, the system now **automatically extracts GPS coordinates** from the image's EXIF metadata (if available) and stores them in the database.

---

## What Gets Stored

### Before (Original Complaint)
- **Latitude & Longitude**: From citizen's original complaint image
- **Stored in**: `complaints` table (`latitude`, `longitude` columns)

### After (Officer's Resolution Image) - NEW ✨
- **Latitude & Longitude**: Extracted from officer's after-work image EXIF data
- **Stored in**: `complaint_resolutions` table (`after_image_latitude`, `after_image_longitude` columns)

---

## Database Schema

### complaint_resolutions Table
```sql
CREATE TABLE complaint_resolutions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  officer_id INT,
  after_image_path VARCHAR(500),
  resolution_notes TEXT,
  after_image_latitude DECIMAL(10, 8),      -- NEW: GPS latitude from after image
  after_image_longitude DECIMAL(11, 8),     -- NEW: GPS longitude from after image
  resolved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ...
)
```

---

## How It Works

### Step 1: Officer Uploads Image
Officer selects an image file from their phone or computer

### Step 2: Backend Receives Image
```
PUT /api/complaints/{id}/resolve
{
  "officer_id": 2,
  "after_image": "data:image/jpeg;base64,...",
  "resolution_notes": "Fixed pothole"
}
```

### Step 3: Backend Processes Image
1. Saves image to disk
2. **Extracts EXIF metadata** from image buffer
3. **Reads GPS coordinates** if available
4. Stores coordinates in database

### Step 4: Database Storage
```sql
INSERT INTO complaint_resolutions 
(complaint_id, officer_id, after_image_path, resolution_notes, 
 after_image_latitude, after_image_longitude)
VALUES (55, 2, '/uploads/resolution-55-after-...jpg', 'Fixed pothole',
        12.9716, 77.5946)
```

---

## GPS Data Availability

### When GPS Data is Available ✅
- Officer takes photo with **phone camera** (has GPS)
- Photo has **EXIF metadata** with GPS coordinates
- GPS was **enabled** on the phone when photo was taken

### When GPS Data is NOT Available ❌
- Officer uploads **screenshot** (no GPS)
- Officer uploads **file from computer** (no GPS)
- Photo has **EXIF data removed** (privacy)
- GPS was **disabled** on phone

---

## API Response

### Success Response (with GPS)
```json
{
  "success": true,
  "message": "Complaint resolved successfully",
  "resolutionId": 123,
  "gpsExtracted": true,
  "gpsData": {
    "latitude": 12.9716,
    "longitude": 77.5946
  }
}
```

### Success Response (without GPS)
```json
{
  "success": true,
  "message": "Complaint resolved successfully",
  "resolutionId": 123,
  "gpsExtracted": false,
  "gpsData": null
}
```

---

## Use Cases

### 1. Verify Officer Location
Check if officer was actually at the complaint location when resolving

```sql
SELECT 
  c.id,
  c.title,
  c.latitude as complaint_latitude,
  c.longitude as complaint_longitude,
  cr.after_image_latitude as resolution_latitude,
  cr.after_image_longitude as resolution_longitude,
  -- Calculate distance between complaint and resolution
  (6371 * acos(cos(radians(c.latitude)) * cos(radians(cr.after_image_latitude)) * 
   cos(radians(cr.after_image_longitude) - radians(c.longitude)) + 
   sin(radians(c.latitude)) * sin(radians(cr.after_image_latitude)))) as distance_km
FROM complaints c
LEFT JOIN complaint_resolutions cr ON c.id = cr.complaint_id
WHERE c.status = 'resolved' AND cr.after_image_latitude IS NOT NULL;
```

### 2. Track Officer Movement
See where officers are resolving complaints

```sql
SELECT 
  officer_id,
  COUNT(*) as resolutions_count,
  AVG(after_image_latitude) as avg_latitude,
  AVG(after_image_longitude) as avg_longitude
FROM complaint_resolutions
WHERE after_image_latitude IS NOT NULL
GROUP BY officer_id;
```

### 3. Quality Assurance
Verify officer was at the right location

```sql
SELECT 
  c.id,
  c.title,
  CASE 
    WHEN cr.after_image_latitude IS NULL THEN 'No GPS data'
    WHEN (6371 * acos(cos(radians(c.latitude)) * cos(radians(cr.after_image_latitude)) * 
          cos(radians(cr.after_image_longitude) - radians(c.longitude)) + 
          sin(radians(c.latitude)) * sin(radians(cr.after_image_latitude)))) < 0.1 
    THEN 'At location ✓'
    ELSE 'Not at location ✗'
  END as location_verification
FROM complaints c
LEFT JOIN complaint_resolutions cr ON c.id = cr.complaint_id
WHERE c.status = 'resolved';
```

---

## Deployment Steps

### 1. Run Updated Migration
```bash
cd backend
node run-resolution-migration.js
```

This will:
- Add `after_image_latitude` column to complaint_resolutions
- Add `after_image_longitude` column to complaint_resolutions

### 2. Restart Backend
```bash
npm start
```

### 3. Hard Refresh Frontend
```
Ctrl + Shift + R
```

---

## Testing

### Test with Phone Photo (Has GPS)
1. Take a photo with your phone camera
2. Upload it as resolution image
3. Check backend logs for "GPS data extracted"
4. Query database to verify coordinates stored

```sql
SELECT after_image_latitude, after_image_longitude 
FROM complaint_resolutions 
WHERE complaint_id = 55;
```

### Test with Screenshot (No GPS)
1. Take a screenshot
2. Upload it as resolution image
3. Check backend logs for "No GPS data found"
4. Query database - columns should be NULL

```sql
SELECT after_image_latitude, after_image_longitude 
FROM complaint_resolutions 
WHERE complaint_id = 56;
-- Result: NULL, NULL
```

---

## Backend Logs

### With GPS Data
```
✓ Image saved to: D:\hack\backend\uploads\resolution-55-after-...jpg
Extracting EXIF GPS data from after image...
✓ GPS data extracted: { latitude: 12.9716, longitude: 77.5946 }
✓ Resolution record created: 123
```

### Without GPS Data
```
✓ Image saved to: D:\hack\backend\uploads\resolution-56-after-...jpg
Extracting EXIF GPS data from after image...
ℹ️ No GPS data found in after image
✓ Resolution record created: 124
```

---

## Data Comparison

### Original Complaint vs Resolution

```
ORIGINAL COMPLAINT (Citizen)
├─ Image: complaint-55-...jpg
├─ Latitude: 12.9716 (from citizen's phone)
├─ Longitude: 77.5946 (from citizen's phone)
└─ Stored in: complaints table

RESOLUTION (Officer)
├─ Image: resolution-55-after-...jpg
├─ Latitude: 12.9720 (from officer's phone) ← NEW
├─ Longitude: 77.5948 (from officer's phone) ← NEW
└─ Stored in: complaint_resolutions table
```

---

## Privacy Considerations

### GPS Data Privacy
- GPS coordinates are extracted from EXIF metadata
- Users can disable GPS on their phones
- Users can remove EXIF data from photos
- System gracefully handles missing GPS data

### Recommendations
- Inform officers that GPS data is extracted
- Allow officers to disable GPS if desired
- Use GPS data only for verification, not punishment
- Store GPS data securely

---

## Troubleshooting

### GPS Data Not Extracted
**Possible Causes:**
- Photo doesn't have EXIF metadata
- GPS was disabled on phone
- Photo is a screenshot
- EXIF data was removed

**Solution:**
- Take photo with phone camera
- Enable GPS on phone
- Use original photo, not screenshot

### Database Columns Missing
**Solution:**
- Run migration: `node backend/run-resolution-migration.js`
- Verify columns exist: `DESCRIBE complaint_resolutions;`

### Backend Error Extracting EXIF
**Solution:**
- Check backend logs for error message
- Verify exifParserService is working
- Try with different image file

---

## Summary

✅ **Automatic GPS Extraction** - No extra steps needed
✅ **Optional Data** - Works with or without GPS
✅ **Secure Storage** - Stored in database with complaint
✅ **Verification Ready** - Can verify officer location
✅ **Privacy Friendly** - Respects user GPS settings

---

## Next Steps

1. Run database migration
2. Restart backend
3. Test with phone photo
4. Verify GPS data in database
5. Use GPS data for verification queries

---

**Feature Status**: ✅ Ready to Use
**Database Migration**: Required
**Backend Restart**: Required
