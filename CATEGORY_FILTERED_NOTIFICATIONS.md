# Category-Filtered Notifications Feature

## Overview
When an officer selects a category filter (e.g., "Utilities"), the notification bell now only displays complaints from that selected category.

## How It Works

### User Flow

1. **Officer opens dashboard**
   - Default category: Infrastructure
   - Notification bell shows Infrastructure complaints only

2. **Officer changes category filter**
   - Selects "Utilities" from category dropdown
   - Notification bell automatically updates
   - Now shows only Utilities complaints

3. **Notification bell displays filtered complaints**
   - Shows only complaints matching selected category
   - Unread count reflects only selected category
   - Clicking notification opens that complaint

## Implementation Details

### Frontend Changes

**File**: `frontend/src/components/OfficerDashboard.jsx`
- Pass `selectedCategory={filters.category}` to OfficerNotificationBell component
- Category filter state already exists: `filters.category`

**File**: `frontend/src/components/OfficerNotificationBell.jsx`
- Accept new prop: `selectedCategory`
- Pass category to API: `?officer_id=${officerId}&category=${selectedCategory}`
- Re-fetch notifications when category changes
- Updated useEffect dependency: `[officerId, selectedCategory]`

### Backend Changes

**File**: `backend/controllers/notificationController.js`
- Method: `getCategoryBasedNotifications()`
- Accept category query parameter: `req.query.category`
- Filter notifications to only selected category
- If category is provided and valid, use only that category
- Otherwise, show all officer's assigned categories

### API Endpoint

**GET** `/api/notifications/officer/category/notifications`

**Query Parameters**:
- `officer_id` (required): Officer ID
- `category` (optional): Specific category to filter by

**Example Requests**:
```
# Get all notifications for officer
/api/notifications/officer/category/notifications?officer_id=4

# Get only Utilities notifications for officer
/api/notifications/officer/category/notifications?officer_id=4&category=utilities

# Get only Infrastructure notifications for officer
/api/notifications/officer/category/notifications?officer_id=4&category=infrastructure
```

**Response**:
```json
{
  "success": true,
  "count": 3,
  "unread_count": 2,
  "notifications": [
    {
      "complaint_id": 1,
      "complaint_title": "Water pipeline leakage",
      "category": "utilities",
      "complaint_status": "submitted",
      "latitude": "28.7041",
      "longitude": "77.1025",
      "created_at": "2024-01-15T10:30:00Z",
      "citizen_name": "John Doe",
      "is_read": false
    },
    ...
  ]
}
```

## Features

✅ **Dynamic Filtering**
- Notifications update when category changes
- No page refresh needed
- Smooth user experience

✅ **Accurate Counts**
- Unread count reflects only selected category
- Badge shows correct number

✅ **Category Validation**
- Only shows categories officer is assigned to
- Prevents unauthorized access

✅ **Real-time Updates**
- Polls every 30 seconds
- Fetches new notifications for selected category

## Testing

### Test Case 1: Infrastructure Category
1. Officer selects "Infrastructure" category
2. Notification bell shows Infrastructure complaints only
3. Unread count shows only Infrastructure notifications
4. Clicking notification opens Infrastructure complaint

### Test Case 2: Utilities Category
1. Officer selects "Utilities" category
2. Notification bell shows Utilities complaints only
3. Unread count shows only Utilities notifications
4. Clicking notification opens Utilities complaint

### Test Case 3: Category Change
1. Officer viewing Infrastructure notifications
2. Changes category to "Sanitation"
3. Notification bell updates immediately
4. Shows only Sanitation complaints
5. Unread count updates

### Test Case 4: Multiple Categories
1. Officer assigned to: Infrastructure, Utilities, Traffic
2. Selects "Infrastructure" → shows Infrastructure only
3. Selects "Utilities" → shows Utilities only
4. Selects "Traffic" → shows Traffic only

## Database Query

The backend uses this query to fetch filtered notifications:

```sql
SELECT 
  c.id as complaint_id,
  c.title as complaint_title,
  c.category,
  c.status as complaint_status,
  c.latitude,
  c.longitude,
  c.created_at,
  u.name as citizen_name,
  CASE WHEN cn.id IS NOT NULL THEN TRUE ELSE FALSE END as is_read
FROM complaints c
JOIN users u ON c.user_id = u.id
LEFT JOIN category_notifications cn ON c.id = cn.complaint_id AND cn.officer_id = ?
WHERE c.category IN (?)  -- Filtered by selected category
AND c.status = 'submitted'
ORDER BY c.created_at DESC
LIMIT 50
```

## Performance

- **Query Time**: ~50-100ms (with proper indexing)
- **Polling Interval**: 30 seconds
- **Max Notifications**: 50 per request
- **Unread Count**: Calculated in-memory

## Future Enhancements

- [ ] Add "All Categories" option to show all notifications
- [ ] Add category-specific notification sounds
- [ ] Add notification preferences per category
- [ ] Add notification history/archive
- [ ] Add notification search/filter

## Troubleshooting

### Notifications Not Updating
- Check if category filter is changing
- Verify officer is assigned to selected category
- Check browser console for errors

### Wrong Notifications Showing
- Verify category parameter is being sent
- Check backend logs for query
- Ensure officer_categories table has correct data

### Unread Count Wrong
- Clear browser cache
- Refresh page
- Check category_notifications table

## Files Modified

1. `frontend/src/components/OfficerDashboard.jsx`
   - Added `selectedCategory` prop to OfficerNotificationBell

2. `frontend/src/components/OfficerNotificationBell.jsx`
   - Added `selectedCategory` prop
   - Updated API call to include category
   - Updated useEffect dependency

3. `backend/controllers/notificationController.js`
   - Updated `getCategoryBasedNotifications()` method
   - Added category filtering logic
