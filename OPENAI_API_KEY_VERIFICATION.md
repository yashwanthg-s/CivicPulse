# OpenAI API Key Verification Guide

## Current Status
✅ **Advanced Human Detection Service**: Implemented and integrated  
✅ **Backend Integration**: Complete in `complaintController.js`  
⏳ **API Key Configuration**: Needs your actual OpenAI API key

## What's Configured

### Backend (.env)
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=5003
```

### Detection Flow
1. **Human Detection** (First check)
   - Analyzes 8 facial/body features: eyes, nose, ears, face, lips, hands, hair, skin
   - Blocks if confidence ≥ 70% AND is_human=true, OR 3+ features detected
   - Shows detected features in error message

2. **Complaint Analysis** (If human check passes)
   - Categorizes complaint (Infrastructure, Sanitation, Traffic, etc.)
   - Assigns priority level
   - Detects duplicates

## Setup Steps

### Step 1: Get Your OpenAI API Key
1. Go to https://platform.openai.com/api/keys
2. Sign in with your OpenAI account
3. Click "Create new secret key"
4. Copy the key (you won't see it again)

### Step 2: Add Key to .env
Edit `backend/.env` and replace:
```
OPENAI_API_KEY=your_openai_api_key_here
```

With your actual key:
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Verify API Connection
Run the test script:
```bash
cd backend
node test-openai-vision-direct.js
```

Expected output:
```
✓ API Key found
✓ API Response received
✓ Image analysis successful
✓ Human detection analysis successful
✅ Tests complete
```

### Step 4: Restart Backend
```bash
# Stop current backend (Ctrl+C)
# Restart with:
npm start
```

## Testing Human Detection

### Test 1: Block Human Image (Selfie)
1. Open citizen dashboard
2. Upload a selfie/human photo
3. Expected: ❌ "Image contains human features (eyes, nose, face, lips). Please upload a photo of the actual issue/complaint, not a person."

### Test 2: Allow Complaint Image (Pothole)
1. Upload a photo of a pothole/infrastructure issue
2. Expected: ✅ Complaint submitted successfully

### Test 3: Check Backend Logs
Look for:
```
🔍 STEP 1: Advanced Human Detection
📊 Human Detection Result:
  Is Human: true/false
  Confidence: XX%
  Features: [list of detected features]
```

## Troubleshooting

### Error: "OPENAI_API_KEY not set in .env"
- Check `.env` file exists in `backend/` folder
- Verify key is set: `OPENAI_API_KEY=sk-proj-...`
- Restart backend after editing `.env`

### Error: "401 Unauthorized"
- API key is invalid or expired
- Generate a new key from https://platform.openai.com/api/keys
- Update `.env` and restart backend

### Error: "invalid_request_error"
- Vision capabilities not enabled for your API key
- Check your OpenAI account plan (requires paid account)
- Verify you're using `gpt-4-turbo` model

### Error: "Rate limit exceeded"
- You've hit OpenAI API rate limits
- Wait a few minutes before retrying
- Check your usage at https://platform.openai.com/account/usage/overview

## API Key Requirements

✅ **Required**:
- OpenAI account with API access
- Paid account (free trial may not support vision)
- API key with vision capabilities

✅ **Model**: `gpt-4-turbo` (supports vision)

✅ **Features Used**:
- Vision API (image analysis)
- JSON response parsing
- Base64 image encoding

## Files Involved

- `backend/.env` - Configuration
- `backend/services/advancedHumanDetectionService.js` - Detection logic
- `backend/controllers/complaintController.js` - Integration point
- `backend/test-openai-vision-direct.js` - API test script

## Next Steps

1. ✅ Add your OpenAI API key to `.env`
2. ✅ Run verification test: `node backend/test-openai-vision-direct.js`
3. ✅ Restart backend
4. ✅ Test with real images (selfie should block, pothole should allow)
5. ✅ Monitor backend logs for detection results

---

**Status**: Ready for API key configuration  
**Last Updated**: March 14, 2026
