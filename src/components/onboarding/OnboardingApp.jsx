import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import AuthPage from './AuthPage.jsx';
import PersonalInfo from './PersonalInfo.jsx';
import PhysicalStats from './PhysicalStats.jsx';

// OnboardingApp state machine extracted from HTML
// Manages signup → welcome → dashboard flow for Week 1 retention

const OnboardingApp = ({ onComplete }) => {
  const { isAuthenticated, hasProfile } = useAuth();
  
  // Start at step 2 if already authenticated, step 1 if not
  const [step, setStep] = useState(isAuthenticated ? 2 : 1);
  const [userData, setUserData] = useState({
    name: '', age: '', gender: '', location: '',
    height: { feet: '', inches: '' },
    weight: { value: '', unit: 'lbs' },
    apeIndex: ''
  });

  console.log('🔄 OnboardingApp - Authenticated:', isAuthenticated, 'HasProfile:', hasProfile, 'Step:', step);

  // If already authenticated and has profile, complete immediately
  if (isAuthenticated && hasProfile) {
    onComplete?.();
    return null;
  }

  // Step 1: Authentication
  if (step === 1) {
    return (
      <AuthPage 
        onComplete={(data) => { 
          setUserData(prev => ({...prev, ...data})); 
          setStep(2);
        }}
        onError={(error) => {
          console.error('Auth error:', error);
        }}
      />
    );
  }

  // Step 2: Personal Info
  if (step === 2) {
    return (
      <PersonalInfo 
        onComplete={(data) => { 
          setUserData(prev => ({...prev, ...data})); 
          setStep(3);
        }}
        onBack={() => setStep(1)}
        initialData={userData}
      />
    );
  }

  // Step 3: Physical Stats
  return (
    <PhysicalStats 
      onComplete={(data) => { 
        const completeUserData = {...userData, ...data};
        setUserData(completeUserData); 
        onComplete?.();
      }}
      onBack={() => setStep(2)}
      userData={userData}
    />
  );
};

export default OnboardingApp;
