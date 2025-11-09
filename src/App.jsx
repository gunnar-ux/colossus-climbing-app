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
import ReadinessInfoPage from './components/dashboard/ReadinessInfoPage.jsx';
import LoadRatioInfoPage from './components/dashboard/LoadRatioInfoPage.jsx';
import ChartTestingPage from './components/dashboard/ChartTestingPage.jsx';
import StatsTestingPage from './components/progress/StatsTestingPage.jsx';
import LoadRatioTestingPage from './components/dashboard/LoadRatioTestingPage.jsx';
import ReadinessLoadTestingPage from './components/dashboard/ReadinessLoadTestingPage.jsx';
import ReadinessLoadV2TestingPage from './components/dashboard/ReadinessLoadV2TestingPage.jsx';
import QuickSetupTestPage from './components/onboarding/QuickSetupTestPage.jsx';
import { HomeIcon, ListIcon, TrendingIcon, UserIcon } from './components/ui/Icons.jsx';

// Utils & Services
import { getCleanInitialData, getCleanInitialSessions } from './utils/appReset.js';
import { roundRPE, getMetricAvailability } from './utils/index.js';
import { calculateSessionStats } from './utils/sessionCalculations.js';
import { calculateCRS, calculateLoadRatio, getCapacityRecommendations } from './utils/metrics.js';
import { database } from './lib/supabase.js';

