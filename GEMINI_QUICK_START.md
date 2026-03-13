# Gemini API - Quick Start Guide

## What Changed?

Your system now uses **Google Gemini API** instead of OpenAI for image analysis.

### Why Gemini?

- ✓ **Free tier available** - No quota issues
- ✓ **Fast processing** - Quick image analysis
- ✓ **Reliable** - Google's AI model
- ✓ **Fallback support** - OpenAI as backup

## How to Use

### 1. Start Backend Server
```bash
cd backend
npm start
```

### 2. Submit a Complaint
- Open citizen dashboard
- Take/upload image
- Fill title and description
- Submit complaint

### 3. Check Notifications
- Officer opens dashboard
- Selects category (e.g., Utilities 💧)
- Sees notification bell with count
- Clicks bell to view complaint

## What Gemini Does

When you submit a complaint:

1. **Image Analysis**
   - Detects human faces (blocks if found)
   - Analyzes civic issue
   - Determines category
   - Sets priority level

2. **Categorization**
   - Infrastructure 🏗️
   - Sanitation 🧹
   - Traffic 🚦
   - Safety ⚠️
   - Utilities 💧

3. **Priority Levels**
   - Critical (emergency)
   - High (urgent)
   - Medium (normal)
   - Low (minor)

## API Key Info

Your Gemini API key is configured in `backend/.env`:
```
GOOGLE_GEMINI_API_KEY=AIzaSyA3tR0iEAcXHD_XtKzbbb6ETg-qWoBqd_M
GEMINI_MODEL=gemini-2.0-flash
```

## Fallback Chain

If Gemini fails:
1. Try OpenAI Vision API
2. If OpenAI fails, use keyword matching
3. System always works (never blocks users)

## Testing

Submit a test complaint:
1. Go to citizen dashboard
2. Take a photo of a pothole/garbage/etc
3. Fill in details
4. Submit
5. Check officer dashboard for notification

## Troubleshooting

**Notification not appearing?**
- Restart backend: `npm start`
- Check browser console for errors
- Verify officer is logged in
- Check category filter matches complaint

**Image rejected?**
- Image contains human face
- Try different image without people

**Slow processing?**
- First request may be slower
- Subsequent requests are faster
- Check internet connection

## Support

For issues:
1. Check backend logs
2. Verify API key in `.env`
3. Check Gemini quota at Google Cloud Console
4. System will fallback to keyword matching

---

**Ready to use! Start submitting complaints.**
