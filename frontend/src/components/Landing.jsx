import React from 'react';
import '../styles/Landing.css';

export const Landing = ({ onGoToLogin }) => {
  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">🚨 CivicPulse</h1>
          <p className="hero-subtitle">Report issues in your community with precision and accountability</p>
          <button onClick={onGoToLogin} className="btn btn-hero">
            Go to Login →
          </button>
        </div>
        <div className="hero-background"></div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>GPS Location Tracking</h3>
            <p>Automatically capture precise GPS coordinates from your device for accurate complaint location mapping.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>Photo Evidence</h3>
            <p>Upload high-quality images with embedded metadata to provide visual proof of issues.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⏰</div>
            <h3>Automatic Timestamps</h3>
            <p>Every complaint is automatically timestamped for accountability and tracking purposes.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Smart Categorization</h3>
            <p>AI-powered system automatically categorizes complaints for faster resolution.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Real-time Notifications</h3>
            <p>Get instant updates on your complaint status and resolution progress.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👮</div>
            <h3>Officer Dashboard</h3>
            <p>Dedicated interface for officers to manage and resolve complaints efficiently.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Analytics & Reports</h3>
            <p>Comprehensive admin dashboard with heatmaps and performance metrics.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Multi-Language Support</h3>
            <p>Available in multiple languages for accessibility to all community members.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Sign Up or Login</h3>
            <p>Create an account as a citizen, officer, or admin</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step">
            <div className="step-number">2</div>
            <h3>Submit Complaint</h3>
            <p>Take a photo, add details, and submit with GPS location</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step">
            <div className="step-number">3</div>
            <h3>Track Progress</h3>
            <p>Monitor your complaint status in real-time</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step">
            <div className="step-number">4</div>
            <h3>Resolution</h3>
            <p>Receive updates when your complaint is resolved</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Ready to Make a Difference?</h2>
        <p>Join thousands of community members reporting and resolving issues</p>
        <button onClick={onGoToLogin} className="btn btn-cta">
          Get Started Now
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 CivicPulse. All rights reserved.</p>
        <p>Making communities safer and more responsive</p>
      </footer>
    </div>
  );
};
