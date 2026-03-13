const fs = require('fs');
const path = require('path');
const openaiVisionService = require('./services/openaiVisionService');

/**
 * Test OpenAI Vision Service with different images
 * Usage: node test-openai-vision.js <image_path> <title> <description>
 */

async function testOpenAIVision() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: node test-openai-vision.js <image_path> <title> <description>');
    console.log('\nExample:');
    console.log('  node test-openai-vision.js ./uploads/test.jpg "Pothole on Main Street" "Large pothole affecting traffic"');
    process.exit(1);
  }

  const imagePath = args[0];
  const title = args[1];
  const description = args[2];

  try {
    console.log('🔍 Testing OpenAI Vision Service');
    console.log('================================');
    console.log('Image:', imagePath);
    console.log('Title:', title);
    console.log('Description:', description);
    console.log('');

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      console.error('❌ Image file not found:', imagePath);
      process.exit(1);
    }

    // Read image and convert to base64
    console.log('📸 Reading image...');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    console.log('✓ Image size:', imageBuffer.length, 'bytes');
    console.log('✓ Base64 size:', base64Image.length, 'bytes');
    console.log('');

    // Analyze with OpenAI
    console.log('🤖 Sending to OpenAI Vision API...');
    const result = await openaiVisionService.analyzeComplaintImage(
      base64Image,
      title,
      description
    );

    console.log('');
    console.log('✅ OpenAI Response:');
    console.log('================================');
    console.log(JSON.stringify(result, null, 2));
    console.log('');

    // Validate response
    if (result.is_blocked) {
      console.log('⚠️  Image is BLOCKED:', result.block_reason);
    } else {
      console.log('✓ Category:', result.category);
      console.log('✓ Priority:', result.priority);
      console.log('✓ Confidence:', result.confidence + '%');
      console.log('✓ Detected Issue:', result.detected_issue);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
    process.exit(1);
  }
}

testOpenAIVision();
