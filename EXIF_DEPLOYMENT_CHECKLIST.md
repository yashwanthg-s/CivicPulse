# EXIF Location Extraction - Deployment Checklist

## Pre-Deployment ✅

### Backend Setup
- [ ] Install piexifjs: `npm install piexifjs`
- [ ] Verify piexifjs in package.json
- [ ] Check backend/services/exifParserService.js exists
- [ ] Check backend/services/locationValidatorService.js exists
- [ ] Check backend/routes/exifRoutes.js exists
- [ ] Verify server.js imports exifRoutes
- [ ] Verify Complaint.js has new methods

### Database Setup
- [ ] Backup existing database
- [ ] Run migration: `mysql -u root -p complaint_system < database/add_exif_location_tables.sql`
- [ ] Verify new columns in complaints table:
  ```sql
  DESCRIBE complaints;
  -- Should show: exif_latitude, exif_longitude, capture_timestamp, location_source, location_validation_status, location_discrepancy_flag, confidence_score
  ```
- [ ] Verify new tables created:
  ```sql
  SHOW TABLES LIKE '%location%';
  -- Should show: location_review_queue, exif_metadata_archive
  ```

### Frontend Setup
- [ ] Check ExifLocationDisplay.jsx exists
- [ ] Check ManualLocationSelector.jsx exists
- [ ] Check LocationReviewQueue.jsx exists
- [ ] Check CSS files exist (3 files)
- [ ] Verify ComplaintForm.jsx imports new components
- [ ] Verify ComplaintForm.jsx has EXIF state variables
- [ ] Verify ComplaintForm.jsx has EXIF handlers

## Deployment Steps

### Step 1: Backend Deployment
```bash
cd backend
npm install piexifjs
npm start
```

Expected output:
```
Server running on port 5003
✓ EXIF extraction service ready
```

### Step 2: Database Migration
```bash
mysql -u root -p complaint_system < database/add_exif_location_tables.sql
```

Verify:
```sql
SELECT COUNT(*) FROM location_review_queue;
SELECT COUNT(*) FROM exif_metadata_archive;
```

### Step 3: Frontend Deployment
```bash
cd frontend
npm run build
# or for development
npm run dev
```

### Step 4: Verify Installation

#### Test EXIF Extraction Endpoint
```bash
curl -X POST http://localhost:5003/api/admin/extract-exif \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."}'
```

Expected response:
```json
{
  "success": true,
  "exif": {
    "gps": {
      "latitude": 13.0827,
      "longitude": 80.2707,
      "dop": 2.5
    },
    "timestamp": {
      "timestamp": "2024-03-14T10:30:00.000Z",
      "source": "DateTimeOriginal"
    },
    "camera": {
      "make": "Apple",
      "model": "iPhone 14"
    }
  }
}
```

#### Test Location Review Queue Endpoint
```bash
curl -X GET http://localhost:5003/api/admin/location-review-queue \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "queue": []
}
```

#### Test Frontend Components
1. Open complaint form
2. Capture photo with GPS
3. Verify EXIF location displays
4. Verify confidence indicator shows
5. Test manual location selector
6. Submit complaint

## Post-Deployment Testing

### Test Case 1: EXIF GPS Extraction
- [ ] Capture photo with GPS metadata
- [ ] Upload complaint
- [ ] Verify EXIF location extracted
- [ ] Verify confidence score calculated
- [ ] Verify location_source = 'EXIF'
- [ ] Verify capture_timestamp stored

### Test Case 2: Manual Location Fallback
- [ ] Upload photo without GPS
- [ ] Verify manual location selector shown
- [ ] Select location on map
- [ ] Verify location_source = 'MANUAL'
- [ ] Verify complaint created successfully

### Test Case 3: Location Discrepancy Detection
- [ ] Upload photo with EXIF GPS
- [ ] Manually enter location >500m away
- [ ] Verify complaint flagged
- [ ] Verify entry in location_review_queue
- [ ] Verify location_discrepancy_flag = true

