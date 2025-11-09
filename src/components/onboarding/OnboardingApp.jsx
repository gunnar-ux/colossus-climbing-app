import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import AuthPage from './AuthPage.jsx';
import QuickSetup from './QuickSetup.jsx';

// OnboardingApp - Simplified flow for rapid onboarding
// Auth → Optional Quick Setup → Dashboard
// Collects flash grade and typical volume to seed baseline data

const OnboardingApp = ({ onComplete }) => {
  const { isAuthenticated, hasProfile, user } = useAuth();
  
  // Start at step 2 if already authenticated, step 1 if not
  const [step, setStep] = useState(isAuthenticated ? 2 : 1);
  const [userId, setUserId] = useState(user?.id || null);

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
          setUserId(data.id);
          setStep(2);
        }}
        onError={(error) => {
          console.error('Auth error:', error);
        }}
      />
    );
  }

  // Step 2: Quick Setup (optional)
  return (
    <QuickSetup 
      userId={userId || user?.id}
      onComplete={(data) => {
        console.log('✅ Quick setup completed:', data);
        onComplete?.();
      }}
      onSkip={() => {
        console.log('⏭️ Quick setup skipped');
        onComplete?.();
      }}
    />
  );
};

export default OnboardingApp;
