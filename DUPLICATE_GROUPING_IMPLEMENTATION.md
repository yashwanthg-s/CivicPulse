# Duplicate Complaint Grouping Implementation

## Overview
Duplicate complaints are now automatically detected, grouped, and displayed as a single item with a badge showing the count of duplicates in the Officer Dashboard.

## How It Works

### 1. Duplicate Detection (During Complaint Submission)
When a citizen submits a complaint:
- System checks for recent complaints in the same category and area (within 500m)
- AI service analyzes text similarity between new and existing complaints
- If similarity score ≥ 60%, complaint is marked as duplicate
- Duplicate complaints are linked to a cluster with the primary complaint

### 2. Cluster Storage
Duplicates are stored in the database with:
- `complaint_clusters` table: Stores cluster information
  - `cluster_hash`: Unique identifier for the cluster
  - `primary_complaint_id`: ID of the first complaint in the cluster
  - `complaint_count`: Total number of complaints in cluster
  
- `complaint_cluster_members` table: Links complaints to clusters
  - `cluster_id`: Reference to cluster
  - `complaint_id`: Individual complaint ID
  - `similarity_score`: How similar this complaint is to the primary

### 3. Officer Dashboard Display
When officer views complaints:
- Backend groups duplicate complaints using `groupDuplicateComplaints()` method
- Only primary complaints are displayed in the list
- Each primary complaint shows a badge with duplicate count
- Badge format: `🔄 {count}` (e.g., `🔄 3` means 3 total complaints including primary)

### 4. Category-Specific Grouping
Grouping is applied per category:
- Infrastructure complaints grouped separately
- Sanitation complaints grouped separately
- Traffic complaints grouped separately
- Safety complaints grouped separately
- Utilities complaints grouped separately

## Database Schema

### complaint_clusters
```sql
CREATE TABLE complaint_clusters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cluster_hash VARCHAR(255) UNIQUE,
  category VARCHAR(50),
  primary_complaint_id INT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  complaint_count INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (primary_complaint_id) REFERENCES complaints(id)
);
```

### complaint_cluster_members
```sql
CREATE TABLE complaint_cluster_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cluster_id INT,
  complaint_id INT,
  similarity_score DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cluster_id) REFERENCES complaint_clusters(id),
  FOREIGN KEY (complaint_id) REFERENCES complaints(id)
);
```

## Duplicate Detection Algorithm

### Text Similarity (Jaccard Index)
- Extracts keywords from title + description
- Removes stop words (the, a, and, etc.)
- Calculates: intersection / union of keywords
- Threshold: 60% similarity

### Location Proximity (Haversine Formula)
- Calculates distance between GPS coordinates
- Threshold: 500 meters (0.5 km)

### Category Matching
- Must be exact category match
- Infrastructure ≠ Sanitation, etc.

### Cluster Hash Generation
- Combines: category + rounded coordinates + top keywords
- MD5 hash ensures consistency
- Similar complaints generate similar hashes

## Frontend Display

### Badge Styling
```css
.badge-duplicate {
  background: rgba(255, 152, 0, 0.15);
  color: var(--accent-warning);
  border: 1px solid var(--accent-warning);
  font-weight: 700;
  padding: 4px 10px;
}
```

### Example Display
```
Assigned Complaints (5)

┌─────────────────────────────────────┐
│ Large pothole on main road      🔄 3 │
│ 📍 13.023536, 74.967993             │
│ 📅 2026-03-12 19:49:07              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Water pipeline leakage          🔄 2 │
│ 📍 13.025000, 74.970000             │
│ 📅 2026-03-13 10:30:00              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Garbage accumulation                │
│ 📍 13.030000, 74.975000             │
│ 📅 2026-03-13 14:15:00              │
└─────────────────────────────────────┘
```

## Implementation Details

### Backend: groupDuplicateComplaints()
Located in: `backend/controllers/complaintController.js`

```javascript
static async groupDuplicateComplaints(complaints) {
  // 1. Get complaint IDs
  // 2. Query cluster_members table for cluster info
  // 3. Group by primary_complaint_id
  // 4. Return only primary complaints with duplicate_count
  // 5. Add standalone complaints (not in any cluster)
}
```

### Frontend: OfficerDashboard.jsx
- Displays `complaint.duplicate_count` in badge
- Shows badge only if `duplicate_count > 1`
- Badge appears next to status badge

## Testing

### Manual Test
1. Submit 3 similar complaints in same category/area
2. Go to Officer Dashboard
3. Should see only 1 complaint with `🔄 3` badge
4. Click on it to view details

### API Test
```bash
# Get complaints for infrastructure category
curl "http://localhost:5003/api/complaints?role=officer&category=infrastructure"

# Response should show grouped complaints with duplicate_count
{
  "success": true,
  "count": 2,
  "complaints": [
    {
      "id": 48,
      "title": "Large pothole",
      "duplicate_count": 3,
      "is_primary": true,
      ...
    },
    {
      "id": 50,
      "title": "Water leak",
      "duplicate_count": 1,
      "is_primary": true,
      ...
    }
  ]
}
```

## Configuration

### Duplicate Detection Thresholds
Edit `ai-service/models/duplicate_detector.py`:
- `LOCATION_THRESHOLD_KM = 0.5` (500 meters)
- `SIMILARITY_THRESHOLD = 0.6` (60% text similarity)

### Adjust Sensitivity
- Increase `SIMILARITY_THRESHOLD` to 0.7 for stricter matching
- Decrease to 0.5 for more aggressive grouping
- Increase `LOCATION_THRESHOLD_KM` to 1.0 for larger areas

## Benefits

✅ Reduces duplicate work for officers
✅ Faster resolution with grouped complaints
✅ Better resource allocation
✅ Cleaner dashboard view
✅ Category-specific grouping
✅ Automatic clustering based on AI analysis

## Future Enhancements

- [ ] Allow officers to view all duplicates in a cluster
- [ ] Merge duplicate complaints into single case
- [ ] Show similarity score in UI
- [ ] Manual duplicate marking by officers
- [ ] Duplicate history tracking
