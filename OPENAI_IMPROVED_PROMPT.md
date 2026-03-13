# Improved OpenAI Prompt for Civic Complaint Classification

## Key Improvement: Analyze THREE Inputs Together

The prompt now explicitly instructs OpenAI to analyze:
1. **Title** - The complaint headline
2. **Description** - Detailed explanation
3. **Image** - Visual evidence

All three inputs are combined to make better predictions.

## What Changed

### Before
- Prompt focused mainly on image analysis
- Title/description were secondary
- Confidence was low (30%) because image alone wasn't enough

### After
- Prompt explicitly states: "Your task is to analyze THREE inputs together"
- Each step emphasizes combining all three sources
- Confidence scoring now considers alignment between all inputs
- Keywords provided for each category to help with text analysis

## New Confidence Scoring System

Confidence is now calculated based on 5 factors (0-100):

```
- Image clarity: +20 points (clear image = higher confidence)
- Description-Image match: +20 points (description matches what's shown)
- Title obviousness: +20 points (title clearly indicates the issue)
- Input consistency: +20 points (all three inputs align)
- Category certainty: +20 points (how certain about the category)
```

### Scoring Examples
- **90-100%**: All three inputs align perfectly and are clear
- **70-80%**: Two inputs align, one unclear
- **50-70%**: Inputs partially align
- **30-50%**: Inputs unclear or conflicting

## Example Scenarios

### Scenario 1: Road Accident
- **Title**: "Road accident at busy intersection"
- **Description**: "Two vehicles collided at intersection, causing traffic disruption"
- **Image**: Shows damaged vehicles and traffic
- **Expected**: Category=Traffic/Safety, Priority=Critical, Confidence=95%
- **Why**: All three inputs align perfectly

### Scenario 2: Pothole
- **Title**: "Pothole on Main Street"
- **Description**: "Large pothole affecting traffic"
- **Image**: Shows pothole in road
- **Expected**: Category=Infrastructure, Priority=High, Confidence=90%
- **Why**: Title, description, and image all clearly indicate infrastructure issue

### Scenario 3: Garbage
- **Title**: "Garbage pile"
- **Description**: "Waste dumped on street corner"
- **Image**: Shows garbage
- **Expected**: Category=Sanitation, Priority=Medium, Confidence=85%
- **Why**: All inputs clearly indicate sanitation issue

## How It Works

1. **OpenAI reads the title** - Understands the issue type
2. **OpenAI reads the description** - Gets context and details
3. **OpenAI analyzes the image** - Sees visual evidence
4. **OpenAI combines all three** - Makes informed decision
5. **OpenAI calculates confidence** - Based on alignment of all inputs

## Keywords for Each Category

The prompt now includes keywords to help OpenAI classify:

- **Infrastructure**: pothole, road damage, sidewalk, pavement, crack, bridge, building, water pipe, drainage
- **Sanitation**: garbage, waste, trash, dirty, litter, sewage, dump, filth, cleanliness
- **Traffic**: traffic, signal, congestion, accident, vehicle, collision, blocked, sign, marking
- **Safety**: danger, hazard, unsafe, fire, accident, emergency, threat, exposed, broken barrier
- **Utilities**: water leak, electricity, power, streetlight, gas, outage, supply, line, pole

## Testing

### Test with Different Inputs

```bash
# Test 1: Clear alignment
node backend/test-openai-vision.js image.jpg "Pothole" "Large pothole on Main Street"

# Test 2: Partial alignment
node backend/test-openai-vision.js image.jpg "Road issue" "Unclear description"

# Test 3: Conflicting inputs
node backend/test-openai-vision.js image.jpg "Garbage" "Description about potholes"
```

### Expected Results

- **Clear alignment**: Confidence 85-100%
- **Partial alignment**: Confidence 60-80%
- **Conflicting inputs**: Confidence 30-50%

## Benefits

✅ Higher confidence scores when inputs align
✅ Better categorization using text + image
✅ More accurate priority assessment
✅ Handles cases where image alone isn't clear
✅ Uses title/description to provide context
✅ Consistent predictions across different images

## Model & Settings

- **Model**: gpt-4o (current, fast, accurate)
- **Temperature**: 0.3 (deterministic, consistent)
- **Max Tokens**: 500 (enough for detailed response)
- **Image Detail**: high (better visual analysis)
- **Unique ID**: timestamp (prevents caching)

## Next Steps

1. Test with real complaint data
2. Monitor confidence scores
3. Adjust keywords if needed
4. Fine-tune priority thresholds
5. Collect feedback from officers
