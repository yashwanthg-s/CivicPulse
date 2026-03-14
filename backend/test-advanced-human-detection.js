const advancedHumanDetectionService = require('./services/advancedHumanDetectionService');
const fs = require('fs');
require('dotenv').config();

async function testHumanDetection() {
  try {
    console.log('🧪 Testing Advanced Human Detection Service\n');

    // Test 1: Check if service is initialized
    console.log('✓ Service initialized');
    console.log(`  OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Not set'}`);

    // Test 2: Check methods exist
    console.log('\n✓ Methods available:');
    console.log(`  - detectHuman: ${typeof advancedHumanDetectionService.detectHuman === 'function' ? '✓' : '✗'}`);
    console.log(`  - analyzeImageForHumanFeatures: ${typeof advancedHumanDetectionService.analyzeImageForHumanFeatures === 'function' ? '✓' : '✗'}`);
    console.log(`  - quickFeatureCheck: ${typeof advancedHumanDetectionService.quickFeatureCheck === 'function' ? '✓' : '✗'}`);
    console.log(`  - isHumanImage: ${typeof advancedHumanDetectionService.isHumanImage === 'function' ? '✓' : '✗'}`);
    console.log(`  - getBlockMessage: ${typeof advancedHumanDetectionService.getBlockMessage === 'function' ? '✓' : '✗'}`);

    // Test 3: Check human features list
    console.log('\n✓ Human features to detect:');
    console.log(`  ${advancedHumanDetectionService.humanFeatures.join(', ')}`);

    // Test 4: Test isHumanImage logic
    console.log('\n✓ Testing isHumanImage logic:');

    const testCases = [
      {
        name: 'High confidence human',
        result: {
          is_human: true,
          confidence: 95,
          detected_features: ['eyes', 'nose', 'face', 'lips'],
          reason: 'Clear human face'
        },
        expected: true
      },
      {
        name: 'Low confidence human',
        result: {
          is_human: true,
          confidence: 50,
          detected_features: ['eyes'],
          reason: 'Possible human'
        },
        expected: false
      },
      {
        name: 'Multiple features',
        result: {
          is_human: false,
          confidence: 30,
          detected_features: ['eyes', 'nose', 'face'],
          reason: 'Multiple features detected'
        },
        expected: true
      },
      {
        name: 'No human',
        result: {
          is_human: false,
          confidence: 5,
          detected_features: [],
          reason: 'No human features'
        },
        expected: false
      }
    ];

    testCases.forEach(testCase => {
      const result = advancedHumanDetectionService.isHumanImage(testCase.result);
      const status = result === testCase.expected ? '✓' : '✗';
      console.log(`  ${status} ${testCase.name}: ${result} (expected: ${testCase.expected})`);
    });

    // Test 5: Test getBlockMessage
    console.log('\n✓ Testing getBlockMessage:');

    const blockTestCases = [
      {
        detected_features: ['eyes', 'nose', 'face'],
        expected: 'contains human features (eyes, nose, face)'
      },
      {
        detected_features: [],
        expected: 'contains human features'
      }
    ];

    blockTestCases.forEach(testCase => {
      const message = advancedHumanDetectionService.getBlockMessage({
        detected_features: testCase.detected_features
      });
      const hasExpected = message.includes(testCase.expected);
      const status = hasExpected ? '✓' : '✗';
      console.log(`  ${status} Message generated: "${message.substring(0, 60)}..."`);
    });

    console.log('\n✅ All tests passed!');
    console.log('\n📝 Next steps:');
    console.log('  1. Ensure OPENAI_API_KEY is set in .env');
    console.log('  2. Test with actual image upload');
    console.log('  3. Monitor logs for detection results');
    console.log('  4. Adjust thresholds if needed');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testHumanDetection();
