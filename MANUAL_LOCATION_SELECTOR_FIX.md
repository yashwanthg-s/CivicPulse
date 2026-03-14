# Manual Location Selector - Null Reference Error Fixed

## Problem
Console error: `TypeError: Cannot read properties of null (reading 'lat')`

This occurred when the ManualLocationSelector component received a null `initialLocation` prop and tried to access properties on it.

## Root Cause
The component was trying to use `initialLocation` directly as an array without checking if it was null or had valid latitude/longitude properties:

```javascript
// WRONG - fails if initialLocation is null
const defaultCenter = initialLocation || [13.0827, 80.2707];
```

When `initialLocation` was null, it would try to use null as the center, causing errors.

## Solution Implemented

**File**: `frontend/src/components/ManualLocationSelector.jsx`

Added proper null checks before accessing properties:

```javascript
// CORRECT - checks for null and valid properties
const defaultCenter = (initialLocation && initialLocation.latitude && initialLocation.longitude) 
  ? [initialLocation.latitude, initialLocation.longitude]
  : [13.0827, 80.2707]; // Default to Chennai
```

Also added checks before using initialLocation:
```javascript
// CORRECT - checks before accessing properties
if (initialLocation && initialLocation.latitude && initialLocation.longitude) {
  updateMarker(mapInstance, initialLocation.latitude, initialLocation.longitude);
}
```

## What Changed
- Added null safety checks for `initialLocation` object
- Validates both `latitude` and `longitude` properties exist before using them
- Falls back to Chennai default coordinates if no valid location provided

## Testing

### Step 1: Refresh the page
The console errors should be gone.

### Step 2: Test complaint submission
1. Go to complaint form
2. Upload/capture photo without GPS
3. Manual location selector should appear without errors
4. Click on map to select location
5. Should work smoothly now

### Step 3: Verify in console
- No more "Cannot read properties of null" errors
- Map loads correctly
- Location selection works

## Files Modified
- `frontend/src/components/ManualLocationSelector.jsx` - Added null safety checks

## Success Indicators
✅ No console errors when opening manual location selector
✅ Map loads with default Chennai location when no GPS data
✅ Can click on map to select location
✅ Location coordinates display correctly
✅ Complaint submission works with manual location

## Related Components
- `ComplaintForm.jsx` - Shows manual location selector when no GPS found
- `CameraCapture.jsx` - Captures photos for EXIF extraction
- `ExifLocationDisplay.jsx` - Shows extracted GPS coordinates
