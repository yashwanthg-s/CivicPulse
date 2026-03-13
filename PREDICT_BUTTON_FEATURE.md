# Predict Button Feature

## Overview
Citizens can now click a "Predict" button to analyze their complaint and get auto-detected category and priority BEFORE submitting.

## User Flow

### Step 1: Enter Complaint Details
- Citizen enters **Title** (e.g., "Road accident at busy intersection")
- Citizen enters **Description** (e.g., "Two vehicles collided...")
- Citizen captures **Image** (via camera)

### Step 2: Click Predict Button
- Button appears after all three inputs are filled
- Button text: "🔍 Predict Category & Priority"
- Button is disabled until title, description, and image are provided

### Step 3: View Predictions
- System analyzes title + description + image
- Shows predicted **Category** (Infrastructure, Sanitation, Traffic, Safety, Utilities)
- Shows predicted **Priority** (Low, Medium, High, Critical)
- Shows **Confidence** score (0-100%)
- Shows **Detected Issue** description

### Step 4: Submit or Adjust
- If predictions look correct → Click "Submit Complaint"
- If predictions need adjustment → Edit and click "Predict" again
- Form auto-fills with predicted values

## Implementation Details

### Frontend Changes

**File**: `frontend/src/components/ComplaintForm.jsx`

1. **New State Variable**
   ```javascript
   const [predictLoading, setPredictLoading] = useState(false);
   ```

2. **New Handler Function**
   ```javascript
   const handlePredictClick = async () => {
     // Validates title, description, image
     // Calls /api/complaints/validate-image endpoint
     // Updates form with predictions
     // Shows validation result
   }
   ```

3. **New UI Section**
   - Predict button appears after location section
   - Button is disabled until all required fields are filled
   - Shows loading state while predicting
   - Displays info text below button

### Backend (No Changes Needed)
- Uses existing `/api/complaints/validate-image` endpoint
- Already returns category, priority, confidence, detected_issue

### Styling

**File**: `frontend/src/styles/ComplaintForm.css`

```css
.predict-section {
  background: #f0f7ff;
  border: 2px solid #007bff;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  text-align: center;
}

.btn-predict {
  background: #007bff;
  color: white;
  padding: 12px 30px;
  font-size: 16px;
  width: 100%;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-predict:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-predict:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}
```

## Features

✅ **Smart Button State**
- Disabled until title, description, and image are provided
- Shows loading state while predicting
- Clear visual feedback

✅ **Error Handling**
- Shows error if image is invalid (contains human face)
- Shows error if prediction fails
- Allows retry

✅ **Auto-Fill Form**
- Predictions automatically fill category and priority fields
- Citizen can see what will be submitted
- Can click predict again to re-analyze

✅ **Confidence Display**
- Shows confidence score (0-100%)
- Shows detected issue description
- Helps citizen verify accuracy

## User Experience

### Before (Auto-Detection on Image Upload)
1. Citizen uploads image
2. System auto-detects category/priority
3. Citizen sees results immediately
4. Citizen submits

### After (Manual Predict Button)
1. Citizen enters title, description, image
2. Citizen clicks "Predict" button
3. System analyzes all three inputs
4. Citizen sees predictions
5. Citizen can adjust if needed
6. Citizen submits

## Benefits

- **More Control**: Citizens can review predictions before submitting
- **Better Accuracy**: All three inputs (title + description + image) are analyzed together
- **Transparency**: Citizens see confidence scores and detected issues
- **Flexibility**: Citizens can re-predict if they change title/description

## Testing

### Test Scenario 1: Road Accident
1. Title: "Road accident at busy intersection"
2. Description: "Two vehicles collided, causing traffic disruption"
3. Image: Photo of accident
4. Click "Predict"
5. Expected: Category=Traffic/Safety, Priority=Critical, Confidence=90%+

### Test Scenario 2: Pothole
1. Title: "Pothole on Main Street"
2. Description: "Large pothole affecting traffic"
3. Image: Photo of pothole
4. Click "Predict"
5. Expected: Category=Infrastructure, Priority=High, Confidence=85%+

### Test Scenario 3: Garbage
1. Title: "Garbage pile"
2. Description: "Waste dumped on street corner"
3. Image: Photo of garbage
4. Click "Predict"
5. Expected: Category=Sanitation, Priority=Medium, Confidence=80%+

## API Endpoint Used

**POST** `/api/complaints/validate-image`

**Request**:
```json
{
  "image": "base64_encoded_image",
  "title": "Complaint title",
  "description": "Complaint description"
}
```

**Response**:
```json
{
  "success": true,
  "valid": true,
  "category": "infrastructure",
  "priority": "high",
  "confidence": 85,
  "detected_issue": "Large pothole on Main Street affecting traffic"
}
```

## Future Enhancements

- [ ] Allow multiple predictions to compare results
- [ ] Show confidence breakdown (image clarity, text match, etc.)
- [ ] Allow citizen to override predictions with custom values
- [ ] Save prediction history for citizen reference
- [ ] Show similar past complaints for reference

## Troubleshooting

### Predict Button is Disabled
- Make sure title is filled
- Make sure description is filled
- Make sure image is captured

### Prediction Shows "infrastructure" for Everything
- Check if OpenAI API key is set correctly in `.env`
- If not set, system uses fallback keyword matching
- See `SETUP_OPENAI_API_KEY.md` for setup instructions

### Prediction Takes Too Long
- OpenAI API might be slow
- Timeout is set to 10 seconds
- If it times out, try again

### Prediction Shows Error
- Image might contain human face (blocked)
- Image might be invalid
- Try capturing a different image
