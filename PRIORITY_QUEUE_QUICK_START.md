# Priority Queue System - Quick Start Guide

## 🚀 Installation (5 minutes)

### Step 1: Run Database Migration

```bash
# Navigate to project root
cd /path/to/project

# Run migration
mysql -u root -p complaint_system < database/add_priority_queue_system.sql

# Enter your MySQL password when prompted
```

**What this does:**
- Adds priority scoring columns to complaints table
- Creates configuration tables
- Creates stored procedures for automatic priority calculation
- Initializes default severity and location configurations
- Recalculates priorities for all existing complaints

### Step 2: Restart Backend

```bash
# Stop current backend (Ctrl+C if running)

# Restart
npm start
```

Expected output:
```
Server running on port 5003
Priority Queue System initialized
```

### Step 3: Verify Installation

Open browser and test API:
```
http://localhost:5003/api/priority-queue/all-departments
```

Expected response:
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
    },
    ...
  ]
}
```

## 📊 Using Priority Queue in Officer Dashboard

### Access Priority Queue

1. Open Officer Dashboard
2. Select a category (Infrastructure, Sanitation, etc.)
3. Click **📊 Priority Queue** button

### Understanding the Display

```
Queue Position | Title | Priority Score | SLA Status
─────────────────────────────────────────────────────
#1             | Open manhole near school | 215 | ⏰ 2h remaining
#2             | Pothole cluster metro    | 180 | ⏰ 6h remaining
#3             | Water leakage hospital   | 165 | ⏰ 12h remaining
```

### Priority Levels

- 🔴 **Critical** (≥200): Dangerous issues, immediate action needed
- 🟠 **High** (150-199): Important issues, address soon
- 🟡 **Medium** (100-149): Standard issues, routine handling
- 🟢 **Low** (<100): Minor issues, can wait

### Filtering & Sorting

**Filter by Priority:**
- All Levels
- 🔴 Critical
- 🟠 High
- 🟡 Medium
- 🟢 Low

**Sort by:**
- Priority Score (highest first)
- SLA Time Remaining (most urgent first)
- Oldest First (longest pending)

### Complaint Details

Click any complaint to see:
- **Priority Score Breakdown**
  - Severity: Why it's dangerous
  - Cluster Size: How many similar complaints
  - Location: Sensitive area bonus
  - SLA Delay: How overdue it is
- **SLA Information**
  - Deadline
  - Time remaining
  - Status (overdue/urgent/on_track)
- **Citizen Information**
  - Name and phone number

## 🔍 API Examples

### Get Department Queue

```bash
curl http://localhost:5003/api/priority-queue/department/infrastructure
```

Response:
```json
{
  "success": true,
  "department": "infrastructure",
  "count": 42,
  "queue": [
    {
      "id": 123,
      "title": "Open manhole near school",
      "priority_score": 215,
      "priority_level": "critical",
      "severity_score": 100,
      "cluster_score": 35,
      "location_score": 50,
      "sla_score": 30,
      "queue_position": 1,
      "sla_deadline": "2026-03-15 10:30:00",
      "hours_remaining": 2,
      "sla_status": "urgent"
    },
    ...
  ]
}
```

### Get Top 5 Critical Issues

```bash
curl http://localhost:5003/api/priority-queue/department/infrastructure/level/critical?limit=5
```

### Get Overdue Complaints

```bash
curl http://localhost:5003/api/priority-queue/overdue?department=infrastructure
```

### Get Queue Statistics

```bash
curl http://localhost:5003/api/priority-queue/department/infrastructure/stats
```

Response:
```json
{
  "success": true,
  "stats": {
    "department": "infrastructure",
    "total_complaints": 42,
    "critical_count": 3,
    "high_count": 8,
    "medium_count": 15,
    "low_count": 16,
    "avg_priority_score": 95.5
  }
}
```

## ⚙️ Configuration

### Add Custom Severity Keywords

```sql
-- Add new keyword for a category
INSERT INTO severity_config (category, keyword, severity_score)
VALUES ('infrastructure', 'bridge collapse', 100);

-- Verify
SELECT * FROM severity_config WHERE category = 'infrastructure';
```

### Modify SLA Times

```sql
-- Change SLA for infrastructure from 48 to 36 hours
UPDATE category_sla_config
SET sla_hours = 36
WHERE category = 'infrastructure';

-- Verify
SELECT * FROM category_sla_config;
```

### Add Sensitive Location

```sql
-- Add a new sensitive location
INSERT INTO location_sensitivity_config 
(location_type, location_name, sensitivity_score)
VALUES ('hospital', 'City General Hospital', 50);

