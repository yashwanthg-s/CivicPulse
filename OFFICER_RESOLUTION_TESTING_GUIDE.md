# Officer Dashboard Resolution Testing Guide

## Quick Start - Test the Resolution Feature

### Prerequisites
- Backend running on port 5003
- Frontend loaded (hard refresh if needed)
- Logged in as officer
- At least one complaint assigned

### Step-by-Step Testing

#### Step 1: Navigate to Officer Dashboard
- Click "Officer Dashboard" in navigation
- You should see a list of assigned complaints

#### Step 2: Select a Complaint
- Click on any complaint in the list
- Complaint details will appear on the right side
- You'll see the citizen's original image

#### Step 3: Start Resolution Process
- Scroll down to "Update Status" section
- Click the status dropdown
- Select "🟢 Resolved"
- Click "📸 Upload Resolution Images" button

#### Step 4: Upload After Image
- You'll see 3 steps:
  - **Step 1️⃣**: BEFORE - Citizen's original image (already displayed)
  - **Step 2️⃣**: AFTER - Click file input button
  - **Step 3️⃣**: NOTES - Optional description

#### Step 5: Select Image File
- Click "📷 Upload Image (After Work)" button
- Browse your computer
- Select any image file (JPG, PNG, etc.)
- Image preview will appear

#### Step 6: Add Optional Notes
- In Step 3️⃣, type work description
- Example: "Fixed pothole with asphalt, smoothed edges"
- This is optional

#### Step 7: Submit Resolution
- Click "✓ Submit Resolution" button
- Button will show "⏳ Submitting..." while processing
- Wait for success message

### Expected Results

**Success:**
- Alert: "Complaint resolved successfully!"
- Complaint disappears from active list
- Status changes to "resolved"
- Image saved to backend/uploads/
- Database record created

**Error:**
- Alert shows error message with details
- Check backend console for error logs
- Common issues:
  - Image file too large
  - File system permissions
  - Database connection issue

### Testing Checklist

- [ ] Officer can see assigned complaints
- [ ] Citizen's original image displays in Step 1
- [ ] File input works and allows image selection
- [ ] Image preview shows after selection
- [ ] Optional notes can be entered
- [ ] Submit button is disabled until after image is selected
- [ ] Submit button works and shows loading state
- [ ] Success message appears
- [ ] Complaint status changes to resolved
- [ ] Image file saved to backend/uploads/

### Troubleshooting

**Issue: "Failed to resolve complaint" error**
- Check backend console for detailed error
- Verify database migration ran: `node backend/run-resolution-migration.js`
- Check file permissions on backend/uploads/ folder

**Issue: Image not uploading**
- Verify image file is valid (JPG/PNG)
- Check file size (should be < 5MB)
- Try a different image file

**Issue: Button disabled after image selection**
- Ensure image file is selected (not just preview)
- Try selecting image again
- Refresh page and retry

### Database Verification

After successful submission, check database:

```sql
-- Check resolution record
SELECT * FROM complaint_resolutions WHERE complaint_id = 55;

-- Check complaint status
SELECT id, status, resolution_id, resolved_by, resolved_at 
FROM complaints WHERE id = 55;
```

### Files Involved

- Frontend: `frontend/src/components/OfficerDashboard.jsx`
- Backend: `backend/controllers/complaintController.js`
- Database: `complaint_resolutions` table
- Uploads: `backend/uploads/` folder

### Next Steps

After testing:
1. Verify images are saved correctly
2. Check database records
3. Test with multiple complaints
4. Test error scenarios (missing image, etc.)
