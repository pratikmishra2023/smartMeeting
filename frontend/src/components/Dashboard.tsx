import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import './Dashboard.css';

interface DashboardProps {
  user: {
    username: string;
    email: string;
    role?: string;
  };
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    transcriptStats: [
      { name: 'Uploaded', value: 45, color: '#87CEEB' },
      { name: 'Processed', value: 38, color: '#4CAF50' },
      { name: 'Pending', value: 7, color: '#FFC107' }
    ],
    uploadTypeStats: [
      { name: 'Audio Files', value: 25, color: '#4a9b8e' },
      { name: 'Video Files', value: 13, color: '#2d7a70' },
      { name: 'Text Files', value: 7, color: '#6bb8aa' }
    ],
    monthlyStats: [
      { name: 'Jan', meetings: 8 },
      { name: 'Feb', meetings: 12 },
      { name: 'Mar', meetings: 15 },
      { name: 'Apr', meetings: 9 },
      { name: 'May', meetings: 18 },
      { name: 'Jun', meetings: 22 }
    ]
  });

  const dashboardTiles = [
    {
      id: 1,
      title: 'Transcript Analysis',
      description: 'Leverage advanced algorithms to gain insights from your meeting transcripts.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      ),
      color: '#4a9b8e',
      action: 'transcripts'
    },
    {
      id: 2,
      title: 'MOM Generation',
      description: 'Automatically create concise minutes of meetings to capture key decisions.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12l2 2 4-4"/>
          <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h9l4 4V12z"/>
        </svg>
      ),
      color: '#2196F3',
      action: 'moms'
    },
    {
      id: 3,
      title: 'Task Management',
      description: 'Efficiently organize and keep track of action items assigned during meetings.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9,11 12,14 22,4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
      color: '#FF9800',
      action: 'tasks'
    },
    {
      id: 4,
      title: 'Calendar Sync',
      description: 'Seamlessly integrate meeting schedules with your personal calendar.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      color: '#9C27B0',
      action: 'calendar'
    },
    {
      id: 5,
      title: 'Reports & Analytics',
      description: 'Generate comprehensive reports and analytics from your meeting data.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      ),
      color: '#F44336',
      action: 'reports'
    },
    {
      id: 6,
      title: 'Audio Processing',
      description: 'Convert audio recordings to text with advanced speech recognition.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      ),
      color: '#4CAF50',
      action: 'audio'
    }
  ];

  const handleMenuClick = (action: string) => {
    if (action === 'dashboard') {
      console.log('Already on dashboard');
    } else {
      setShowComingSoon(true);
    }
  };

  const handleTileClick = (action: string) => {
    if (action === 'transcripts') {
      console.log(`Navigate to ${action}`);
      // Add actual navigation logic here
    } else {
      setShowComingSoon(true);
    }
  };

  const closeComingSoon = () => {
    setShowComingSoon(false);
  };

  return (
    <div className="dashboard-container">
      {/* Header Navigation */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>Smart Meeting Assistant</h1>
          </div>
          
          <nav className="nav-menu">
            <button 
              className="nav-item active"
              onClick={() => handleMenuClick('dashboard')}
            >
              📊 Dashboard
            </button>
            <button 
              className="nav-item"
              onClick={() => handleMenuClick('moms')}
            >
              📋 MOMs
            </button>
            <button 
              className="nav-item"
              onClick={() => handleMenuClick('reports')}
            >
              📈 Reports
            </button>
            <button 
              className="nav-item"
              onClick={() => handleMenuClick('calendar')}
            >
              📅 Calendar
            </button>
            <button 
              className="nav-item"
              onClick={() => handleMenuClick('settings')}
            >
              ⚙️ Settings
            </button>
          </nav>

          <div className="user-menu">
            <div 
              className="user-profile"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{user.username}</span>
              <span className="dropdown-arrow">▼</span>
            </div>
            
            {showDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-item">
                  <span>👤 Profile</span>
                </div>
                <div className="dropdown-item">
                  <span>⚙️ Settings</span>
                </div>
                <hr className="dropdown-divider" />
                <div className="dropdown-item" onClick={onLogout}>
                  <span>🚪 Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Welcome Section */}
          <div className="welcome-section">
            <h2>Welcome back, {user.username}! 👋</h2>
            <p>Here's what's happening with your meetings today.</p>
          </div>

          {/* Analytics Section */}
          <div className="analytics-section">
            <h3>📊 Analytics Overview</h3>
            <div className="analytics-grid">
              {/* Transcript Statistics Pie Chart */}
              <div className="analytics-card">
                <h4>Transcript Status</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={analyticsData.transcriptStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analyticsData.transcriptStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Upload Type Statistics Bar Chart */}
              <div className="analytics-card">
                <h4>Upload Types</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analyticsData.uploadTypeStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4a9b8e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Meetings Bar Chart */}
              <div className="analytics-card">
                <h4>Monthly Meetings</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analyticsData.monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="meetings" fill="#2d7a70" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Dashboard Tiles */}
          <div className="tiles-section">
            <h3>🚀 Quick Actions</h3>
            <div className="tiles-grid">
              {dashboardTiles.map((tile) => (
                <div 
                  key={tile.id}
                  className="dashboard-tile"
                  onClick={() => handleTileClick(tile.action)}
                  style={{ borderTopColor: tile.color }}
                >
                  <div className="tile-header">
                    <div 
                      className="tile-icon"
                      style={{ backgroundColor: `${tile.color}20` }}
                    >
                      {tile.icon}
                    </div>
                  </div>
                  <div className="tile-content">
                    <h4 style={{ color: tile.color }}>{tile.title}</h4>
                    <p>{tile.description}</p>
                  </div>
                  <div className="tile-footer">
                    <button 
                      className="tile-button"
                      style={{ backgroundColor: tile.color }}
                    >
                      Get Started →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="recent-activity">
            <h3>📋 Recent Activity</h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">📝</div>
                <div className="activity-content">
                  <h5>Weekly Team Meeting - Transcript Processed</h5>
                  <p>Generated MOM and action items • 2 hours ago</p>
                </div>
                <div className="activity-status success">✓</div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">🎵</div>
                <div className="activity-content">
                  <h5>Client Call - Audio Uploaded</h5>
                  <p>Processing speech-to-text conversion • 4 hours ago</p>
                </div>
                <div className="activity-status processing">⏳</div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">📅</div>
                <div className="activity-content">
                  <h5>Project Review Meeting - Scheduled</h5>
                  <p>Calendar invite sent to all attendees • 1 day ago</p>
                </div>
                <div className="activity-status success">✓</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="modal-overlay" onClick={closeComingSoon}>
          <div className="coming-soon-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🚀 Coming Soon!</h3>
              <button className="close-btn" onClick={closeComingSoon}>✕</button>
            </div>
            <div className="modal-content">
              <p>This feature is currently under development and will be available soon.</p>
              <p>Stay tuned for updates!</p>
            </div>
            <div className="modal-footer">
              <button className="modal-btn" onClick={closeComingSoon}>Got it!</button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Us Button */}
      <div className="contact-us-btn">
        <button className="chat-btn" title="Contact Support">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
