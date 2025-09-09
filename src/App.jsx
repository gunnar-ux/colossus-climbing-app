import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

// Components
import Dashboard from './components/dashboard/Dashboard.jsx';
import SessionsPage from './components/sessions/SessionsPage.jsx';
import ProgressPage from './components/progress/ProgressPage.jsx';
import AccountPage from './components/account/AccountPage.jsx';
import TrackClimb from './components/tracker/TrackClimb.jsx';
import OnboardingApp from './components/onboarding/OnboardingApp.jsx';
import LoadingScreen from './components/ui/LoadingScreen.jsx';
import { HomeIcon, ListIcon, TrendingIcon, UserIcon } from './components/ui/Icons.jsx';

// Utils & Services
import { getCleanInitialData, getCleanInitialSessions } from './utils/appReset.js';
import { roundRPE } from './utils/index.js';
import { calculateSessionStats } from './utils/sessionCalculations.js';
import { database } from './lib/supabase.js';
import { useDataHydration } from './hooks/useDataHydration.js';

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
  const { user, profile, loading, profileLoading, isAuthenticated, hasProfile, signOut } = useAuth();
  
  // Data hydration from database
  const { 
    sessions, 
    userData, 
    dataLoading, 
    setSessions, 
    setUserData 
  } = useDataHydration(user, profile);
  
  // Session loading is now handled by useDataHydration hook
  
  // Handle account creation
  const handleAccountCreation = (accountData) => {
    setUserData(prev => ({
      ...prev,
      ...accountData
    }));
    navigate('/');
  };
  
  // Real logout handler using Supabase auth
  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out user...');
      await signOut(); // This will clear auth state and redirect
      
      // Clear local state as well
      setUserData(getCleanInitialData());
      setSessions(getCleanInitialSessions());
      
      console.log('🚪 Logout successful');
    } catch (error) {
      console.error('🚪 Logout error:', error);
      // Still clear local state even if signOut fails
      setUserData(getCleanInitialData());
      setSessions(getCleanInitialSessions());
      navigate('/');
    }
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
    if (!user) return;
    
    const timestamp = climbData.timestamp || Date.now();
    
    // Create climb object for local state
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

    try {
      // Save to Supabase
      const climbPayload = {
        user_id: user.id,
        grade: climbData.grade,
        wall_angle: climbData.wall || climbData.angle, // Use original uppercase values
        style: climbData.styles[0], // Use original uppercase values
        rpe: roundRPE(climbData.rpe),
        attempts: climbData.attempts || 1,
        climb_type: climbData.type || 'BOULDER',
        timestamp: new Date(timestamp).toISOString()
      };
      
      console.log('🔥 About to save climb payload:', climbPayload);
      console.log('🔥 Original climb data:', climbData);

      // Find or create today's session (database-first approach)
      let sessionId;
      let currentSession = sessions.find(s => s.date === "Now" || 
        new Date(s.timestamp).toDateString() === new Date().toDateString());
      
      if (!currentSession) {
        // Create new session in database first
        const today = new Date();
        const sessionData = {
          user_id: user.id,
          date: today.toISOString().split('T')[0], // Store as proper date
          start_time: new Date(timestamp).toISOString(),
          gym_location: 'Session'
        };
        
        console.log('🔥 Creating new session in database:', sessionData);
        const { data: sessionResult, error: sessionError } = await database.sessions.create(sessionData);
        if (sessionError) throw sessionError;
        
        sessionId = sessionResult.id;
        
        // Add the new session to local state immediately
        const newLocalSession = {
          id: sessionResult.id,
          date: "Now",
          timestamp: timestamp,
          startTime: timestamp,
          endTime: null,
          duration: "Active",
          climbs: 0,
          climbList: [],
          grades: [],
          styles: [],
          angles: [],
          types: []
        };
        
        setSessions(prevSessions => [newLocalSession, ...prevSessions]);
        currentSession = newLocalSession;
        
      } else {
        sessionId = currentSession.id;
      }

      // Add session_id to climb payload
      climbPayload.session_id = sessionId;
      
      // Save climb to Supabase
      console.log('🔥 Calling database.climbs.create with payload:', climbPayload);
      const { data: climbResult, error: climbError } = await database.climbs.create(climbPayload);
      
      console.log('🔥 Database response:', { climbResult, climbError });
      
      if (climbError) {
        console.error('🔥 Database error details:', climbError);
        throw climbError;
      }

      console.log('🔥 Climb saved to Supabase successfully:', climbResult);
      
      // Update local state immediately after successful save
      const currentSessionId = sessionId;
      setSessions(prevSessions => {
        const updatedSessions = [...prevSessions];
        const sessionIndex = updatedSessions.findIndex(s => s.id === currentSessionId);
        
        if (sessionIndex !== -1) {
          // Update existing session
          const session = updatedSessions[sessionIndex];
          const updatedClimbList = [newClimb, ...session.climbList];
          const sessionStats = calculateSessionStats(updatedClimbList);
          
          updatedSessions[sessionIndex] = {
            ...session,
            climbList: updatedClimbList,
            climbs: updatedClimbList.length,
            endTime: timestamp,
            duration: calculateSessionDuration(session.startTime, timestamp),
            ...sessionStats
          };
          
          console.log('🔥 Updated local session state:', updatedSessions[sessionIndex]);
        }
        
        return updatedSessions;
      });
      
      // Update user data totals
      setUserData(prev => ({
        ...prev,
        totalClimbs: prev.totalClimbs + 1
      }));
      
    } catch (error) {
      console.error('🔥 Failed to save climb to Supabase:', error);
      console.error('🔥 Error details:', error.message);
      console.error('🔥 Error stack:', error.stack);
      console.error('🔥 User ID:', user?.id);
      console.error('🔥 Climb payload that failed:', climbPayload);
      // Continue with local state update even if Supabase fails
    }
    
    // Data is now stored in database and synced to local state
  };
  
  // AUTH CHECK - AFTER ALL HOOKS
  if (loading) {
    return <LoadingScreen />;
  }
  
  // If not authenticated, show simple auth page
  if (!isAuthenticated) {
    return <OnboardingApp onComplete={() => navigate('/dashboard')} />;
  }
  
  // If authenticated but profile is still loading, show loading screen
  if (isAuthenticated && profileLoading) {
    return <LoadingScreen />;
  }
  
  // If authenticated but no profile, show onboarding to create profile
  if (isAuthenticated && !profile) {
    return <OnboardingApp onComplete={() => navigate('/dashboard')} />;
  }
  
  // If profile loaded but data is still loading, show loading screen
  if (isAuthenticated && profile && dataLoading) {
    return <LoadingScreen />;
  }
  
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
                        profile={profile || { id: user?.id, name: 'Gunnar', email: user?.email }}
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

// Main App wrapper with Router and Auth
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