// Persistent Bottom Navigation Component
const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Don't show on tracker, onboarding, or info pages
  if (
    location.pathname === '/tracker' || 
    location.pathname === '/onboarding' ||
    location.pathname === '/readiness-info' ||
    location.pathname === '/load-ratio-info'
  ) {
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
  const { 
    user, 
    profile, 
    sessions, 
    userData, 
    setSessions, 
    setUserData,
    isInitializing,
    isAuthenticated, 
    hasProfile, 
    signOut, 
    loadProfile 
  } = useAuth();
  
  // Metric calculations state - CRS and Load Ratio
  const [crsData, setCrsData] = useState(null);
  const [loadRatioData, setLoadRatioData] = useState(null);
  const [recommendedTraining, setRecommendedTraining] = useState(null);
  
  // Minimum loading screen display time (for full animation)
  const [minLoadingComplete, setMinLoadingComplete] = useState(false);
  
  // Ensure loading screen shows for minimum animation duration (3.3 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingComplete(true);
      console.log('⏱️ Minimum loading time complete');
    }, 3300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Calculate CRS and Load Ratio when sessions or userData changes
  useEffect(() => {
    if (!sessions || sessions.length === 0) {
      setCrsData(null);
      setLoadRatioData(null);
      setRecommendedTraining(null);
      return;
    }
    
    // Calculate CRS if user has 3+ sessions
    let calculatedCRS = null;
    if (userData.totalSessions >= 3) {
      calculatedCRS = calculateCRS(userData.totalSessions, userData.totalClimbs, sessions);
      setCrsData(calculatedCRS);
      console.log('📊 CRS calculated:', calculatedCRS);
    } else {
      setCrsData(null);
    }
    
    // Calculate Load Ratio if user has 5+ sessions
    let calculatedLoadRatio = null;
    if (userData.totalSessions >= 5) {
      calculatedLoadRatio = calculateLoadRatio(sessions);
      setLoadRatioData(calculatedLoadRatio);
      console.log('📊 Load Ratio calculated:', calculatedLoadRatio);
    } else {
      setLoadRatioData(null);
    }
    
    // Calculate recommended training based on freshly calculated metrics
    const recommendations = getCapacityRecommendations(
      calculatedCRS,
      calculatedLoadRatio,
      sessions
    );
    setRecommendedTraining(recommendations);
    console.log('📊 Recommended Training:', recommendations);
    
  }, [sessions, userData.totalSessions, userData.totalClimbs]);
  
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
      await signOut(); // This clears all state in AuthContext
      navigate('/');
      console.log('🚪 Logout successful');
    } catch (error) {
      console.error('🚪 Logout error:', error);
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
      

      // Smart session detection with 2-hour gap threshold
      const SESSION_GAP_THRESHOLD = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      
      let sessionId;
      let currentSession = sessions.find(s => s.date === "Now");
      
      // Check if we need a new session based on time gap
      if (currentSession && currentSession.climbList && currentSession.climbList.length > 0) {
        const lastClimbTime = Math.max(...currentSession.climbList.map(climb => climb.timestamp));
        const timeGap = timestamp - lastClimbTime;
        
        if (timeGap > SESSION_GAP_THRESHOLD) {
          console.log(`🕐 Time gap of ${Math.round(timeGap / (1000 * 60))} minutes detected. Creating new session.`);
          
          // End the current session by setting end_time in database
          try {
            await database.sessions.update(currentSession.id, {
              end_time: new Date(lastClimbTime).toISOString()
            });
            console.log('🏁 Previous session ended in database');
          } catch (error) {
            console.warn('⚠️ Failed to end previous session in database:', error);
          }
          
          // Update local session state to show it's ended
          const sessionDate = new Date(currentSession.startTime);
          const today = new Date();
          const isToday = sessionDate.toDateString() === today.toDateString();
          const formattedDate = isToday ? 
            sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
            sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
          setSessions(prevSessions => 
            prevSessions.map(s => 
              s.id === currentSession.id 
                ? { ...s, date: formattedDate, endTime: lastClimbTime, duration: calculateSessionDuration(s.startTime, lastClimbTime) }
                : s
            )
          );
          
          currentSession = null; // Force creation of new session
        }
      }
      
      if (!currentSession) {
        // Create new session in database first
        const today = new Date();
        const sessionData = {
          user_id: user.id,
          session_date: today.toISOString().split('T')[0], // Use correct column name
          start_time: new Date(timestamp).toISOString(),
          gym_location: 'Session'
        };
        
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
          types: [],
          totalXP: 0,
          flashRate: 0,
          peakGrade: 'V0',
          style: '--'
        };
        
        setSessions(prevSessions => [newLocalSession, ...prevSessions]);
        currentSession = newLocalSession;
        
        // Update user data totals for new session
        setUserData(prev => ({
          ...prev,
          totalSessions: prev.totalSessions + 1
        }));
        
      } else {
        sessionId = currentSession.id;
      }

      // Add session_id to climb payload
      climbPayload.session_id = sessionId;
      
      // Save climb to Supabase with timeout
      let climbResult, climbError;
      try {
        const dbPromise = database.climbs.create(climbPayload);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database call timed out after 10s')), 10000)
        );
        
        const response = await Promise.race([dbPromise, timeoutPromise]);
        climbResult = response.data;
        climbError = response.error;
      } catch (err) {
        console.error('Failed to save climb:', err);
        throw err;
      }
      
      if (climbError) {
        console.error('Database error:', climbError);
        throw climbError;
      }
      
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
        }
        
        return updatedSessions;
      });
      
      // Update user data totals
      setUserData(prev => ({
        ...prev,
        totalClimbs: prev.totalClimbs + 1
      }));
      
      // Refresh profile data to sync with database totals for calibration card
      try {
        await loadProfile(user.id);
      } catch (profileError) {
        console.warn('Failed to refresh profile after climb logging:', profileError);
      }
      
    } catch (error) {
      console.error('Failed to save climb:', error);
    }
    
    // Data is now stored in database and synced to local state
  };
  
  // AUTH CHECK - Ensure both auth initialization AND minimum animation time complete
  console.log('🎯 App render - isInitializing:', isInitializing, 'minLoadingComplete:', minLoadingComplete, 'isAuth:', isAuthenticated, 'hasProfile:', !!profile, 'sessions:', sessions.length)
  
  // Show loading screen until BOTH conditions are met:
  // 1. Auth/data has finished loading (!isInitializing)
  // 2. Minimum animation time has passed (minLoadingComplete)
  if (isInitializing || !minLoadingComplete) {
    console.log('🎯 Showing LoadingScreen')
    return <LoadingScreen />;
  }
  
  // If not authenticated, show onboarding/auth
  if (!isAuthenticated) {
    console.log('🎯 Not authenticated - showing onboarding')
    return <OnboardingApp onComplete={() => navigate('/')} />;
  }
  
  // If authenticated but no profile, show onboarding to create profile
  if (isAuthenticated && !profile) {
    console.log('🎯 Authenticated but no profile - showing onboarding')
    return <OnboardingApp onComplete={() => navigate('/')} />;
  }
  
  console.log('🎯 Rendering main app')
  
  return (
    <div className="bg-black text-white min-h-screen">
      {/* Page content */}
      <div 
        className="min-h-screen"
        style={{ 
          paddingBottom: (
            location.pathname === '/tracker' || 
            location.pathname === '/readiness-info' || 
            location.pathname === '/load-ratio-info'
          ) ? 0 : '80px' 
        }}
      >
        <Routes>
                    <Route path="/" element={
                      <Dashboard 
                        userData={userData}
                        sessions={sessions}
                        user={user}
                        profile={profile || { id: user?.id, name: 'Gunnar', email: user?.email }}
                        crsData={crsData}
                        loadRatioData={loadRatioData}
                        recommendedTraining={recommendedTraining}
                        onNavigateToTracker={() => navigate('/tracker')}
                        onNavigateToProgress={() => navigate('/progress')}
                        onNavigateToReadinessInfo={() => navigate('/readiness-info')}
                        onNavigateToLoadRatioInfo={() => navigate('/load-ratio-info')}
                        onLogout={handleLogout}
                      />
                    } />
                    
                    <Route path="/sessions" element={
                      <SessionsPage 
                        sessions={sessions}
                        profile={profile}
                        userData={userData}
                        metricAvailability={getMetricAvailability(userData.totalSessions, userData.totalClimbs)}
                        onNavigateToTracker={() => navigate('/tracker')}
                        onNavigateToProgress={() => navigate('/progress')}
                        onNavigateToDashboard={() => navigate('/')}
                        onNavigateToAccount={() => navigate('/account')}
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
                    
                    <Route path="/readiness-info" element={
                      <ReadinessInfoPage 
                        score={crsData?.score || 77}
                        onBack={() => navigate('/')}
                        onTrackClimbs={() => navigate('/tracker')}
                      />
                    } />
                    
                    <Route path="/load-ratio-info" element={
                      <LoadRatioInfoPage 
                        loadRatio={loadRatioData?.ratio || 1.0}
                        onBack={() => navigate('/')}
                        onTrackClimbs={() => navigate('/tracker')}
                      />
                    } />
                    
        <Route path="/chart-testing" element={<ChartTestingPage />} />
        <Route path="/stats-testing" element={<StatsTestingPage />} />
        <Route path="/loadratio-testing" element={<LoadRatioTestingPage />} />
        <Route path="/readiness-load-testing" element={<ReadinessLoadTestingPage />} />
        <Route path="/readiness-load-v2" element={<ReadinessLoadV2TestingPage />} />
        <Route path="/quick-setup-test" element={<QuickSetupTestPage />} />
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
