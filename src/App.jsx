import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import OnboardingApp from './components/onboarding/OnboardingApp.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import SessionsPage from './components/sessions/SessionsPage.jsx';
import ProgressPage from './components/progress/ProgressPage.jsx';
import TrackClimb from './components/tracker/TrackClimb.jsx';
import AccountPage from './components/account/AccountPage.jsx';
import LoadingScreen from './components/ui/LoadingScreen.jsx';
import { getCleanInitialData, getCleanInitialSessions } from './utils/appReset.js';
import { roundRPE } from './utils/index.js';

// Inner component that has access to auth context
const AppContent = () => {
  const { user, loading, profile, signOut } = useAuth();
  
  // App loading state for initial animation
  const [appLoading, setAppLoading] = useState(true);
  
  // Initialize with completely clean data
  const [userData, setUserData] = useState(getCleanInitialData());
  const [sessions, setSessions] = useState(getCleanInitialSessions());

  // Handle initial app loading animation (3.5 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 3500); // 3.5 seconds

    return () => clearTimeout(timer);
  }, []);


  // Recalculate existing sessions to include new distribution data
  React.useEffect(() => {
    setSessions(prevSessions => 
      prevSessions.map(session => {
        // If session already has types, don't recalculate
        if (session.types && session.types.length > 0) return session;
        
        // If session has climbs, recalculate distributions
        if (session.climbList && session.climbList.length > 0) {
          const distributions = calculateSessionDistributions(session.climbList);
          return {
            ...session,
            ...distributions
          };
        }
        
        return session;
      })
    );
  }, []); // Only run once on mount
  
  // App navigation state
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Handle account creation completion
  const handleAccountCreation = (accountData) => {
    setUserData(prev => ({
      ...prev,
      ...accountData,
      hasCompletedOnboarding: true
    }));
  };



  // Navigation handlers
  const handleNavigateToTracker = () => setCurrentPage('tracker');
  const handleNavigateToSessions = () => setCurrentPage('sessions');
  const handleNavigateToProgress = () => setCurrentPage('progress');
  const handleNavigateToAccount = () => setCurrentPage('account');
  const handleNavigateToDashboard = () => setCurrentPage('dashboard');

  // Auth handlers
  const handleLogout = async () => {
    try {
      await signOut();
      // Reset app state
      setUserData(getCleanInitialData());
      setSessions(getCleanInitialSessions());
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };



  // Calculate session distributions with all possible values
  const calculateSessionDistributions = (climbList) => {
    const total = climbList.length;
    
    // Grade distribution - show all grades that appear, others at 0%
    const gradeCount = {};
    const allGrades = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10+'];
    climbList.forEach(c => {
      gradeCount[c.grade] = (gradeCount[c.grade] || 0) + 1;
    });
    const grades = allGrades.filter(grade => gradeCount[grade] > 0).map(grade => ({
      label: grade,
      val: Math.round((gradeCount[grade] / total) * 100),
      count: gradeCount[grade]
    }));
    
    // Style distribution - always show all three styles
    const styleCount = { 'Power': 0, 'Technical': 0, 'Simple': 0 };
    climbList.forEach(c => {
      // Normalize style names: POWERFUL -> Power, TECHNICAL -> Technical, SIMPLE -> Simple
      const normalizedStyle = c.style === 'POWERFUL' ? 'Power' : 
                             c.style === 'TECHNICAL' ? 'Technical' : 
                             c.style === 'SIMPLE' ? 'Simple' : c.style;
      styleCount[normalizedStyle] = (styleCount[normalizedStyle] || 0) + 1;
    });
    const styles = Object.entries(styleCount).map(([style, count]) => ({
      label: style,
      val: Math.round((count / total) * 100),
      count: count
    }));
    
    // Angle distribution - always show all three angles
    const angleCount = { 'Slab': 0, 'Vertical': 0, 'Overhang': 0 };
    climbList.forEach(c => {
      // Normalize angle names
      const normalizedAngle = c.angle === 'SLAB' ? 'Slab' : 
                             c.angle === 'VERTICAL' ? 'Vertical' : 'Overhang';
      angleCount[normalizedAngle] = (angleCount[normalizedAngle] || 0) + 1;
    });
    const angles = Object.entries(angleCount).map(([angle, count]) => ({
      label: angle,
      val: Math.round((count / total) * 100),
      count: count
    }));
    
    // Type distribution - Boulder vs Board (always show, default to Boulder)
    const typeCount = { 'Boulder': 0, 'Board': 0 };
    climbList.forEach(c => {
      // Default to Boulder if no type data, normalize BOULDER/BOARD to Boulder/Board
      const normalizedType = c.type === 'BOARD' ? 'Board' : 'Boulder';
      typeCount[normalizedType] = (typeCount[normalizedType] || 0) + 1;
    });
    const types = Object.entries(typeCount).map(([type, count]) => ({
      label: type,
      val: Math.round((count / total) * 100),
      count: count
    }));
    
    return { grades, styles, angles, types };
  };

  // Session gap threshold (90 minutes)
  const SESSION_GAP_THRESHOLD = 90 * 60 * 1000; // 90 minutes in milliseconds

  // Helper function to get session name
  const getSessionName = (isActive, startTime) => {
    if (isActive) return "Now";
    
    const date = new Date(startTime);
    const monthDay = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const time = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    return `${monthDay} (${time})`;
  };

  // Helper function to calculate realistic session duration
  const calculateSessionDuration = (climbList) => {
    if (!climbList || climbList.length === 0) return '15m';
    
    const timestamps = climbList.map(c => c.timestamp).sort();
    const firstClimb = timestamps[0];
    const lastClimb = timestamps[timestamps.length - 1];
    
    // Actual time span from first to last climb
    const timeSpan = lastClimb - firstClimb;
    
    // Add reasonable session padding (15 minutes)
    const sessionPadding = 15 * 60 * 1000; // 15min
    const totalDuration = timeSpan + sessionPadding;
    
    // Convert to readable format
    const hours = Math.floor(totalDuration / (60 * 60 * 1000));
    const minutes = Math.floor((totalDuration % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${Math.max(minutes, 15)}m`; // Minimum 15min session
    }
  };

  // Handle climb logging with "Now" session logic
  const handleClimbLogged = (climbData) => {
    const timestamp = Date.now();
    
    // Create climb object with proper format and normalized display values
    const normalizedStyle = climbData.styles[0] === 'POWERFUL' ? 'Power' : 
                            climbData.styles[0] === 'TECHNICAL' ? 'Technical' : 
                            climbData.styles[0] === 'SIMPLE' ? 'Simple' : climbData.styles[0];
    
    const normalizedAngle = climbData.wall === 'SLAB' ? 'Slab' : 
                           climbData.wall === 'VERTICAL' ? 'Vertical' : 
                           climbData.wall === 'OVERHANG' ? 'Overhang' : climbData.wall;
    
    const newClimb = {
      grade: climbData.grade,
      angle: normalizedAngle,
      style: normalizedStyle,
      rpe: climbData.rpe,
      attempts: climbData.attempts,
      type: climbData.type, // Include climb type (BOULDER/BOARD)
      allStyles: climbData.styles.map(s => 
        s === 'POWERFUL' ? 'Power' : 
        s === 'TECHNICAL' ? 'Technical' : 
        s === 'SIMPLE' ? 'Simple' : s
      ), // Store all selected styles, normalized
      timestamp: timestamp
    };

    // Find current "Now" session
    const nowSession = sessions.find(s => s.date === "Now");
    
    if (nowSession) {
      const timeSinceLastClimb = timestamp - nowSession.timestamp;
      
      if (timeSinceLastClimb <= SESSION_GAP_THRESHOLD) {
        // Continue "Now" session
        const updatedClimbList = [...(nowSession.climbList || []), newClimb];
        const distributions = calculateSessionDistributions(updatedClimbList);
        
        const updatedSession = {
          ...nowSession,
          climbs: nowSession.climbs + 1,
          climbList: updatedClimbList,
          timestamp: timestamp, // Update session timestamp
          endTime: timestamp,
          duration: calculateSessionDuration(updatedClimbList),
          avgRPE: roundRPE(updatedClimbList.reduce((sum, c) => sum + c.rpe, 0) / updatedClimbList.length),
          ...distributions
        };
        
        // Update sessions array
        setSessions(prev => prev.map(s => 
          s.date === "Now" ? updatedSession : s
        ));
      } else {
        // Convert "Now" to timestamped, create new "Now"
        const historicalSession = {
          ...nowSession,
          date: getSessionName(false, nowSession.startTime)
        };
        
        // Create new "Now" session
        const climbList = [newClimb];
        const distributions = calculateSessionDistributions(climbList);
        
        const normalizedStyle = climbData.styles[0] === 'POWERFUL' ? 'Power' : 
                                climbData.styles[0] === 'TECHNICAL' ? 'Technical' : 
                                climbData.styles[0] === 'SIMPLE' ? 'Simple' : climbData.styles[0];
        
        const newSession = {
          date: 'Now',
          timestamp: timestamp,
          startTime: timestamp,
          endTime: timestamp,
          duration: '15m',
          climbs: 1,
          medianGrade: climbData.grade,
          style: normalizedStyle,
          avgRPE: roundRPE(climbData.rpe),
          climbList: climbList,
          ...distributions
        };
        
        // Update sessions: new "Now" first, then historical, then rest
        setSessions(prev => [
          newSession, // New "Now" session
          historicalSession, // Old session with timestamp
          ...prev.filter(s => s.date !== "Now")
        ]);
      }
    } else {
      // No active session, create new "Now"
      const climbList = [newClimb];
      const distributions = calculateSessionDistributions(climbList);
      
      const normalizedStyle = climbData.styles[0] === 'POWERFUL' ? 'Power' : 
                              climbData.styles[0] === 'TECHNICAL' ? 'Technical' : 
                              climbData.styles[0] === 'SIMPLE' ? 'Simple' : climbData.styles[0];
      
      const newSession = {
        date: 'Now',
        timestamp: timestamp,
        startTime: timestamp,
        endTime: timestamp,
        duration: '15m',
        climbs: 1,
        medianGrade: climbData.grade,
        style: normalizedStyle,
        avgRPE: roundRPE(climbData.rpe),
        climbList: climbList,
        ...distributions
      };
      
      // Add new session to the beginning of the array
      setSessions(prev => [newSession, ...prev]);
    }

    // Update user data totals
    setUserData(prev => ({
      ...prev,
      totalSessions: Math.max(prev.totalSessions, sessions.length + 1),
      totalClimbs: prev.totalClimbs + 1
    }));
  };

  // Check authentication and onboarding state
  const isAuthenticated = !!user;
  const hasProfile = !!profile;
  
  // For existing users: if they have a profile in DB, they've completed onboarding
  // For new users: check local state for onboarding completion
  const needsOnboarding = !hasProfile;
  
  // Tour feature disabled - skip welcome tour
  
  // Show loading animation on first app load
  if (appLoading) {
    return <LoadingScreen />;
  }

  // If loading auth state, show nothing (Supabase handles this quickly)
  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Colossus</div>
          <div className="text-graytxt">Loading...</div>
        </div>
      </div>
    );
  }



  return (
    <div className="bg-black text-white min-h-screen">

      <Router>
        <Routes>
          {/* Root route - handles onboarding flow */}
          <Route 
            path="/" 
            element={
              !isAuthenticated ? (
                <OnboardingApp
                  initialState="signup"
                  onAccountCreation={handleAccountCreation}
                />
              ) : needsOnboarding ? (
                <OnboardingApp
                  initialState="personal"
                  onAccountCreation={handleAccountCreation}
                />
              ) : (
                (() => {
                  switch(currentPage) {
                    case 'tracker':
                      return (
                        <TrackClimb 
                          onBack={handleNavigateToDashboard}
                          onClimbLogged={(climbData) => {
                            handleClimbLogged(climbData);
                          }}
                          onNavigateToDashboard={handleNavigateToDashboard}
                          onNavigateToSessions={handleNavigateToSessions}
                          onNavigateToProgress={handleNavigateToProgress}
                          onNavigateToAccount={handleNavigateToAccount}
                          onLogout={handleLogout}
                        />
                      );
                    case 'sessions':
                      return (
                        <SessionsPage 
                          sessions={sessions}
                          onNavigateBack={handleNavigateToDashboard}
                          onNavigateToTracker={handleNavigateToTracker}
                          onNavigateToProgress={handleNavigateToProgress}
                          onNavigateToDashboard={handleNavigateToDashboard}
                          onNavigateToAccount={handleNavigateToAccount}
                        />
                      );
                    case 'progress':
                      return (
                        <ProgressPage 
                          sessions={sessions}
                          userData={userData}
                          onNavigateBack={handleNavigateToDashboard}
                          onNavigateToTracker={handleNavigateToTracker}
                          onNavigateToSessions={handleNavigateToSessions}
                          onNavigateToDashboard={handleNavigateToDashboard}
                          onNavigateToAccount={handleNavigateToAccount}
                        />
                      );
                    case 'account':
                      return (
                        <AccountPage 
                          sessions={sessions}
                          onNavigateBack={handleNavigateToDashboard}
                          onNavigateToDashboard={handleNavigateToDashboard}
                          onNavigateToSessions={handleNavigateToSessions}
                          onNavigateToProgress={handleNavigateToProgress}
                          onNavigateToTracker={handleNavigateToTracker}
                          onLogout={handleLogout}
                        />
                      );
                    case 'dashboard':
                    default:
                      return (
                        <Dashboard 
                          userData={userData}
                          sessions={sessions}
                          user={user}
                          profile={profile}
                          onNavigateToTracker={handleNavigateToTracker}
                          onNavigateToSessions={handleNavigateToSessions}
                          onNavigateToProgress={handleNavigateToProgress}
                          onNavigateToAccount={handleNavigateToAccount}
                          onLogout={handleLogout}
                        />
                      );
                  }
                })()
              )
            } 
          />

          {/* Catch all other routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;