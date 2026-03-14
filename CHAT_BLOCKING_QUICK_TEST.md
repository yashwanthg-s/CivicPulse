# Chat Message Blocking - Quick Test Guide

## How to Test the Chat Detection System

### Test Cases to Try in the Frontend

#### 1. English Chat Messages (Should BLOCK)
- **Title**: "Hi"
- **Description**: "Hello there"
- **Expected**: ❌ BLOCKED - "This appears to be a chat message..."

#### 2. English Question (Should BLOCK)
- **Title**: "What are you doing"
- **Description**: "Just checking in"
- **Expected**: ❌ BLOCKED - "This appears to be a chat message..."

#### 3. Multiple Chat Keywords (Should BLOCK)
- **Title**: "Hi hello"
- **Description**: "Just saying hi"
- **Expected**: ❌ BLOCKED - "This appears to be a chat message..."

#### 4. Kannada Chat (Should BLOCK)
- **Title**: "ನಮಸ್ಕಾರ"
- **Description**: "ಹಾಯ್ ನೀವು ಯಾಕೆ ಮಾಡುತ್ತಿದ್ದೀರಿ"
- **Expected**: ❌ BLOCKED - "This appears to be a chat message..."

#### 5. Hindi Chat (Should BLOCK)
- **Title**: "नमस्ते"
- **Description**: "हाय आप क्या कर रहे हैं"
- **Expected**: ❌ BLOCKED - "This appears to be a chat message..."

#### 6. Legitimate Complaint (Should ALLOW)
- **Title**: "Pothole on Main Street"
- **Description**: "There is a large pothole on Main Street near the market that needs immediate repair"
- **Expected**: ✓ ALLOWED - Proceeds to image validation

#### 7. Legitimate Complaint with Casual Language (Should ALLOW)
- **Title**: "Hi, there is a pothole"
- **Description**: "There is a large pothole on the road that needs repair. It is very dangerous and needs immediate attention"
- **Expected**: ✓ ALLOWED - Chat keyword but legitimate complaint content

#### 8. Kannada Complaint (Should ALLOW)
- **Title**: "ರಸ್ತೆಯಲ್ಲಿ ಗುಂಡಿ"
- **Description**: "ಮುಖ್ಯ ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಗುಂಡಿ ಇದೆ ಮತ್ತು ಅದನ್ನು ಸರಿಪಡಿಸಬೇಕು"
- **Expected**: ✓ ALLOWED - Legitimate complaint

#### 9. Hindi Complaint (Should ALLOW)
- **Title**: "सड़क पर गड्ढा"
- **Description**: "मुख्य सड़क पर एक बड़ा गड्ढा है जिसे तुरंत ठीक करने की आवश्यकता है"
- **Expected**: ✓ ALLOWED - Legitimate complaint

### Testing Steps

1. **Start the application**
   ```bash
   # Terminal 1: Backend
   cd backend
   node server.js
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

2. **Navigate to Complaint Form**
   - Go to http://localhost:5173 (or your frontend URL)
   - Click "Submit Complaint"

3. **Test Each Case**
   - Enter title and description from test cases above
   - Capture a photo (any image)
   - Select location
   - Click Submit
   - Observe the error message or success

4. **Check Backend Logs**
   - Look for blocked attempts in backend console
   - Should see: `🚫 BLOCKED COMPLAINT ATTEMPT:`

### Expected Behavior

#### When Chat is Detected (BLOCKED)
```
❌ Error:
This appears to be a chat message, not a complaint. 
Please submit only legitimate civic issues like infrastructure problems, 
sanitation issues, or public service concerns.
```

#### When Complaint is Legitimate (ALLOWED)
- Form proceeds to image validation
- AI analyzes the image
- Category and priority are auto-detected
- Complaint is saved to database

### Backend Test File

To run the automated test suite:
```bash
cd backend
node test-chat-detection.js
```

Expected output:
```
✓ PASS Test 1: Simple greeting
✓ PASS Test 2: Chat question
✓ PASS Test 3: Multiple chat keywords
...
📊 Results: 14 passed, 0 failed out of 14 tests
Success rate: 100%
```

### Monitoring Blocked Attempts

Check backend console for blocked attempts:
```
🚫 BLOCKED COMPLAINT ATTEMPT: {
  userId: 1,
  title: "Hi",
  description: "Hello there",
  reason: "This appears to be a chat message...",
  timestamp: "2026-03-14T10:30:45.123Z"
}
```

### Troubleshooting

**Issue**: Chat message is not being blocked
- Check that `backend/utils/contentFilter.js` has the enhanced keywords
- Verify backend is running on port 5003
- Check browser console for any errors

**Issue**: Legitimate complaint is being blocked
- Make sure description is longer than 50 characters
- Avoid using multiple chat keywords
- Check if the content matches any blocked keywords (violence, hate speech, etc.)

**Issue**: Error message not showing
- Check that frontend is using the latest `ComplaintForm.jsx`
- Verify `errors.general` alert is displayed
- Check browser console for any JavaScript errors

### Success Indicators

✓ Chat messages are blocked with clear error message
✓ Legitimate complaints proceed normally
✓ Multi-language support works (English, Kannada, Hindi)
✓ Backend logs blocked attempts
✓ Frontend displays error messages clearly
✓ Users can correct and resubmit after seeing error
