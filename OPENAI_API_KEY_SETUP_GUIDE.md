# OpenAI API Key Setup Guide

## Current Status
Your system is currently using **fallback keyword matching** (30% confidence) because the OpenAI API key is not configured.

**Current .env value:**
```
OPENAI_API_KEY=your_openai_api_key_here
```

This is a placeholder and needs to be replaced with a real API key.

---

## Step 1: Get Your OpenAI API Key

1. Go to https://platform.openai.com/api/keys
2. Sign in with your OpenAI account (create one if needed)
3. Click "Create new secret key"
4. Copy the key (you won't be able to see it again)

---

## Step 2: Update .env File

Open `backend/.env` and replace:
```
OPENAI_API_KEY=your_openai_api_key_here
```

With your actual key:
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

**Important:** Keep this key secret! Never commit it to git.

---

## Step 3: Restart Backend

Stop your backend server and restart it:
```bash
npm start
```

---

## Step 4: Test the Fix

1. Go to the Complaint Form
2. Enter a title: "Road pothole"
3. Enter description: "Large pothole on main street"
4. Capture an image of a pothole
5. Click "🔍 Predict Category & Priority"

**Expected Result:**
- Category: **Infrastructure** (NOT Safety)
- Priority: **High**
- Confidence: **80-95%** (NOT 3000%)
- Detected Issue: "Road pothole"

---

## What Changed

### 1. Improved OpenAI Prompt
- Clearer category definitions
- Explicit rule: "Potholes = Infrastructure (NOT Safety)"
- Better priority guidelines
- Lower temperature (0.1) for more consistent results

### 2. Fixed Confidence Display
- Confidence now properly clamped to 0-100 range
- No more "3000%" display bug
- Proper number parsing

### 3. Better Category Classification
The system now correctly classifies:
- **Potholes** → Infrastructure (was incorrectly going to Safety)
- **Garbage** → Sanitation (checked first)
- **Water leaks** → Utilities
- **Traffic signals** → Traffic
- **Fire/accidents** → Safety (only for actual emergencies)

---

## Troubleshooting

### Still showing 30% confidence?
- Check that you updated `.env` with the real key
- Restart the backend server
- Check backend console for errors

### Still classifying potholes as Safety?
- Make sure you restarted the backend after updating `.env`
- The new prompt is more explicit about Infrastructure vs Safety

### Getting API errors?
- Verify your API key is correct
- Check your OpenAI account has credits
- Check backend console for detailed error messages

---

## Cost Considerations

OpenAI Vision API costs approximately:
- **$0.01 per image** (gpt-4o with vision)
- Each complaint submission = 1 API call
- Predict button = 1 API call

For testing, you can use the fallback keyword matching (30% confidence) without API costs.

---

## Fallback Behavior

If OpenAI API fails or key is not set:
- System automatically falls back to keyword matching
- Confidence shows as 30%
- Categories are detected based on keywords in title/description
- No API costs incurred

This ensures the system always works, even without OpenAI.