-- Verify
SELECT * FROM location_sensitivity_config;
```

## 📈 Monitoring

### Check Queue Health

```bash
# Get analytics for all departments
curl http://localhost:5003/api/priority-queue/analytics

# Get analytics for specific department
curl http://localhost:5003/api/priority-queue/analytics?department=infrastructure
```

### Monitor SLA Breaches

```bash
# Get overdue complaints
curl http://localhost:5003/api/priority-queue/overdue

# Get complaints approaching SLA (within 24 hours)
curl http://localhost:5003/api/priority-queue/approaching-sla?hours=24
```

### View Priority Breakdown

```bash
# Get detailed priority calculation for a complaint
curl http://localhost:5003/api/priority-queue/complaint/123/breakdown

Response:
{
  "success": true,
  "breakdown": {
    "id": 123,
    "title": "Open manhole near school",
    "severity_score": 100,
    "cluster_score": 35,
    "location_score": 50,
    "sla_score": 30,
    "priority_score": 215,
    "priority_level": "critical",
    "hours_elapsed": 36,
    "hours_remaining": 2
  }
}
```

## 🔧 Troubleshooting

### Priority Scores Not Updating

**Problem:** New complaints don't have priority scores

**Solution:**
```sql
-- Manually recalculate for a specific complaint
CALL calculate_complaint_priority(complaint_id);

-- Recalculate all complaints
CALL recalculate_all_priorities();
```

### Queue Positions Out of Sync

**Problem:** Queue positions don't match priority order

**Solution:**
```sql
-- Update queue positions for a department
CALL update_queue_positions('infrastructure');

-- Update all departments
CALL update_queue_positions('infrastructure');
CALL update_queue_positions('sanitation');
CALL update_queue_positions('traffic');
CALL update_queue_positions('safety');
CALL update_queue_positions('utilities');
```

### API Returns Empty Queue

**Problem:** Department queue is empty

**Check:**
```sql
-- Verify complaints exist
SELECT COUNT(*) FROM complaints WHERE department = 'infrastructure';

-- Check if they have priority scores
SELECT COUNT(*) FROM complaints 
WHERE department = 'infrastructure' AND priority_score > 0;

-- Recalculate if needed
CALL recalculate_all_priorities();
```

## 📊 Example Scenarios

### Scenario 1: Officer Starts Shift

1. Officer opens Officer Dashboard
2. Clicks **📊 Priority Queue**
3. Sees top 10 most urgent complaints
4. Starts with #1 (highest priority)
5. Completes work and marks resolved
6. Queue automatically updates

### Scenario 2: New Critical Issue Reported

1. Citizen reports "Gas leak near market"
2. System detects severity: 100 (gas leak)
3. System finds 8 similar complaints: cluster score 20
4. Location is market area: location score 35
5. SLA is 24 hours: sla score 0 (just reported)
6. **Total: 155 (High Priority)**
7. Complaint appears in queue at appropriate position
8. Officer is notified

### Scenario 3: SLA Approaching

1. Complaint reported 20 hours ago
2. SLA is 24 hours (4 hours remaining)
3. System detects 80% of SLA elapsed
4. SLA score increases to 30
5. Priority score increases
6. Complaint moves up in queue
7. Officer sees it's urgent

## 📱 Mobile Responsiveness

Priority Queue Dashboard is fully responsive:
- **Desktop**: Full details panel on right side
- **Tablet**: Stacked layout with collapsible details
- **Mobile**: Bottom sheet for complaint details

## 🎯 Best Practices

1. **Check Priority Queue First**
   - Always start with highest priority complaints
   - Don't skip critical issues

2. **Monitor SLA Status**
   - Red (overdue): Immediate action needed
   - Orange (urgent): Address within 6 hours
   - Green (on_track): Normal handling

3. **Update Status Regularly**
   - Mark as "in_progress" when starting work
   - Mark as "resolved" when complete
   - Add notes for citizen communication

4. **Use Filters Effectively**
   - Filter by priority level to focus on critical issues
   - Sort by SLA to handle urgent cases first

5. **Review Analytics**
   - Check queue health regularly
   - Identify bottlenecks
   - Adjust SLA times if needed

## 📞 Support

For detailed documentation:
- **Implementation Details**: `PRIORITY_QUEUE_IMPLEMENTATION.md`
- **API Reference**: `PRIORITY_QUEUE_API.md`
- **UI Guide**: `PRIORITY_QUEUE_UI_GUIDE.md`
- **Troubleshooting**: `PRIORITY_QUEUE_TROUBLESHOOTING.md`

---

**Status**: ✅ READY TO USE  
**Last Updated**: March 14, 2026  
**Version**: 1.0.0
