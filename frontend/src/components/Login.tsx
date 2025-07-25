import React, { useState } from 'react';
import { AuthService } from '../services/auth';
import './Login.css';

interface LoginProps {
  onLogin: (userData: { username: string; email: string; role?: string }) => void;
  onShowRegister: () => void;
  onShowForgotPassword: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onShowRegister, onShowForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await AuthService.login({ email, password });
      
      if (result.success && result.user) {
        onLogin({
          username: result.user.username,
          email: result.user.email,
          role: result.user.role
        });
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-content">
          <div className="welcome-section">
            <h1>WELCOME TO</h1>
            <h1>SMART MEETING</h1>
            <h1>ASSISTANT</h1>
            <p>We analyze meetings, generate transcripts,</p>
            <p>MOMs, tasks, and calendar invites using AI</p>
            <button className="learn-more-btn">LEARN MORE</button>
          </div>
          
          <div className="login-section">
            <div className="login-card">
              <h2>Login</h2>
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <div className="input-container">
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <span className="input-icon">📧</span>
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-container">
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span className="input-icon">🔒</span>
                  </div>
                </div>
                
                <div className="auth-links">
                  <button 
                    type="button" 
                    className="link-btn forgot-password"
                    onClick={onShowForgotPassword}
                  >
                    🔒 Forgot Password?
                  </button>
                  <button 
                    type="button" 
                    className="link-btn create-account"
                    onClick={onShowRegister}
                  >
                    ✨ Create New Account
                  </button>
                </div>

                <button 
                  type="submit" 
                  className="login-btn"
                  disabled={isLoading}
                >
                  <span className="login-icon">🔐</span>
                  {isLoading ? 'LOGGING IN...' : 'LOGIN'}
                </button>
              </form>
            </div>
            
            <div className="login-illustration">
              <div className="calendar-icon">
                <div className="calendar-header"></div>
                <div className="calendar-body">
                  <div className="calendar-row">
                    <div className="calendar-cell"></div>
                    <div className="calendar-cell"></div>
                    <div className="calendar-cell"></div>
                  </div>
                  <div className="calendar-row">
                    <div className="calendar-cell"></div>
                    <div className="calendar-cell active"></div>
                    <div className="calendar-cell"></div>
                  </div>
                </div>
              </div>
              <div className="document-icon">
                <div className="document-header"></div>
                <div className="document-lines">
                  <div className="document-line"></div>
                  <div className="document-line"></div>
                  <div className="document-line"></div>
                  <div className="document-line"></div>
                </div>
              </div>
              <div className="connection-line"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
