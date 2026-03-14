import React, { useState, useEffect } from 'react';
import { ComplaintForm } from './components/ComplaintForm';
import OfficerDashboard from './components/OfficerDashboard';
import CitizenHistory from './components/CitizenHistory';
import AdminDashboard from './components/AdminDashboard';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { Landing } from './components/Landing';
import { CategoryNotificationBells } from './components/CategoryNotificationBells';
import { CitizenNotificationBell } from './components/CitizenNotificationBell';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import './styles/theme.css';
import './App.css';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('complaint'); // 'complaint', 'history', 'dashboard', or 'admin'
  const [authPage, setAuthPage] = useState('landing'); // 'landing', 'login' or 'signup'
  const [user, setUser] = useState(null); // null when not logged in
  const [selectedComplaintId, setSelectedComplaintId] = useState(null); // For notification navigation

  // Check for saved user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedPage = localStorage.getItem('currentPage');

    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);

        // Restore the page they were on, or default based on role
        if (savedPage) {
          setCurrentPage(savedPage);
        } else {
          // Set default page based on role
          if (userData.role === 'admin') {
            setCurrentPage('admin');
          } else if (userData.role === 'officer') {
            setCurrentPage('dashboard');
          } else {
            setCurrentPage('complaint');
          }
        }
      } catch (err) {
        console.error('Failed to parse saved user:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('currentPage');
      }
    }
  }, []);

  // Save current page to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentPage', currentPage);
    }
  }, [currentPage, user]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));

    // Set initial page based on role
    if (userData.role === 'admin') {
      setCurrentPage('admin');
    } else if (userData.role === 'officer') {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('complaint');
    }
  };

  const handleSignup = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentPage('complaint');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('currentPage');
    setCurrentPage('complaint');
    setAuthPage('login');
  };

  const handleNotificationClick = (complaintId) => {
    // Navigate to history page and select the complaint
    setSelectedComplaintId(complaintId);
    setCurrentPage('history');
  };

  // If not logged in, show login/signup page
  if (!user) {
    if (authPage === 'landing') {
      return <Landing onGoToLogin={() => setAuthPage('login')} />;
    } else if (authPage === 'login') {
      return <Login onLogin={handleLogin} onSwitchToSignup={() => setAuthPage('signup')} />;
    } else {
      return <Signup onSignup={handleSignup} onSwitchToLogin={() => setAuthPage('login')} />;
    }
  }

  return <AppMain user={user} currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={handleLogout} handleNotificationClick={handleNotificationClick} selectedComplaintId={selectedComplaintId} setSelectedComplaintId={setSelectedComplaintId} />;
}

function AppMain({ user, currentPage, setCurrentPage, handleLogout, handleNotificationClick, selectedComplaintId, setSelectedComplaintId }) {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🚨 {t('dashboard')}</h1>
          <div className="header-right">
            {user.role === 'citizen' && (
              <>
                <CitizenNotificationBell
                  userId={user.id}
                  onNotificationClick={handleNotificationClick}
                />
                <CategoryNotificationBells
                  userId={user.id}
                  selectedCategory={null}
                  onNotificationClick={handleNotificationClick}
                />
              </>
            )}
            <div className="theme-toggle">
              <button
                className={theme === 'light' ? 'active' : ''}
                onClick={() => toggleTheme('light')}
                title="Light theme"
              >
                ☀️
              </button>
              <button
                className={theme === 'dark' ? 'active' : ''}
                onClick={() => toggleTheme('dark')}
                title="Dark theme"
              >
                🌙
              </button>
              <button
                className={theme === 'system' ? 'active' : ''}
                onClick={() => toggleTheme('system')}
                title="System theme"
              >
                💻
              </button>
            </div>
            <div className="user-info">
              <span className="user-name">👤 {user.name || user.username}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <nav className="nav">
              {user.role === 'citizen' && (
                <>
                  <button
                    className={`nav-btn ${currentPage === 'complaint' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('complaint')}
                  >
                    📝 {t('submitComplaint')}
                  </button>
                  <button
                    className={`nav-btn ${currentPage === 'history' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('history')}
                  >
                    📋 {t('myComplaints')}
                  </button>
                </>
              )}
              {user.role === 'officer' && (
                <button
                  className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('dashboard')}
                >
                  👮 {t('dashboard')}
                </button>
              )}
              {user.role === 'admin' && (
                <button
                  className={`nav-btn ${currentPage === 'admin' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('admin')}
                >
                  🔐 {t('dashboard')}
                </button>
              )}
              <button
                className="nav-btn logout-btn"
                onClick={handleLogout}
              >
                🚪 {t('logout')}
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="app-main">
        {currentPage === 'complaint' && <ComplaintForm userId={user.id} />}
        {currentPage === 'history' && (
          <CitizenHistory
            userId={user.id}
            selectedComplaintId={selectedComplaintId}
            onComplaintViewed={() => setSelectedComplaintId(null)}
          />
        )}
        {currentPage === 'dashboard' && <OfficerDashboard userId={user.id} />}
        {currentPage === 'admin' && <AdminDashboard />}
      </main>

      <footer className="app-footer">
        <p>© 2026 CivicPulse. All rights reserved.</p>
        <p>Live camera capture • GPS location • Automatic timestamp</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
