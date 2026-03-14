/**
 * Test Language Translator
 * Tests Kannada and Hindi to English translation
 */

const languageTranslator = require('./utils/languageTranslator');

console.log('🔤 Testing Language Translator\n');

// Test 1: Kannada translation
console.log('Test 1: Kannada Translation');
console.log('Input: ಮುಖ್ಯ ರಸ್ತೆಯಲ್ಲಿ ಗುಂಡಿ');
const kannadaTranslated = languageTranslator.translateKannadaToEnglish('ಮುಖ್ಯ ರಸ್ತೆಯಲ್ಲಿ ಗುಂಡಿ');
console.log('Output:', kannadaTranslated);
console.log('Expected: main road pothole\n');

// Test 2: Hindi translation
console.log('Test 2: Hindi Translation');
console.log('Input: मुख्य सड़क पर गड्ढा');
const hindiTranslated = languageTranslator.translateHindiToEnglish('मुख्य सड़क पर गड्ढा');
console.log('Output:', hindiTranslated);
console.log('Expected: main road pothole\n');

// Test 3: Auto-detect and translate Kannada
console.log('Test 3: Auto-detect Kannada');
const autoKannada = languageTranslator.detectAndTranslate('ರಸ್ತೆಯಲ್ಲಿ ಗುಂಡಿ ಮತ್ತು ಕಸ');
console.log('Input: ರಸ್ತೆಯಲ್ಲಿ ಗುಂಡಿ ಮತ್ತು ಕಸ');
console.log('Output:', autoKannada);
console.log('Expected: road pothole and garbage\n');

// Test 4: Auto-detect and translate Hindi
console.log('Test 4: Auto-detect Hindi');
const autoHindi = languageTranslator.detectAndTranslate('सड़क पर गड्ढा और कचरा');
console.log('Input: सड़क पर गड्ढा और कचरा');
console.log('Output:', autoHindi);
console.log('Expected: road pothole and garbage\n');

// Test 5: Translate complaint (title + description)
console.log('Test 5: Translate Complaint');
const complaint = languageTranslator.translateComplaint(
  'ಮುಖ್ಯ ರಸ್ತೆಯಲ್ಲಿ ಗುಂಡಿ',
  'ಪೊಟ್ಟೆ ಮಾರ್ಗದಲ್ಲಿ ದೊಡ್ಡ ಗುಂಡಿ ಇದೆ ಮತ್ತು ಟ್ರಾಫಿಕ್ ಸಮಸ್ಯೆ ಉಂಟಾಗುತ್ತಿದೆ'
);
console.log('Title:', complaint.title);
console.log('Description:', complaint.description);
console.log('\n✓ Language Translator Tests Complete');
