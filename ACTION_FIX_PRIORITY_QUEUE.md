# ACTION: Fix Priority Queue System Now

## The Problem

Complaints fail to create with error:
```
Can't update table 'complaints' in stored function/trigger
```

## The Solution (Copy & Paste)

### Step 1: Run This Command

```bash
mysql -u root -p complaint_system < database/cleanup_and_fix_priority_queue.sql
```

Enter your MySQL password when prompted.

### Step 2: Restart Backend

```bash
# Stop current backend (Ctrl+C)
npm start
```

### Step 3: Done!

Try creating a complaint. It should work now.

## Verify It Works

```bash
# Test API
curl http://localhost:5003/api/priority-queue/all-departments

# Should return queue statistics
```

## What This Does

1. ✅ Removes problematic triggers
2. ✅ Recreates stored procedures correctly
3. ✅ Recalculates all priorities
4. ✅ Updates queue positions
5. ✅ Enables priority queue system

## That's It!

The Priority Queue System is now working. Officers can:
- Click "📊 Priority Queue" in dashboard
- See complaints sorted by priority
- Filter by priority level
- Sort by SLA time
- View score breakdown

---

**Time**: 2 minutes  
**Difficulty**: Easy  
**Status**: Ready to fix
