# Quick Start - Officer Resolution Workflow

## 🚀 Get Started in 3 Steps

### Step 1: Run Database Migration
```bash
cd backend
node run-resolution-migration.js
```
✅ Creates complaint_resolutions table and adds columns to complaints table

### Step 2: Restart Backend
```bash
npm start
```
✅ Backend runs on port 5003

### Step 3: Hard Refresh Frontend
- Press `Ctrl + Shift + R` in browser
✅ Loads latest code

---

## 📸 How to Resolve a Complaint

### As an Officer:

1. **Login** → Enter officer credentials
2. **Select Complaint** → Click on any complaint in the list
3. **Change Status** → Select "🟢 Resolved" from dropdown
4. **Upload Image** → Click "📸 Upload Resolution Images"
5. **Upload After Image** → Select image from your computer
   - Can be phone photo, screenshot, or any image file
6. **Add Notes** (Optional) → Describe the work done
7. **Submit** → Click "✓ Submit Resolution"
8. **Success!** → See "Complaint resolved successfully!" message

---

## 📜 View Resolved Complaints

1. Click **"📜 View History"** button
2. See all resolved complaints in the selected category
3. Click on any complaint to view:
   - Original complaint image
   - Resolution details
   - Timeline and location

---

## ✅ What Gets Saved

When you resolve a complaint:
- ✅ After image saved to disk
- ✅ Resolution notes stored in database
- ✅ Officer ID recorded (for accountability)
- ✅ Timestamp recorded (for SLA tracking)
- ✅ Complaint status changed to "resolved"
- ✅ Complaint moved to history

---

## 🎯 Key Points

| Item | Details |
|------|---------|
| **HTTP Method** | PUT (not POST) |
| **Endpoint** | `/api/complaints/{id}/resolve` |
| **Required** | After image only |
| **Optional** | Resolution notes |
| **Image Types** | JPG, PNG, any image format |
| **Image Size** | Recommended under 5MB |
| **Storage** | `/backend/uploads/` directory |

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| 500 Error | Run migration: `node backend/run-resolution-migration.js` |
| Complaint doesn't disappear | Hard refresh: `Ctrl + Shift + R` |
| Can't see in history | Click "View History" and check status filter |
| Image upload fails | Ensure image file is valid (JPG, PNG, etc.) |
| Backend won't start | Check port 5003 is not in use |

---

## 📋 Database Verification

Check if resolution was saved:
```sql
-- View resolved complaint
SELECT * FROM complaints WHERE id = 55 AND status = 'resolved';

-- View resolution details
SELECT * FROM complaint_resolutions WHERE complaint_id = 55;

-- View all resolved complaints
SELECT * FROM complaints WHERE status = 'resolved';
```

---

## 🎓 Example Workflow

**Scenario**: Officer resolves a pothole complaint

1. Officer logs in
2. Sees complaint: "Pothole on Main Street"
3. Clicks on complaint
4. Selects status "🟢 Resolved"
5. Clicks "📸 Upload Resolution Images"
6. Uploads photo showing fixed pothole
7. Adds notes: "Fixed pothole with asphalt, smoothed edges"
8. Clicks "✓ Submit Resolution"
9. Sees success message
10. Complaint disappears from active list
11. Officer clicks "📜 View History"
12. Sees resolved complaint with status "🟢 Resolved"
13. Clicks on it to view original image and resolution image

---

## ✨ Features

✅ Simple 3-step workflow
✅ Any image file works (phone photo, screenshot, etc.)
✅ Optional notes for work description
✅ Automatic history display
✅ Audit trail with officer ID and timestamp
✅ Easy access to resolved complaints

---

## 📞 Need Help?

1. Check backend logs for error messages
2. Verify database migration completed
3. Hard refresh browser
4. Check that uploads directory exists
5. Verify database connection is working

---

**Status**: ✅ Ready to Use

All fixes have been applied. The resolution workflow is fully functional!
