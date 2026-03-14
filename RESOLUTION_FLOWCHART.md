# Officer Resolution - Simple Flowchart

## 🎯 Main Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    OFFICER DASHBOARD                            │
│                                                                 │
│  Officer logs in and sees list of assigned complaints           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   OFFICER SELECTS COMPLAINT                     │
│                                                                 │
│  Complaint details appear:                                      │
│  - Citizen's original image                                    │
│  - Title, description, location                                │
│  - Date, time, category, status                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              OFFICER CLICKS "UPDATE STATUS"                     │
│                                                                 │
│  Dropdown appears with status options:                          │
│  - Open                                                         │
│  - Assigned                                                     │
│  - In Progress                                                  │
│  - Resolved ← Officer selects this                              │
│  - Rejected                                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         OFFICER CLICKS "UPLOAD RESOLUTION IMAGES"               │
│                                                                 │
│  3-step workflow appears:                                       │
│  1️⃣ Original Issue (auto-displays citizen's image)             │
│  2️⃣ Completed Work (officer uploads after image)               │
│  3️⃣ Work Notes (optional description)                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│           OFFICER UPLOADS "AFTER" IMAGE                         │
│                                                                 │
│  Officer clicks "Choose File"                                   │
│  Selects photo from phone or computer                           │
│  Image preview appears                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         OFFICER ADDS OPTIONAL WORK NOTES                        │
│                                                                 │
│  Officer types description of work done                         │
│  Example: "Fixed pothole with asphalt, smoothed edges"         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│        OFFICER CLICKS "SUBMIT RESOLUTION"                       │
│                                                                 │
│  Frontend prepares data:                                        │
│  - Converts image to base64                                    │
│  - Prepares JSON body with:                                    │
│    * officer_id                                                │
│    * after_image (base64)                                      │
│    * resolution_notes                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         FRONTEND SENDS PUT REQUEST TO BACKEND                   │
│                                                                 │
│  PUT /api/complaints/55/resolve                                 │
│  Content-Type: application/json                                 │
│                                                                 │
│  Body: {                                                        │
│    officer_id: 2,                                               │
│    after_image: "data:image/jpeg;base64,...",                   │
│    resolution_notes: "Fixed pothole..."                         │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND RECEIVES REQUEST                           │
│                                                                 │
│  1. Validate request                                            │
│  2. Get complaint location from database                        │
│  3. Convert base64 to buffer                                   │
│  4. Save image to disk                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         BACKEND EXTRACTS GPS (HYBRID STRATEGY)                  │
│                                                                 │
│  Try to extract GPS from image EXIF                             │
│           ↓                                                     │
│    ┌──────────────────────────────────────┐                    │
│    │ Does image have GPS data?             │                    │
│    └──────────────────────────────────────┘                    │
│           ↙                    ↘                                │
│        YES                      NO                              │
│         ↓                        ↓                              │
│    Use image GPS          Use complaint GPS                     │
│    source: "image"        source: "complaint"                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         BACKEND CREATES RESOLUTION RECORD                       │
│                                                                 │
│  INSERT INTO complaint_resolutions:                             │
│  - complaint_id: 55                                             │
│  - officer_id: 2                                                │
│  - after_image_path: /uploads/resolution-55-after-...jpg        │
│  - resolution_notes: "Fixed pothole..."                         │
│  - resolution_latitude: 12.345678                               │
│  - resolution_longitude: 77.654321                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         BACKEND UPDATES COMPLAINT STATUS                        │
│                                                                 │
│  UPDATE complaints SET:                                         │
│  - status: "resolved"                                           │
│  - resolution_id: 1                                             │
│  - resolved_by: 2                                               │
│  - resolved_at: NOW()                                           │
│  WHERE id = 55                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         BACKEND RETURNS SUCCESS RESPONSE                        │
│                                                                 │
│  {                                                              │
│    "success": true,                                             │
│    "message": "Complaint resolved successfully",                │
│    "resolutionId": 1,                                           │
│    "location": {                                                │
│      "latitude": 12.345678,                                     │
│      "longitude": 77.654321,                                    │
│      "source": "image"                                          │
│    }                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         FRONTEND SHOWS SUCCESS MESSAGE                          │
│                                                                 │
│  ✅ Complaint resolved successfully!                            │
│                                                                 │
│  Click 'View History' to see all resolved complaints.           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         COMPLAINT MOVES TO HISTORY                              │
│                                                                 │
│  - Disappears from "Active Complaints" list                     │
│  - Appears in "History" section                                 │
│  - Shows resolution image and notes                             │
│  - Shows GPS location used                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 GPS Extraction Decision Tree

```
┌─────────────────────────────────────────────────────────────────┐
│              OFFICER UPLOADS AFTER IMAGE                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         BACKEND ATTEMPTS GPS EXTRACTION                         │
│                                                                 │
│  Read image buffer                                              │
│  Parse EXIF metadata                                            │
│  Look for GPS coordinates                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │ GPS Found?      │
                    └─────────────────┘
                         ↙        ↘
                      YES          NO
                       ↓            ↓
        ┌──────────────────────┐  ┌──────────────────────┐
        │ SCENARIO A           │  │ SCENARIO B           │
        │ Phone Photo with GPS │  │ Screenshot/No GPS    │
        └──────────────────────┘  └──────────────────────┘
                 ↓                         ↓
        ┌──────────────────────┐  ┌──────────────────────┐
        │ Extract GPS from     │  │ Fall back to         │
        │ image EXIF           │  │ complaint location   │
        │                      │  │                      │
        │ resolution_latitude  │  │ resolution_latitude  │
        │ = image GPS          │  │ = complaint GPS      │
        │                      │  │                      │
        │ resolution_longitude │  │ resolution_longitude │
        │ = image GPS          │  │ = complaint GPS      │
        │                      │  │                      │
        │ source = "image"     │  │ source = "complaint" │
        └──────────────────────┘  └──────────────────────┘
                 ↓                         ↓
        ┌──────────────────────┐  ┌──────────────────────┐
        │ Backend Logs:        │  │ Backend Logs:        │
        │ ✓ GPS extracted      │  │ ℹ️ No GPS data in    │
        │   from image         │  │    image, using      │
        │                      │  │    complaint location│
        └──────────────────────┘  └──────────────────────┘
                 ↓                         ↓
        ┌──────────────────────┐  ┌──────────────────────┐
        │ API Response:        │  │ API Response:        │
        │ "source": "image"    │  │ "source": "complaint"│
        └──────────────────────┘  └──────────────────────┘
                 ↓                         ↓
        ┌──────────────────────┐  ┌──────────────────────┐
        │ Store accurate GPS   │  │ Store fallback GPS   │
        │ from image           │  │ from complaint       │
        │                      │  │                      │
        │ ✓ Most accurate      │  │ ✓ Always has data    │
        │ ✓ Works offline      │  │ ✓ Reasonable approx  │
        │ ✓ Taken at moment    │  │ ✓ Better than NULL   │
        │   of photo           │  │                      │
        └──────────────────────┘  └──────────────────────┘
                 ↓                         ↓
                 └─────────────┬───────────┘
                               ↓
                ┌──────────────────────────────┐
                │ RESOLUTION STORED WITH GPS   │
                │ (Never NULL - Always has     │
                │  location data)              │
                └──────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│                                                                 │
│  OfficerDashboard.jsx                                           │
│  ├─ Displays complaint list                                     │
│  ├─ Shows complaint details                                     │
│  ├─ Handles image upload                                        │
│  ├─ Converts image to base64                                    │
│  └─ Sends PUT request to backend                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    PUT /api/complaints/:id/resolve
                    Content-Type: application/json
                    Body: {officer_id, after_image, resolution_notes}
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND                                  │
│                                                                 │
│  complaintController.js (resolveComplaint method)               │
│  ├─ Validate request                                            │
│  ├─ Get complaint location                                      │
│  ├─ Convert base64 to buffer                                    │
│  ├─ Save image to disk                                          │
│  ├─ Extract GPS from image                                      │
│  ├─ Fall back to complaint location if needed                   │
│  ├─ Create resolution record                                    │
│  ├─ Update complaint status                                     │
│  └─ Return success response                                     │
│                                                                 │
│  exifParserService.js                                           │
│  ├─ extractExifFromBuffer(buffer)                               │
│  ├─ extractGPS(exifData)                                        │
│  ├─ convertDmsToDecimal()                                       │
│  └─ validateCoordinates()                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Response: {success, resolutionId, location}
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                 │
│                                                                 │
│  complaint_resolutions table                                    │
│  ├─ id (auto-increment)                                         │
│  ├─ complaint_id (foreign key)                                  │
│  ├─ officer_id (foreign key)                                    │
│  ├─ after_image_path                                            │
│  ├─ resolution_notes                                            │
│  ├─ resolution_latitude                                         │
│  ├─ resolution_longitude                                        │
│  └─ resolved_at (timestamp)                                     │
│                                                                 │
│  complaints table (updated)                                     │
│  ├─ status = 'resolved'                                         │
│  ├─ resolution_id (foreign key)                                 │
│  ├─ resolved_by (officer_id)                                    │
│  └─ resolved_at (timestamp)                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│                                                                 │
│  Show success message                                           │
│  Refresh complaint list                                         │
│  Move complaint to history                                      │
│  Display resolved complaint with image and notes                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              OFFICER SUBMITS RESOLUTION                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │ Validation      │
                    └─────────────────┘
                         ↙        ↘
                      PASS        FAIL
                       ↓            ↓
                    Continue    ┌──────────────────┐
                                │ Return Error:    │
                                │ - Missing image  │
                                │ - Missing officer│
                                │ - Invalid data   │
                                └──────────────────┘
                                       ↓
                                Frontend shows error
                                Officer can retry
                              ↓
                    ┌─────────────────┐
                    │ Save Image      │
                    └─────────────────┘
                         ↙        ↘
                      SUCCESS    FAIL
                       ↓            ↓
                    Continue    ┌──────────────────┐
                                │ Return Error:    │
                                │ - Disk full      │
                                │ - Permission     │
                                │ - Invalid format │
                                └──────────────────┘
                                       ↓
                                Frontend shows error
                                Officer can retry
                              ↓
                    ┌─────────────────┐
                    │ Extract GPS     │
                    └─────────────────┘
                         ↙        ↘
                      SUCCESS    FAIL
                       ↓            ↓
                    Use image   Use complaint
                    GPS         GPS (fallback)
                       ↓            ↓
                    Continue    Continue
                              ↓
                    ┌─────────────────┐
                    │ Create Record   │
                    └─────────────────┘
                         ↙        ↘
                      SUCCESS    FAIL
                       ↓            ↓
                    Continue    ┌──────────────────┐
                                │ Return Error:    │
                                │ - DB error       │
                                │ - Constraint     │
                                │ - Connection     │
                                └──────────────────┘
                                       ↓
                                Frontend shows error
                                Officer can retry
                              ↓
                    ┌─────────────────┐
                    │ Update Status   │
                    └─────────────────┘
                         ↙        ↘
                      SUCCESS    FAIL
                       ↓            ↓
                    Return      ┌──────────────────┐
                    Success     │ Return Error:    │
                       ↓        │ - DB error       │
                    Frontend    │ - Constraint     │
                    shows       │ - Connection     │
                    success     └──────────────────┘
                    message            ↓
                                Frontend shows error
                                Officer can retry
```

---

## 📱 Offline Support Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              OFFICER IS OFFLINE                                 │
│                                                                 │
│  No network connection                                          │
│  No internet access                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         OFFICER TAKES PHOTO WITH PHONE CAMERA                   │
│                                                                 │
│  GPS enabled on phone                                           │
│  Phone has GPS signal (works offline)                           │
│  Photo includes GPS coordinates in EXIF                         │
│  GPS data stored IN the image file                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         OFFICER COMPLETES WORK                                  │
│                                                                 │
│  Work is done                                                   │
│  Photo is taken                                                 │
│  GPS is in image file                                           │
│  Still offline                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         OFFICER UPLOADS IMAGE WHEN NETWORK RETURNS              │
│                                                                 │
│  Network connection restored                                    │
│  Officer uploads image to dashboard                             │
│  Image contains GPS data from offline                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         BACKEND EXTRACTS GPS FROM IMAGE                         │
│                                                                 │
│  GPS data is in image file (not from network)                   │
│  No network needed to read EXIF                                 │
│  GPS extraction works even though image was taken offline       │
│  Accurate location stored                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         RESOLUTION STORED WITH ACCURATE GPS                     │
│                                                                 │
│  ✓ Works offline (GPS in image file)                            │
│  ✓ Accurate location (from phone GPS)                           │
│  ✓ No network needed for GPS extraction                         │
│  ✓ Fallback to complaint location if GPS unavailable            │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Success Indicators

```
Resolution Successful When:

✓ Officer can select complaint
✓ Officer can upload after image
✓ Backend saves image to disk
✓ Backend extracts GPS (or falls back)
✓ Resolution record created in database
✓ Complaint status updated to "resolved"
✓ API returns success response
✓ Frontend shows success message
✓ Complaint moves to history
✓ History displays resolved complaint
✓ Resolution image visible in history
✓ Work notes visible in history
✓ GPS location stored correctly
✓ Backend logs show GPS source
✓ API response includes GPS source
```

