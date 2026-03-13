# Quick Test Guide - Category Classification

## Before Testing
1. Update `backend/.env` with real OpenAI API key
2. Restart backend: `npm start`
3. Go to Complaint Form

## Test Cases

### Test 1: Pothole (Infrastructure)
- Title: "Road pothole"
- Description: "Large pothole on main street"
- Image: Photo of pothole
- Expected: Infrastructure, High, 80-95%

### Test 2: Garbage (Sanitation)
- Title: "Garbage pile"
- Description: "Trash accumulation on sidewalk"
- Image: Photo of garbage
- Expected: Sanitation, Medium, 80-95%

### Test 3: Water Leak (Utilities)
- Title: "Water leaking"
- Description: "Water leaking from pipe"
- Image: Photo of water leak
- Expected: Utilities, High, 80-95%

## What Changed
✓ Pothole now = Infrastructure (not Safety)
✓ Confidence now 0-100% (not 3000%)
✓ Better analysis of title + description + image
