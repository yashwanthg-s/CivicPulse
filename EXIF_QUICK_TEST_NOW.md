# How to Test EXIF Location Extraction - RIGHT NOW

## Quick Start (5 minutes)

### Step 1: Open the App
1. Open your browser
2. Go to `http://localhost:5173` (frontend)
3. Login or create an account

### Step 2: Go to Complaint Form
1. Click "Submit Complaint" or "📝 New Complaint"
2. You should see the complaint form

### Step 3: Capture a Photo
1. Click "📷 Capture Photo" button
2. Allow camera access when prompted
3. Take a photo of something (doesn't matter what)
4. Click "Use Photo" or "✓ Confirm"

### Step 4: Watch for EXIF Location
After capturing the photo, you should see:
- **If photo has GPS:** 
  - Blue pin on map showing location
  - Confidence indicator (e.g., "92% - High Confidence")
  - Coordinates displayed (e.g., "13.0827, 80.2707")
  
- **If photo has NO GPS:**
  - Message: "GPS data not found in photo"
  - Interactive map appears
  - Click on map to select location manually

### Step 5: Fill Complaint Details
1. Enter title (e.g., "Broken Streetlight")
2. Enter description
3. Category auto-fills (or select manually)
4. Click "✓ Submit Complaint"

### Step 6: Verify Success
- You should see: "✓ Complaint submitted successfully! ID: [number]"
- Complaint created with EXIF location (if GPS available)

---

## Testing Scenarios

### Scenario A: Photo WITH GPS (Best Case)
**What to do:**
1. Use smartphone with GPS enabled
2. Capture photo outdoors
3. Upload to complaint form
4. Observe EXIF location extraction

**Expected:**
- ✓ Location auto-fills from EXIF
- ✓ Confidence indicator shows
- ✓ Blue pin on map
- ✓ No manual entry needed

---

### Scenario B: Photo WITHOUT GPS (Fallback)
**What to do:**
1. Use photo without GPS (or disable GPS)
2. Upload to complaint form
3. Observe manual location selector

**Expected:**
- ✓ Manual location selector appears
- ✓ Interactive map shows
- ✓ Click on map to select location
- ✓ Complaint submits with manual location

---

### Scenario C: Location Discrepancy (Admin Test)
**What to do:**
1. Upload photo with EXIF GPS
2. Manually enter location >500m away
3. Submit complaint
4. Login as admin
5. Go to admin dashboard

**Expected:**
- ✓ Complaint appears in "Location Review Queue"
- ✓ Both locations show on map
- ✓ Admin can approve/reject/correct

---

## Troubleshooting

### Issue: Camera not working
**Solution:**
- Check browser permissions
- Allow camera access
- Try different browser
- Check camera is connected

### Issue: Location not showing
**Solution:**
- Check if photo has GPS metadata
- Try different photo
- Check browser console for errors
- Verify backend is running

### Issue: Manual selector not appearing
**Solution:**
- Photo might have GPS (check EXIF)
- Try photo without GPS
- Refresh page
- Check browser console

### Issue: Complaint won't submit
**Solution:**
- Fill all required fields
- Ensure location is selected
- Check for error messages
- Check backend logs

---

## Quick Checklist

- [ ] Backend running on port 5003
- [ ] Frontend running on port 5173
- [ ] Can access complaint form
- [ ] Can capture photo
- [ ] Location displays (EXIF or manual)
- [ ] Can submit complaint
- [ ] Complaint created successfully

---

## What to Look For

### Success Signs ✅
- Location auto-fills from photo
- Confidence indicator shows percentage
- Map displays with pin
- Complaint submits without errors
- ID number returned

### Problem Signs ❌
- Location doesn't appear
- Error messages in form
- Camera not working
- Map not loading
- Submission fails

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

## Database Verification

### To Check if Data Saved:
1. Open database client (TablePlus, MySQL Workbench, etc.)
2. Run these queries:

```sql
-- Check complaints with EXIF data
SELECT id, title, exif_latitude, exif_longitude, 
       location_source, confidence_score 
FROM complaints 
WHERE exif_latitude IS NOT NULL 
LIMIT 5;

-- Check flagged complaints
SELECT * FROM location_review_queue 
WHERE reviewed_at IS NULL;

-- Check EXIF archive
SELECT id, complaint_id, camera_make, camera_model 
FROM exif_metadata_archive 
LIMIT 5;
```

---

## Backend Logs

### To Monitor Backend:
1. Look at backend terminal where server is running
2. Watch for messages like:
   - "✓ EXIF GPS extracted"
   - "✓ Location validation completed"
   - "✓ Complaint created"
   - Any errors

---

## Browser Console

### To Check for Errors:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Check Network tab for API calls
5. Verify API responses are successful

---

## API Testing (Advanced)

### Test EXIF Endpoint Directly:
```bash
curl -X POST http://localhost:5003/api/admin/extract-exif \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,..."}'
```

### Test Review Queue:
```bash
curl -X GET http://localhost:5003/api/admin/location-review-queue \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Summary

**To test EXIF extraction RIGHT NOW:**

1. ✅ Open app at http://localhost:5173
2. ✅ Go to complaint form
3. ✅ Capture photo
4. ✅ Watch for EXIF location or manual selector
5. ✅ Fill details and submit
6. ✅ Verify complaint created

**That's it!** The system will automatically extract EXIF data if available, or show manual location selector if not.

---

## Next Steps After Testing

1. Test with multiple photos
2. Test location discrepancy detection
3. Test admin review interface
4. Check database for saved data
5. Monitor backend logs
6. Check browser console for errors

---

**Ready to test?** Start with Step 1 above!
