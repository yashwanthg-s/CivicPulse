/**
 * Language Translator - Converts Kannada and Hindi text to English keywords
 * Used for AI model compatibility (Gemini, OpenAI only understand English)
 */

class LanguageTranslator {
  constructor() {
    // Kannada to English keyword mappings
    this.kannadaKeywords = {
      // Main keywords
      'ಗುಂಡಿ': 'pothole',
      'ರಸ್ತೆ': 'road',
      'ರಸ್ತೆಯಲ್ಲಿ': 'road',
      'ರಸ್ತೆಯ': 'road',
      'ಕಸ': 'garbage',
      'ನೀರು': 'water',
      'ಸೋರಿಕೆ': 'leak',
      'ಹಾನಿ': 'damage',
      'ಮುರಿದ': 'broken',
      'ಅಪಘಾತ': 'accident',
      'ಟ್ರಾಫಿಕ್': 'traffic',
      'ಮೂಲಸೌಕರ್ಯ': 'infrastructure',
      'ಬೀದಿ': 'street',
      'ರಂಧ್ರ': 'hole',
      'ಅವಶೇಷ': 'debris',
      'ಹೊಗೆ': 'smoke',
      'ಬೆಂಕಿ': 'fire',
      'ತ್ಯಾಜ್ಯ': 'waste',
      'ಮಲ': 'sewage',
      'ಮಲಿನತೆ': 'filth',
      'ಪಾದಚಾರಿ ಮಾರ್ಗ': 'sidewalk',
      'ಸಿಮೆಂಟ್ ಮಾರ್ಗ': 'pavement',
      'ಬಿರುಕು': 'crack',
      'ಸೇತುವೆ': 'bridge',
      'ಕಟ್ಟಡ': 'building',
      'ರಸ್ತೆ ದೀಪ': 'streetlight',
      'ದೀಪ': 'light',
      'ಮೇಲ್ಮೈ': 'surface',
      'ಸಂಕೇತ': 'signal',
      'ಸಂಚಯ': 'congestion',
      'ವಾಹನ': 'vehicle',
      'ವಾಹನಗಳ': 'vehicles',
      'ಕಾರು': 'car',
      'ಘರ್ಷಣೆ': 'collision',
      'ನಿರ್ಬಂಧಿತ': 'blocked',
      'ಚಿಹ್ನೆ': 'sign',
      'ಗುರುತು': 'marking',
      'ಛೇದಕ': 'intersection',
      'ಗಾಯ': 'injury',
      'ತುರ್ತು': 'emergency',
      'ಅಪಾಯ': 'danger',
      'ಅಪಾಯಕರ': 'dangerous',
      'ಅಪಾಯಕರವಾಗಿದೆ': 'dangerous',
      'ಅಸುರಕ್ಷಿತ': 'unsafe',
      'ಬೆದರಿಕೆ': 'threat',
      'ಬಹಿರಂಗ': 'exposed',
      'ಕುಸಿತ': 'collapsed',
      'ವಿದ್ಯುತ್': 'electricity',
      'ಶಕ್ತಿ': 'power',
      'ಅನಿಲ': 'gas',
      'ಕಂಬ': 'pole',
      'ತಾರ': 'wire',
      'ಸರಬರಾಜು': 'supply',
      'ಸೋರಿಕೆ': 'leakage',
      'ಒಳಚರಂಡಿ': 'drainage',
      'ಪೈಪ್ ಲೈನ್': 'pipeline',
      // Additional variations
      'ಮುಖ್ಯ': 'main',
      'ದೊಡ್ಡ': 'large',
      'ಸಮಸ್ಯೆ': 'problem',
      'ಉಂಟಾಗುತ್ತಿದೆ': 'happening',
      'ಇದೆ': 'is',
      'ಮತ್ತು': 'and',
      'ಜನರಿಗೆ': 'people',
      'ಚಲಿಸುವ': 'moving',
      'ಹಾಗೂ': 'and',
      'ಮೆಟ್ಟೆ': 'surface'
    };

    // Hindi to English keyword mappings
    this.hindiKeywords = {
      // Main keywords
      'गड्ढा': 'pothole',
      'सड़क': 'road',
      'सड़क पर': 'road',
      'कचरा': 'garbage',
      'पानी': 'water',
      'रिसाव': 'leak',
      'नुकसान': 'damage',
      'टूटा हुआ': 'broken',
      'दुर्घटना': 'accident',
      'ट्रैफिक': 'traffic',
      'बुनियादी ढांचा': 'infrastructure',
      'सड़क': 'street',
      'छेद': 'hole',
      'मलबा': 'debris',
      'धुआं': 'smoke',
      'आग': 'fire',
      'अपशिष्ट': 'waste',
      'सीवेज': 'sewage',
      'गंदगी': 'filth',
      'फुटपाथ': 'sidewalk',
      'दरार': 'crack',
      'पुल': 'bridge',
      'भवन': 'building',
      'सड़क की रोशनी': 'streetlight',
      'प्रकाश': 'light',
      'सतह': 'surface',
      'संकेत': 'signal',
      'भीड़': 'congestion',
      'वाहन': 'vehicle',
      'कार': 'car',
      'टकराव': 'collision',
      'अवरुद्ध': 'blocked',
      'संकेत': 'sign',
      'निशान': 'marking',
      'चौराहा': 'intersection',
      'चोट': 'injury',
      'आपातकाल': 'emergency',
      'खतरा': 'danger',
      'असुरक्षित': 'unsafe',
      'धमकी': 'threat',
      'उजागर': 'exposed',
      'ढहा हुआ': 'collapsed',
      'बिजली': 'electricity',
      'शक्ति': 'power',
      'गैस': 'gas',
      'खंभा': 'pole',
      'तार': 'wire',
      'आपूर्ति': 'supply',
      'रिसाव': 'leakage',
      'जल निकासी': 'drainage',
      'पाइपलाइन': 'pipeline',
      // Additional variations
      'मुख्य': 'main',
      'बड़ा': 'large',
      'समस्या': 'problem',
      'हो रहा है': 'happening',
      'है': 'is',
      'और': 'and'
    };
  }

