# Kanban Board - Quick Setup Guide

## Step 1: Run Database Migration

### Option A: Using MySQL CLI (Recommended)
```bash
# Navigate to database directory
cd database

# Run the final migration script
mysql -u root -p complaint_system < kanban_workflow_final.sql

# When prompted, enter your MySQL password
```

### Option B: Using TablePlus or MySQL Workbench
1. Open your MySQL client
2. Select the `complaint_system` database
3. Copy and paste the contents of `database/kanban_workflow_final.sql`
4. Execute the script

### Option C: Using Node.js Migration Runner
```bash
cd backend
node run-migration.js
```

## Step 2: Verify Migration

After running the migration, verify it was successful:

```sql
-- Check if new columns exist
DESCRIBE complaints;

-- Check if workflow history table exists
SHOW TABLES LIKE 'complaint_workflow_history';

-- Check if kanban_board_view exists
SHOW VIEWS LIKE 'kanban_board_view';

-- View sample data
SELECT id, title, status, assigned_worker_id FROM complaints LIMIT 5;
```

## Step 3: Start Backend Server

```bash
cd backend
npm start
```

Expected output:
```
⚠️ Port 5001 may be in use, using port 5003 instead
Server running on port 5003
```

## Step 4: Start Frontend Server

In a new terminal:
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.0.0  ready in 123 ms

➜  Local:   http://localhost:5173/
```

## Step 5: Access Kanban Board

1. Open browser to `http://localhost:5173`
2. Log in as admin
3. Navigate to Admin Dashboard
4. Click "📊 Kanban Board" tab

## Troubleshooting

### Issue: "Unknown column 'c.before_image_path'"
**Solution**: The migration didn't run properly. Try the safe migration:
```bash
mysql -u root -p complaint_system < database/add_kanban_workflow_safe.sql
```

### Issue: Kanban board shows empty columns
**Solution**: 
1. Check if complaints exist in database:
   ```sql
   SELECT COUNT(*) FROM complaints;
   ```
2. If no complaints, create test data:
   ```sql
   INSERT INTO complaints (user_id, title, description, image_path, latitude, longitude, date, time, category, priority, status)
   VALUES (1, 'Test Complaint', 'Test description', '/uploads/test.jpg', 12.9716, 77.5946, CURDATE(), CURTIME(), 'Garbage', 'high', 'submitted');
   ```

### Issue: Kanban board not loading
**Solution**:
1. Check browser console for errors (F12)
2. Check backend logs for API errors
3. Verify `/api/admin/kanban` endpoint is accessible:
   ```bash
   curl http://localhost:5003/api/admin/kanban
   ```

### Issue: Drag-and-drop not working
**Solution**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh page (Ctrl+Shift+R)
3. Check if CSS file is loaded (check Network tab in DevTools)

## Features Overview

### Kanban Columns
- **🔴 Open**: New complaints (status: submitted)
- **🟡 Assigned**: Assigned to worker (status: under_review)
- **🟠 In Progress**: Worker is working (status: in_progress)
- **🟢 Resolved**: Work completed (status: resolved)
- **✅ Verified**: Citizen confirmed (status: verified)

### Card Information
Each complaint card shows:
- Category icon (🗑️ 🛣️ 💧 💡)
- Priority badge (Critical/High/Medium/Low)
- Complaint title
- Category name
- Location coordinates
- Created timestamp
- Assigned worker ID (if assigned)

### Interactions
- **Drag cards** between columns to update status
- **Click cards** to view full details in modal
- **Refresh button** to manually update data
- **Auto-refresh** every 30 seconds

## API Endpoints

### Get Kanban Data
```
GET /api/admin/kanban
Authorization: Bearer {token}

Response:
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

### Update Complaint Status
```
PATCH /api/complaints/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "status": "in_progress",
  "message": "Status updated to in_progress"
}
```

## Database Schema Changes

### New Columns Added to `complaints` table:
- `assigned_worker_id` (INT, FK to users.id)
- `before_image_path` (VARCHAR 500)
- `after_image_path` (VARCHAR 500)
- `workflow_updated_at` (TIMESTAMP)

### New Table: `complaint_workflow_history`
Tracks all status changes with:
- complaint_id
- old_status
- new_status
- changed_by (user_id)
- change_reason
- changed_at (timestamp)

### New View: `kanban_board_view`
Provides Kanban-formatted data with status mapping

## Next Steps

1. ✅ Run database migration
2. ✅ Start backend and frontend servers
3. ✅ Access Kanban board
4. ✅ Create test complaints
5. ✅ Test drag-and-drop functionality
6. ✅ Verify status updates in database

## Support

For issues:
1. Check troubleshooting section above
2. Review browser console (F12)
3. Check backend logs
4. Verify database migration ran successfully
5. Ensure all files are in correct locations

## Files Created/Modified

### Created:
- `frontend/src/components/KanbanBoard.jsx`
- `frontend/src/styles/KanbanBoard.css`
- `database/add_kanban_workflow.sql`
- `database/add_kanban_workflow_safe.sql`
- `KANBAN_BOARD_IMPLEMENTATION.md`
- `KANBAN_SETUP_QUICK_START.md`

### Modified:
- `frontend/src/components/AdminDashboard.jsx` (added Kanban tab)
- `backend/routes/admin.js` (added kanban route)
- `backend/controllers/adminController.js` (added getKanbanData method)
