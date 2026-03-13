const GeminiVisionService = require('./services/geminiVisionService');
require('dotenv').config();

async function testGemini() {
  try {
    const gemini = new GeminiVisionService();
    console.log('✓ Gemini Vision Service initialized');
    console.log('API Key configured:', !!process.env.GOOGLE_GEMINI_API_KEY);
    console.log('Model:', process.env.GEMINI_MODEL);
    
    // Test with a simple base64 image (1x1 pixel red image)
    const testBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
    
    console.log('\nTesting Gemini Vision API...');
    const result = await gemini.analyzeComplaintImage(
      testBase64,
      'Test complaint',
      'This is a test complaint'
    );
    
    console.log('✓ Gemini analysis successful!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('✗ Gemini test failed:', error.message);
    if (error.response?.data) {
      console.error('API Error:', error.response.data);
    }
  }
}

testGemini();
