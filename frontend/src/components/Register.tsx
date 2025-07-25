import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { AuthService } from '../services/auth';
import './Register.css';

interface RegisterProps {
  onBack: () => void;
  onSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ onBack, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    securityQuestion1: '',
    securityAnswer1: '',
    securityQuestion2: '',
    securityAnswer2: ''
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const securityQuestions = [
    "What is your mother's maiden name?",
    "What was the name of your first pet?",
    "What is your favorite programming language?",
    "What city were you born in?",
    "What was the name of your elementary school?",
    "What is your favorite movie?",
    "What was your first car?",
    "What is your favorite book?"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password || 
        !formData.confirmPassword || !formData.dateOfBirth) {
      setError('All fields are required');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.securityQuestion1 || !formData.securityAnswer1 ||
        !formData.securityQuestion2 || !formData.securityAnswer2) {
      setError('All security questions and answers are required');
      return false;
    }

    if (formData.securityQuestion1 === formData.securityQuestion2) {
      setError('Please select different security questions');
      return false;
    }

    if (!captchaToken) {
      setError('Please complete the captcha verification');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    setError('');
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      onBack();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await AuthService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        securityQuestion1: formData.securityQuestion1,
        securityAnswer1: formData.securityAnswer1,
        securityQuestion2: formData.securityQuestion2,
        securityAnswer2: formData.securityAnswer2,
        captchaToken: captchaToken!
      });

      if (result.success) {
        setSuccess('Registration successful! You can now login.');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <button className="back-button-top" onClick={handleBack}>
          ←
        </button>
        
        <div className="step-indicator">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
          </div>
        </div>

        <h2>
          {currentStep === 1 ? '👤 Personal Information' : '🔐 Security Setup'}
        </h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {currentStep === 1 && (
          <form>
            <div className="form-row">
              <div className="form-group">
                <label>👤 Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>📧 Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>🎂 Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>🔒 Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password (min 6 characters)"
                  required
                />
              </div>
              <div className="form-group">
                <label>🔒 Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="next-btn"
                onClick={handleNext}
              >
                Next Step →
              </button>
            </div>
          </form>
        )}

        {currentStep === 2 && (
          <form onSubmit={handleSubmit}>
            <div className="security-section">
              <h3>🔐 Security Questions</h3>
              <p>These will be used for password recovery</p>
              
              <div className="form-row">
                <div className="form-group">
                  <label>❓ Security Question 1</label>
                  <select
                    name="securityQuestion1"
                    value={formData.securityQuestion1}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a question</option>
                    {securityQuestions.map((question, index) => (
                      <option key={index} value={question}>{question}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>💭 Answer 1</label>
                  <input
                    type="text"
                    name="securityAnswer1"
                    value={formData.securityAnswer1}
                    onChange={handleInputChange}
                    placeholder="Enter your answer"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>❓ Security Question 2</label>
                  <select
                    name="securityQuestion2"
                    value={formData.securityQuestion2}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a question</option>
                    {securityQuestions.map((question, index) => (
                      <option key={index} value={question}>{question}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>💭 Answer 2</label>
                  <input
                    type="text"
                    name="securityAnswer2"
                    value={formData.securityAnswer2}
                    onChange={handleInputChange}
                    placeholder="Enter your answer"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="captcha-container">
              <ReCAPTCHA
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Test key
                onChange={handleCaptchaChange}
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="back-btn"
                onClick={handleBack}
              >
                ← Back
              </button>
              <button 
                type="submit" 
                className="register-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : '✓ Create Account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
