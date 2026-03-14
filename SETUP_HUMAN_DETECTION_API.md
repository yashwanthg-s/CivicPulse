# Setup Human Detection - API Configuration

## Problem
AI is not analyzing images because OpenAI API key is not configured.

## Solution

### Step 1: Get OpenAI API Key

1. Go to https://platform.openai.com/api/keys
2. Sign in with your OpenAI account
3. Click "Create new secret key"
4. Copy the key (you won't see it again!)
5. Make sure your account has:
   - ✓ Billing enabled
   - ✓ API access enabled
   - ✓ Vision capabilities enabled (gpt-4-turbo)

### Step 2: Add to .env File

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=5001
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=complaint_system
AI_SERVICE_URL=http://localhost:8001
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=your_gemini_key_here
```

Replace `sk-proj-xxxxxxxxxxxxxxxxxxxxx` with your actual key.

### Step 3: Verify Setup

```bash
# Test the API connection
node backend/test-openai-vision-direct.js
```

Expected output:
```
✓ API Key found
✓ API Response received
✓ Image analysis successful
✓ Human detection analysis successful
```

### Step 4: Restart Backend

```bash
# Kill existing process
Stop-Process -Name node -Force

# Start backend
npm start
```

## API Model Used

- **Model**: `gpt-4-turbo` (supports vision)
- **Cost**: ~$0.01 per image
- **Speed**: 5-30 seconds per image

## How It Works

### Flow
```
1. Citizen uploads image
   ↓
2. Backend converts to base64
   ↓
3. Sends to OpenAI Vision API
   ↓
4. OpenAI analyzes for human features:
   - Eyes, Nose, Ears, Face, Lips
   - Hands, Hair, Skin
   ↓
5. Returns JSON with:
   - is_human (true/false)
   - confidence (0-100%)
   - detected_features (array)
   ↓
6. If human detected → BLOCK
   If not human → ALLOW
```

## Testing

### Test 1: Check API Key
```bash
node backend/test-openai-vision-direct.js
```

### Test 2: Upload Selfie
1. Go to complaint form
2. Upload selfie
3. Should see error: "❌ Image contains human features..."

### Test 3: Upload Pothole
1. Go to complaint form
2. Upload pothole photo
3. Should see: "✓ Complaint submitted successfully"

## Troubleshooting

### Error: "OPENAI_API_KEY not set"
```
Solution: Add OPENAI_API_KEY to backend/.env
```

### Error: "Invalid API key"
```
Solution: Check key is correct (starts with sk-proj-)
         Verify billing is enabled on OpenAI account
```

### Error: "Model not found"
```
Solution: Use gpt-4-turbo (not gpt-4-vision)
         Verify account has vision capabilities
```

### Error: "Rate limit exceeded"
```
Solution: Wait a few minutes
         Check OpenAI usage dashboard
         Consider upgrading plan
```

### Error: "Timeout"
```
Solution: Network issue - try again
         Image too large - compress image
         API slow - wait and retry
```

## Cost Estimation

| Scenario | Cost |
|----------|------|
| 1 image | $0.01 |
| 100 images/day | $1.00 |
| 1000 images/day | $10.00 |
| 10,000 images/month | ~$300 |

## API Limits

- **Rate Limit**: 3,500 requests/minute (free tier)
- **Timeout**: 30 seconds per request
- **Max Image Size**: 20MB
- **Supported Formats**: JPEG, PNG, GIF, WebP

## Configuration Options

### Adjust Confidence Threshold

Edit `backend/services/advancedHumanDetectionService.js`:

```javascript
// More strict (block more)
if (detectionResult.confidence >= 80) {
  return true;
}

// More lenient (block less)
if (detectionResult.confidence >= 60) {
  return true;
}
```

### Adjust Feature Threshold

```javascript
// Require more features to block
if (detectionResult.detected_features.length >= 4) {
  return true;
}

// Block with fewer features
if (detectionResult.detected_features.length >= 2) {
  return true;
}
```

## Monitoring

### Check API Usage
1. Go to https://platform.openai.com/account/usage/overview
2. View current month's usage
3. Monitor costs

### Enable Logging
```javascript
// In advancedHumanDetectionService.js
console.log('OpenAI Response:', content);
console.log('Analysis Result:', analysisResult);
```

## Fallback Strategy

If OpenAI API fails:
1. Try quick check (fallback)
2. If fallback fails, allow upload
3. Log error for debugging
4. Don't block users

## Security Notes

✅ API key stored in .env (not in code)
✅ Image not stored after analysis
✅ Only metadata stored in database
✅ Secure HTTPS connection to OpenAI

## Next Steps

1. ✅ Get OpenAI API key
2. ✅ Add to backend/.env
3. ✅ Test with test script
4. ✅ Restart backend
5. ✅ Test with real images
6. ✅ Monitor usage and costs

## Support

If you encounter issues:
1. Check OpenAI status: https://status.openai.com
2. Review API documentation: https://platform.openai.com/docs
3. Check error logs in backend console
4. Verify API key is correct
5. Ensure billing is enabled

## Status: ⏳ WAITING FOR API KEY

The system is ready to use once you:
1. Get OpenAI API key
2. Add to backend/.env
3. Restart backend

Then human detection will work automatically!
