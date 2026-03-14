# Kanban Board Implementation Guide

## Overview
The Kanban Board Dashboard provides real-time visualization of complaint lifecycle management through a structured workflow. Complaints move through five stages: Open → Assigned → In-Progress → Resolved → Verified.

## Architecture

### Backend Components

#### 1. Database Schema Updates
**File**: `database/add_kanban_workflow.sql`

New columns added to `complaints` table:
- `assigned_worker_id` (INT, FK to users.id) - Tracks which worker is assigned
- `workflow_updated_at` (TIMESTAMP) - Tracks when status last changed

New table: `complaint_workflow_history`
- Maintains audit trail of all status changes
- Records who made the change and when
- Stores change reason for transparency

#### 2. API Endpoint
**Route**: `GET /api/admin/kanban`
**Controller**: `AdminController.getKanbanData()`
**File**: `backend/controllers/adminController.js`

Response format:
```json
{
  "success": true,
  "data": {
    "open": [...],
    "assigned": [...],
    "in_progress": [...],
    "resolved": [...],
    "verified": [...]
  }
}
```

Status mapping (Database → Kanban):
- `submitted` → `open`
- `under_review` → `assigned`
- `in_progress` → `in_progress`
- `resolved` → `resolved`
- `verified` → `verified`
- `rejected` → `reopened`

### Frontend Components

#### 1. KanbanBoard Component
**File**: `frontend/src/components/KanbanBoard.jsx`

Features:
- Drag-and-drop card movement between columns
- Real-time status updates
- Auto-refresh every 30 seconds
- Click to view complaint details in modal
- Responsive grid layout (5 columns on desktop, adapts on mobile)

#### 2. Styling
**File**: `frontend/src/styles/KanbanBoard.css`

Features:
- Color-coded columns with gradient headers
- Smooth animations and transitions
- Responsive breakpoints for mobile/tablet/desktop
- Custom scrollbar styling
- Modal overlay for complaint details

#### 3. Integration
**File**: `frontend/src/components/AdminDashboard.jsx`

- Added "📊 Kanban Board" tab to admin dashboard
- Imported KanbanBoard component
- Integrated into tab navigation

## Workflow Stages

### 1. Open (🔴)
- **Status**: `submitted`
- **Description**: Complaint just created by citizen
- **Actions**: 
  - View complaint details
  - Assign to worker
  - Drag to "Assigned" column

### 2. Assigned (🟡)
- **Status**: `under_review`
- **Description**: Complaint assigned to a worker
- **Actions**:
  - Worker accepts task
  - Drag to "In Progress" column
  - View assigned worker details

### 3. In Progress (🟠)
- **Status**: `in_progress`
- **Description**: Worker is actively working on the issue
- **Actions**:
  - Upload before/after photos
  - Add resolution notes
  - Drag to "Resolved" column

### 4. Resolved (🟢)
- **Status**: `resolved`
- **Description**: Worker completed the work
- **Actions**:
  - Citizen receives notification
  - Citizen can verify or reject
  - Drag to "Verified" column

### 5. Verified (✅)
- **Status**: `verified`
- **Description**: Citizen confirmed resolution
- **Actions**:
  - Submit feedback/rating
  - View complete history
  - Archive complaint

## Features

### Drag-and-Drop
- Click and hold a complaint card to drag
- Hover over a column to see drop zone
- Release to move complaint to new status
- Automatic backend update on drop

### Real-Time Updates
- Auto-refresh every 30 seconds
- Manual refresh button available
- Optimistic UI updates (instant visual feedback)
- Fallback to server state if update fails

### Complaint Details Modal
- Click any card to view full details
- Shows:
  - Complaint ID and title
  - Category and priority
  - Location coordinates
  - Full description
  - Complaint image
  - Before/after resolution images
  - Assigned worker info
  - Timestamps

### Responsive Design
- **Desktop (>1400px)**: 5 columns in grid
- **Tablet (1000-1400px)**: 3 columns
- **Mobile (<1000px)**: 2 columns
- **Small Mobile (<600px)**: 1 column (horizontal scroll)

### Visual Indicators
- **Priority Badges**: Color-coded (Critical, High, Medium, Low)
- **Category Icons**: Visual representation of issue type
- **Card Count**: Number of complaints in each column
- **Timestamps**: When complaint was created
- **Worker Assignment**: Shows assigned worker ID

## Setup Instructions

### 1. Database Migration
```bash
# Run the migration to update schema
mysql -u root -p complaint_system < database/add_kanban_workflow.sql
```

