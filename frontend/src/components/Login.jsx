import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { languageService } from '../services/languageService';
import '../styles/Login.css';

export const Login = ({ onLogin, onSwitchToSignup }) => {
  const { setLanguage, t } = useLanguage();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'citizen'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [tempLanguage, setTempLanguage] = useState('en');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Hardcoded credentials for admin and officer
      if (formData.role === 'admin') {
        if (formData.username === 'admin' && formData.password === 'admin') {
          onLogin({ role: 'admin', username: 'admin', id: 1 });
        } else {
          setError(t('invalidCredentials'));
        }
      } else if (formData.role === 'officer') {
        if (formData.username === 'officer' && formData.password === 'officer') {
          onLogin({ role: 'officer', username: 'officer', id: 2 });
        } else {
          setError(t('invalidCredentials'));
        }
      } else {
        // For citizens, check against database
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5003/api'}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Show language selection modal for citizens
          setShowLanguageModal(true);
          setTempLanguage('en');
        } else {
          setError(data.message || t('invalidCredentials'));
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(t('invalidCredentials'));
    }
    setLoading(false);
  };

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setShowLanguageModal(false);

    // Get the login data from form
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';
    const response = fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: formData.username,
        password: formData.password
      })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        onLogin({
          role: 'citizen',
          username: data.user.username,
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          language: lang
        });
      }
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🚨 CivicPulse</h1>
          <h2>{t('login')}</h2>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="role">{t('login')} As</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="citizen">👤 Citizen</option>
              <option value="officer">👮 Officer</option>
              <option value="admin">🔐 Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="username">{t('username')}</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder={t('username')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={t('password')}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-large"
          >
            {loading ? '⏳ ' + t('loading') : '✓ ' + t('loginButton')}
          </button>
        </form>

        {formData.role === 'citizen' && (
          <div className="login-footer">
            <p>{t('noAccount')}</p>
            <button
              onClick={onSwitchToSignup}
              className="btn-link"
            >
              {t('signup')}
            </button>
          </div>
        )}

        {formData.role !== 'citizen' && (
          <div className="login-info">
            <p className="info-text">
              {formData.role === 'admin' && '🔐 Admin: username=admin, password=admin'}
              {formData.role === 'officer' && '👮 Officer: username=officer, password=officer'}
            </p>
          </div>
        )}
      </div>

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div className="modal-overlay">
          <div className="language-modal">
            <h2>{t('selectLanguage')}</h2>
            <p>Please select your preferred language</p>
            <div className="language-options">
              {languageService.getAvailableLanguages().map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`language-btn ${tempLanguage === lang.code ? 'active' : ''}`}
                >
                  <span className="language-name">{lang.nativeName}</span>
                  <span className="language-code">({lang.name})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
