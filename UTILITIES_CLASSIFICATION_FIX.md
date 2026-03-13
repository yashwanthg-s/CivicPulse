# Utilities Classification Fix

## Issue
Water pipeline leakage was being classified as **Infrastructure** instead of **Utilities**.

## Root Cause
The keyword matching order was wrong:
1. Sanitation (checked first)
2. **Infrastructure (checked second)** ← "water pipe" was here
3. Utilities (checked third) ← "pipeline" is here

When checking "water pipeline leakage", it matched "water pipe" in Infrastructure first, so it was classified as Infrastructure instead of Utilities.

## Solution
Changed the keyword checking order to:
1. Sanitation (checked first)
2. **Utilities (checked second)** ← Moved here
3. Infrastructure (checked third)

Also moved "water pipe" and "drainage" keywords from Infrastructure to Utilities where they belong.

## Changes Made
**File:** `backend/services/openaiVisionService.js`

### Before
```javascript
infrastructure: ['pothole', 'road', 'sidewalk', 'pavement', 'crack', 'bridge', 'building', 'water pipe', 'drainage', 'streetlight', 'light', 'damaged', 'broken', 'surface'],
utilities: ['water leak', 'water leaking', 'pipeline', 'electricity', 'power', 'gas', 'outage', 'line', 'pole', 'wire', 'supply', 'leakage', 'leaking'],
```

### After
```javascript
utilities: ['water leak', 'water leaking', 'pipeline', 'water pipe', 'electricity', 'power', 'gas', 'outage', 'line', 'pole', 'wire', 'supply', 'leakage', 'leaking', 'drainage'],
infrastructure: ['pothole', 'road', 'sidewalk', 'pavement', 'crack', 'bridge', 'building', 'streetlight', 'light', 'damaged', 'broken', 'surface'],
```

## New Classification Order
1. **Sanitation** - garbage, waste, trash, litter, dirty, sewage, dump, filth
2. **Utilities** - water leak, water leaking, pipeline, water pipe, electricity, power, gas, outage, line, pole, wire, supply, leakage, leaking, drainage
3. **Infrastructure** - pothole, road, sidewalk, pavement, crack, bridge, building, streetlight, light, damaged, broken, surface
4. **Traffic** - traffic, signal, congestion, vehicle, car, collision, blocked, sign, marking, intersection
5. **Safety** - fire, accident, injury, emergency, danger, hazard, unsafe, threat, exposed, collapsed

## Test Case
**Input:**
- Title: "Water pipeline leakage on roadside"
- Description: "Water is leaking from an underground pipeline and spreading across the road"
- Image: Water leak photo

**Expected Result:**
- Category: **Utilities** ✓
- Priority: High
- Confidence: 30% (fallback) or 80-95% (with OpenAI API)

## Restart Required
Restart backend to apply the fix:
```bash
npm start
```

## Note
This fix applies to the fallback keyword matching (30% confidence). When you add a real OpenAI API key, the system will use the improved OpenAI prompt which already has correct category rules.
