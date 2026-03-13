# Update OpenAI API Key

Your system is now configured to use **OpenAI as primary** with **Gemini as fallback**.

## Steps to Add Your New OpenAI API Key

### 1. Get Your OpenAI API Key

1. Go to https://platform.openai.com/api/keys
2. Sign in to your OpenAI account
3. Click "Create new secret key"
4. Copy the key (it starts with `sk-proj-`)

### 2. Update .env File

Open `backend/.env` and replace:

```
OPENAI_API_KEY=sk-proj-YOUR_NEW_API_KEY_HERE
```

With your actual key:

```
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

### 3. Restart Backend Server

```bash
cd backend
npm start
```

The server will restart and use your new OpenAI API key.

## System Configuration

**Primary Service**: OpenAI Vision API
- Analyzes complaint images
- Detects human faces
- Categorizes civic issues
- Determines priority levels

**Fallback Service**: Gemini Vision API
- Used if OpenAI fails
- Free tier available

**Final Fallback**: Keyword-based categorization
- Used if both APIs fail
- Always works

## How It Works

1. Citizen submits complaint with image
2. Backend receives complaint
3. **OpenAI Vision API analyzes**:
   - Detects if image contains human faces
   - Categorizes the civic issue
   - Determines priority level
   - Returns confidence score
4. Complaint saved with AI-determined category
5. Officer receives notification in category bell

## Verify It's Working

1. Submit a complaint with an image
2. Check backend logs for: "✓ OpenAI analysis successful"
3. Officer dashboard should show notification in category bell
4. Category should be correctly detected

## Troubleshooting

**Error: "insufficient_quota"**
- Your OpenAI account has no credits
- Add payment method at https://platform.openai.com/account/billing/overview
- Or use Gemini (free tier)

**Error: "invalid_api_key"**
- Check your API key is correct in `.env`
- Make sure you copied the entire key
- Restart backend after updating

**Notification not appearing?**
- Restart backend server
- Check browser console for errors
- Verify officer is logged in
- Check category filter matches complaint

## API Key Security

⚠️ **Important**: Never commit your API key to git!

The `.env` file is already in `.gitignore`, so it won't be committed.

---

**System ready to use with OpenAI!**
