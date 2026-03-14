# EXIF Location Extraction - Ready to Test

## ✅ System Status

- **Backend**: Running on port 5003 ✓
- **Frontend**: Running on port 5173 ✓
- **AI Service**: Running ✓
- **Database**: Connected ✓
- **Test User**: Created ✓

---

## 🔐 Login Credentials

### For Testing (Citizen Account)
```
Username: testuser
Password: password123
Role: Citizen
```

### Admin Account (Hardcoded)
```
Username: admin
Password: admin
Role: Admin
```

### Officer Account (Hardcoded)
```
Username: officer
Password: officer
Role: Officer
```

---

## 🚀 Quick Start - Test EXIF Extraction

### Step 1: Open the App
1. Go to: **http://localhost:5173**
2. You should see the login page

### Step 2: Login
1. Select role: **Citizen**
2. Username: **testuser**
3. Password: **password123**
4. Click **Login**

### Step 3: Select Language
1. Choose your preferred language (English, Kannada, or Hindi)
2. Click to proceed

### Step 4: Submit a Complaint with EXIF
1. Click **"📝 Submit Complaint"** or **"New Complaint"**
2. You should see the complaint form

### Step 5: Upload Photo with GPS
1. Look for **"Upload Photo"** or camera input
2. Click to open file picker
3. Select a photo from your computer that has GPS metadata
   - Use a smartphone photo taken with GPS enabled
   - Or download a sample photo with EXIF data

### Step 6: Watch for EXIF Extraction
After uploading, you should see:

**If photo HAS GPS metadata:**
```
✓ Blue pin on map showing location
✓ Coordinates displayed (e.g., "13.0827, 80.2707")
✓ Confidence indicator (e.g., "92% - High Confidence")
✓ Green/Yellow/Red confidence bar
✓ Message: "✓ Location extracted from photo metadata"
```

**If photo has NO GPS metadata:**
```
✓ Message: "📸 GPS data not found in photo"
✓ Manual location selector appears
✓ Interactive map shows
✓ Click on map to select location
```

### Step 7: Fill Complaint Details
1. **Title**: Enter complaint title (e.g., "Broken Streetlight")
2. **Description**: Enter details (e.g., "Light is broken near bus stop")
3. **Category**: Auto-detected from image (or select manually)
4. **Priority**: Auto-detected or select manually

### Step 8: Submit Complaint
1. Click **"✓ Submit Complaint"**
2. You should see: **"✓ Complaint submitted successfully! ID: [number]"**

---

## 📊 Verify in Database

After submitting, verify the EXIF data was saved:

```sql
-- Check complaint with EXIF data
SELECT id, title, exif_latitude, exif_longitude, 
       location_source, confidence_score, capture_timestamp
FROM complaints 
WHERE exif_latitude IS NOT NULL 
ORDER BY id DESC LIMIT 1;
```

Expected output:
- `exif_latitude`: GPS latitude from photo
- `exif_longitude`: GPS longitude from photo
- `location_source`: "EXIF"
- `confidence_score`: 85-100
- `capture_timestamp`: Photo capture time

---

## 🧪 Testing Scenarios

### Scenario 1: Photo WITH GPS (Best Case)
**What to do:**
1. Use a smartphone photo taken with GPS enabled
2. Upload to complaint form
3. Watch for automatic location extraction

**Expected result:**
- ✅ Location auto-fills from EXIF
- ✅ Confidence indicator shows (Green if ≥90%)
- ✅ Blue pin on map
- ✅ No manual entry needed
- ✅ Complaint submits successfully

**Verify:**
```sql
SELECT * FROM complaints 
WHERE exif_latitude IS NOT NULL 
ORDER BY id DESC LIMIT 1;
```

---

### Scenario 2: Photo WITHOUT GPS (Fallback)
**What to do:**
1. Use a photo without GPS metadata
2. Upload to complaint form
3. Manual location selector should appear

**Expected result:**
- ✅ Manual location selector appears
- ✅ Interactive map shows
- ✅ Click on map to select location
- ✅ Coordinates display as you click
- ✅ Complaint submits with manual location

