# Location Verification - Quick Reference

## 🎯 The Feature

When officer resolves complaint, system checks if officer's location matches citizen's location.

---

## How It Works

```
Citizen Location: 12.345678, 77.654321
Officer Location: 12.345700, 77.654340
Distance: 3 meters
Tolerance: 100 meters

Result: ✅ VERIFIED
```

---

## Verification Status

### ✅ VERIFIED
- Officer's location is within 100 meters of complaint location
- Work was done at correct location
- Green badge

### ⚠️ NOT VERIFIED
- Officer's location is more than 100 meters away
- Work might be at different location
- Orange badge

---

## Database

### New Columns
```sql
location_verified BOOLEAN      -- TRUE if verified, FALSE otherwise
location_distance_km DECIMAL   -- Distance in kilometers
```

### Query Verified Resolutions
```sql
SELECT * FROM complaint_resolutions WHERE location_verified = TRUE;
```

---

## API Response

```json
{
  "verification": {
    "verified": true,
    "distance": 0.003,
    "tolerance": 0.1,
    "reason": "Location verified (0.003 km from complaint location)"
  }
}
```

---

## Backend Logs

```
Verifying location...
✓ Location verification: VERIFIED
  Distance: 0.003 km
  Reason: Location verified (0.003 km from complaint location)
```

---

## Tolerance

**Default**: 0.1 km (100 meters)

| Tolerance | Distance | Meaning |
|-----------|----------|---------|
| 0.01 km | 10 m | Strict |
| 0.1 km | 100 m | Normal (default) |
| 0.5 km | 500 m | Lenient |

---

## Scenarios

### Scenario 1: Same Location ✅
```
Citizen: 12.345678, 77.654321
Officer: 12.345678, 77.654321
Distance: 0 m
Result: ✅ VERIFIED
```

### Scenario 2: Nearby ✅
```
Citizen: 12.345678, 77.654321
Officer: 12.345700, 77.654340
Distance: 3 m
Result: ✅ VERIFIED
```

### Scenario 3: Far Away ⚠️
```
Citizen: 12.345678, 77.654321
Officer: 12.346678, 77.655321
Distance: 150 m
Result: ⚠️ NOT VERIFIED
```

### Scenario 4: No GPS ✅
```
Citizen: 12.345678, 77.654321
Officer: Screenshot (no GPS)
Falls back to: Complaint location
Distance: 0 m
Result: ✅ VERIFIED
```

---

## Files Modified

### Backend
- `backend/controllers/complaintController.js` - Added verification logic
- `backend/run-resolution-migration.js` - Added new columns
- `backend/services/locationVerificationService.js` - NEW service

### Database
- `complaint_resolutions` table - Added 2 new columns

---

## Testing

```
1. Run migration: node backend/run-resolution-migration.js
2. Restart backend: npm start
3. Test with verified location
4. Test with not verified location
5. Check database for verification status
```

---

## Summary

✅ Automatically verifies officer location
✅ Uses Haversine formula for accuracy
✅ Configurable tolerance (100m default)
✅ Stores verification status
✅ Returns verification in API response
✅ Handles edge cases

