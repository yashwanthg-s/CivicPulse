import React, { useState } from 'react';
import { CameraCapture } from './CameraCapture';
import { LocationDisplay } from './LocationDisplay';
import { complaintService } from '../services/complaintService';
import { useLanguage } from '../context/LanguageContext';
import '../styles/ComplaintForm.css';

export const ComplaintForm = ({ userId = 1 }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  });

  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [duplicateInfo, setDuplicateInfo] = useState(null);
  const [imageValidationError, setImageValidationError] = useState('');
  const [validationResult, setValidationResult] = useState(null);

  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0]
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const convertImageToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const validateImageWithGemini = async (photoBlob) => {
    try {
      setValidating(true);
      setImageValidationError('');

      // Convert image to base64
      const base64Image = await convertImageToBase64(photoBlob);

      // Send to backend for Gemini validation with timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch('http://localhost:5000/api/complaints/validate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image: base64Image
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn('Gemini validation service unavailable (status: ' + response.status + '), allowing submission');
          setImageValidationError('');
          setValidationResult(null);
          return true; // Allow submission if service down
        }

        const result = await response.json();

        if (!result.success || !result.valid) {
          setImageValidationError(result.message || 'Invalid image. Please capture a photo showing the civic issue.');
          setValidationResult(null);
          return false;
        }

        // Image is valid - store validation result
        setValidationResult(result);
        setImageValidationError('');

        // Auto-fill category and priority if detected
        if (result.category && result.category !== 'other') {
          setFormData(prev => ({
            ...prev,
            category: result.category,
            priority: result.priority || prev.priority
          }));
        }

        return true;
      } catch (fetchError) {
        console.warn('Gemini validation fetch error:', fetchError.message);
        // Allow submission if validation service is unavailable
        setImageValidationError('');
        setValidationResult(null);
        return true;
      }
    } catch (error) {
      console.warn('Image validation error:', error);
      // Allow submission if any error occurs
      setImageValidationError('');
      setValidationResult(null);
      return true;
    } finally {
      setValidating(false);
    }
  };

  const handlePhotoCapture = async (photoData) => {
    // Set photo immediately
    setCapturedPhoto(photoData);
    setImageValidationError('');
    
    // Validate image with Gemini and auto-fill category/priority
    setValidating(true);
    try {
      const base64Image = await convertImageToBase64(photoData.blob);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('http://localhost:5000/api/complaints/validate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: base64Image,
          title: formData.title,
          description: formData.description
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.valid) {
          // Store validation result
          setValidationResult(result);
          
          // Auto-fill category and priority based on image analysis
          if (result.category && result.category !== 'other') {
            setFormData(prev => ({
              ...prev,
              category: result.category,
              priority: result.priority || prev.priority
            }));
            console.log(`✓ Auto-detected: Category=${result.category}, Priority=${result.priority}`);
          }
          setImageValidationError('');
        } else if (!result.valid) {
          setImageValidationError(result.message || 'Invalid image. Please capture a photo showing the civic issue.');
          setValidationResult(null);
        }
      }
    } catch (error) {
      console.warn('Image analysis error:', error.message);
      // Allow submission even if analysis fails
      setValidationResult(null);
    } finally {
      setValidating(false);
    }
  };

  const handleLocationCapture = (locationData) => {
    setLocation(locationData);
  };

  const handleError = (errorMessage) => {
    setErrors(prev => ({
      ...prev,
      general: errorMessage
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t('complaintTitle') + ' ' + t('error');
    }
    if (!formData.description.trim()) {
      newErrors.description = t('description') + ' ' + t('error');
    }
    // Category is auto-detected from image, no manual validation needed
    if (!capturedPhoto) {
      newErrors.photo = 'Live photo capture is required';
    }
    if (!location) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const { date, time } = getCurrentDateTime();

      const complaintPayload = {
        userId: userId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        latitude: location.latitude,
        longitude: location.longitude,
        date,
        time,
        imageBlob: capturedPhoto.blob,
        detected_issue: validationResult?.detected_issue || null
      };

      console.log('Submitting complaint for user ID:', userId);
      const response = await complaintService.submitComplaint(complaintPayload);

      console.log('Backend response:', response);

      if (response.duplicate_detected) {
        console.log('Duplicate detected! Setting notification...');
        setDuplicateInfo({
          message: response.duplicate_message,
          count: response.similar_complaints_count
        });
      } else {
        console.log('No duplicate detected');
      }

      setSuccessMessage(`✓ Complaint submitted successfully! ID: ${response.id}`);

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium'
      });
      setCapturedPhoto(null);
      setLocation(null);
      setErrors({});
      setImageValidationError('');
      setValidationResult(null);

      setTimeout(() => {
        setSuccessMessage('');
        setDuplicateInfo(null);
      }, 10000);
    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error.message || 'Failed to submit complaint';
      
      // Check if it's a blocked image error
      if (errorMessage.includes('human') || errorMessage.includes('blocked')) {
        setImageValidationError(errorMessage);
      } else {
        setErrors(prev => ({
          ...prev,
          general: errorMessage
        }));
      }
    }
    setLoading(false);
  };

  const isFormValid = capturedPhoto && location && formData.title && formData.description;

  return (
    <div className="complaint-form-container">
      <h1>📝 {t('submitComplaint')}</h1>

      {errors.general && (
        <div className="alert alert-error">
          {errors.general}
        </div>
      )}

      {validating && (
        <div className="alert alert-info">
          ⏳ {t('loading')}
        </div>
      )}

      {imageValidationError && (
        <div className="alert alert-error">
          <strong>❌ {t('error')}:</strong>
          <p>{imageValidationError}</p>
        </div>
      )}

      {validationResult && (
        <div className="alert alert-success">
          <strong>✓ {t('success')}:</strong>
          <p>Detected Issue: <strong>{validationResult.detected_issue}</strong></p>
          <p>{t('category')}: <strong>{t(validationResult.category)}</strong></p>
          <p>Confidence: <strong>{validationResult.confidence}%</strong></p>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}

      {duplicateInfo && (
        <div className="alert alert-warning">
          <strong>⚠️ Duplicate Detected:</strong>
          <p>{duplicateInfo.message}</p>
          <p><small>{duplicateInfo.count} similar complaint{duplicateInfo.count > 1 ? 's' : ''} found in this area.</small></p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="complaint-form">
        {/* Complaint Title */}
        <div className="form-group">
          <label htmlFor="title">{t('complaintTitle')} *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder={t('complaintTitle')}
            className={errors.title ? 'input-error' : ''}
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        {/* Complaint Description */}
        <div className="form-group">
          <label htmlFor="description">{t('description')} *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder={t('description')}
            rows="5"
            className={errors.description ? 'input-error' : ''}
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        {/* Auto-Detected Category & Priority Display */}
        {validationResult && (
          <div className="form-group auto-detected-info">
            <h4>🔍 Auto-Detected Information</h4>
            <div className="detection-grid">
              <div className="detection-item">
                <label>{t('category')}</label>
                <p className="detection-value">{t(validationResult.category)}</p>
              </div>
              <div className="detection-item">
                <label>{t('priority')}</label>
                <p className="detection-value">{t(validationResult.priority)}</p>
              </div>
              <div className="detection-item">
                <label>Confidence</label>
                <p className="detection-value">{validationResult.confidence}%</p>
              </div>
            </div>
            <p className="detection-issue"><strong>Detected Issue:</strong> {validationResult.detected_issue}</p>
          </div>
        )}

        {/* Live Camera Capture */}
        <div className="form-section">
          {errors.photo && <span className="error-text">{errors.photo}</span>}
          <CameraCapture
            onPhotoCapture={handlePhotoCapture}
            onError={handleError}
          />
        </div>

        {/* Location Capture */}
        <div className="form-section">
          {errors.location && <span className="error-text">{errors.location}</span>}
          <LocationDisplay
            onLocationCapture={handleLocationCapture}
            onError={handleError}
          />
        </div>

        {/* Date and Time Display */}
        <div className="form-group datetime-display">
          <h3>📅 Submission Date & Time</h3>
          <p>
            <strong>Date:</strong> {getCurrentDateTime().date}
          </p>
          <p>
            <strong>Time:</strong> {getCurrentDateTime().time}
          </p>
          <p className="info-text">
            These are automatically captured and cannot be edited.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || validating}
          className="btn btn-primary btn-large btn-submit"
        >
          {loading ? '⏳ ' + t('submitting') : validating ? '⏳ ' + t('loading') : '✓ ' + t('submitButton')}
        </button>
      </form>
    </div>
  );
};
