# OpenAI API Key Setup Checklist

## ✅ Completed
- [x] Advanced human detection service implemented
- [x] Integration into complaint submission flow
- [x] Backend configured for port 5003
- [x] Error handling with fallback logic
- [x] Test scripts created
- [x] `.env` file updated with placeholder

## ⏳ Action Required (User)

### 1. Get OpenAI API Key
- [ ] Visit https://platform.openai.com/api/keys
- [ ] Create new secret key
- [ ] Copy the key (format: `sk-proj-...`)

### 2. Update .env File
- [ ] Open `backend/.env`
- [ ] Replace `OPENAI_API_KEY=your_openai_api_key_here` with your actual key
- [ ] Save file

### 3. Verify Connection
- [ ] Run: `cd backend && node test-openai-vision-direct.js`
- [ ] Confirm all tests pass (✓ marks)

### 4. Restart Backend
- [ ] Stop current backend process (Ctrl+C)
- [ ] Run: `npm start`
- [ ] Verify backend starts on port 5003

### 5. Test Human Detection
- [ ] Upload selfie → Should block with feature list
- [ ] Upload pothole photo → Should allow submission
- [ ] Check backend logs for detection results

## Current Configuration

```
PORT: 5003
API Model: gpt-4-turbo
Detection Features: 8 (eyes, nose, ears, face, lips, hands, hair, skin)
Blocking Threshold: confidence ≥ 70% OR 3+ features detected
```

## Files to Reference

1. **Setup Guide**: `OPENAI_API_KEY_VERIFICATION.md`
2. **Service Code**: `backend/services/advancedHumanDetectionService.js`
3. **Integration**: `backend/controllers/complaintController.js`
4. **Test Script**: `backend/test-openai-vision-direct.js`

## Expected Behavior After Setup

### Human Image Upload
```
Input: Selfie/human photo
↓
Advanced Detection Service
↓
Detects: eyes, nose, face, lips (4 features)
↓
Confidence: 95%
↓
Result: ❌ BLOCKED
Message: "Image contains human features (eyes, nose, face, lips). 
          Please upload a photo of the actual issue/complaint, not a person."
```

### Complaint Image Upload
```
Input: Pothole/infrastructure photo
↓
Advanced Detection Service
↓
Detects: No human features
↓
Confidence: 5%
↓
Result: ✅ ALLOWED
↓
Complaint Analysis
↓
Category: Infrastructure
Priority: High
↓
Saved to Database
```

## Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| "OPENAI_API_KEY not set" | Add key to `.env` and restart backend |
| "401 Unauthorized" | Check API key is valid and not expired |
| "invalid_request_error" | Verify paid account with vision enabled |
| "Rate limit exceeded" | Wait a few minutes, check usage dashboard |

---

**Status**: Ready for user to add API key  
**Estimated Setup Time**: 5 minutes  
**Last Updated**: March 14, 2026
