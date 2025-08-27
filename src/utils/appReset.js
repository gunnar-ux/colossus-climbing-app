// Complete app reset utility
// Clears all user data while preserving tour preferences

import { supabase } from '../lib/supabase.js';

export const resetAppData = async () => {
  console.log('🧹 Resetting app data...');
  
  try {
    // 1. Sign out from Supabase
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.warn('Sign out error:', signOutError);
    }

    // 2. Clear all localStorage except tour preferences
    const preserveKeys = ['colossus-tour-completed', 'colossus-welcome-seen'];
    const preservedData = {};
    
    // Save tour data
    preserveKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        preservedData[key] = value;
      }
    });

    // Clear all localStorage
    localStorage.clear();

    // Restore tour data
    Object.entries(preservedData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    console.log('✅ App data reset complete');
    return { success: true };
  } catch (error) {
    console.error('❌ Reset error:', error);
    return { success: false, error };
  }
};

export const getCleanInitialData = () => {
  return {
    name: '',
    age: '',
    gender: '',
    height: { feet: '', inches: '', cm: '' },
    weight: { value: '', unit: 'lbs' },
    apeIndex: '',
    location: '',
    totalSessions: 0,
    totalClimbs: 0,
    hasCompletedOnboarding: false,
    hasSeenWelcomeTour: localStorage.getItem('colossus-welcome-seen') === 'true'
  };
};

export const getCleanInitialSessions = () => {
  return [];
};
