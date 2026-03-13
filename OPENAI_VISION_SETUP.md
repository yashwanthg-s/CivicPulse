# OpenAI Vision API Setup - Auto-Detect Category & Priority

## Overview
The system now uses OpenAI Vision API to automatically detect complaint category and priority based on:
1. Image analysis (what's in the photo)
2. Complaint title
3. Complaint description

When a citizen uploads an image, the system automatically fills in the category and priority fields.

## Setup Steps

### Step 1: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the API key

### Step 2: Add API Key to .env

Edit `backend/.env` and replace:
```
OPENAI_API_KEY=your_openai_api_key_here
```

With your actual API key:
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Verify Setup

The system will automatically use OpenAI Vision API when:
- Citizen uploads an image in the complaint form
- Image is analyzed for human faces (blocked if detected)
- Category is auto-detected
- Priority is auto-detected

## How It Works

### Flow Diagram
```
Citizen uploads image + title + description
    ↓
Frontend sends to backend: /api/complaints/validate-image
    ↓
Backend calls OpenAI Vision API with:
  - Base64 encoded image
  - Complaint title
  - Complaint description
    ↓
OpenAI analyzes and returns:
  - human_face_detected (true/false)
  - category (infrastructure|sanitation|traffic|safety|utilities|other)
  - priority (critical|high|medium|low)
  - confidence_score (0-100)
    ↓
If human face detected → Block image
If no human face → Auto-fill category & priority in form
    ↓
Citizen can review and submit
```

## Categories Detected

- **infrastructure**: roads, bridges, streetlights, buildings, water systems, potholes, cracks
- **sanitation**: garbage, waste, cleanliness, sewage, dirt, litter
- **traffic**: traffic signals, road markings, congestion, accidents, vehicles
- **safety**: hazards, dangerous conditions, security issues, broken barriers
- **utilities**: electricity, water, gas, power lines, outages
- **other**: if unclear

## Priority Levels

- **critical**: immediate danger, emergency, life-threatening, blocking roads
- **high**: significant damage, affects many people, urgent, major issue
- **medium**: moderate issue, affects some people, noticeable problem
- **low**: minor issue, cosmetic, can wait, small damage

## API Endpoint

**POST** `/api/complaints/validate-image`

**Request Body**:
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "title": "Broken streetlight",
  "description": "The streetlight on Main Street is not working"
}
```

**Response**:
```json
{
  "success": true,
  "valid": true,
  "message": "Image analysis successful",
  "category": "infrastructure",
  "priority": "high",
  "confidence": 85,
  "detected_issue": "Broken streetlight pole"
}
```

## Frontend Integration

The `ComplaintForm.jsx` component automatically:
1. Calls the validation endpoint when image is uploaded
2. Receives category and priority from OpenAI
3. Auto-fills the form fields
4. Shows loading indicator while analyzing

## Fallback Behavior

If OpenAI API fails:
- System uses keyword-based fallback categorization
- Complaint can still be submitted
- User can manually select category if needed

## Cost Considerations

OpenAI Vision API pricing:
- $0.01 per image (low resolution)
- $0.03 per image (high resolution)

For cost optimization:
- Images are compressed before sending
- Fallback categorization available if API fails
- Consider rate limiting for high-volume usage

## Troubleshooting

### Issue: "OPENAI_API_KEY not configured"
**Solution**: 
1. Check `.env` file has `OPENAI_API_KEY` set
2. Restart backend server
3. Verify API key is valid

### Issue: "Could not parse OpenAI response"
**Solution**:
1. Check OpenAI API status
2. Verify API key has vision permissions
3. Check image format (must be valid JPEG/PNG)

### Issue: Image analysis is slow
**Solution**:
1. OpenAI Vision API can take 5-10 seconds
2. Frontend shows loading indicator
3. Consider caching results for similar images

### Issue: Wrong category detected
**Solution**:
1. User can manually override auto-detected category
2. Provide more detailed title/description
3. Ensure image clearly shows the issue

## Testing

### Test Scenario 1: Infrastructure Issue
1. Upload image of pothole
2. Title: "Large pothole on Main Street"
3. Description: "Dangerous pothole causing accidents"
4. Expected: category=infrastructure, priority=high

### Test Scenario 2: Sanitation Issue
1. Upload image of garbage
2. Title: "Garbage pile in park"
3. Description: "Trash not collected for days"
4. Expected: category=sanitation, priority=medium

### Test Scenario 3: Human Face Detection
1. Upload selfie or image with person's face
2. Expected: Image blocked with message "Image contains human"

## Files Modified

- `backend/services/openaiVisionService.js` - New OpenAI Vision service
- `backend/controllers/complaintController.js` - Updated to use OpenAI
- `frontend/src/components/ComplaintForm.jsx` - Auto-fill on image upload
- `backend/.env` - Added OPENAI_API_KEY

## Next Steps

1. Add your OpenAI API key to `.env`
2. Restart backend server
3. Test by uploading an image in complaint form
4. Verify category and priority are auto-filled

## Support

For OpenAI API issues:
- Visit: https://platform.openai.com/docs/guides/vision
- Check API status: https://status.openai.com
- Contact OpenAI support for account issues
