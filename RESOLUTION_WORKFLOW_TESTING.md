# Resolution Workflow - Complete Testing Guide

## Prerequisites
- Backend running on port 5003
- Frontend running (Vite dev server)
- Database migration completed (`node backend/run-resolution-migration.js`)
- At least one complaint submitted by a citizen

## Step-by-Step Testing

### Step 1: Login as Officer
1. Open the application
2. Click "Login"
3. Enter officer credentials (or create test officer account)
4. You should see the Officer Dashboard

### Step 2: View Active Complaints
1. Select a category (e.g., "Infrastructure")
2. You should see a list of assigned complaints
3. Click on a complaint to view details

### Step 3: Start Resolution Process
1. Click "Update Status" dropdown
2. Select "🟢 Resolved"
3. Click "📸 Upload Resolution Images" button
4. You should see the resolution workflow with 3 steps

### Step 4: Upload Resolution Image
**Step 1 - Original Issue (Auto-displayed)**
- Citizen's original complaint image displays automatically
- No action needed

**Step 2 - Completed Work (Your Photo)**
1. Click the file input button
2. Select an image from your computer (any image works)
   - Phone photo
   - Screenshot
   - Any image file
3. Image preview should appear
4. Green checkmark shows "✓ After image uploaded"

**Step 3 - Work Notes (Optional)**
1. Type optional notes describing the work
   - Example: "Fixed pothole with asphalt, smoothed edges"
2. Leave blank if no notes needed

### Step 5: Submit Resolution
1. Verify both progress indicators show complete:
   - ✓ Original Image (always complete)
   - ✓ After Image (should be complete after upload)
2. Click "✓ Submit Resolution" button
3. Wait for success message

### Step 6: Verify Success
You should see:
- ✅ Success alert: "Complaint resolved successfully! Click 'View History' to see all resolved complaints."
- Complaint disappears from active list
- Dashboard refreshes

### Step 7: View in History
1. Click "📜 View History" button
2. You should see the resolved complaint in the list
3. Click on it to view:
   - Original complaint image
   - Resolution details
   - Timeline
   - Location information

## Expected Behavior

### Active Complaints List
- **Before Resolution**: Complaint appears in active list
- **After Resolution**: Complaint disappears from active list

### History Section
- **Status Filter**: Defaults to "🟢 Resolved"
- **Resolved Complaints**: Show all complaints with status = 'resolved'
- **Details View**: Shows original image and resolution information

## Database Verification

To verify the resolution was saved correctly, run these SQL queries:

```sql
-- Check complaint status
SELECT id, title, status, resolution_id, resolved_by, resolved_at 
FROM complaints 
WHERE id = 55;

-- Check resolution record
SELECT id, complaint_id, officer_id, after_image_path, resolution_notes, created_at 
FROM complaint_resolutions 
WHERE complaint_id = 55;

-- Check all resolved complaints
SELECT c.id, c.title, c.status, cr.after_image_path, cr.resolution_notes 
FROM complaints c 
LEFT JOIN complaint_resolutions cr ON c.id = cr.complaint_id 
WHERE c.status = 'resolved';
```

## Troubleshooting

### Issue: "500 Internal Server Error"
**Solution**: 
- Check backend logs for error message
- Ensure database migration was run: `node backend/run-resolution-migration.js`
- Verify `complaint_resolutions` table exists

### Issue: Complaint doesn't disappear from active list
**Solution**:
- Hard refresh browser: `Ctrl + Shift + R`
- Check that `fetchComplaints()` is being called after resolution
- Verify complaint status changed to 'resolved' in database

### Issue: Can't see resolved complaint in history
**Solution**:
- Click "View History" button
- Make sure status filter is set to "🟢 Resolved"
- Check that complaint status is 'resolved' in database

### Issue: Image upload fails
**Solution**:
- Ensure image file is valid (JPG, PNG, etc.)
- Check that `/uploads` directory exists and is writable
- Verify base64 encoding is working (check browser console)

## Performance Notes

- Resolution images are saved to disk in `/backend/uploads/`
- Database stores path reference, not the image data
- Large images may take longer to upload (depends on connection)
- Recommend images under 5MB for best performance

## Security Notes

- Officer ID is tracked for accountability
- Timestamp recorded for audit trail
- Resolution images stored with unique filenames
- Database foreign keys prevent orphaned records
- Cascade delete removes resolution if complaint deleted

## Next Steps

After testing resolution workflow:
1. Test with multiple complaints
2. Test with different image types
3. Verify history filters work correctly
4. Test with different officer accounts
5. Verify SLA monitoring with resolved complaints
