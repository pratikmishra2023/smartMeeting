import React, { useState } from 'react';
import './Navigation.css';

interface User {
  username: string;
  email: string;
}

interface NavigationProps {
  user: User;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ user, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleProfileClick = () => {
    // Handle profile navigation
    setIsDropdownOpen(false);
    alert('Profile page - Coming soon!');
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    onLogout();
  };

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h2>🤖 Smart Meeting Assistant</h2>
      </div>
      
      <div className="nav-user">
        <div className="user-menu" onClick={toggleDropdown}>
          <div className="user-avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <span className="user-greeting">Hi, {user.username}</span>
          <div className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</div>
        </div>
        
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-header">
              <div className="dropdown-user-info">
                <div className="dropdown-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="dropdown-user-details">
                  <div className="dropdown-username">{user.username}</div>
                  <div className="dropdown-email">{user.email}</div>
                </div>
              </div>
            </div>
            <hr className="dropdown-divider" />
            <button className="dropdown-item" onClick={handleProfileClick}>
              <span className="dropdown-icon">👤</span>
              My Profile
            </button>
            <button className="dropdown-item logout" onClick={handleLogout}>
              <span className="dropdown-icon">🚪</span>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
