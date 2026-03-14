// Test Chat Detection Filter
const contentFilter = require('./utils/contentFilter');

// Test cases
const testCases = [
  // Should BLOCK - Chat messages
  {
    title: 'Hi',
    description: 'Hello there',
    shouldBlock: true,
    reason: 'Simple greeting'
  },
  {
    title: 'What are you doing',
    description: 'Just checking in',
    shouldBlock: true,
    reason: 'Chat question'
  },
  {
    title: 'How are you',
    description: 'How are you doing today',
    shouldBlock: true,
    reason: 'Chat question'
  },
  {
    title: 'Hi hello',
    description: 'Just saying hi',
    shouldBlock: true,
    reason: 'Multiple chat keywords'
  },
  {
    title: 'ನಮಸ್ಕಾರ',
    description: 'ಹಾಯ್ ನೀವು ಯಾಕೆ ಮಾಡುತ್ತಿದ್ದೀರಿ',
    shouldBlock: true,
    reason: 'Kannada chat'
  },
  {
    title: 'नमस्ते',
    description: 'हाय आप क्या कर रहे हैं',
    shouldBlock: true,
    reason: 'Hindi chat'
  },
  {
    title: 'Bye',
    description: 'Goodbye',
    shouldBlock: true,
    reason: 'Goodbye message'
  },
  {
    title: 'Thanks',
    description: 'Thank you',
    shouldBlock: true,
    reason: 'Thank you message'
  },
  
  // Should ALLOW - Legitimate complaints
  {
    title: 'Pothole on Main Street',
    description: 'There is a large pothole on Main Street near the market that needs immediate repair',
    shouldBlock: false,
    reason: 'Legitimate complaint'
  },
  {
    title: 'Broken streetlight',
    description: 'The streetlight near the park is broken and needs replacement',
    shouldBlock: false,
    reason: 'Legitimate complaint'
  },
  {
    title: 'Water leak',
    description: 'There is a water leak from the main pipe near the school',
    shouldBlock: false,
    reason: 'Legitimate complaint'
  },
  {
    title: 'Garbage accumulation',
    description: 'Garbage is piling up in the residential area and needs to be cleaned',
    shouldBlock: false,
    reason: 'Legitimate complaint'
  },
  {
    title: 'Hi, there is a pothole',
    description: 'There is a large pothole on the road that needs repair. It is very dangerous',
    shouldBlock: false,
    reason: 'Chat keyword but legitimate complaint with details'
  },
  {
    title: 'Road damage',
    description: 'The road is damaged and needs immediate repair. This is affecting traffic',
    shouldBlock: false,
    reason: 'Legitimate complaint without chat keywords'
  }
];

console.log('🧪 Testing Chat Detection Filter\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = contentFilter.checkContent(testCase.title, testCase.description);
  const isCorrect = result.isBlocked === testCase.shouldBlock;
  
  const status = isCorrect ? '✓ PASS' : '✗ FAIL';
  const color = isCorrect ? '\x1b[32m' : '\x1b[31m';
  const reset = '\x1b[0m';
  
  console.log(`\n${color}${status}${reset} Test ${index + 1}: ${testCase.reason}`);
  console.log(`  Title: "${testCase.title}"`);
  console.log(`  Description: "${testCase.description}"`);
  console.log(`  Expected: ${testCase.shouldBlock ? 'BLOCKED' : 'ALLOWED'}`);
  console.log(`  Got: ${result.isBlocked ? 'BLOCKED' : 'ALLOWED'}`);
  if (result.reason) {
    console.log(`  Reason: ${result.reason}`);
  }
  
  if (isCorrect) {
    passed++;
  } else {
    failed++;
  }
});

console.log('\n' + '='.repeat(80));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);
console.log(`Success rate: ${((passed / testCases.length) * 100).toFixed(1)}%\n`);

if (failed === 0) {
  console.log('✓ All tests passed!');
} else {
  console.log(`✗ ${failed} test(s) failed`);
  process.exit(1);
}
