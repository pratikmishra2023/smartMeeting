import React, { useState, useEffect } from 'react';
import AuthContainer from './components/AuthContainer';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import { AuthService } from './services/auth';
import './App.css';

interface User {
  username: string;
  email: string;
  role?: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  // Check for existing authentication on app load
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser && AuthService.isAuthenticated()) {
      setUser({
        username: currentUser.username,
        email: currentUser.email,
        role: currentUser.role
      });
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  if (!user) {
    return <AuthContainer onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <Dashboard user={user} onLogout={handleLogout} />
    </div>
  );
}

export default App;