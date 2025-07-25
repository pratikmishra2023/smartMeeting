import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { AuthService } from '../services/auth';
import './ForgotPassword.css';

interface ForgotPasswordProps {
  onBack: () => void;
  onSuccess: () => void;
}

interface SecurityQuestions {
  question1: string;
  question2: string;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: Security Questions, 3: Reset Password
  const [email, setEmail] = useState('');
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestions | null>(null);
  const [securityData, setSecurityData] = useState({
    dateOfBirth: '',
    answer1: '',
    answer2: ''
  });
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  // Step 1: Get security questions for email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await AuthService.getSecurityQuestions(email);
      
      if (result.success) {
        setSecurityQuestions(result.questions);
        setStep(2);
      } else {
        setError(result.message || 'User not found');
      }
    } catch (error) {
      setError('Failed to get security questions');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify security questions and DOB
  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!securityData.dateOfBirth || !securityData.answer1 || !securityData.answer2) {
      setError('All fields are required');
      return;
    }

    if (!captchaToken) {
      setError('Please complete the captcha verification');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await AuthService.verifySecurityQuestions({
        email,
        dateOfBirth: securityData.dateOfBirth,
        answer1: securityData.answer1,
        answer2: securityData.answer2,
        captchaToken: captchaToken!
      });
      
      if (result.success) {
        setResetToken(result.resetToken);
        setStep(3);
        setSuccess('Security verification successful! You can now reset your password.');
      } else {
        setError(result.message || 'Security verification failed');
      }
    } catch (error) {
      setError('Security verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setError('Both password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await AuthService.resetPassword(resetToken, newPassword);
      
      if (result.success) {
        setSuccess('Password reset successful! You can now login with your new password.');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setError(result.message || 'Password reset failed');
      }
    } catch (error) {
      setError('Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <form onSubmit={handleEmailSubmit}>
      <h2>🔍 Find Your Account</h2>
      <p>Enter your email address to begin the password recovery process</p>
      
      <div className="form-group">
        <label>📧 Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your registered email address"
          required
        />
      </div>

      <div className="form-actions">
        <button type="button" className="back-btn" onClick={onBack}>
          ← Back to Login
        </button>
        <button type="submit" className="continue-btn" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Find Account →'}
        </button>
      </div>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleSecuritySubmit}>
      <h2>🔐 Verify Your Identity</h2>
      <p>Please answer your security questions and provide your date of birth to verify your identity</p>
      
      <div className="form-group">
        <label>🎂 Date of Birth</label>
        <input
          type="date"
          value={securityData.dateOfBirth}
          onChange={(e) => setSecurityData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
          required
        />
      </div>

      <div className="form-group">
        <label>❓ {securityQuestions?.question1}</label>
        <input
          type="text"
          value={securityData.answer1}
          onChange={(e) => setSecurityData(prev => ({ ...prev, answer1: e.target.value }))}
          placeholder="Enter your answer to security question 1"
          required
        />
      </div>

      <div className="form-group">
        <label>❓ {securityQuestions?.question2}</label>
        <input
          type="text"
          value={securityData.answer2}
          onChange={(e) => setSecurityData(prev => ({ ...prev, answer2: e.target.value }))}
          placeholder="Enter your answer to security question 2"
          required
        />
      </div>

      <div className="captcha-container">
        <ReCAPTCHA
          sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Test key
          onChange={handleCaptchaChange}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="back-btn" onClick={() => setStep(1)}>
          ← Back
        </button>
        <button type="submit" className="continue-btn" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify Identity →'}
        </button>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={handlePasswordReset}>
      <h2>🔑 Create New Password</h2>
      <p>Your identity has been verified! Now you can create a secure new password</p>
      
      <div className="form-group">
        <label>🔒 New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Create a strong password (minimum 6 characters)"
          required
        />
      </div>

      <div className="form-group">
        <label>🔒 Confirm New Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your new password"
          required
        />
      </div>

      <div className="form-actions">
        <button type="button" className="back-btn" onClick={onBack}>
          ✕ Cancel
        </button>
        <button type="submit" className="reset-btn" disabled={isLoading}>
          {isLoading ? 'Updating...' : '✓ Reset Password'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <button className="back-button-top" onClick={onBack}>
          ←
        </button>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default ForgotPassword;
