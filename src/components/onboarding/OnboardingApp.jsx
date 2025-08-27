import { useState } from 'react';
import AuthPage from './AuthPage.jsx';
import PersonalInfo from './PersonalInfo.jsx';
import PhysicalStats from './PhysicalStats.jsx';
import WelcomePage from './WelcomePage.jsx';
import Dashboard from '../dashboard/Dashboard.jsx';

// OnboardingApp state machine extracted from HTML
// Manages signup → welcome → dashboard flow for Week 1 retention

const OnboardingApp = ({ 
  initialState = 'signup',
  onAccountCreation,
  onWelcomeTourComplete,
  onNavigateToTracker,
  onNavigateToSessions,
  onViewAchievements 
}) => {
  // Use initial state passed from parent
  const getInitialState = () => {
    return initialState;
  };

  const getInitialUserData = () => {
    return {
      name: '', age: '', gender: '',
      height: { feet: '', inches: '' },
      weight: { value: '', unit: 'lbs' },
      apeIndex: '', location: '',
      totalSessions: 0, totalClimbs: 0,
    };
  };

  const [appState, setAppState] = useState(getInitialState()); // 'signup' | 'personal' | 'physical' | 'welcome' | 'dashboard' | 'achievements'
  const [userData, setUserData] = useState(getInitialUserData());

  if (appState === 'signup') {
    return (
      <AuthPage 
        onComplete={(data) => { 
          setUserData(u => ({...u, ...data})); 
          setAppState('personal');
        }}
        onError={(error) => {
          console.error('Auth error:', error);
        }}
      />
    );
  }

  if (appState === 'personal') {
    return (
      <PersonalInfo 
        onComplete={(data) => { 
          setUserData(u => ({...u, ...data})); 
          setAppState('physical');
        }}
        onBack={() => setAppState('signup')}
        initialData={userData}
      />
    );
  }

  if (appState === 'physical') {
    return (
      <PhysicalStats 
        onComplete={(data) => { 
          const completeUserData = {...userData, ...data};
          setUserData(completeUserData); 
          setAppState('welcome');
          if (onAccountCreation) {
            onAccountCreation(completeUserData);
          }
        }}
        onBack={() => setAppState('personal')}
        userData={userData}
      />
    );
  }

  if (appState === 'welcome') {
    return (
      <WelcomePage onComplete={() => {
        setAppState('dashboard');
        if (onWelcomeTourComplete) {
          onWelcomeTourComplete();
        }
      }} />
    );
  }

  if (appState === 'achievements') {
    return (
      <div>
        {/* AchievementsPage would be implemented here */}
        <div className="flex items-center justify-center min-h-screen text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Achievements Coming Soon</h2>
            <button 
              onClick={() => setAppState('dashboard')}
              className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dashboard 
      userData={userData} 
      onNavigateToTracker={onNavigateToTracker}
      onNavigateToSessions={onNavigateToSessions}
      onViewAchievements={() => setAppState('achievements')}
    />
  );
};

export default OnboardingApp;
