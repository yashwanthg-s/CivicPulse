# Officer Resolution Workflow - Visual Guide

## 🎯 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    OFFICER DASHBOARD                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Assigned Complaints (Infrastructure)                     │   │
│  │                                                           │   │
│  │ ┌─────────────────────────────────────────────────────┐  │   │
│  │ │ Pothole on Main Street                              │  │   │
│  │ │ 📍 12.9716° N, 77.5946° E                           │  │   │
│  │ │ 📅 2024-01-15 10:30 AM                              │  │   │
│  │ │ Status: 🟠 In Progress                              │  │   │
│  │ └─────────────────────────────────────────────────────┘  │   │
│  │                                                           │   │
│  │ ┌─────────────────────────────────────────────────────┐  │   │
│  │ │ Broken Street Light                                 │  │   │
│  │ │ 📍 12.9720° N, 77.5950° E                           │  │   │
│  │ │ 📅 2024-01-15 11:00 AM                              │  │   │
│  │ │ Status: 🟡 Assigned                                 │  │   │
│  │ └─────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  [📋 Active Complaints] [📜 View History]                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    (Click on complaint)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLAINT DETAILS                             │
│                                                                   │
│  Title: Pothole on Main Street                                  │
│  Description: Large pothole causing traffic issues              │
│  Category: Infrastructure                                        │
│  Status: 🟠 In Progress                                          │
│                                                                   │
│  📸 Captured Image: [Original complaint photo]                  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Update Status                                            │   │
│  │                                                          │   │
│  │ New Status: [🟢 Resolved ▼]                             │   │
│  │ Message: [Optional message...]                          │   │
│  │                                                          │   │
│  │ [📸 Upload Resolution Images]                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                  (Click Upload Resolution Images)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              WORK PROGRESS DOCUMENTATION                         │
│                                                                   │
│  Upload an image showing the completed work to mark this        │
│  complaint as resolved.                                          │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1️⃣ ORIGINAL ISSUE - Citizen's Photo                     │   │
│  │    ✓ Auto-displayed                                      │   │
│  │                                                          │   │
│  │    [Original complaint image displayed here]            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 2️⃣ COMPLETED WORK - Your Photo                          │   │
│  │    Upload image showing completed work                  │   │
│  │                                                          │   │
│  │    [Choose File] [Browse...]                            │   │
│  │                                                          │   │
│  │    [After image preview appears here]                   │   │
│  │    ✓ After image uploaded                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 3️⃣ WORK NOTES (Optional)                                │   │
│  │                                                          │   │
│  │    [Fixed pothole with asphalt, smoothed edges...]     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Progress: ✓ Original Image  ✓ After Image                      │
│                                                                   │
│  [✓ Submit Resolution] [✕ Cancel]                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    (Click Submit Resolution)
                              ↓
                    ✅ SUCCESS ALERT
        "Complaint resolved successfully!
         Click 'View History' to see all resolved complaints."
                              ↓
                    (Complaint disappears from
                     active list and refreshes)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    OFFICER DASHBOARD                             │
