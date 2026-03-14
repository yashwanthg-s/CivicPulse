// Content Filter - Blocks inappropriate complaints (Frontend version)

class ContentFilter {
  constructor() {
    // Chat/greeting words that indicate non-complaint content
    this.chatKeywords = [
      // English greetings
      'hi', 'hello', 'hey', 'hii', 'hiii', 'hiiii',
      'good morning', 'good afternoon', 'good evening', 'good night',
      'hi there', 'hello there', 'greetings', 'hey there',
      'what\'s up', 'whats up', 'sup', 'yo',
      'how are you', 'how r u', 'how ru', 'how are u',
      'what are you doing', 'what r u doing', 'what ru doing',
      'where are you', 'where r u', 'where ru',
      'who are you', 'who r u', 'who ru',
      'what is this', 'what is that',
      'are you there', 'r u there', 'anyone there',
      'talk to me', 'chat with me', 'message me',
      'call me', 'text me', 'dm me',
      'thanks', 'thank you', 'thx', 'ty',
      'bye', 'goodbye', 'see you', 'see ya',
      'ok', 'okay', 'alright', 'sure', 'yes', 'no',
      'lol', 'haha', 'hehe', 'rofl',
      'whatsapp', 'instagram', 'facebook', 'snapchat', 'tiktok', 'telegram',
      
      // Kannada greetings
      'ನಮಸ್ಕಾರ', 'ಹಾಯ್', 'ಹಲೋ', 'ಹೆಲೋ',
      'ಸುಪ್ರಭಾತ', 'ಸುಸಂಜೆ', 'ಸುರಾತ್ರಿ',
      'ನೀವು ಯಾಕೆ ಮಾಡುತ್ತಿದ್ದೀರಿ', 'ನೀವು ಎಲ್ಲಿದ್ದೀರಿ',
      'ನೀವು ಯಾರು', 'ಇದು ಏನು', 'ಅದು ಏನು',
      'ಧನ್ಯವಾದ', 'ಧನ್ಯವಾದಗಳು', 'ಸರಿ', 'ಸರಿಯಾಗಿದೆ',
      'ಹೌದು', 'ಇಲ್ಲ', 'ಸರಿ', 'ಠೀಕ್',
      'ಬೈ', 'ಗುಡ್ಬೈ', 'ಸೀ ಯೂ',
      
      // Hindi greetings
      'नमस्ते', 'हाय', 'हेलो', 'हेलो',
      'सुप्रभात', 'शुभ संध्या', 'शुभ रात्रि',
      'आप क्या कर रहे हैं', 'आप कहाँ हैं',
      'आप कौन हैं', 'यह क्या है', 'वह क्या है',
      'धन्यवाद', 'धन्यवाद', 'ठीक है', 'ठीक है',
      'हाँ', 'नहीं', 'ठीक है', 'ठीक है',
      'बाय', 'अलविदा', 'देखते हैं'
    ];
    
    // Question patterns that indicate chat attempts
    this.chatPatterns = [
      /\b(are you there|r u there|anyone there)\b/i,
      /\b(who are you|what are you|who is this|what is this)\b/i,
      /\b(how are you|how r u|how ru|how are u)\b/i,
      /\b(what are you doing|what r u doing|what ru doing)\b/i,
      /\b(where are you|where r u|where ru)\b/i,
      /\b(talk to me|chat with me|message me|call me|text me)\b/i,
      /\b(what\'s up|whats up|sup|yo)\b/i,
      /\b(thanks|thank you|thx|ty)\b/i,
      /\b(bye|goodbye|see you|see ya)\b/i,
      /\b(ok|okay|alright|sure)\b/i,
      /\b(lol|haha|hehe|rofl)\b/i,
    ];
  }
  
  /**
   * Check if content contains chat messages
   * @param {string} title - Complaint title
   * @param {string} description - Complaint description
   * @returns {Object} - { isBlocked: boolean, reason: string }
   */
  checkContent(title, description) {
    const fullText = `${title} ${description}`.toLowerCase();
    
    // Check for too short content (likely spam)
    if (title.trim().length < 3 || description.trim().length < 5) {
      return {
        isBlocked: true,
        reason: 'Please provide more details. Title must be at least 3 characters and description at least 5 characters.'
      };
    }
    
    // Check for chat patterns first (more aggressive)
    const hasChatPattern = this.chatPatterns.some(pattern => pattern.test(fullText));
    
    // Check for chat keywords
    const chatKeywordCount = this.chatKeywords.filter(kw => 
      fullText.includes(kw.toLowerCase())
    ).length;
    
    // Block if:
    // 1. Contains chat patterns (like "what are you doing", "how are you")
    // 2. Contains multiple chat keywords
    // 3. Is very short and contains chat keywords
    
    if (hasChatPattern) {
      // Chat pattern detected - this is likely a chat message
      return {
        isBlocked: true,
        reason: `This appears to be a chat message, not a complaint. Please submit only legitimate civic issues like infrastructure problems, sanitation issues, or public service concerns.`
      };
    }
    
    if (chatKeywordCount >= 2) {
      // Multiple chat keywords detected
      return {
        isBlocked: true,
        reason: `This appears to be a chat message, not a complaint. Please submit only legitimate civic issues like infrastructure problems, sanitation issues, or public service concerns.`
      };
    }
    
    if (chatKeywordCount >= 1 && fullText.length < 50) {
      // Single chat keyword and very short = likely spam
      return {
        isBlocked: true,
        reason: `This appears to be a chat message, not a complaint. Please submit only legitimate civic issues like infrastructure problems, sanitation issues, or public service concerns.`
      };
    }
    
    // Content is acceptable
    return {
      isBlocked: false,
      reason: null
    };
  }
}

export const contentFilter = new ContentFilter();