  /**
   * Translate Kannada text to English keywords
   * @param {string} text - Kannada text
   * @returns {string} Translated text with English keywords
   */
  translateKannadaToEnglish(text) {
    if (!text) return '';
    
    let translated = text;
    
    // Replace Kannada keywords with English equivalents
    // Sort by length (longest first) to avoid partial replacements
    const sortedKeywords = Object.entries(this.kannadaKeywords)
      .sort((a, b) => b[0].length - a[0].length);
    
    for (const [kannada, english] of sortedKeywords) {
      // Use word boundary matching for better accuracy
      const regex = new RegExp(kannada, 'g');
      translated = translated.replace(regex, english);
    }
    
    console.log(`[Kannada] "${text}" → "${translated}"`);
    return translated;
  }

  /**
   * Translate Hindi text to English keywords
   * @param {string} text - Hindi text
   * @returns {string} Translated text with English keywords
   */
  translateHindiToEnglish(text) {
    if (!text) return '';
    
    let translated = text;
    
    // Replace Hindi keywords with English equivalents
    // Sort by length (longest first) to avoid partial replacements
    const sortedKeywords = Object.entries(this.hindiKeywords)
      .sort((a, b) => b[0].length - a[0].length);
    
    for (const [hindi, english] of sortedKeywords) {
      const regex = new RegExp(hindi, 'g');
      translated = translated.replace(regex, english);
    }
    
    console.log(`[Hindi] "${text}" → "${translated}"`);
    return translated;
  }

  /**
   * Detect language and translate to English
   * @param {string} text - Text to translate
   * @returns {string} Translated text
   */
  detectAndTranslate(text) {
    if (!text) return '';
    
    // Check if text contains Kannada characters
    const kannadaRegex = /[\u0C80-\u0CFF]/g;
    if (kannadaRegex.test(text)) {
      console.log('🔤 Detected Kannada text, translating to English...');
      return this.translateKannadaToEnglish(text);
    }
    
    // Check if text contains Hindi characters
    const hindiRegex = /[\u0900-\u097F]/g;
    if (hindiRegex.test(text)) {
      console.log('🔤 Detected Hindi text, translating to English...');
      return this.translateHindiToEnglish(text);
    }
    
    // Already in English or other language
    return text;
  }

  /**
   * Translate both title and description
   * @param {string} title - Complaint title
   * @param {string} description - Complaint description
   * @returns {Object} Translated title and description
   */
  translateComplaint(title, description) {
    return {
      title: this.detectAndTranslate(title),
      description: this.detectAndTranslate(description)
    };
  }
}

module.exports = new LanguageTranslator();
