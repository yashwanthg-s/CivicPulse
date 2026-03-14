// Content Filter - Blocks inappropriate complaints

class ContentFilter {
  constructor() {
    // Inappropriate keywords that should be blocked
    this.blockedKeywords = [
      // Violence & Harassment
      'kill', 'murder', 'assault', 'attack', 'beat', 'hit', 'punch', 'kick',
      'stab', 'shoot', 'gun', 'knife', 'weapon', 'threat', 'threaten',
      'harass', 'harassment', 'bully', 'bullying', 'abuse', 'abusive',
      
      // Sexual Content
      'rape', 'molest', 'sexual assault', 'sexual harassment', 'grope',
      'inappropriate touch', 'indecent', 'obscene', 'pornography', 'porn',
      
      // Hate Speech
      'hate', 'racist', 'racism', 'discrimination', 'discriminate',
      
      // Drugs & Illegal Activities
      'drug deal', 'selling drugs', 'buy drugs', 'cocaine', 'heroin', 'meth',
      
      // Personal Attacks
      'revenge', 'retaliate', 'get back at', 'teach a lesson',
      
      // Spam/Fake (removed 'test', 'testing', 'sample' as they're too common in legitimate complaints)
      'fake complaint', 'dummy'
    ];
    
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
    
    // Suspicious patterns
    this.suspiciousPatterns = [
      /\b(massage|massaging|touching|touched)\s+(someone|somebody|person|people|him|her)\b/i,
      /\b(hurt|harm|damage|injure)\s+(someone|somebody|person|people|him|her)\b/i,
      /\b(follow|following|followed|stalk|stalking)\s+(someone|somebody|person|people|him|her)\b/i,
      /\b(spy|spying|watch|watching)\s+(someone|somebody|person|people|him|her)\b/i,
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
   * Check if content contains inappropriate material
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
    
    // Check for blocked keywords (violence, hate speech, etc.)
    for (const keyword of this.blockedKeywords) {
      if (fullText.includes(keyword.toLowerCase())) {
        return {
          isBlocked: true,
          reason: `Your complaint contains inappropriate content and cannot be submitted. Please ensure your complaint is about legitimate civic issues only.`,
          keyword: keyword
        };
      }
    }
    
    // Check for suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(fullText)) {
        return {
          isBlocked: true,
          reason: `Your complaint appears to describe personal matters or inappropriate behavior. This system is for reporting civic infrastructure and public service issues only.`,
          pattern: pattern.toString()
        };
      }
    }
    
    // Check for chat patterns first (more aggressive)
    const hasChatPattern = this.chatPatterns.some(pattern => pattern.test(fullText));
    
    // Check for chat keywords
    const chatKeywordCount = this.chatKeywords.filter(kw => 
      fullText.includes(kw.toLowerCase())
    ).length;
    
    // Block if:
    // 1. Contains chat patterns (like "what are you doing", "how are you")
    // 2. Contains 3+ chat keywords (was 2, now more lenient)
    // 3. Is very short and contains 2+ chat keywords
    
    if (hasChatPattern) {
      // Chat pattern detected - this is likely a chat message
      return {
        isBlocked: true,
        reason: `This appears to be a chat message, not a complaint. Please submit only legitimate civic issues like infrastructure problems, sanitation issues, or public service concerns.`
      };
    }
    
    if (chatKeywordCount >= 3) {
      // Multiple chat keywords detected (3 or more)
      return {
        isBlocked: true,
        reason: `This appears to be a chat message, not a complaint. Please submit only legitimate civic issues like infrastructure problems, sanitation issues, or public service concerns.`
      };
    }
    
    if (chatKeywordCount >= 2 && fullText.length < 30) {
      // Two chat keywords and very short (< 30 chars) = likely spam
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
  
  /**
   * Log blocked attempts for monitoring
   */
  logBlockedAttempt(userId, title, description, reason) {
    console.warn('🚫 BLOCKED COMPLAINT ATTEMPT:', {
      userId,
      title: title.substring(0, 50),
      description: description.substring(0, 100),
      reason,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new ContentFilter();
