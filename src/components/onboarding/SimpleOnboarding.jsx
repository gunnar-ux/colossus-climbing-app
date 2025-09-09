import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';

// Simple 3-step onboarding: Email/Password → Personal Info → Physical Stats → Dashboard
const SimpleOnboarding = ({ onComplete }) => {
  const { signUp, signIn, createProfile } = useAuth();
  const [step, setStep] = useState(1); // 1=auth, 2=personal, 3=physical
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [authData, setAuthData] = useState({ email: '', password: '', isLogin: false });
  const [personalData, setPersonalData] = useState({ name: '', age: '', gender: '', location: '' });
  const [physicalData, setPhysicalData] = useState({ 
    height: { feet: '', inches: '' }, 
    weight: '', 
    apeIndex: '' 
  });

  // Step 1: Email & Password
  const handleAuth = async () => {
    if (!authData.email.includes('@') || authData.password.length < 6) {
      setError('Please enter a valid email and password (6+ characters)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;
      
      if (authData.isLogin) {
        result = await signIn(authData.email, authData.password);
      } else {
        result = await signUp(authData.email, authData.password);
        
        // If signup fails because user exists, try login
        if (!result.success && result.error.includes('already registered')) {
          result = await signIn(authData.email, authData.password);
        }
      }

      if (result.success) {
        console.log('Authentication successful, moving to personal info');
        setStep(2);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Personal Info
  const handlePersonal = () => {
    if (!personalData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    console.log('Personal info complete, moving to physical stats');
    setError('');
    setStep(3);
  };

  // Step 3: Physical Stats & Profile Creation
  const handlePhysical = async () => {
    setLoading(true);
    setError('');

    try {
      // Convert measurements
      const height_cm = Math.round(
        (Number(physicalData.height.feet) || 0) * 30.48 + 
        (Number(physicalData.height.inches) || 0) * 2.54
      );
      const weight_kg = Math.round((Number(physicalData.weight) || 0) * 0.453592);
      const ape_index_cm = Math.round((Number(physicalData.apeIndex) || 0) * 2.54);

      const profileData = {
        name: personalData.name,
        age: personalData.age ? Number(personalData.age) : null,
        gender: personalData.gender,
        location: personalData.location,
        height_cm,
        weight_kg,
        ape_index_cm
      };

      const result = await createProfile(profileData);

      if (result.success) {
        console.log('Profile created successfully!');
        onComplete?.();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Authentication
  if (step === 1) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center px-6">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-3xl font-bold mb-2 text-center">
            {authData.isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-400 text-center mb-8">
            {authData.isLogin ? 'Sign in to continue' : 'Start your climbing journey'}
          </p>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={authData.email}
              onChange={(e) => setAuthData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
            <input
              type="password"
              placeholder="Password (6+ characters)"
              value={authData.password}
              onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full mt-6 py-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (authData.isLogin ? 'Sign In' : 'Create Account')}
          </button>

          <button
            onClick={() => setAuthData(prev => ({ ...prev, isLogin: !prev.isLogin }))}
            className="w-full mt-4 text-gray-400 hover:text-white"
          >
            {authData.isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Personal Info
  if (step === 2) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center px-6">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-3xl font-bold mb-2 text-center">Personal Info</h1>
          <p className="text-gray-400 text-center mb-8">Tell us about yourself</p>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={personalData.name}
              onChange={(e) => setPersonalData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
            <input
              type="number"
              placeholder="Age (optional)"
              value={personalData.age}
              onChange={(e) => setPersonalData(prev => ({ ...prev, age: e.target.value }))}
              className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
            <select
              value={personalData.gender}
              onChange={(e) => setPersonalData(prev => ({ ...prev, gender: e.target.value }))}
              className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="">Gender (optional)</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="text"
              placeholder="Location (optional)"
              value={personalData.location}
              onChange={(e) => setPersonalData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handlePersonal}
            className="w-full mt-6 py-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-100"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Physical Stats
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center px-6">
      <div className="max-w-md mx-auto w-full">
        <h1 className="text-3xl font-bold mb-2 text-center">Physical Stats</h1>
        <p className="text-gray-400 text-center mb-8">Help us calculate your climbing metrics</p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Height (feet)"
              value={physicalData.height.feet}
              onChange={(e) => setPhysicalData(prev => ({ 
                ...prev, 
                height: { ...prev.height, feet: e.target.value }
              }))}
              className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
            <input
              type="number"
              placeholder="Height (inches)"
              value={physicalData.height.inches}
              onChange={(e) => setPhysicalData(prev => ({ 
                ...prev, 
                height: { ...prev.height, inches: e.target.value }
              }))}
              className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
          <input
            type="number"
            placeholder="Weight (lbs, optional)"
            value={physicalData.weight}
            onChange={(e) => setPhysicalData(prev => ({ ...prev, weight: e.target.value }))}
            className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
          <input
            type="number"
            placeholder="Ape Index (inches, optional)"
            value={physicalData.apeIndex}
            onChange={(e) => setPhysicalData(prev => ({ ...prev, apeIndex: e.target.value }))}
            className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handlePhysical}
          disabled={loading}
          className="w-full mt-6 py-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-50"
        >
          {loading ? 'Creating Profile...' : 'Complete Setup'}
        </button>
      </div>
    </div>
  );
};

export default SimpleOnboarding;
