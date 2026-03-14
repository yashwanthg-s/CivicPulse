# CRITICAL FIX REQUIRED - Priority Queue Trigger Error

## Problem
Complaint submission is failing with error:
```
Error: Can't update table 'complaints' in stored function/trigger because it is already used by statement which invoked this stored function/trigger
```

This is a MySQL limitation - triggers cannot update the same table they're triggered on.

## Solution Implemented

### 1. ✅ Added `extractExif()` Method
- **File**: `backend/controllers/complaintController.js`
- **What it does**: Extracts GPS coordinates and metadata from uploaded images
- **Endpoint**: `POST /api/complaints/extract-exif`
- **Status**: COMPLETE

### 2. ⚠️ REQUIRED: Run Database Cleanup Script
The priority queue system has problematic triggers that must be removed.

**Run this command in your terminal:**
```bash
mysql -u root -p complaint_system < database/cleanup_and_fix_priority_queue.sql
```

When prompted, enter your MySQL password.

**What this script does:**
- Removes the problematic triggers (`complaint_priority_on_create`, `complaint_priority_on_update`)
- Removes old stored procedures
- Adds priority scoring columns to complaints table
- Creates configuration tables for severity, location sensitivity, and SLA
- Creates stored procedures (WITHOUT triggers) for priority calculation
- Recalculates all existing complaint priorities
- Initializes department queues

### 3. ✅ Priority Calculation Already Integrated
- **File**: `backend/controllers/complaintController.js` (line ~350)
- **What it does**: After complaint is created, calls `CALL calculate_complaint_priority(complaintId)`
- **Status**: COMPLETE - No changes needed

## Next Steps

1. **Run the cleanup script** (CRITICAL):
   ```bash
   mysql -u root -p complaint_system < database/cleanup_and_fix_priority_queue.sql
   ```

2. **Restart the backend**:
   ```bash
   npm start
   ```

3. **Test complaint submission**:
   - Go to the complaint form
   - Fill in details and upload an image
   - Click Submit
   - Should now work without errors

4. **Verify Priority Queue**:
   - Go to Officer Dashboard
   - Click "📊 Priority Queue" button
   - Should see complaints sorted by priority score

## Files Modified
- `backend/controllers/complaintController.js` - Added `extractExif()` method

## Files to Run
- `database/cleanup_and_fix_priority_queue.sql` - MUST RUN THIS

## API Endpoints Now Available
- `POST /api/complaints/extract-exif` - Extract GPS from image
- `POST /api/complaints` - Create complaint (now works without trigger error)
- `GET /api/priority-queue/department/:department` - Get priority queue
- `GET /api/priority-queue/complaint/:id` - Get complaint priority details

## Troubleshooting

If you still get errors after running the cleanup script:

1. **Verify the script ran successfully**:
   ```bash
   mysql -u root -p complaint_system -e "SHOW TRIGGERS;"
   ```
   Should show NO triggers (empty result)

2. **Check if tables exist**:
   ```bash
   mysql -u root -p complaint_system -e "SHOW TABLES LIKE 'severity_config';"
   ```
   Should show the configuration tables

3. **Restart MySQL** (if needed):
   ```bash
   # Windows
   net stop MySQL80
   net start MySQL80
   
   # Or restart via Services
   ```

4. **Clear Node cache** and restart backend:
   ```bash
   npm start
   ```
