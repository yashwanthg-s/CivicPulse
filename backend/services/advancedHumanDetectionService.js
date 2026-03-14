const axios = require('axios');
const fs = require('fs');

class AdvancedHumanDetectionService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.openaiUrl = 'https://api.openai.com/v1/chat/completions';
    
    // Human facial features to detect
    this.humanFeatures = [
      'eye', 'eyes',
      'nose',
      'ear', 'ears',
      'face', 'facial',
      'lip', 'lips', 'mouth',
      'hand', 'hands', 'finger', 'fingers',
      'skin', 'hair',
      'forehead', 'cheek', 'chin',
      'eyebrow', 'eyebrows',
      'person', 'human', 'people',
      'head', 'face'
    ];
  }

  /**
   * Analyze image using OpenAI Vision API for human detection
   * Checks for specific facial and body features
   */
  async analyzeImageForHumanFeatures(base64Image) {
    try {
      console.log('\n=== ADVANCED HUMAN DETECTION ===');
      console.log('Analyzing image for human facial features...');

      const response = await axios.post(
        this.openaiUrl,
        {
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this image and identify if it contains human facial or body features. 
                  
                  Check for the presence of these specific features:
                  1. Eyes (eye sockets, pupils, eyelids)
                  2. Nose (nostrils, bridge, tip)
                  3. Ears (ear shape, lobes)
                  4. Face (facial structure, skin texture)
                  5. Lips (mouth, lips, teeth)
                  6. Hands (fingers, palms, nails)
                  7. Hair (head hair, facial hair, beard)
                  8. Skin (human skin tone, texture)
                  
                  Respond ONLY with valid JSON (no markdown, no extra text):
                  {
                    "is_human": true or false,
                    "confidence": number between 0 and 100,
                    "detected_features": ["feature1", "feature2"],
                    "feature_details": {
                      "eyes": {"detected": true or false, "confidence": 0-100},
                      "nose": {"detected": true or false, "confidence": 0-100},
                      "ears": {"detected": true or false, "confidence": 0-100},
                      "face": {"detected": true or false, "confidence": 0-100},
                      "lips": {"detected": true or false, "confidence": 0-100},
                      "hands": {"detected": true or false, "confidence": 0-100},
                      "hair": {"detected": true or false, "confidence": 0-100},
                      "skin": {"detected": true or false, "confidence": 0-100}
                    },
                    "reason": "Brief explanation"
                  }
                  
                  Be strict: If you see ANY human facial features, mark as human.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      // Parse response
      const content = response.data.choices[0].message.content;
      console.log('OpenAI Response:', content);

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse OpenAI response');
      }

      const analysisResult = JSON.parse(jsonMatch[0]);

      console.log('\n📊 Analysis Result:');
      console.log(`  Is Human: ${analysisResult.is_human}`);
      console.log(`  Confidence: ${analysisResult.confidence}%`);
      console.log(`  Detected Features: ${analysisResult.detected_features.join(', ')}`);
      console.log(`  Reason: ${analysisResult.reason}`);

      return {
        is_human: analysisResult.is_human,
        confidence: analysisResult.confidence,
        detected_features: analysisResult.detected_features,
        feature_details: analysisResult.feature_details,
        reason: analysisResult.reason,
        detection_method: 'openai_vision_advanced'
      };
    } catch (error) {
      console.error('❌ Advanced human detection error:', error.message);
      throw error;
    }
  }

  /**
   * Quick check using feature keywords
   * Fallback if OpenAI fails
   */
  async quickFeatureCheck(base64Image) {
    try {
      console.log('\n=== QUICK FEATURE CHECK (Fallback) ===');
      
      const response = await axios.post(
        this.openaiUrl,
        {
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Quick check: Does this image contain a human face or body? Answer ONLY with: YES or NO`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 10
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      const answer = response.data.choices[0].message.content.trim().toUpperCase();
      const isHuman = answer.includes('YES');

      console.log(`Quick Check Result: ${answer}`);

      return {
        is_human: isHuman,
        confidence: isHuman ? 85 : 15,
        detected_features: isHuman ? ['human_detected'] : [],
        reason: `Quick check: ${answer}`,
        detection_method: 'openai_vision_quick'
      };
    } catch (error) {
      console.error('Quick feature check error:', error.message);
      throw error;
    }
  }

  /**
   * Comprehensive human detection with fallback
   */
  async detectHuman(base64Image) {
    try {
      // Try advanced detection first
      try {
        return await this.analyzeImageForHumanFeatures(base64Image);
      } catch (advancedError) {
        console.warn('Advanced detection failed, trying quick check:', advancedError.message);
        
        // Fallback to quick check
        return await this.quickFeatureCheck(base64Image);
      }
    } catch (error) {
      console.error('❌ Human detection failed:', error.message);
      
      // If all fails, return safe default (allow upload)
      return {
        is_human: false,
        confidence: 0,
        detected_features: [],
        reason: 'Detection service unavailable',
        detection_method: 'error_fallback',
        error: error.message
      };
    }
  }

  /**
   * Validate detection result
   */
  isHumanImage(detectionResult) {
    // If confidence is high and human detected, block it
    if (detectionResult.is_human && detectionResult.confidence >= 70) {
      return true;
    }
    
    // If multiple features detected, likely human
    if (detectionResult.detected_features.length >= 3) {
      return true;
    }

    return false;
  }

  /**
   * Get user-friendly error message
   */
  getBlockMessage(detectionResult) {
    const features = detectionResult.detected_features.join(', ');
    
    if (detectionResult.detected_features.length === 0) {
      return '❌ Image contains human features. Please upload a photo of the actual issue/complaint.';
    }

    return `❌ Image contains human features (${features}). Please upload a photo of the actual issue/complaint, not a person.`;
  }
}

module.exports = new AdvancedHumanDetectionService();
