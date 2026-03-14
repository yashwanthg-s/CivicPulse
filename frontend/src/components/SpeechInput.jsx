import React, { useState, useEffect } from 'react';
import { speechRecognitionService } from '../services/speechRecognitionService';
import { useLanguage } from '../context/LanguageContext';
import '../styles/SpeechInput.css';

export const SpeechInput = ({ 
  value, 
  onChange, 
  placeholder, 
  isTextarea = false,
  language = 'en-US',
  fieldName = 'title'
}) => {
  const { currentLanguage } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  // Map language codes to speech recognition codes
  const languageMap = {
    en: 'en-US',
    kn: 'kn-IN',
    hi: 'hi-IN'
  };

  const speechLanguage = languageMap[currentLanguage] || 'en-US';

  useEffect(() => {
    setIsSupported(speechRecognitionService.isSupported());
  }, []);

  const handleStartListening = () => {
    if (!isSupported) {
      setError('Speech recognition not supported in your browser');
      return;
    }

    setError('');
    setInterimText('');
    setIsListening(true);

    speechRecognitionService.startListening(
      speechLanguage,
      (result) => {
        // Update interim text for real-time feedback
        if (result.interim) {
          setInterimText(result.interim);
        }
        
        // Update the input field with final transcript
        if (result.final) {
          const newText = value + result.final;
          onChange({
            target: {
              name: fieldName,
              value: newText
            }
          });
          setInterimText('');
        }
      },
      (error) => {
        console.error('Speech error:', error);
        setError(`Error: ${error}`);
        setIsListening(false);
      },
      () => {
        // On start
        console.log('Listening started');
      },
      (finalTranscript) => {
        // On end
        setIsListening(false);
        setInterimText('');
      }
    );
  };

  const handleStopListening = () => {
    speechRecognitionService.stopListening();
    setIsListening(false);
    setInterimText('');
  };

  const handleClear = () => {
    onChange({
      target: {
        name: fieldName,
        value: ''
      }
    });
    setInterimText('');
    setError('');
  };

  const handleTextChange = (e) => {
    // Allow direct typing
    onChange(e);
    setError('');
  };

  const InputComponent = isTextarea ? 'textarea' : 'input';

  return (
    <div className="speech-input-container">
      <div className="speech-input-wrapper">
        {/* Text Input Field - Always editable */}
        <div className="input-field-wrapper">
          <InputComponent
            type={isTextarea ? undefined : 'text'}
            name={fieldName}
            value={value}
            onChange={handleTextChange}
            placeholder={placeholder}
            className="speech-input-field"
            rows={isTextarea ? 5 : undefined}
          />
          
          {/* Interim text display while listening */}
          {interimText && (
            <div className="interim-text">
              <span className="interim-label">🎤 Listening:</span>
              <span className="interim-content">{interimText}</span>
            </div>
          )}
        </div>

        {/* Speech controls */}
        <div className="speech-controls">
          {!isListening ? (
            <button
              type="button"
              className="btn-speech-start"
              onClick={handleStartListening}
              disabled={!isSupported}
              title="Click to start speaking"
            >
              🎤 Start
            </button>
          ) : (
            <button
              type="button"
              className="btn-speech-stop"
              onClick={handleStopListening}
              title="Click to stop speaking"
            >
              ⏹️ Stop
            </button>
          )}

          {value && (
            <button
              type="button"
              className="btn-speech-clear"
              onClick={handleClear}
              title="Clear text"
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Status indicator */}
        {isListening && (
          <div className="listening-indicator">
            <span className="pulse"></span>
            <span className="listening-text">Listening...</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="speech-error">
            ⚠️ {error}
          </div>
        )}

        {/* Browser support message */}
        {!isSupported && (
          <div className="speech-unsupported">
            ℹ️ Speech recognition not supported. Please use text input.
          </div>
        )}
      </div>
    </div>
  );
};