**Verify:**
```sql
SELECT * FROM complaints 
WHERE location_source = 'MANUAL' 
ORDER BY id DESC LIMIT 1;
```

---

### Scenario 3: Location Discrepancy (Admin Test)
**What to do:**
1. Upload photo with EXIF GPS: 13.0827, 80.2707
2. Manually enter location: 13.0900, 80.2800 (>500m away)
3. Submit complaint

**Expected result:**
- ✅ Complaint created
- ✅ Appears in location review queue
- ✅ Admin can see both locations on map

**Verify:**
```sql
SELECT * FROM location_review_queue 
WHERE reviewed_at IS NULL 
ORDER BY id DESC LIMIT 1;
```

---

## 🔍 How to Check if Photo Has GPS

### Online EXIF Viewer:
1. Go to: https://exif.tools/
2. Upload your photo
3. Look for GPS coordinates
4. If present, photo has GPS metadata

### Command Line (if available):
```bash
exiftool photo.jpg | grep GPS
```

---

## 🐛 Troubleshooting

### Issue: Login fails with 401 Unauthorized
**Solution:**
- Verify you're using correct credentials: `testuser` / `password123`
- Check backend is running on port 5003
- Check frontend environment: `VITE_API_URL=http://localhost:5003/api`

### Issue: Photo uploads but location doesn't show
**Solution:**
- Photo doesn't have GPS metadata
- Try a different photo with GPS
- Check browser console (F12) for errors
- Check backend logs for EXIF extraction errors

### Issue: Manual location selector doesn't appear
**Solution:**
- Photo has GPS (so manual selector not shown)
- Use a photo without GPS to test fallback
- Check browser console for errors

### Issue: Complaint won't submit
**Solution:**
- Fill all required fields (title, description, location)
- Ensure location is selected (EXIF or manual)
- Check for error messages in form
- Check backend logs

---

## 📱 Backend Logs to Watch

When you upload a photo, watch backend logs for:

```
✓ EXIF GPS extracted: 13.0827, 80.2707
✓ Capture timestamp extracted: 2024-03-14T10:30:00Z
✓ Camera metadata extracted: Apple iPhone 14
✓ Location validation completed
✓ Complaint created successfully
```

---

## ✅ Testing Checklist

- [ ] Can access app at http://localhost:5173
- [ ] Can login with testuser/password123
- [ ] Can select language
- [ ] Can access complaint form
- [ ] Can upload photo
- [ ] Location displays (EXIF or manual)
- [ ] Can fill complaint details
- [ ] Can submit complaint
- [ ] See success message with ID
- [ ] Data visible in database

---

## 🎯 Success Indicators

✅ **EXIF extraction working if:**
- Location auto-fills from photo
- Confidence indicator shows percentage
- Map displays with blue pin
- Complaint submits without errors
- ID number returned
- Data appears in database with `location_source = 'EXIF'`

❌ **Problems if:**
- Location doesn't appear
- Error messages in form
- Photo upload fails
- Map not loading
- Submission fails
- No data in database

---

## 📋 Next Steps After Testing

1. ✅ Test with multiple photos (with and without GPS)
2. ✅ Test location discrepancy detection
3. ✅ Test admin review interface
4. ✅ Check database for saved EXIF data
5. ✅ Monitor backend logs
6. ✅ Check browser console for errors

---

## 🔗 Quick Links

- **App**: http://localhost:5173
- **Backend API**: http://localhost:5003/api
- **Database**: MySQL (complaint_system)
- **EXIF Extraction Endpoint**: POST /api/admin/extract-exif
- **Location Review Queue**: GET /api/admin/location-review-queue

---

## 📞 Support

If you encounter issues:

1. Check backend logs: `node server.js` output
2. Check frontend console: F12 → Console tab
3. Check database: Verify tables and data
4. Verify all services running: Backend, Frontend, AI Service

---

**Ready to test?** Start with Step 1 above!

