# Setup OpenAI API Key

## Problem Found
Your system is currently using a **placeholder API key** instead of a real OpenAI key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

This causes OpenAI to fail, so the system falls back to **keyword-based categorization** with only 30% confidence.

## Solution: Get Real OpenAI API Key

### Step 1: Create OpenAI Account
1. Go to https://platform.openai.com/signup
2. Sign up with your email
3. Verify your email

### Step 2: Get API Key
1. Go to https://platform.openai.com/api/keys
2. Click "Create new secret key"
3. Copy the key (you won't see it again!)
4. Keep it safe - don't share it

### Step 3: Add to .env
Edit `backend/.env` and replace:
```
OPENAI_API_KEY=your_openai_api_key_here
```

With your actual key:
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

### Step 4: Restart Backend
```bash
# Stop the backend (Ctrl+C)
# Then restart it
npm start
```

## Verify It Works

### Check Logs
You should see in backend console:
```
✓ Title: Road accident at busy intersection
✓ Description: Two vehicles collided...
✓ Using model: gpt-4o
✓ Detected category: traffic
✓ Detected priority: critical
✓ Confidence: 95
```

### Test Different Complaints
- **Pothole**: Should return "infrastructure" with high confidence
- **Garbage**: Should return "sanitation" with high confidence
- **Accident**: Should return "traffic/safety" with high confidence

## Current Fallback (Without Real Key)

Until you add a real API key, the system uses **keyword-based fallback**:

### Fallback Categories (Priority Order)
1. **Safety**: accident, collision, fire, emergency, danger, hazard, threat
2. **Traffic**: traffic, signal, congestion, vehicle, collision, blocked
3. **Infrastructure**: road, pothole, streetlight, bridge, building, water, pipe
4. **Sanitation**: garbage, waste, trash, dirty, sewage, litter
5. **Utilities**: electricity, power, water, gas, outage, line, pole

### Fallback Priority
- **Critical**: emergency, danger, accident, collision, injury, fire, hazard
- **High**: major, significant, severe, broken, damaged, blocked, flooding
- **Medium**: issue, problem, damage, concern, needs, repair
- **Low**: everything else

### Confidence Score
- Fallback always returns **30% confidence**
- Real OpenAI returns **70-100% confidence** (depending on alignment)

## Cost

OpenAI Vision API pricing (as of 2024):
- **gpt-4o**: $0.005 per 1K input tokens, $0.015 per 1K output tokens
- **Typical complaint**: ~500 tokens = ~$0.003 per analysis
- **1000 complaints/month**: ~$3

## Troubleshooting

### Still Getting 30% Confidence?
1. Check `.env` file - is the key set correctly?
2. Check backend logs - look for "OPENAI_API_KEY is not configured"
3. Restart backend after changing .env
4. Check OpenAI dashboard - is your account active?

### API Key Errors?
- **401 Unauthorized**: Invalid API key
- **429 Too Many Requests**: Rate limited (wait a bit)
- **500 Server Error**: OpenAI service issue

### How to Debug
Run the test script:
```bash
node backend/test-openai-vision.js ./uploads/test.jpg "Pothole" "Large pothole on Main Street"
```

Check output for:
- ✓ Using model: gpt-4o (means key is valid)
- ❌ OpenAI error (means key is invalid)

## Next Steps

1. Get OpenAI API key from https://platform.openai.com/api/keys
2. Add it to `backend/.env`
3. Restart backend
4. Test with different complaint types
5. Monitor confidence scores (should be 70-100%)

## Questions?

- OpenAI Docs: https://platform.openai.com/docs/guides/vision
- API Status: https://status.openai.com/
- Pricing: https://openai.com/pricing/
