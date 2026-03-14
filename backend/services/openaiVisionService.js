const axios = require('axios');
const languageTranslator = require('../utils/languageTranslator');

class OpenAIVisionService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    
    if (!this.apiKey) {
      console.warn('⚠️ OPENAI_API_KEY not set in environment variables');
    }
  }

  /**
   * Analyze complaint image using OpenAI Vision API
   * Detects: human faces, category, priority
   * @param {string} base64Image - Base64 encoded image
   * @param {string} title - Complaint title
   * @param {string} description - Complaint description
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeComplaintImage(base64Image, title = '', description = '') {
    try {
      if (!this.apiKey) {
        throw new Error('OPENAI_API_KEY not configured');
      }

      console.log('Analyzing complaint image with OpenAI Vision API...');
      console.log('Original Title:', title);
      console.log('Original Description:', description);
      
      // Translate title and description from Kannada/Hindi to English
      const translated = languageTranslator.translateComplaint(title, description);
      const translatedTitle = translated.title;
      const translatedDescription = translated.description;
      
      if (translatedTitle !== title || translatedDescription !== description) {
        console.log('🔤 Translated Title:', translatedTitle);
        console.log('🔤 Translated Description:', translatedDescription);
      }
      
      const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
      
      if (!base64Data || base64Data.length === 0) {
        throw new Error('Invalid base64 image data');
      }

      console.log('Base64 image size:', base64Data.length, 'bytes');
      console.log('Using model: gpt-4o');
      
      // Call OpenAI Vision API with translated text
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `You are a civic complaint classifier. Analyze the image and text, then respond ONLY with valid JSON.

COMPLAINT DETAILS:
Title: "${translatedTitle}"
Description: "${translatedDescription}"

ANALYSIS STEPS:
1. Examine the image carefully for human faces
2. Identify the civic issue shown in the image
3. Match to the most appropriate category
4. Determine priority level
5. Provide confidence score (0-100)

CATEGORY RULES (in priority order):
1. Sanitation: garbage, waste, trash, litter, dirty streets, sewage, dump, filth
2. Infrastructure: potholes, roads, sidewalks, pavements, cracks, bridges, buildings, water pipes, drainage, streetlights, damaged surfaces
3. Utilities: water leaks, electricity, power, gas, outages, water supply, poles, wires
4. Traffic: traffic signals, congestion, blocked roads, collisions, vehicles, signs
5. Safety: fire, accidents, injuries, hazards, exposed wires, collapsed structures, immediate danger

PRIORITY LEVELS:
- critical: life-threatening, emergency, fire, accidents with injuries
- high: significant damage, affects many people, urgent repair needed
- medium: moderate issue, needs attention soon
- low: minor issue, cosmetic, can wait

Return ONLY this JSON (no other text):
{
  "human_face_detected": false,
  "face_count": 0,
  "category": "infrastructure",
  "priority": "high",
  "confidence_score": 85,
  "detected_issue": "Brief description",
  "reason": "Explanation"
}`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Data}`,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 250,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      // Parse OpenAI response
      const responseText = response.data.choices[0].message.content;
      console.log('OpenAI raw response:', responseText);

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log('Parsed JSON result:', JSON.stringify(result, null, 2));

        // BLOCK if human face is detected
        if (result.human_face_detected) {
          console.error('❌ HUMAN FACE DETECTED - BLOCKING COMPLAINT');
          console.error('Face count:', result.face_count);
          console.error('Confidence:', result.confidence_score);
          console.error('Reason:', result.reason);
          return {
            category: 'blocked',
            priority: 'blocked',
            confidence: 0,
            is_blocked: true,
            block_reason: 'Image contains human. Please upload an image of the issue/location, not people.',
            detection_method: 'openai_vision',
            face_count: result.face_count
          };
        }

        // No face detected - ACCEPT and return category/priority
        console.log('✓ No human face detected, accepting image');
        console.log('Detected category:', result.category);
        console.log('Detected priority:', result.priority);
        console.log('Reason:', result.reason);
        
        // Ensure confidence is a number between 0-100
        let confidence = result.confidence_score || 50;
        if (typeof confidence === 'string') {
          confidence = parseInt(confidence, 10);
        }
        // Clamp confidence to 0-100 range
        confidence = Math.max(0, Math.min(100, confidence));
        
        return {
          category: result.category || 'other',
          priority: result.priority || 'medium',
          confidence: confidence,
          is_blocked: false,
          detection_method: 'openai_vision',
          detected_issue: result.detected_issue,
          face_count: result.face_count || 0
        };
      } else {
        throw new Error('Could not parse OpenAI response');
      }

    } catch (error) {
      console.error('❌ OpenAI Vision API error:', error.message);
      if (error.response) {
        console.error('OpenAI error status:', error.response.status);
        console.error('OpenAI error data:', JSON.stringify(error.response.data));
      }
      
      // Check if it's an API key issue
      if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
        console.error('❌ CRITICAL: OPENAI_API_KEY is not configured properly!');
        console.error('   Current value:', this.apiKey);
        console.error('   Please set OPENAI_API_KEY in .env file');
      }
      
      // Fallback: Use keyword-based categorization
      console.warn('⚠️ OpenAI API failed, using fallback keyword-based categorization');
      console.warn('   Title:', title);
      console.warn('   Description:', description);
      
      const category = this.getCategory(title + ' ' + description);
      const priority = this.getPriority(title + ' ' + description);
      
      console.warn('   Fallback category:', category);
      console.warn('   Fallback priority:', priority);
      
      return {
        category: category,
        priority: priority,
        confidence: 30,
        is_blocked: false,
        detection_method: 'fallback_keyword',
        face_count: 0,
        warning: 'Using fallback keyword matching - OpenAI API not available'
      };
    }
  }

  /**
   * Fallback category detection based on keywords
   */
  getCategory(text) {
    const textLower = text.toLowerCase();

    const categories = {
      sanitation: ['garbage', 'waste', 'trash', 'dirty', 'clean', 'sewage', 'litter', 'dump', 'filth', 'accumulation'],
      utilities: ['water leak', 'water leaking', 'pipeline', 'water pipe', 'electricity', 'power', 'gas', 'outage', 'line', 'pole', 'wire', 'supply', 'leakage', 'leaking', 'drainage'],
      infrastructure: ['pothole', 'road', 'sidewalk', 'pavement', 'crack', 'bridge', 'building', 'streetlight', 'light', 'damaged', 'broken', 'surface'],
      traffic: ['traffic', 'signal', 'congestion', 'vehicle', 'car', 'collision', 'blocked', 'sign', 'marking', 'intersection'],
      safety: ['fire', 'accident', 'injury', 'emergency', 'danger', 'hazard', 'unsafe', 'threat', 'exposed', 'collapsed']
    };

    // Check Sanitation first (garbage/waste keywords)
    for (const keyword of categories.sanitation) {
      if (textLower.includes(keyword)) {
        return 'sanitation';
      }
    }

    // Check Utilities second (water leaks, electricity, gas, etc.)
    for (const keyword of categories.utilities) {
      if (textLower.includes(keyword)) {
        return 'utilities';
      }
    }

    // Check Infrastructure third (potholes, roads, etc.)
    for (const keyword of categories.infrastructure) {
      if (textLower.includes(keyword)) {
        return 'infrastructure';
      }
    }

    // Check traffic
    for (const keyword of categories.traffic) {
      if (textLower.includes(keyword)) {
        return 'traffic';
      }
    }

    // Check safety last (only for actual emergencies)
    for (const keyword of categories.safety) {
      if (textLower.includes(keyword)) {
        return 'safety';
      }
    }

    return 'other';
  }

  /**
   * Fallback priority detection based on keywords
   */
  getPriority(text) {
    const textLower = text.toLowerCase();

    const criticalKeywords = ['emergency', 'danger', 'urgent', 'critical', 'accident', 'collision', 'injury', 'death', 'fire', 'collapse', 'hazard', 'life-threatening', 'immediate', 'flooding', 'flood'];
    const highKeywords = ['major', 'significant', 'severe', 'broken', 'damaged', 'blocked', 'serious', 'urgent repair', 'leaking', 'leakage', 'wastage', 'slippery', 'affects'];
    const mediumKeywords = ['issue', 'problem', 'damage', 'concern', 'needs', 'repair', 'attention'];

    if (criticalKeywords.some(keyword => textLower.includes(keyword))) {
      return 'critical';
    }
    if (highKeywords.some(keyword => textLower.includes(keyword))) {
      return 'high';
    }
    if (mediumKeywords.some(keyword => textLower.includes(keyword))) {
      return 'medium';
    }

    return 'low';
  }
}

module.exports = new OpenAIVisionService();
