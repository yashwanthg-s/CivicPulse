# Dual Input Method Guide - Text & Speech

## Overview
The complaint form now supports **BOTH** input methods for Title and Description:
1. **Text Input** - Users can type directly into the field
2. **Speech Input** - Users can click the mic button to speak and convert to text

## How It Works

### For Complaint Title
```
┌─────────────────────────────────────────┐
│ Complaint Title *                       │
├─────────────────────────────────────────┤
│ [Text input field - type here]          │
│                                         │
│ [🎤 Start] [✕ Clear]                   │
│                                         │
│ Listening: [interim text shows here]    │
└─────────────────────────────────────────┘
```

### For Description
```
┌─────────────────────────────────────────┐
│ Description *                           │
├─────────────────────────────────────────┤
│ [Textarea - type here]                  │
│                                         │
│ [🎤 Start] [✕ Clear]                   │
│                                         │
│ Listening: [interim text shows here]    │
└─────────────────────────────────────────┘
```

## User Workflow

### Option 1: Type Text
1. Click on the text input field
2. Type the complaint title or description
3. Text appears in the field immediately
4. Click "Clear" button to remove text if needed

### Option 2: Use Speech Recognition
1. Click the **"🎤 Start"** button
2. Speak clearly in your preferred language (English, Kannada, or Hindi)
3. See interim text appearing as you speak
4. Click **"⏹️ Stop"** button when done speaking
5. Final text is added to the field
6. Continue speaking to add more text, or click "Clear" to start over

### Option 3: Mix Both Methods
1. Type some text in the field
2. Click "🎤 Start" to add more via speech
3. Speech text is **appended** to existing text
4. Continue typing or speaking as needed

## Features

### Text Input
- ✓ Direct typing in input field
- ✓ Works on all devices
- ✓ No browser permissions needed
- ✓ Instant feedback

### Speech Input
- ✓ Continuous listening until user stops
- ✓ Real-time interim text display
- ✓ Multi-language support (English, Kannada, Hindi)
- ✓ Auto-detects language from app settings
- ✓ Appends to existing text
- ✓ Clear button to remove all text
- ✓ Visual feedback (pulsing indicator while listening)
- ✓ Error handling with user-friendly messages

## Supported Languages

### English
- Language code: `en-US`
- Recognized: "pothole", "water leak", "broken streetlight", etc.

### Kannada
- Language code: `kn-IN`
- Recognized: "ಗುಂಡಿ" (pothole), "ನೀರಿನ ಸೋರಿಕೆ" (water leak), etc.

### Hindi
- Language code: `hi-IN`
- Recognized: "गड्ढा" (pothole), "पानी का रिसाव" (water leak), etc.

## Step-by-Step Examples

### Example 1: Type Title, Speak Description
```
Step 1: Type title
  → Click title field
  → Type: "Pothole on Main Street"
  
Step 2: Speak description
  → Click description field
  → Click "🎤 Start"
  → Speak: "There is a large pothole on Main Street near the market"
  → See interim text: "There is a large pothole..."
  → Click "⏹️ Stop"
  → Text is added to description field
```

### Example 2: Speak Both Title and Description
```
Step 1: Speak title
  → Click title field
  → Click "🎤 Start"
  → Speak: "Broken streetlight"
  → Click "⏹️ Stop"
  
Step 2: Speak description
  → Click description field
  → Click "🎤 Start"
  → Speak: "The streetlight near the park is broken and needs replacement"
  → Click "⏹️ Stop"
```

### Example 3: Kannada Speech Input
```
Step 1: Set language to Kannada
  → Click language selector
  → Select "ಕನ್ನಡ" (Kannada)
  
Step 2: Speak in Kannada
  → Click title field
  → Click "🎤 Start"
  → Speak: "ರಸ್ತೆಯಲ್ಲಿ ಗುಂಡಿ" (Pothole on road)
  → Click "⏹️ Stop"
  → Text appears in Kannada
```

## UI Components

### SpeechInput Component
**File**: `frontend/src/components/SpeechInput.jsx`

Props:
- `value` - Current text value
- `onChange` - Handler for text changes
- `placeholder` - Placeholder text
- `isTextarea` - Boolean (true for description, false for title)
- `fieldName` - Field identifier ('title' or 'description')

### Speech Recognition Service
**File**: `frontend/src/services/speechRecognitionService.js`