│                                                                   │
│  Assigned Complaints (Infrastructure)                           │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Broken Street Light                                     │   │
│  │ 📍 12.9720° N, 77.5950° E                               │   │
│  │ 📅 2024-01-15 11:00 AM                                  │   │
│  │ Status: 🟡 Assigned                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  [📋 Active Complaints] [📜 View History]                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    (Click View History)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              CATEGORY HISTORY - INFRASTRUCTURE                   │
│                                                                   │
│  Status Filters:                                                 │
│  [🔴 Open] [🟡 Assigned] [🟠 In Progress] [🟢 Resolved] ...     │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Pothole on Main Street                                  │   │
│  │ 🟢 Resolved                                              │   │
│  │ 📅 2024-01-15 10:30 AM                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Broken Sidewalk                                         │   │
│  │ 🟢 Resolved                                              │   │
│  │ 📅 2024-01-14 09:15 AM                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    (Click on resolved complaint)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              RESOLVED COMPLAINT DETAILS                          │
│                                                                   │
│  Title: Pothole on Main Street                                  │
│  Description: Large pothole causing traffic issues              │
│  Status: 🟢 Resolved                                             │
│                                                                   │
│  📸 Original Image: [Citizen's complaint photo]                 │
│                                                                   │
│  📸 Resolution Image: [Officer's after photo]                   │
│                                                                   │
│  📝 Work Notes: Fixed pothole with asphalt, smoothed edges      │
│                                                                   │
│  📅 Timeline:                                                    │
│     Submitted: 2024-01-15 10:30 AM                              │
│     Resolved: 2024-01-15 02:45 PM                               │
│                                                                   │
│  📍 Location:                                                    │
│     Latitude: 12.9716                                            │
│     Longitude: 77.5946                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Status Progression

```
COMPLAINT LIFECYCLE:

submitted (🔴 Open)
    ↓
under_review (🟡 Assigned)
    ↓
in_progress (🟠 In Progress)
    ↓
resolved (🟢 Resolved) ← Officer uploads image here
    ↓
verified (✅ Verified) ← Admin verifies (optional)
    ↓
closed (✓ Closed)

OR

rejected (❌ Rejected) ← Officer can reject at any stage
```

---

## 🔄 Data Flow

```
FRONTEND                          BACKEND                    DATABASE
─────────────────────────────────────────────────────────────────────

Officer selects
complaint
    ↓
Officer clicks
"Upload Resolution
Images"
    ↓
Officer uploads
image & notes
    ↓
Officer clicks
"Submit Resolution"
    ↓
Frontend converts
image to base64
    ↓
Frontend sends
PUT request
    ├─ complaint_id
    ├─ officer_id
    ├─ after_image (base64)
    └─ resolution_notes
                              Backend receives
                              request
                                  ↓
                              Validates data
                                  ↓
                              Saves image to
                              /uploads/ directory
                                  ↓
                              Creates record in
                              complaint_resolutions
                                  ├─ complaint_id
                                  ├─ officer_id
                                  ├─ after_image_path
                                  └─ resolution_notes
                                                          INSERT INTO
                                                          complaint_resolutions
                                                          ↓
                                                          ✓ Record created
                                  ↓
                              Updates complaints
                              table
                                  ├─ status = 'resolved'
                                  ├─ resolution_id
                                  ├─ resolved_by
                                  └─ resolved_at
                                                          UPDATE complaints
                                                          ↓
                                                          ✓ Status updated
                                  ↓
                              Sends success
                              response
    ↓
Frontend receives
success response
    ↓
Frontend shows
success alert
    ↓
Frontend calls
fetchComplaints()
    ↓
Complaint removed
from active list
    ↓
User clicks
"View History"
    ↓
Frontend fetches
complaints with
status = 'resolved'
                              Backend queries
                              complaints table
                              WHERE status = 'resolved'
                                                          SELECT * FROM
                                                          complaints
                                                          WHERE status = 'resolved'
                                                          ↓
                                                          Returns resolved
                                                          complaints
                              ↓
                              Returns data
    ↓
Frontend displays
resolved complaints
in history
    ↓
User clicks on
resolved complaint
    ↓
Frontend displays
original image +
resolution image
```

---

## 🎨 UI Components

### Active Complaints List
```
┌─ Complaint Item ─────────────────────────────────┐
│ Title: Pothole on Main Street                    │
│ Status: 🟠 In Progress                           │
│ 📍 12.9716° N, 77.5946° E                        │
│ 📅 2024-01-15 10:30 AM                           │
└──────────────────────────────────────────────────┘
```

### Resolution Workflow
```
Step 1: Original Image (Auto-displayed)
┌─────────────────────────────────┐
│ [Citizen's complaint photo]      │
│ ✓ Auto-displayed                │
└─────────────────────────────────┘

Step 2: After Image (Officer uploads)
┌─────────────────────────────────┐
│ [Choose File] [Browse...]       │
│ [Officer's after photo]         │
│ ✓ After image uploaded          │
└─────────────────────────────────┘

Step 3: Notes (Optional)
┌─────────────────────────────────┐
│ [Fixed pothole with asphalt...] │
└─────────────────────────────────┘

Progress: ✓ Original  ✓ After
```

### History View
```
Status Filters:
[🔴 Open] [🟡 Assigned] [🟠 In Progress] [🟢 Resolved]

Resolved Complaints:
┌─ Complaint Item ─────────────────────────────────┐
│ Pothole on Main Street                           │
│ 🟢 Resolved                                       │
│ 📅 2024-01-15 10:30 AM                           │
└──────────────────────────────────────────────────┘
```

---

## ✨ Key Interactions

| Action | Result |
|--------|--------|
| Select complaint | Shows complaint details |
| Change status to "Resolved" | Shows resolution workflow |
| Upload image | Image preview appears |
| Submit resolution | Complaint moves to history |
| Click "View History" | Shows resolved complaints |
| Click resolved complaint | Shows resolution details |

---

## 🎯 Success Indicators

✅ Complaint disappears from active list
✅ Success alert appears
✅ Resolved complaint appears in history
✅ Resolution image displays correctly
✅ Officer ID recorded in database
✅ Timestamp recorded for SLA tracking

---

**This visual guide shows the complete user journey from complaint selection to viewing in history.**
