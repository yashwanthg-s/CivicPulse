# OpenAI Only Setup - Human Detection

## Configuration

### backend/.env
```env
NODE_ENV=development
PORT=5001
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=complaint_system
AI_SERVICE_URL=http://localhost:8001
OPENAI_API_KEY=your_openai_api_key_here
```

## Setup Steps

### 1. Get OpenAI API Key
- Go to https://platform.openai.com/api/keys
- Create new secret key
- Copy the key (starts with `sk-proj-`)

### 2. Add to .env
Replace `your_openai_api_key_here` with your actual key:
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

### 3. Test
```bash
node backend/test-openai-vision-direct.js
```

### 4. Restart Backend
```bash
Stop-Process -Name node -Force
npm start
```

## How It Works

```
Citizen uploads image
    ↓
Backend converts to base64
    ↓
Sends to OpenAI Vision API (gpt-4-turbo)
    ↓
Analyzes for human features:
- Eyes, Nose, Ears, Face, Lips
- Hands, Hair, Skin
    ↓
Returns JSON with:
- is_human (true/false)
- confidence (0-100%)
- detected_features (array)
    ↓
Decision:
- If confidence >= 70% AND is_human = true → BLOCK
- If 3+ features detected → BLOCK
- Else → ALLOW
```

## Testing

### Test 1: Selfie Upload
```
Expected: BLOCKED
Message: "❌ Image contains human features..."
```

### Test 2: Pothole Photo
```
Expected: ALLOWED
Message: "✓ Complaint submitted successfully"
```

## Cost
- ~$0.01 per image
- 100 images/day = $1.00
- 1,000 images/day = $10.00

## Status: ✅ READY

Only OpenAI API key needed. No Gemini required.
