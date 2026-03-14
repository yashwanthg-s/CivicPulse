# Quick Fix Steps - Complaint Submission Error

## The Problem
Complaint submission returns 500 error due to MySQL trigger conflict.

## The Fix (3 Steps)

### Step 1: Run Database Cleanup
```bash
mysql -u root -p complaint_system < database/cleanup_and_fix_priority_queue.sql
```
Enter your MySQL password when prompted.

### Step 2: Restart Backend
```bash
npm start
```

### Step 3: Test
1. Go to complaint form
2. Fill in details and upload image
3. Click Submit
4. Should work now ✓

## What Was Fixed

### Code Changes
- ✅ Added `extractExif()` method to `ComplaintController`
- ✅ Route `/api/complaints/extract-exif` now works
- ✅ Priority calculation already integrated in controller

### Database Changes (Run cleanup script)
- ❌ Removes problematic triggers
- ✅ Adds priority scoring columns
- ✅ Creates configuration tables
- ✅ Recalculates all priorities

## Verify It Works

### Test Complaint Submission
```bash
# In browser console or Postman
POST http://localhost:5003/api/complaints
```

### Test EXIF Extraction
```bash
# In browser console or Postman
POST http://localhost:5003/api/complaints/extract-exif
# (with image file)
```

### Check Priority Queue
```bash
# In browser console or Postman
GET http://localhost:5003/api/priority-queue/department/infrastructure
```

## If Still Having Issues

1. **Verify cleanup script ran**:
   ```bash
   mysql -u root -p complaint_system -e "SHOW TRIGGERS;"
   ```
   Should show NO triggers

2. **Check tables exist**:
   ```bash
   mysql -u root -p complaint_system -e "SHOW TABLES LIKE 'severity_config';"
   ```

3. **Restart MySQL** (if needed):
   - Windows: Services → MySQL80 → Restart
   - Or: `net stop MySQL80` then `net start MySQL80`

4. **Clear and restart**:
   ```bash
   npm start
   ```

## Files Modified
- `backend/controllers/complaintController.js` - Added extractExif method

## Files to Run
- `database/cleanup_and_fix_priority_queue.sql` - CRITICAL

## Success Indicators
- ✅ Complaint submission works without 500 error
- ✅ EXIF extraction endpoint responds
- ✅ Priority Queue Dashboard shows complaints
- ✅ Officer Dashboard displays priority scores
