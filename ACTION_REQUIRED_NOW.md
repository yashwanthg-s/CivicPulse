# ACTION REQUIRED NOW

## The Issue
Complaint submission fails with 500 error due to MySQL trigger conflict.

## The Fix (Do This Now)

### Step 1: Run Database Cleanup Script
Open terminal and run:
```bash
mysql -u root -p complaint_system < database/cleanup_and_fix_priority_queue.sql
```

When prompted, enter your MySQL password.

**What this does**:
- Removes problematic triggers
- Adds priority scoring system
- Recalculates all priorities
- Initializes department queues

### Step 2: Restart Backend
```bash
npm start
```

### Step 3: Test
1. Open complaint form
2. Upload/capture photo
3. Click Submit
4. Should work now ✓

## What Was Fixed

### Code Changes (Already Done)
✅ Added `extractExif()` method to extract GPS from images
✅ Fixed frontend EXIF extraction call to use FormData
✅ Priority calculation already integrated in controller

### Database Changes (You Need to Do)
⚠️ Run cleanup script to remove trigger errors
⚠️ Restart backend

## Verify It Works

### Test 1: Complaint Submission
- Form → Upload photo → Submit
- Should succeed without error

### Test 2: EXIF Extraction
- Photo should auto-fill GPS coordinates
- If no GPS, manual location selector appears

### Test 3: Priority Queue
- Officer Dashboard → "📊 Priority Queue" button
- Should see complaints sorted by priority

## If Issues Persist

### Check 1: Verify cleanup script ran
```bash
mysql -u root -p complaint_system -e "SHOW TRIGGERS;"
```
Should show NO triggers (empty result)

### Check 2: Verify tables exist
```bash
mysql -u root -p complaint_system -e "SHOW TABLES LIKE 'severity_config';"
```
Should show the configuration tables

### Check 3: Restart MySQL (if needed)
Windows Services → MySQL80 → Restart

### Check 4: Clear and restart
```bash
npm start
```

## Files Modified
- `backend/controllers/complaintController.js` - Added extractExif method
- `frontend/src/components/ComplaintForm.jsx` - Fixed EXIF extraction

## Files to Run
- `database/cleanup_and_fix_priority_queue.sql` - CRITICAL

## Success = 
✅ Complaint submission works
✅ EXIF extraction works
✅ Priority Queue displays
✅ No 500 errors

---

**NEXT ACTION**: Run the cleanup script now!
```bash
mysql -u root -p complaint_system < database/cleanup_and_fix_priority_queue.sql
```
