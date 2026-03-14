# Quick Test: OpenAI API Key Verification

## 🚀 Quick Start (5 minutes)

### Step 1: Verify API Key is Set
```bash
# Check .env file
cat backend/.env | grep OPENAI_API_KEY
```

Expected output:
```
OPENAI_API_KEY=sk-proj-...
```

### Step 2: Run API Test
```bash
cd backend
node test-openai-vision-direct.js
```

Expected output:
```
🧪 Testing OpenAI Vision API

✓ API Key found
  Key: sk-proj-...

📝 Test 1: Simple text request (no image)
✓ API Response received
  Message: Hello, I am working

🖼️  Test 2: Image analysis with base64
✓ Image analysis successful
  Response: This image shows a simple green background...

👤 Test 3: Human detection prompt
✓ Human detection analysis successful
  Response: {"is_human": false, "confidence": 5, ...}

✅ Tests complete
```

### Step 3: Restart Backend
```bash
# Stop current backend (Ctrl+C if running)
npm start
```

Expected output:
```
Server running on port 5003
Database connected
```

### Step 4: Test Human Detection in UI

#### Test 4a: Upload Selfie (Should Block)
1. Open citizen dashboard
2. Take/upload a selfie
3. Fill in complaint details
4. Click Submit

Expected result:
```
❌ Image contains human features (eyes, nose, face, lips). 
   Please upload a photo of the actual issue/complaint, not a person.
```

#### Test 4b: Upload Pothole (Should Allow)
1. Open citizen dashboard
2. Upload a pothole/infrastructure photo
3. Fill in complaint details
4. Click Submit

Expected result:
```
✅ Complaint submitted successfully
```

## 📊 Monitoring Backend Logs

### What to Look For

**Successful Human Detection**:
```
🔍 STEP 1: Advanced Human Detection
📊 Human Detection Result:
  Is Human: true
  Confidence: 95%
  Features: eyes, nose, face, lips, skin
✓ Image passed human detection - proceeding with complaint analysis
```

**Blocked Human Image**:
```
❌ Image blocked - Human detected: Image contains human features...
```

**API Error (Fallback)**:
```
Human detection error (non-blocking): [error message]
⚠️ Image validation failed, allowing submission to proceed
```

## 🔍 Troubleshooting

### Issue: "OPENAI_API_KEY not set"
**Solution**:
1. Check `.env` file exists in `backend/` folder
2. Verify key is set: `OPENAI_API_KEY=sk-proj-...`
3. Restart backend

### Issue: "401 Unauthorized"
**Solution**:
1. API key is invalid or expired
2. Generate new key: https://platform.openai.com/api/keys
3. Update `.env` and restart backend

### Issue: "invalid_request_error"
**Solution**:
1. Vision capabilities not enabled
2. Check your OpenAI account plan (requires paid account)
3. Verify using `gpt-4-turbo` model

### Issue: "Rate limit exceeded"
**Solution**:
1. You've hit OpenAI API rate limits
2. Wait a few minutes before retrying
3. Check usage: https://platform.openai.com/account/usage/overview

## 📋 Verification Checklist

- [ ] API key configured in `.env`
- [ ] Test script runs successfully
- [ ] Backend starts on port 5003
- [ ] Selfie upload is blocked
- [ ] Pothole upload is allowed
- [ ] Backend logs show detection results
- [ ] No API errors in logs

## 🎯 Expected Results Summary

| Test | Input | Expected Output | Status |
|------|-------|-----------------|--------|
| API Connection | Text request | "Hello, I am working" | ✓ |
| Image Analysis | 1x1 pixel | Image description | ✓ |
| Human Detection | Test image | JSON with is_human | ✓ |
| Selfie Upload | Selfie photo | ❌ Blocked | ✓ |
| Pothole Upload | Pothole photo | ✅ Submitted | ✓ |

## 📞 Support

If tests fail:
1. Check API key is valid
2. Verify backend is running on port 5003
3. Check backend logs for errors
4. Review troubleshooting section above

---

**Time to Complete**: ~5 minutes  
**Status**: Ready to test  
**Last Updated**: March 14, 2026
