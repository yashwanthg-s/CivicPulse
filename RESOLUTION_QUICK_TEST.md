# Officer Resolution - Quick Test Guide

## 🚀 Quick Start (5 minutes)

### 1. Run Migration
```bash
node backend/run-resolution-migration.js
```
✅ Should see: "✅ Migration completed successfully!"

### 2. Start Backend
```bash
cd backend
npm start
```
✅ Should see: "Server running on port 5003"

### 3. Start Frontend
```bash
cd frontend
npm run dev
```
✅ Should see: "Local: http://localhost:5173"

### 4. Hard Refresh Browser
```
Ctrl + Shift + R
```

---

## 📋 Test Workflow

### Login as Officer
1. Go to http://localhost:5173
2. Login with officer credentials
3. You should see "Officer Dashboard"

### Test Resolution (Phone Photo with GPS)
1. Click on any complaint
2. Click "Update Status" dropdown
3. Select "🟢 Resolved"
4. Click "📸 Upload Resolution Images"
5. Upload a **phone photo** (has GPS data)
6. Add optional notes
7. Click "✓ Submit Resolution"

**Expected Results:**
- ✅ Alert: "Complaint resolved successfully!"
- ✅ Complaint disappears from active list
- ✅ Backend logs show: "GPS extracted from image"
- ✅ API response shows: `"source": "image"`

### Test Resolution (Screenshot - No GPS)
1. Click on another complaint
2. Click "Update Status" dropdown
3. Select "🟢 Resolved"
4. Click "📸 Upload Resolution Images"
5. Upload a **screenshot** (no GPS data)
6. Add optional notes
7. Click "✓ Submit Resolution"

**Expected Results:**
- ✅ Alert: "Complaint resolved successfully!"
- ✅ Complaint disappears from active list
- ✅ Backend logs show: "No GPS data in image, using complaint location"
- ✅ API response shows: `"source": "complaint"`

### View History
1. Click "📜 View History" button
2. You should see resolved complaints
3. Click on a resolved complaint to see details

**Expected Results:**
- ✅ Resolved complaints appear in history
- ✅ Shows resolution image
- ✅ Shows work notes
- ✅ Shows GPS location

---

## 🔍 What to Check in Backend Logs

### Success (Phone Photo with GPS)
```
=== RESOLVE COMPLAINT DEBUG ===
Complaint ID: 55
Officer ID: 2
Has after_image: true
✓ Complaint found with location: { latitude: 12.345678, longitude: 77.654321 }
✓ Image saved to: /path/to/resolution-55-after-TIMESTAMP-RANDOM.jpg
✓ GPS extracted from image: { latitude: 12.345678, longitude: 77.654321 }
✓ Using location from image: { latitude: 12.345678, longitude: 77.654321 }
✓ Resolution record created: 1
✓ Complaint status updated to resolved
```

### Fallback (Screenshot - No GPS)
```
=== RESOLVE COMPLAINT DEBUG ===
Complaint ID: 56
Officer ID: 2
Has after_image: true
✓ Complaint found with location: { latitude: 12.345678, longitude: 77.654321 }
✓ Image saved to: /path/to/resolution-56-after-TIMESTAMP-RANDOM.jpg
ℹ️ No GPS data in image, using complaint location
✓ Using location from complaint: { latitude: 12.345678, longitude: 77.654321 }
✓ Resolution record created: 2
✓ Complaint status updated to resolved
```

---

## ✅ Verification Checklist

- [ ] Migration completed successfully
- [ ] Backend running on port 5003
- [ ] Frontend running on port 5173
- [ ] Officer can login
- [ ] Can select complaint
- [ ] Can upload resolution image
- [ ] Complaint moves to history
- [ ] Backend logs show GPS source
- [ ] API response includes location source
- [ ] History displays resolved complaints

---

## 🐛 Common Issues

### Issue: 404 Error
**Fix**: Restart backend
```bash
npm start
```

### Issue: "Unknown column" Error
**Fix**: Run migration
```bash
node backend/run-resolution-migration.js
```

### Issue: Image Not Saving
**Fix**: Check uploads directory exists
```bash
mkdir -p backend/uploads
```

### Issue: GPS Not Extracted
**This is normal!** System falls back to complaint location
- Check backend logs for "No GPS data in image"
- This is the expected behavior for screenshots

---

## 📊 Database Check

### View Resolution Records
```sql
SELECT * FROM complaint_resolutions;
```

### View Updated Complaints
```sql
SELECT id, status, resolution_id, resolved_by, resolved_at 
FROM complaints 
WHERE status = 'resolved';
```

### Check GPS Data
```sql
SELECT id, resolution_latitude, resolution_longitude 
FROM complaint_resolutions;
```

---

## 🎯 Success Indicators

✅ Officer can resolve complaints
✅ GPS extracted from phone photos
✅ Falls back to complaint location for screenshots
✅ Resolved complaints appear in history
✅ Backend logs show correct GPS source
✅ Database stores location correctly

---

## 📞 Need Help?

1. Check backend logs for error messages
2. Verify migration completed: `node backend/run-resolution-migration.js`
3. Verify backend running: `curl http://localhost:5003/health`
4. Check frontend `.env` has correct API URL
5. Hard refresh browser: `Ctrl + Shift + R`

