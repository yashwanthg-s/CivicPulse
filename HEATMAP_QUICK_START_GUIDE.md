# Heatmap Feature - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Start Backend
```bash
cd backend
npm start
# Runs on http://localhost:5003
```

### Step 3: Start Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173 (or similar)
```

## 📍 Access the Heatmap

1. Open admin dashboard
2. Click the **"🔥 Heat Map"** tab
3. You should see an interactive map with complaint hotspots

## 🎨 What You'll See

- **Map**: Centered on Bangalore with OpenStreetMap tiles
- **Colored Circles**: Each represents a cluster of complaints
  - 🟢 Green: 1-2 complaints (Low)
  - 🟡 Yellow: 3-5 complaints (Medium)
  - 🟠 Orange: 6-10 complaints (High)
  - 🔴 Red: 10+ complaints (Critical)
- **Heatmap Layer**: Smooth color gradient overlay
- **Metrics**: Total complaints, hotspot areas, max density, coverage area

## 🎛️ Controls

- **Category Filter**: Select complaint type (All, Garbage, Road Damage, etc.)
- **Time Period**: Choose date range (7, 30, 90, 365 days)
- **Refresh Button**: Manually update data
- **Click Markers**: View complaint details in popup

## ✅ Verification Checklist

- [ ] Backend running on port 5003
- [ ] Frontend running on port 5173
- [ ] Admin dashboard loads
- [ ] Heat Map tab is visible
- [ ] Map displays with Bangalore center
- [ ] Clusters appear as colored circles
- [ ] Metrics show correct numbers
- [ ] Filters work (category and time period)
- [ ] Clicking markers shows popup
- [ ] Refresh button updates data

## 🔧 Troubleshooting

**Map not loading?**
- Check backend is running: `curl http://localhost:5003/api/admin/heatmap`
- Check browser console for errors
- Verify VITE_API_URL in frontend/.env

**No clusters showing?**
- Ensure database has complaints with valid coordinates
- Check API response: `curl "http://localhost:5003/api/admin/heatmap?category=all&days=30"`
- Try changing time period filter

**Leaflet error?**
- Run `npm install` in frontend directory
- Clear node_modules and reinstall if needed

## 📊 Expected API Response

```bash
curl "http://localhost:5003/api/admin/heatmap?category=all&days=30"
```

Should return:
```json
{
  "success": true,
  "data": {
    "clusters": [
      {
        "latitude": 12.9716,
        "longitude": 77.5946,
        "count": 4,
        "complaints": [...]
      }
    ],
    "metrics": {
      "totalComplaints": 45,
      "hotspotAreas": 8,
      "maxDensity": 12,
      "coverageArea": "0.05° × 0.08°"
    }
  }
}
```

## 🎯 Key Features

✅ Interactive Leaflet.js map
✅ Real-time heatmap visualization
✅ Geographic clustering (200m radius)
✅ Category filtering
✅ Time period filtering
✅ Metrics dashboard
✅ Responsive design
✅ Popup details on click
✅ Color intensity legend
✅ Automatic bounds fitting

## 📝 Notes

- Heatmap updates every time you change filters
- Clusters are calculated server-side for performance
- Map is centered on Bangalore (12.9716, 77.5946)
- Intensity based on complaint count in cluster
- Only complaints with valid coordinates are shown
- Hotspot = cluster with 3+ complaints

## 🎓 How It Works

1. **User selects filters** → Category and time period
2. **Frontend calls API** → `/api/admin/heatmap?category=X&days=Y`
3. **Backend clusters** → Groups complaints by 200m radius
4. **Returns data** → Cluster coordinates and metrics
5. **Frontend renders** → Leaflet heatmap with markers
6. **User interacts** → Click markers for details

## 📱 Responsive Design

- **Desktop**: Full-size map (600px height)
- **Tablet**: Flexible layout
- **Mobile**: Compact controls (400px height)

## 🔐 Security

- Admin verification on API endpoint
- No sensitive data in responses
- Location data aggregated (cluster centers only)
- Complaint details limited to: id, title, category, priority, status

---

**Ready to test?** Start with Step 1 above! 🚀
