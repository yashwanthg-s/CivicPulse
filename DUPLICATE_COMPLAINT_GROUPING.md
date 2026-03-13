# Duplicate Complaint Grouping Feature

## Overview

When duplicate complaints are detected, they are now grouped together in the officer dashboard. Only the primary complaint is displayed with a badge showing how many times it was submitted.

## How It Works

### Backend Logic

1. **Complaint Submission**
   - Citizen submits complaint
   - System detects if it's a duplicate
   - If duplicate: Links to cluster with primary complaint
   - If new: Creates new complaint

2. **Officer Dashboard Fetch**
   - Backend queries all complaints in category
   - Groups complaints by cluster
   - Returns only primary complaints
   - Adds `duplicate_count` field to each complaint

3. **Grouping Algorithm**
   - Queries `complaint_cluster_members` table
   - Identifies primary complaint in each cluster
   - Filters to show only primary complaints
   - Adds count badge for duplicates

### Frontend Display

**Single Complaint (No Duplicates)**
```
Large pothole on main road
📍 13.074098, 77.499817
📅 2026-03-13 12:18:30
```

**Primary Complaint with Duplicates**
```
Large pothole on main road          [SUBMITTED] [🔄 3]
📍 13.074098, 77.499817
📅 2026-03-13 12:18:30
```

The badge shows:
- 🔄 Icon (indicates duplicate)
- Number (total count including original)
- Hover text: "3 similar complaints"

## Database Tables Used

### complaint_clusters
- Stores cluster information
- `primary_complaint_id`: First complaint in cluster
- `complaint_count`: Total complaints in cluster

### complaint_cluster_members
- Links complaints to clusters
- `complaint_id`: Individual complaint
- `cluster_id`: Cluster it belongs to

## Features

✅ **Deduplication**: Duplicate complaints grouped together
✅ **Primary Display**: Only primary complaint shown
✅ **Count Badge**: Shows total number of similar complaints
✅ **Hover Info**: Tooltip shows "X similar complaints"
✅ **Fallback**: If grouping fails, shows all complaints

## Example Scenario

**Scenario**: 3 citizens report the same pothole

1. **Citizen 1** submits complaint
   - Status: New complaint
   - Cluster created with count = 1

2. **Citizen 2** submits similar complaint
   - System detects duplicate
   - Linked to Citizen 1's cluster
   - Cluster count = 2

3. **Citizen 3** submits similar complaint
   - System detects duplicate
   - Linked to Citizen 1's cluster
   - Cluster count = 3

4. **Officer Dashboard Shows**
   - Only Citizen 1's complaint displayed
   - Badge shows: 🔄 3
   - Officer knows 3 people reported same issue

## Officer Workflow

1. Officer opens dashboard
2. Selects category (e.g., Infrastructure)
3. Sees complaints list
4. Notices badge "🔄 3" on pothole complaint
5. Clicks complaint to view details
6. Sees it's a primary complaint with 3 total reports
7. Can resolve once to fix all 3 reports

## Benefits

- **Cleaner Dashboard**: No duplicate clutter
- **Better Prioritization**: See which issues are most reported
- **Faster Resolution**: Fix one issue, resolve multiple reports
- **Improved UX**: Officers focus on unique issues

## Technical Details

### API Response

```json
{
  "success": true,
  "count": 5,
  "complaints": [
    {
      "id": 1,
      "title": "Large pothole on main road",
      "category": "infrastructure",
      "status": "submitted",
      "duplicate_count": 3,
      "is_primary": true,
      ...
    },
    {
      "id": 4,
      "title": "Water leakage near park",
      "category": "utilities",
      "status": "submitted",
      "duplicate_count": 1,
      "is_primary": false,
      ...
    }
  ]
}
```

### Fields Added

- `duplicate_count`: Total complaints in cluster (1 if not duplicate)
- `is_primary`: Boolean indicating if this is primary complaint

## Testing

1. Submit complaint A (pothole)
2. Submit complaint B (similar pothole nearby)
3. System detects duplicate
4. Officer dashboard shows only complaint A
5. Badge shows "🔄 2"
6. Click complaint A to view details
7. Verify it shows as primary with 2 total reports

---

**Feature Complete and Ready to Use!**
