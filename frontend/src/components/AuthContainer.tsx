import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';

interface AuthContainerProps {
  onLogin: (userData: { username: string; email: string; role?: string }) => void;
}

type AuthView = 'login' | 'register' | 'forgot-password';

const AuthContainer: React.FC<AuthContainerProps> = ({ onLogin }) => {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  const handleShowRegister = () => setCurrentView('register');
  const handleShowForgotPassword = () => setCurrentView('forgot-password');
  const handleBackToLogin = () => setCurrentView('login');

  const handleRegisterSuccess = () => {
    // After successful registration, go back to login
    setCurrentView('login');
  };

  const handleForgotPasswordSuccess = () => {
    // After successful password reset, go back to login
    setCurrentView('login');
  };

  switch (currentView) {
    case 'register':
      return (
        <Register 
          onBack={handleBackToLogin}
          onSuccess={handleRegisterSuccess}
        />
      );
    
    case 'forgot-password':
      return (
        <ForgotPassword 
          onBack={handleBackToLogin}
          onSuccess={handleForgotPasswordSuccess}
        />
      );
    
    case 'login':
    default:
      return (
        <Login 
          onLogin={onLogin}
          onShowRegister={handleShowRegister}
          onShowForgotPassword={handleShowForgotPassword}
        />
      );
  }
};

export default AuthContainer;