### Test Case 4: Admin Review Queue
- [ ] Create flagged complaint
- [ ] Login as admin
- [ ] Navigate to location review queue
- [ ] Verify complaint appears in queue
- [ ] Verify both locations show on map
- [ ] Test approve action
- [ ] Test reject action
- [ ] Test correct location action

### Test Case 5: Confidence Scoring
- [ ] Photo with good GPS (DOP < 2): Score ≥ 90% (Green)
- [ ] Photo with moderate GPS (DOP 2-5): Score 70-89% (Yellow)
- [ ] Photo with poor GPS (DOP > 5): Score < 70% (Red)
- [ ] Photo without DOP: Score = 85% (Default)

## Monitoring

### Backend Logs
```bash
tail -f backend/server.log
```

Look for:
- ✓ EXIF GPS extracted
- ✓ EXIF metadata archived
- ✓ Location validation completed
- ⚠️ EXIF extraction failed (should still allow submission)

### Database Monitoring
```sql
-- Check EXIF data storage
SELECT COUNT(*) as total_complaints FROM complaints;
SELECT COUNT(*) as with_exif FROM complaints WHERE exif_latitude IS NOT NULL;
SELECT COUNT(*) as flagged FROM complaints WHERE location_discrepancy_flag = true;

-- Check review queue
SELECT * FROM location_review_queue WHERE reviewed_at IS NULL;

-- Check EXIF archive
SELECT COUNT(*) as archived FROM exif_metadata_archive;
```

### Frontend Monitoring
- Check browser console for errors
- Monitor network requests to `/api/admin/extract-exif`
- Check for EXIF component rendering
- Verify map displays correctly

## Rollback Plan

If issues occur:

### Rollback Database
```bash
# Backup current state
mysqldump -u root -p complaint_system > backup_with_exif.sql

# Restore previous state
mysql -u root -p complaint_system < backup_before_exif.sql
```

### Rollback Backend
```bash
# Remove piexifjs
npm uninstall piexifjs

# Revert server.js changes
git checkout backend/server.js

# Restart backend
npm start
```

### Rollback Frontend
```bash
# Revert ComplaintForm.jsx
git checkout frontend/src/components/ComplaintForm.jsx

# Rebuild
npm run build
```

## Performance Baseline

After deployment, measure:

| Metric | Target | Actual |
|--------|--------|--------|
| EXIF extraction time | <200ms | _____ |
| Complaint creation time | <1s | _____ |
| Location validation time | <100ms | _____ |
| Review queue load time | <500ms | _____ |
| Map rendering time | <1s | _____ |

## Troubleshooting

### Issue: EXIF extraction fails
**Solution:**
- Verify piexifjs installed: `npm list piexifjs`
- Check image has GPS metadata
- Review backend logs for errors
- Test with different image formats

### Issue: Location review queue empty
**Solution:**
- Create test complaint with location discrepancy
- Verify location_discrepancy_flag set correctly
- Check database for entries
- Verify admin user role

### Issue: Confidence score not showing
**Solution:**
- Check GPS DOP in EXIF data
- Verify confidence_score column exists
- Check frontend component rendering
- Review browser console

### Issue: Manual location selector not showing
**Solution:**
- Verify ManualLocationSelector component imported
- Check showManualLocationSelector state
- Verify Leaflet library loaded
- Check browser console for errors

### Issue: Map not displaying
**Solution:**
- Verify Leaflet CSS imported
- Check map container height set
- Verify coordinates are valid
- Check browser console for errors

## Sign-Off

- [ ] Backend deployment complete
- [ ] Database migration successful
- [ ] Frontend deployment complete
- [ ] All test cases passed
- [ ] Performance baseline met
- [ ] Monitoring configured
- [ ] Documentation reviewed
- [ ] Team trained
- [ ] Ready for production

## Deployment Date: _______________

Deployed by: _______________

Verified by: _______________

## Post-Deployment Notes

_______________________________________________________________________________

_______________________________________________________________________________

_______________________________________________________________________________

## Support Contact

For issues during deployment:
- Backend: Check server logs
- Database: Verify migration completed
- Frontend: Check browser console
- General: Review EXIF_SETUP_QUICK_START.md
