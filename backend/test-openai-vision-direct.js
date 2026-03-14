const axios = require('axios');
require('dotenv').config();

async function testOpenAIVision() {
  try {
    console.log('🧪 Testing OpenAI Vision API\n');

    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not set in .env');
      process.exit(1);
    }

    console.log('✓ API Key found');
    console.log(`  Key: ${process.env.OPENAI_API_KEY.substring(0, 10)}...`);

    // Test 1: Simple text request (no image)
    console.log('\n📝 Test 1: Simple text request (no image)');
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'user',
              content: 'Say "Hello, I am working"'
            }
          ],
          max_tokens: 50
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      console.log('✓ API Response received');
      console.log(`  Message: ${response.data.choices[0].message.content}`);
    } catch (error) {
      console.error('❌ Error:', error.response?.data?.error?.message || error.message);
    }

    // Test 2: Image analysis with base64
    console.log('\n🖼️  Test 2: Image analysis with base64');
    console.log('  Creating test image (1x1 pixel)...');

    // Create a simple 1x1 pixel image
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'What do you see in this image? Answer in one sentence.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/png;base64,${testImageBase64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 100
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      console.log('✓ Image analysis successful');
      console.log(`  Response: ${response.data.choices[0].message.content}`);
    } catch (error) {
      console.error('❌ Error:', error.response?.data?.error?.message || error.message);
      if (error.response?.data?.error?.type === 'invalid_request_error') {
        console.log('\n💡 Hint: Make sure you have vision capabilities enabled for your API key');
      }
    }

    // Test 3: Human detection prompt
    console.log('\n👤 Test 3: Human detection prompt');
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this image for human features. Respond ONLY with JSON:
                  {
                    "is_human": true or false,
                    "confidence": 0-100,
                    "detected_features": [],
                    "reason": "explanation"
                  }`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/png;base64,${testImageBase64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 200
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      console.log('✓ Human detection analysis successful');
      console.log(`  Response: ${response.data.choices[0].message.content}`);
    } catch (error) {
      console.error('❌ Error:', error.response?.data?.error?.message || error.message);
    }

    console.log('\n✅ Tests complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

testOpenAIVision();
