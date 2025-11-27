import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';

// Simplified authentication - just collect email and password for testing
// Uses AuthContext for state management

const AuthPage = ({ onComplete, onError }) => {
  const { signUp, signIn, signInWithApple } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAppleSignIn, setIsAppleSignIn] = useState(false);
  const [error, setError] = useState('');

  const update = (field, val) => setForm(f => ({...f, [field]: val}));

  const canSubmit = form.email.trim().length >= 3 && form.password.length >= 3;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Try signup first (for new users)
      let result = await signUp(form.email.trim(), form.password);
      
      // If signup fails because user exists, try signin
      if (!result.success && result.error?.includes('already')) {
        result = await signIn(form.email.trim(), form.password);
      }
      
      if (result.success) {
        onComplete({ 
          email: result.user.email,
          id: result.user.id 
        });
      } else {
        setError(result.error || 'Authentication failed');
      }
      
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && canSubmit) {
      handleSubmit();
    }
  };

  const handleAppleSignIn = async () => {
    if (isAppleSignIn) return;
    
    setIsAppleSignIn(true);
    setError('');
    
    try {
      const result = await signInWithApple();
      
      if (result.success) {
        if (result.user) {
          onComplete({ 
            email: result.user.email,
            id: result.user.id 
          });
        }
      } else {
        setError(result.error || 'Apple Sign-In failed');
      }
      
    } catch (error) {
      console.error('Apple Sign-In error:', error);
      setError('Apple Sign-In failed. Please try again.');
    } finally {
      setIsAppleSignIn(false);
    }
  };

  return (
    <div className="min-h-screen-mobile flex flex-col items-center justify-center px-6 pt-safe-top pb-safe-bottom bg-bg">
      {/* App Icon */}
      <div className="mb-8 border-2 border-white rounded-col p-0">
        <img 
          src="/Asset 6.svg" 
          alt="POGO" 
          className="w-24 h-24 rounded-col"
        />
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-3 font-oswald">
          Welcome, Climber
        </h1>
        <p className="text-graytxt text-base px-4">
          Track your climbs, monitor your progress, and crush your goals.
        </p>
      </div>

      {/* Form */}
      <div className="w-full max-w-md space-y-4">
        <div>
          <input 
            type="email" 
            placeholder="Email address" 
            value={form.email}
            onChange={e => update('email', e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full min-h-[52px] px-4 py-3 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
          />
        </div>

        <div>
          <input 
            type="password" 
            placeholder="Password" 
            value={form.password}
            onChange={e => update('password', e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full min-h-[52px] px-4 py-3 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm p-3 bg-red-500/5 border-l-4 border-red-400 bg-red-400/5">
            <div className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        <button 
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className={`w-full min-h-[52px] py-4 rounded-col font-semibold transition ${
            canSubmit && !isSubmitting
              ? 'bg-white text-black hover:bg-gray-100 active:scale-[0.98]' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Signing in...' : 'Continue'}
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative px-4 bg-bg">
            <span className="text-graytxt text-sm">or</span>
          </div>
        </div>

        {/* Apple Sign In */}
        <button 
          onClick={handleAppleSignIn}
          disabled={isAppleSignIn}
          className={`w-full min-h-[52px] py-4 rounded-col font-semibold transition flex items-center justify-center gap-3 ${
            isAppleSignIn
              ? 'bg-card border border-border text-white/40 cursor-not-allowed'
              : 'bg-white text-black hover:bg-gray-100 active:scale-[0.98]'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          {isAppleSignIn ? 'Signing in...' : 'Continue with Apple'}
        </button>

        <div className="text-xs text-center text-graytxt pt-2">
          <p>Your climbing data is stored securely and synced across devices.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
