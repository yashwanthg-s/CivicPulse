# Fix Priority Queue System - Step by Step

## Problem

When creating complaints, you get this error:
```
Error: Can't update table 'complaints' in stored function/trigger
Code: ER_CANT_UPDATE_USED_TABLE_IN_SF_OR_TRG
```

## Root Cause

The old migration script created triggers that try to update the `complaints` table while it's being inserted into. MySQL doesn't allow this.

## Solution

Run the cleanup and fix script that:
1. Drops problematic triggers
2. Drops and recreates stored procedures
3. Reinstalls the system correctly

## Fix Steps (2 minutes)

### Step 1: Stop Backend

```bash
# Press Ctrl+C to stop the backend
```

### Step 2: Run Cleanup Script

```bash
mysql -u root -p complaint_system < database/cleanup_and_fix_priority_queue.sql
```

When prompted, enter your MySQL password.

Expected output:
```
Priority Queue System cleaned up and fixed successfully!
total_complaints | critical | high | medium | low
```

### Step 3: Restart Backend

```bash
npm start
```

Expected output:
```
Server running on port 5003
```

### Step 4: Test

Try creating a new complaint. It should work without errors.

## Verification

### Check 1: Verify Triggers Are Removed

```sql
SHOW TRIGGERS FROM complaint_system;
```

Should show NO triggers (empty result).

### Check 2: Verify Procedures Exist

```sql
SHOW PROCEDURE STATUS WHERE db = 'complaint_system';
```

Should show 3 procedures:
- calculate_complaint_priority
- update_queue_positions
- recalculate_all_priorities

### Check 3: Verify Priority Scores

```sql
SELECT id, title, priority_score, severity_score, cluster_score, location_score, sla_score
FROM complaints
ORDER BY id DESC
LIMIT 5;
```

Should show priority scores populated.

### Check 4: Test API

```bash
curl http://localhost:5003/api/priority-queue/all-departments
```

Should return queue statistics.

## What Changed

### Removed
- `complaint_priority_on_create` trigger
- `complaint_priority_on_update` trigger

### Kept
- All stored procedures
- All tables
- All configurations
- All API endpoints
- All frontend components

### How Priority Calculation Works Now

```
User Creates Complaint
    ↓
INSERT into complaints
    ↓
Backend calls: CALL calculate_complaint_priority(complaint_id)
    ↓
Priority scores calculated
    ↓
Response sent to user
```

No triggers involved - clean and simple!

## If You Still Get Errors

### Error: "Procedure not found"

```sql
-- Check if procedures exist
SHOW PROCEDURE STATUS WHERE db = 'complaint_system';

-- If missing, re-run the cleanup script
mysql -u root -p complaint_system < database/cleanup_and_fix_priority_queue.sql
```

### Error: "Trigger still exists"

```sql
-- Drop any remaining triggers
DROP TRIGGER IF EXISTS complaint_priority_on_create;
DROP TRIGGER IF EXISTS complaint_priority_on_update;

-- Then re-run cleanup script
mysql -u root -p complaint_system < database/cleanup_and_fix_priority_queue.sql
```

### Error: "Can't update table" still appears

1. Stop backend (Ctrl+C)
2. Run cleanup script again
3. Restart backend
4. Try creating complaint again

## Confirmation Checklist

- [ ] Cleanup script ran successfully
- [ ] Backend restarted
- [ ] No triggers in database
- [ ] 3 procedures exist
- [ ] Can create new complaint
- [ ] Priority scores appear in database
- [ ] API returns queue data
- [ ] Officer Dashboard shows Priority Queue

## Next Steps

1. Create a test complaint
2. Check it appears in Priority Queue
3. Verify priority score is calculated
4. Test filtering and sorting
5. Train officers on new feature

## Support

If issues persist:
1. Check backend logs for errors
2. Verify MySQL connection
3. Ensure cleanup script completed
4. Check database permissions

---

**Status**: ✅ READY TO FIX  
**Time**: ~2 minutes  
**Last Updated**: March 14, 2026
