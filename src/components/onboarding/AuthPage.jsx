import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';

// Unified authentication component - handles both login and signup
// Replaces AccountSignup with toggle between modes

const AuthPage = ({ onComplete, onError }) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = (field, val) => setForm(f => ({...f, [field]: val}));

  const canSubmit = mode === 'login' 
    ? form.email.trim() && form.password.length >= 6
    : form.email.trim() && form.password.length >= 6 && form.confirmPassword === form.password;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      let result;
      if (mode === 'login') {
        result = await signIn(form.email, form.password);
      } else {
        result = await signUp(form.email, form.password);
      }
      
      if (result.success) {
        onComplete({ email: form.email });
      } else {
        // Enhanced error handling for duplicate emails
        if (result.error?.includes('User already registered') || 
            result.error?.includes('already been registered')) {
          setError('This email is already registered. Try logging in instead.');
        } else if (result.error?.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials.');
        } else {
          setError(result.error || `Failed to ${mode === 'login' ? 'log in' : 'create account'}`);
        }
        onError?.(result.error);
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
      onError?.(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && canSubmit) {
      handleSubmit();
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setForm(f => ({...f, confirmPassword: ''})); // Clear confirm password when switching
  };

  const handleTryLogin = () => {
    setMode('login');
    setError('');
  };

  return (
    <div className="min-h-screen-mobile flex flex-col safe-area-top">
      {/* Header */}
      <div className="px-6 pt-12 pb-8">
        <h1 className="text-3xl font-bold mb-2">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-graytxt text-base">
          {mode === 'login' ? 'Log in to continue your climbing journey' : 'Join the climbing community'}
        </p>
      </div>

      {/* Auth Form */}
      <div className="flex-1 px-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Email</label>
            <input 
              type="email" 
              placeholder="your@email.com" 
              value={form.email}
              onChange={e => update('email', e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Password</label>
            <input 
              type="password" 
              placeholder={mode === 'login' ? 'Your password' : 'At least 6 characters'} 
              value={form.password}
              onChange={e => update('password', e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
              <input 
                type="password" 
                placeholder="Confirm your password" 
                value={form.confirmPassword}
                onChange={e => update('confirmPassword', e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
              />
              {form.confirmPassword && form.confirmPassword !== form.password && (
                <p className="text-red-400 text-xs mt-1">Passwords don't match</p>
              )}
            </div>
          )}

          {/* Password requirements for signup */}
          {mode === 'signup' && (
            <div className="text-xs text-graytxt space-y-1">
              <div className="flex items-center gap-2">
                <span className={form.password.length >= 6 ? 'text-green' : 'text-graytxt'}>
                  {form.password.length >= 6 ? '✓' : '○'}
                </span>
                <span>At least 6 characters</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={form.confirmPassword === form.password && form.password ? 'text-green' : 'text-graytxt'}>
                  {form.confirmPassword === form.password && form.password ? '✓' : '○'}
                </span>
                <span>Passwords match</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="px-6 pb-8 pt-6 safe-area-bottom">
        <div className="space-y-3">
          {error && (
            <div className="text-red-400 text-sm p-3 bg-red-500/5 border-l-4 border-red-400 bg-red-400/5">
              <div className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">⚠️</span>
                <div className="flex-1">
                  <span>{error}</span>
                  {error.includes('already registered') && (
                    <button 
                      onClick={handleTryLogin}
                      className="block mt-2 text-blue-400 hover:text-blue-300 underline text-xs"
                    >
                      Try logging in instead
                    </button>
                  )}
                </div>
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
            {isSubmitting ? 
              (mode === 'login' ? 'Logging In...' : 'Creating Account...') : 
              (mode === 'login' ? 'Log In' : 'Create Account')
            }
          </button>

          {/* Mode Switch */}
          <div className="text-center">
            <button 
              onClick={switchMode}
              disabled={isSubmitting}
              className="text-sm text-graytxt hover:text-white transition-colors"
            >
              {mode === 'login' ? 
                "Don't have an account? Create one" : 
                "Already have an account? Log in"
              }
            </button>
          </div>

          {mode === 'signup' && (
            <div className="text-center">
              <p className="text-xs text-graytxt">
                By creating an account, you agree to our terms of service and privacy policy
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
