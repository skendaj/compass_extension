import React, { useState } from 'react';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import '../styles/login.css';

interface LoginPageProps {
  appName: string;
  loginButtonLabel?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  appName, 
  loginButtonLabel = 'Sign In with TS ID' 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLogin = async () => {
    console.log('[LoginPage] User clicked Sign In button');
    setIsLoading(true);
    setError(null);

    try {
      console.log('[LoginPage] Calling authService.login()...');
      const result = await authService.login();
      
      console.log('[LoginPage] Login result:', result);
      
      if (result.success) {
        console.log('[LoginPage] Login successful, reloading app...');
        window.location.reload();
      } else {
        console.error('[LoginPage] Login failed:', result.error);
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('[LoginPage] Unexpected login error:', err);
      console.error('[LoginPage] Error details:', {
        message: err instanceof Error ? err.message : 'Unknown',
        stack: err instanceof Error ? err.stack : undefined
      });
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      console.log('[LoginPage] Login flow completed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-left">
          <div className="login-form-wrapper">
            <div className="login-header">
              <img 
                src={chrome.runtime.getURL('assets/logo192.png')}
                alt="Logo" 
                className="login-logo"
              />
              <h1 className="login-title">{appName}</h1>
              <p className="login-subtitle">Sign in to access your knowledge base</p>
            </div>

            <div className="login-form">
              <button 
                onClick={handleLogin}
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : loginButtonLabel}
              </button>

              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              <p className="login-help-text">
                Use your TeamSystem ID credentials to sign in
              </p>
            </div>

            <div className="login-footer">
              <a href="https://www.teamsystem.com/cookie-policy" target="_blank" rel="noopener noreferrer">
                Cookie Policy
              </a>
              <span className="footer-separator">•</span>
              <a href="https://www.teamsystem.com/privacy-policy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="advertising-content">
            <div className="advertising-text">
              <h2>Welcome to Navify</h2>
              <p>Your enterprise knowledge assistant</p>
              <ul className="feature-list">
                <li>Smart search powered by AI</li>
                <li>Connect with experts instantly</li>
                <li>Access organizational knowledge</li>
                <li>Reduce duplicate questions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

