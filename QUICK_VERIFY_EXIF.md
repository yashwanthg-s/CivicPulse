# Quick EXIF Verification

## After Submitting Complaint, Run This:

### 1. Automated Check (Easiest)
```bash
cd backend
node verify-exif-data.js
```

### 2. Manual Database Check
```sql
-- Check latest complaint with EXIF
SELECT id, title, exif_latitude, exif_longitude, 
       location_source, confidence_score
FROM complaints 
WHERE exif_latitude IS NOT NULL 
ORDER BY id DESC LIMIT 1;
```

### 3. Check EXIF Metadata
```sql
-- Check camera info saved
SELECT * FROM exif_metadata_archive 
WHERE complaint_id = [YOUR_ID];
```

---

## Expected Results

| Field | Expected Value |
|-------|-----------------|
| exif_latitude | 13.0742015 |
| exif_longitude | 77.439617 |
| location_source | EXIF |
| confidence_score | 70-95 |
| capture_timestamp | 2024-03-14T... |

---

## ✅ Success = All Fields Have Values

❌ If NULL or empty = Something went wrong

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| No complaints found | Submit a complaint first |
| exif_latitude is NULL | Photo doesn't have GPS |
| confidence_score is 0 | GPS quality is poor |
| location_source = MANUAL | EXIF extraction failed |

---

## Done! 🎉

If verification shows all ✅, EXIF feature is working!

