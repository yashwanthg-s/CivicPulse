# Geo-Tagged Complaint System

A comprehensive web application for citizens to submit verified complaints with live camera photos, GPS location, and automatic timestamps. Officers can review, filter, and manage complaints through an intuitive dashboard.

## Key Features

### For Citizens
- **Live Camera Capture**: Capture photos directly from device camera (no gallery uploads)
- **GPS Location**: Automatic GPS coordinate capture with accuracy info
- **Auto Timestamp**: Automatic date and time recording (user cannot edit)
- **Form Validation**: Ensures all required data is captured before submission
- **Mobile Friendly**: Works on smartphones and tablets

### For Officers
- **Complaint Dashboard**: View all submitted complaints
- **Advanced Filtering**: Filter by status, category, and priority
- **Geo-Location Viewing**: Click to view complaint location on Google Maps
- **Status Management**: Update complaint status and add messages
- **Evidence Review**: View captured photos and location details

### Security Features
- Live camera capture only (prevents fake uploads)
- GPS location verification
- Automatic timestamp (prevents backdating)
- File upload validation (images only)
- Coordinate validation
- CORS protection

## Technology Stack

- **Frontend**: React.js with Vite
- **Backend**: Node.js with Express
- **AI Service**: Python FastAPI
- **Database**: MySQL
- **APIs**: Browser MediaDevices API, Geolocation API, Google Maps

## Quick Start

### Prerequisites
- Node.js 16+
- Python 3.8+
- MySQL 5.7+

### Installation

1. **Clone and Setup**
```bash
# Database
mysql -u root -p < database/schema.sql

# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# AI Service (new terminal)
cd ai-service
pip install -r requirements.txt
python main.py

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

2. **Access Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- AI Service: http://localhost:8000

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  ┌──────────────────┐  ┌──────────────────────────────┐ │
│  │ Complaint Form   │  │  Officer Dashboard           │ │
│  │ - Camera Capture │  │  - View Complaints           │ │
│  │ - GPS Location   │  │  - Filter & Search           │ │
│  │ - Auto DateTime  │  │  - Update Status             │ │
│  └──────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Node.js Express Backend                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │ REST API Endpoints                               │   │
│  │ - POST /api/complaints (submit)                  │   │
│  │ - GET /api/complaints (list)                     │   │
│  │ - PATCH /api/complaints/:id/status (update)      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         ↓                              ↓
    ┌─────────────┐          ┌──────────────────┐
    │   MySQL     │          │ Python FastAPI   │
    │  Database   │          │  AI Service      │
    │             │          │  - Categorize    │
    │ - Complaints│          │  - Analyze       │
    │ - Users     │          │  - Validate      │
    │ - Updates   │          └──────────────────┘
    └─────────────┘
```

## API Documentation

### Submit Complaint
```
POST /api/complaints
Content-Type: multipart/form-data

{
  "title": "Pothole on Main Street",
  "description": "Large pothole causing accidents",
  "category": "infrastructure",
  "priority": "high",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "date": "2024-03-12",
  "time": "14:30:00",
  "image": <file>
}

Response:
{
  "success": true,
  "id": 1,
  "complaint": { ... }
}
```

### Get Complaints
```
GET /api/complaints?status=submitted&category=infrastructure&priority=high

Response:
{
  "success": true,
  "count": 5,
  "complaints": [ ... ]
}
```

### Update Status
```
PATCH /api/complaints/:id/status
Content-Type: application/json

{
  "status": "under_review",
  "message": "Officer assigned to investigate"
}

Response:
{
  "success": true,
  "message": "Complaint status updated"
}
```

## Database Schema

### Complaints Table
```sql
CREATE TABLE complaints (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(10, 8) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  category VARCHAR(100),
  priority ENUM('low', 'medium', 'high', 'critical'),
  status ENUM('submitted', 'under_review', 'resolved', 'rejected'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── CameraCapture.jsx
│   │   ├── ComplaintForm.jsx
│   │   ├── LocationDisplay.jsx
│   │   └── OfficerDashboard.jsx
│   ├── services/
│   │   ├── cameraService.js
│   │   ├── locationService.js
│   │   └── complaintService.js
│   ├── styles/
│   └── App.jsx

backend/
├── routes/
│   └── complaints.js
├── controllers/
│   └── complaintController.js
├── models/
│   └── Complaint.js
├── middleware/
│   └── upload.js
├── config/
│   └── database.js
└── server.js

ai-service/
├── models/
│   └── categorizer.py
└── main.py
```

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- Image compression (JPEG 90% quality)
- Database indexing on location fields
- Pagination for complaint lists
- Lazy loading for images
- Caching for category data

## Future Enhancements

- Real-time notifications
- Complaint tracking via SMS/Email
- Advanced analytics dashboard
- Machine learning for priority prediction
- Multi-language support
- Offline mode with sync
- Video capture support
- Complaint clustering by location

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please refer to SETUP.md or contact the development team.
