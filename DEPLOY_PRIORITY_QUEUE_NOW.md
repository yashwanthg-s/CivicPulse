# Deploy Priority Queue System - Action Guide

## 🚀 Quick Deploy (5 minutes)

### Step 1: Run Migration (1 min)

```bash
cd /path/to/project
mysql -u root -p complaint_system < database/add_priority_queue_system_fixed.sql
```

Enter your MySQL password when prompted.

**Expected output:**
```
Priority Queue System installed successfully!
```

### Step 2: Restart Backend (1 min)

```bash
# Stop current backend (Ctrl+C if running)

# Restart
npm start
```

**Expected output:**
```
Server running on port 5003
```

### Step 3: Test API (1 min)

```bash
curl http://localhost:5003/api/priority-queue/all-departments
```

**Expected response:**
```json
{
  "success": true,
  "count": 5,
  "queues": [
    {
      "department": "infrastructure",
      "total_complaints": 42,
      "critical_count": 3,
      "high_count": 8,
      "medium_count": 15,
      "low_count": 16,
      "avg_priority_score": 95.5
    }
  ]
}
```

### Step 4: Test UI (2 min)

1. Open Officer Dashboard
2. Select a category
3. Click **📊 Priority Queue** button
4. Verify complaints appear sorted by priority

## ✅ Verification

### Database Check

```sql
-- Verify tables created
SHOW TABLES LIKE '%priority%';

-- Verify columns added
DESCRIBE complaints;

-- Verify procedures exist
SHOW PROCEDURE STATUS WHERE db = 'complaint_system';
```

### API Check

```bash
# Get infrastructure queue
curl http://localhost:5003/api/priority-queue/department/infrastructure

# Get critical complaints
curl http://localhost:5003/api/priority-queue/department/infrastructure/level/critical

# Get overdue complaints
curl http://localhost:5003/api/priority-queue/overdue
```

### UI Check

1. Officer Dashboard opens
2. Priority Queue button visible
3. Can switch between views
4. Complaints sorted by priority
5. Filtering works
6. Sorting works

## 🔧 Configuration (Optional)

### Add Custom Severity Keywords

```sql
-- Add keyword for your region
INSERT INTO severity_config (category, keyword, severity_score)
VALUES ('infrastructure', 'bridge collapse', 100);

-- Verify
SELECT * FROM severity_config WHERE category = 'infrastructure';
```

### Adjust SLA Times

```sql
-- Change SLA for infrastructure
UPDATE category_sla_config
SET sla_hours = 36
WHERE category = 'infrastructure';

-- Verify
SELECT * FROM category_sla_config;
```

## 📊 Monitor

### Check Queue Health

```bash
curl http://localhost:5003/api/priority-queue/analytics
```

### Check Overdue Complaints

```bash
curl http://localhost:5003/api/priority-queue/overdue
```

### Check Urgent Complaints

```bash
curl http://localhost:5003/api/priority-queue/urgent
```

## 🐛 Troubleshooting

### Issue: Migration fails

**Check:**
```sql
-- Verify database exists
SHOW DATABASES;

-- Verify tables exist
SHOW TABLES;
```

**Solution:**
```bash
# Make sure you're using the fixed migration
mysql -u root -p complaint_system < database/add_priority_queue_system_fixed.sql
```

### Issue: API returns empty

**Check:**
```sql
-- Verify complaints exist
SELECT COUNT(*) FROM complaints;

-- Verify priority scores calculated
SELECT COUNT(*) FROM complaints WHERE priority_score > 0;
```

**Solution:**
```sql
-- Recalculate all priorities
CALL recalculate_all_priorities();
```

### Issue: UI doesn't show Priority Queue button

**Check:**
- Backend restarted? (npm start)
- Frontend reloaded? (Ctrl+Shift+R)
- Browser console for errors? (F12)

**Solution:**
```bash
# Restart backend
npm start

# Clear browser cache
# Reload page (Ctrl+Shift+R)
```

## 📋 Deployment Checklist

- [ ] Migration script executed
- [ ] Backend restarted
- [ ] API endpoints tested
- [ ] Database verified
- [ ] UI tested
- [ ] Logs checked
- [ ] Officers trained

## 📚 Documentation

- **Full Details**: `PRIORITY_QUEUE_IMPLEMENTATION.md`
- **Quick Start**: `PRIORITY_QUEUE_QUICK_START.md`
- **Fix Guide**: `PRIORITY_QUEUE_FIX_GUIDE.md`
- **System Summary**: `PRIORITY_QUEUE_SYSTEM_SUMMARY.md`

## 🎯 Next Steps

1. ✅ Deploy (follow steps above)
2. ✅ Test (verify all checks pass)
3. ✅ Configure (add custom keywords)
4. ✅ Monitor (check queue health)
5. ✅ Train (teach officers how to use)

## 📞 Support

If you encounter issues:

1. Check troubleshooting section above
2. Review backend logs: `npm start`
3. Check database: `mysql -u root -p complaint_system`
4. Read documentation files

---

**Status**: ✅ READY TO DEPLOY  
**Time Required**: 5 minutes  
**Difficulty**: Easy  
**Version**: 1.0.1 (Fixed)
