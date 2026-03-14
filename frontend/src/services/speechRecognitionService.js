/**
 * Speech Recognition Service
 * Converts speech to text using Web Speech API
 * Supports multiple languages including Kannada and Hindi
 */

class SpeechRecognitionService {
  constructor() {
    // Get browser's Speech Recognition API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = SpeechRecognition ? new SpeechRecognition() : null;
    this.isListening = false;
    this.transcript = '';
    this.isFinal = false;
  }

  /**
   * Check if browser supports speech recognition
   */
  isSupported() {
    return this.recognition !== null;
  }

  /**
   * Start listening for speech
   * @param {string} language - Language code (e.g., 'en-US', 'kn-IN', 'hi-IN')
   * @param {function} onResult - Callback when speech is recognized
   * @param {function} onError - Callback on error
   * @param {function} onStart - Callback when listening starts
   * @param {function} onEnd - Callback when listening ends
   */
  startListening(language = 'en-US', onResult, onError, onStart, onEnd) {
    if (!this.recognition) {
      console.error('Speech Recognition not supported');
      if (onError) onError('Speech Recognition not supported in this browser');
      return;
    }

    this.isListening = true;
    this.transcript = '';
    this.isFinal = false;

    // Configure recognition
    this.recognition.language = language;
    this.recognition.continuous = true; // Keep listening until stopped
    this.recognition.interimResults = true; // Show interim results
    this.recognition.maxAlternatives = 1;

    // Handle results
    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          this.isFinal = true;
        } else {
          interimTranscript += transcript;
        }
      }

      this.transcript = finalTranscript || interimTranscript;

      if (onResult) {
        onResult({
          transcript: this.transcript,
          isFinal: this.isFinal,
          interim: interimTranscript,
          final: finalTranscript
        });
      }
    };

    // Handle errors
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (onError) onError(event.error);
    };

    // Handle start
    this.recognition.onstart = () => {
      console.log('🎤 Listening started...');
      if (onStart) onStart();
    };

    // Handle end
    this.recognition.onend = () => {
      console.log('🎤 Listening stopped');
      this.isListening = false;
      if (onEnd) onEnd(this.transcript);
    };

    // Start recognition
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      if (onError) onError(error.message);
    }
  }

  /**
   * Stop listening
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Abort listening
   */
  abort() {
    if (this.recognition) {
      this.recognition.abort();
      this.isListening = false;
    }
  }

  /**
   * Get current transcript
   */
  getTranscript() {
    return this.transcript;
  }

  /**
   * Clear transcript
   */
  clearTranscript() {
    this.transcript = '';
    this.isFinal = false;
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
