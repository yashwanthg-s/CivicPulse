# Resolved Complaints History Flow

## How It Works

When an officer resolves a complaint, it automatically moves to the history section. Here's the complete flow:

### 1. Officer Resolves Complaint
- Officer selects a complaint from the active list
- Clicks "Upload Resolution Images"
- Uploads the "after" image showing completed work
- Adds optional notes
- Clicks "Submit Resolution"

### 2. Backend Processing
The backend (`resolveComplaint` method):
1. Receives the complaint ID, officer ID, and after image
2. Saves the after image to `/uploads/` directory
3. Creates a record in `complaint_resolutions` table with:
   - `complaint_id`: The complaint being resolved
   - `officer_id`: The officer who resolved it
   - `after_image_path`: Path to the resolution image
   - `resolution_notes`: Optional notes
4. Updates the `complaints` table:
   - Sets `status = 'resolved'`
   - Sets `resolution_id` (links to complaint_resolutions)
   - Sets `resolved_by` (officer ID)
   - Sets `resolved_at` (current timestamp)

### 3. Frontend Updates
After successful resolution:
1. Shows success alert: "✅ Complaint resolved successfully! Click 'View History' to see all resolved complaints."
2. Calls `fetchComplaints()` to refresh the active complaints list
3. Removes the resolved complaint from the active list
4. Clears the form and resets state

### 4. Viewing Resolved Complaints
User can view resolved complaints by:
1. Clicking "📜 View History" button in the Officer Dashboard
2. The CategoryHistory component loads with `status = 'resolved'` filter
3. All resolved complaints in the selected category are displayed
4. User can click on any resolved complaint to see:
   - Original complaint image
   - Resolution details
   - Timeline information
   - Location data

## Database Schema

### complaint_resolutions Table
```sql
CREATE TABLE complaint_resolutions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  officer_id INT,
  after_image_path VARCHAR(500),
  resolution_notes TEXT,
  resolved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_complaint_id (complaint_id),
  INDEX idx_officer_id (officer_id),
  CONSTRAINT fk_resolution_complaint FOREIGN KEY (complaint_id) 
    REFERENCES complaints(id) ON DELETE CASCADE
)
```

### complaints Table Updates
Added columns:
- `resolution_id` - Links to complaint_resolutions table
- `resolved_by` - Officer ID who resolved it
- `resolved_at` - Timestamp when resolved

## Status Values

The complaint status can be:
- `submitted` - 🔴 Open (new complaint)
- `under_review` - 🟡 Assigned (officer assigned)
- `in_progress` - 🟠 In Progress (officer working on it)
- `resolved` - 🟢 Resolved (officer completed work)
- `verified` - ✅ Verified (admin verified resolution)
- `rejected` - ❌ Rejected (officer rejected it)

## Testing the Flow

1. **Create a complaint** as a citizen
2. **Login as officer** and view assigned complaints
3. **Select a complaint** and click "Upload Resolution Images"
4. **Upload an image** (any image file works)
5. **Add optional notes** (e.g., "Fixed pothole with asphalt")
6. **Click "Submit Resolution"**
7. **See success message** and complaint disappears from active list
8. **Click "View History"** to see the resolved complaint
9. **Click on the resolved complaint** to view all details including the resolution image

## Files Involved

**Frontend:**
- `frontend/src/components/OfficerDashboard.jsx` - Resolution workflow
- `frontend/src/components/CategoryHistory.jsx` - History display

**Backend:**
- `backend/controllers/complaintController.js` - `resolveComplaint()` method
- `backend/routes/complaints.js` - `PUT /:id/resolve` route

**Database:**
- `complaint_resolutions` table - Stores resolution data
- `complaints` table - Updated with resolution fields

## Key Features

✅ Resolved complaints automatically removed from active list
✅ Resolution images saved to disk
✅ Resolution notes stored in database
✅ Officer ID tracked for accountability
✅ Timestamp recorded for SLA tracking
✅ Easy access to history via "View History" button
✅ Filter by status to see only resolved complaints
✅ View original complaint image and resolution image together