Features:
- Continuous listening mode
- Interim results display
- Multi-language support
- Error handling
- Browser compatibility check

### Styling
**File**: `frontend/src/styles/SpeechInput.css`

Includes:
- Input field styling
- Button animations
- Listening indicator
- Error messages
- Responsive design for mobile

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✓ Full | Best support |
| Edge | ✓ Full | Chromium-based |
| Firefox | ✓ Full | Good support |
| Safari | ✓ Full | iOS 14.5+ |
| Opera | ✓ Full | Chromium-based |

## Error Handling

### Browser Not Supported
```
ℹ️ Speech recognition not supported. Please use text input.
```
→ User can still type text normally

### Microphone Permission Denied
```
⚠️ Error: Permission denied
```
→ User needs to grant microphone permission in browser settings

### Network Error
```
⚠️ Error: Network error
```
→ Check internet connection and try again

### No Speech Detected
```
⚠️ Error: No speech input
```
→ Speak louder or closer to microphone

## Accessibility Features

✓ **Keyboard Navigation**
- Tab to navigate between fields
- Enter to submit form
- Space to start/stop recording

✓ **Visual Feedback**
- Pulsing indicator while listening
- Color-coded buttons (green=start, red=stop, orange=clear)
- Interim text display
- Error messages with icons

✓ **Screen Reader Support**
- Button labels are descriptive
- Error messages are announced
- Field labels are associated with inputs

## Performance

- **Text Input**: Instant, no latency
- **Speech Recognition**: 
  - Interim results: ~100-200ms delay
  - Final results: ~500ms-1s after speaking stops
  - Depends on internet connection and speech clarity

## Tips for Best Results

### For Speech Recognition
1. **Speak clearly** - Enunciate words properly
2. **Use appropriate volume** - Not too quiet, not too loud
3. **Minimize background noise** - Quiet environment works best
4. **Use correct language** - Set app language before speaking
5. **Pause between sentences** - Helps with recognition accuracy
6. **Check microphone** - Ensure microphone is working

### For Text Input
1. **Use proper spelling** - Helps with content filtering
2. **Be descriptive** - More details help with categorization
3. **Avoid chat messages** - System blocks casual greetings
4. **Include location details** - Helps with duplicate detection

## Testing the Dual Input

### Test Case 1: Text Only
- Type title: "Pothole on Main Street"
- Type description: "Large pothole needs repair"
- Submit complaint
- Expected: ✓ Complaint submitted

### Test Case 2: Speech Only
- Click "🎤 Start" for title
- Speak: "Broken streetlight"
- Click "⏹️ Stop"
- Click "🎤 Start" for description
- Speak: "Streetlight near park is broken"
- Click "⏹️ Stop"
- Submit complaint
- Expected: ✓ Complaint submitted

### Test Case 3: Mixed Input
- Type title: "Water leak"
- Click "🎤 Start" for description
- Speak: "Water leaking from main pipe"
- Click "⏹️ Stop"
- Type more: " near school building"
- Submit complaint
- Expected: ✓ Complaint submitted with combined text

### Test Case 4: Multi-Language
- Set language to Kannada
- Click "🎤 Start"
- Speak in Kannada: "ರಸ್ತೆಯಲ್ಲಿ ಗುಂಡಿ"
- Click "⏹️ Stop"
- Expected: ✓ Kannada text appears in field

## Troubleshooting

### Speech Not Being Recognized
1. Check microphone is connected and working
2. Grant microphone permission to browser
3. Ensure app language matches your speech language
4. Speak more clearly and louder
5. Try in a quieter environment

### Text Not Appearing
1. Check if field is focused (click on it)
2. Ensure you're typing in the correct field
3. Check for JavaScript errors in browser console
4. Try refreshing the page

### Buttons Not Working
1. Check browser console for errors
2. Ensure JavaScript is enabled
3. Try a different browser
4. Clear browser cache and reload

### Mixed Text Not Working
1. Ensure you click "🎤 Start" after typing
2. Speech text should append to existing text
3. If not working, use "Clear" and start fresh

## Summary

The dual input system provides maximum flexibility:
- **Type** for users who prefer keyboard input
- **Speak** for rural users who can't type
- **Mix both** for maximum flexibility
- **Multi-language** support for all users
- **Accessible** for all user types

Both methods work seamlessly together, allowing users to choose their preferred input method or combine them as needed.
