import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
// Auth system temporarily removed

// Components
import Dashboard from './components/dashboard/Dashboard.jsx';
import SessionsPage from './components/sessions/SessionsPage.jsx';
import ProgressPage from './components/progress/ProgressPage.jsx';
import AccountPage from './components/account/AccountPage.jsx';
import TrackClimb from './components/tracker/TrackClimb.jsx';
// Onboarding and loading components temporarily disabled
import { HomeIcon, ListIcon, TrendingIcon, UserIcon } from './components/ui/Icons.jsx';

// Utils & Services
import { getCleanInitialData, getCleanInitialSessions } from './utils/appReset.js';
import { roundRPE } from './utils/index.js';
import { calculateSessionStats } from './utils/sessionCalculations.js';

// Persistent Bottom Navigation Component
const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Don't show on tracker or onboarding pages
  if (location.pathname === '/tracker' || location.pathname === '/onboarding') {
    return null;
  }
  
  const navItems = [
    { path: '/', label: 'Home', icon: <HomeIcon /> },
    { path: '/sessions', label: 'Sessions', icon: <ListIcon /> },
    { path: '/progress', label: 'Progress', icon: <TrendingIcon /> },
    { path: '/account', label: 'Account', icon: <UserIcon /> }
  ];
  
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] border-t border-white/10"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        transform: 'translate3d(0,0,0)',
        backfaceVisibility: 'hidden'
      }}
    >
      <div className="flex h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/' && location.pathname === '/dashboard');
          
          return (
            <button
              key={item.path}
              onClick={() => {
                if (!isActive) {
                  navigate(item.path);
                }
              }}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1
                transition-all duration-200 ease-out
                ${isActive ? 'text-white' : 'text-gray-500'}
                active:scale-95
              `}
            >
              <div className={`
                transition-transform duration-200
                ${isActive ? 'scale-110' : 'scale-100'}
              `}>
                {item.icon}
              </div>
              <span className={`
                text-xs font-medium transition-all duration-200
                ${isActive ? 'opacity-100' : 'opacity-70'}
              `}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// Main App Content with routing
const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // App state
  const [userData, setUserData] = useState(getCleanInitialData());
  const [sessions, setSessions] = useState(getCleanInitialSessions());
  
  // Mock user data for now
  const user = { id: 'demo-user', email: 'demo@example.com' };
  const profile = { name: 'Demo User' };
  
  // Use local sample data for now (no database loading)
  
  // Handle account creation
  const handleAccountCreation = (accountData) => {
    setUserData(prev => ({
      ...prev,
      ...accountData
    }));
    navigate('/');
  };
  
  // Simple logout handler (no auth system)
  const handleLogout = () => {
    setUserData(getCleanInitialData());
    setSessions(getCleanInitialSessions());
    navigate('/');
  };
  
  // Calculate session duration
  const calculateSessionDuration = (startTime, endTime) => {
    const durationMs = endTime - startTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${Math.max(minutes, 15)}m`; // Minimum 15min session
    }
  };
  

  // Handle climb logging
  const handleClimbLogged = async (climbData) => {
    const timestamp = Date.now();
    
    // Create climb object
    const normalizedStyle = climbData.styles[0] === 'POWERFUL' ? 'Power' : 
                            climbData.styles[0] === 'TECHNICAL' ? 'Technical' : 
                            climbData.styles[0] === 'SIMPLE' ? 'Simple' : climbData.styles[0];
    
    const normalizedAngle = (climbData.wall || climbData.angle) === 'SLAB' ? 'Slab' :
                            (climbData.wall || climbData.angle) === 'VERTICAL' ? 'Vertical' :
                            (climbData.wall || climbData.angle) === 'OVERHANG' ? 'Overhang' : 
                            (climbData.wall || climbData.angle);
    
    const newClimb = {
      id: Date.now(),
      timestamp: timestamp,
      grade: climbData.grade,
      style: normalizedStyle,
      styles: [normalizedStyle],
      angle: normalizedAngle,
      wall: normalizedAngle,
      rpe: roundRPE(climbData.rpe),
      attempts: climbData.attempts || 1,
      zone: climbData.zone || 'ENDURANCE',
      type: climbData.type || 'BOULDER'
    };
    
    let updatedSessions = [...sessions];
    let nowSessionIndex = updatedSessions.findIndex(s => s.date === "Now");
    
    if (nowSessionIndex !== -1) {
      // Update existing "Now" session
      const nowSession = updatedSessions[nowSessionIndex];
      const updatedClimbList = [newClimb, ...nowSession.climbList];
      const sessionStats = calculateSessionStats(updatedClimbList);
      
      updatedSessions[nowSessionIndex] = {
        ...nowSession,
        climbList: updatedClimbList,
        climbs: updatedClimbList.length,
        endTime: timestamp,
        duration: calculateSessionDuration(nowSession.startTime, timestamp),
        ...sessionStats
      };
    } else {
      // Create new "Now" session
      const sessionStats = calculateSessionStats([newClimb]);
      const newSession = {
        id: `now-${timestamp}`,
        date: "Now",
        timestamp: timestamp,
        startTime: timestamp,
        endTime: timestamp,
        climbs: 1,
        duration: "15m",
        quality: 'MODERATE',
        gym: climbData.gym || 'Session',
        avgGrade: climbData.grade,
        style: normalizedStyle,
        climbList: [newClimb],
        ...sessionStats
      };
      
      updatedSessions = [newSession, ...updatedSessions];
    }
    
    setSessions(updatedSessions);
    
    // Update user data totals
    setUserData(prev => ({
      ...prev,
      totalSessions: Math.max(prev.totalSessions, sessions.length + 1),
      totalClimbs: prev.totalClimbs + 1
    }));
    
    // Data is now stored locally only (no database saving)
  };
  
  return (
    <div className="bg-black text-white min-h-screen">
      {/* Page content */}
      <div 
        className="min-h-screen"
        style={{ paddingBottom: location.pathname === '/tracker' ? 0 : '80px' }}
      >
        <Routes>
                    <Route path="/" element={
                      <Dashboard 
                        userData={userData}
                        sessions={sessions}
                        user={user}
                        profile={profile}
                        onNavigateToTracker={() => navigate('/tracker')}
                        onLogout={handleLogout}
                      />
                    } />
                    
                    <Route path="/sessions" element={
                      <SessionsPage 
                        sessions={sessions}
                        onNavigateToTracker={() => navigate('/tracker')}
                      />
                    } />
                    
                    <Route path="/progress" element={
                      <ProgressPage 
                        sessions={sessions}
                        userData={userData}
                        onNavigateToTracker={() => navigate('/tracker')}
                      />
                    } />
                    
                    <Route path="/account" element={
                      <AccountPage 
                        sessions={sessions}
                        onNavigateToTracker={() => navigate('/tracker')}
                        onLogout={handleLogout}
                      />
                    } />
                    
                    <Route path="/tracker" element={
                      <TrackClimb 
                        onBack={() => navigate('/')}
                        onClimbLogged={handleClimbLogged}
                        onLogout={handleLogout}
                      />
                    } />
        </Routes>
      </div>
      
      {/* Persistent bottom navigation */}
      <BottomNavigation />
    </div>
  );
};

// Main App wrapper with Router
const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