### 2. Backend Setup
- Kanban route already registered in `backend/routes/admin.js`
- Controller method `getKanbanData()` implemented in `backend/controllers/adminController.js`
- No additional backend setup needed

### 3. Frontend Setup
- KanbanBoard component created at `frontend/src/components/KanbanBoard.jsx`
- Styling added at `frontend/src/styles/KanbanBoard.css`
- Integrated into AdminDashboard with tab navigation
- No additional npm packages needed

### 4. Start Services
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 5. Access Dashboard
- Navigate to Admin Dashboard
- Click "📊 Kanban Board" tab
- View complaints organized by workflow stage

## API Integration

### Fetch Kanban Data
```javascript
const response = await fetch('http://localhost:5003/api/admin/kanban', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
```

### Update Complaint Status
```javascript
const response = await fetch(`http://localhost:5003/api/complaints/${complaintId}/status`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    status: 'in_progress',
    message: 'Status updated to in_progress'
  })
});
```

## Status Update Flow

1. **User drags card** to new column
2. **Frontend optimistically updates** UI
3. **Backend receives PATCH request** to `/api/complaints/:id/status`
4. **Database updates** complaint status
5. **Workflow history recorded** in `complaint_workflow_history` table
6. **Response sent** to frontend
7. **If error**: Frontend refetches data to sync with server

## Performance Considerations

### Optimization Strategies
1. **Auto-refresh interval**: 30 seconds (configurable)
2. **Optimistic updates**: Instant UI feedback
3. **Lazy loading**: Cards load on demand
4. **Pagination**: Can be added for large datasets
5. **Caching**: Frontend caches kanban data between refreshes

### Scalability
- For 1000+ complaints: Consider pagination
- For real-time updates: Consider WebSocket integration
- For large teams: Consider filtering by department/worker

## Troubleshooting

### Issue: Kanban board not loading
**Solution**: 
- Check backend is running on port 5003
- Verify `/api/admin/kanban` endpoint is accessible
- Check browser console for errors
- Ensure authentication token is valid

### Issue: Drag-and-drop not working
**Solution**:
- Check browser supports HTML5 drag-and-drop
- Verify CSS is loaded correctly
- Check for JavaScript errors in console
- Try refreshing page

### Issue: Status not updating
**Solution**:
- Check network tab for failed requests
- Verify complaint ID is correct
- Check backend logs for errors
- Ensure user has admin permissions

### Issue: Cards not appearing in correct columns
**Solution**:
- Check database status values match mapping
- Verify `getAllForAdmin()` returns all complaints
- Check status mapping in `getKanbanData()` method
- Run database migration if needed

## Future Enhancements

1. **Real-time WebSocket updates** - Push updates instead of polling
2. **Filtering and search** - Filter by category, priority, worker
3. **Bulk actions** - Move multiple cards at once
4. **Custom workflows** - Allow admins to define custom statuses
5. **SLA tracking** - Show time in each stage
6. **Worker assignment UI** - Drag to assign workers
7. **Comments and notes** - Add discussion to cards
8. **Export functionality** - Export kanban data to CSV/PDF
9. **Analytics** - Track average time per stage
10. **Mobile app** - Native mobile kanban board

## Testing

### Manual Testing Checklist
- [ ] Kanban board loads without errors
- [ ] All 5 columns display correctly
- [ ] Complaint cards show all required info
- [ ] Drag-and-drop moves cards between columns
- [ ] Status updates in database after drag
- [ ] Modal opens when clicking card
- [ ] Modal displays all complaint details
- [ ] Refresh button updates data
- [ ] Auto-refresh works every 30 seconds
- [ ] Responsive design works on mobile
- [ ] Error handling shows appropriate messages

### Sample Test Data
Use the commented SQL in `database/add_kanban_workflow.sql` to insert test complaints in different statuses.

## Files Modified/Created

### Created Files
- `frontend/src/components/KanbanBoard.jsx` - Main component
- `frontend/src/styles/KanbanBoard.css` - Styling
- `database/add_kanban_workflow.sql` - Database migration
- `KANBAN_BOARD_IMPLEMENTATION.md` - This guide

### Modified Files
- `frontend/src/components/AdminDashboard.jsx` - Added Kanban tab
- `backend/routes/admin.js` - Added kanban route
- `backend/controllers/adminController.js` - Added getKanbanData method

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review browser console for errors
3. Check backend logs for API errors
4. Verify database migration was applied
5. Ensure all files are in correct locations
