# OpenAI Diagnostic Guide

## Problem
OpenAI is returning 30% confidence for all complaints, indicating it's using **fallback keyword matching** instead of actual OpenAI API.

## Root Cause
The `OPENAI_API_KEY` in `.env` is likely:
1. Not set (placeholder value)
2. Invalid/expired
3. Not being read by the backend

## Diagnostic Steps

### Step 1: Check .env File
```bash
cat backend/.env | grep OPENAI_API_KEY
```

**Expected Output**:
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

**Problem Output**:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Step 2: Check Backend Logs
When you click "Predict", look for these logs:

**If OpenAI is working**:
```
✓ Title: Water pipeline leakage on roadside
✓ Description: Water is leaking continuously...
✓ Using model: gpt-4o
✓ Detected category: utilities
✓ Detected priority: high
✓ Confidence: 92
```

**If OpenAI is failing** (using fallback):
```
❌ CRITICAL: OPENAI_API_KEY is not configured properly!
   Current value: your_openai_api_key_here
   Please set OPENAI_API_KEY in .env file
⚠️ OpenAI API failed, using fallback keyword-based categorization
   Title: Water pipeline leakage on roadside
   Description: Water is leaking continuously...
   Fallback category: traffic
   Fallback priority: low
```

### Step 3: Test OpenAI Directly

Run the test script:
```bash
node backend/test-openai-vision.js ./uploads/test.jpg "Water pipeline leakage" "Water is leaking from underground pipeline"
```

**Expected Output** (if working):
```
✅ OpenAI Response:
================================
{
  "category": "utilities",
  "priority": "high",
  "confidence": 92,
  "detected_issue": "Water pipeline leakage on roadside",
  "is_blocked": false,
  "detection_method": "openai_vision"
}
```

**Problem Output** (if not working):
```
❌ Error: OPENAI_API_KEY not configured
```

## Solution

### Option 1: Get Real OpenAI API Key (Recommended)

1. Go to https://platform.openai.com/api/keys
2. Click "Create new secret key"
3. Copy the key (format: `sk-proj-...`)
4. Edit `backend/.env`:
   ```
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
   ```
5. Restart backend:
   ```bash
   npm start
   ```

### Option 2: Use Gemini Instead (Alternative)

If you don't have OpenAI API key, use Gemini (already configured):

Edit `backend/services/openaiVisionService.js` and replace with Gemini service:
```javascript
const geminiVisionService = require('./geminiVisionService');
// Use geminiVisionService instead of openaiVisionService
```

### Option 3: Improve Fallback (Temporary)

The fallback keyword matching is already improved to handle:
- **Water pipeline leakage** → utilities (not traffic)
- **Road accident** → safety/traffic (not infrastructure)
- **Garbage pile** → sanitation (not infrastructure)

But it only gives 30% confidence. Real OpenAI gives 70-100%.

## Verification Checklist

- [ ] Check `.env` file has real OpenAI key (not placeholder)
- [ ] Backend logs show "Using model: gpt-4o" (not fallback)
- [ ] Confidence scores are 70-100% (not 30%)
- [ ] Different complaints get different categories
- [ ] Test script works without errors

## Common Issues

### Issue 1: "OPENAI_API_KEY is not configured"
**Solution**: Add real API key to `.env` and restart backend

### Issue 2: "401 Unauthorized"
**Solution**: API key is invalid or expired. Get new key from https://platform.openai.com/api/keys

### Issue 3: "429 Too Many Requests"
**Solution**: Rate limited. Wait a few minutes and try again

### Issue 4: "500 Server Error"
**Solution**: OpenAI service issue. Check https://status.openai.com/

### Issue 5: Still Getting 30% Confidence
**Solution**: 
1. Check backend logs for error messages
2. Verify API key is correct
3. Restart backend after changing .env
4. Try test script to isolate issue

## Expected Behavior After Fix

### Water Pipeline Leakage Example
- **Title**: "Water pipeline leakage on roadside"
- **Description**: "Water is leaking continuously from an underground pipeline and spreading across the roadside, causing water wastage and creating slippery conditions for vehicles and pedestrians."
- **Image**: Photo of water leaking

**Current (Broken)**:
- Category: traffic
- Priority: low
- Confidence: 30%

**Expected (Fixed)**:
- Category: utilities
- Priority: high
- Confidence: 90%+

## Performance Notes

- OpenAI API calls take 2-5 seconds
- Fallback keyword matching is instant
- If prediction is slow, OpenAI is working
- If prediction is instant, fallback is being used

## Next Steps

1. Get OpenAI API key
2. Add to `.env`
3. Restart backend
4. Test with different complaint types
5. Monitor confidence scores
6. Adjust if needed

## Support

- OpenAI Docs: https://platform.openai.com/docs/guides/vision
- API Status: https://status.openai.com/
- Pricing: https://openai.com/pricing/
- Account: https://platform.openai.com/account/api-keys
