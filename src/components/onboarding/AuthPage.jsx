import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';

// Simplified authentication - just collect email and password for testing
// Uses AuthContext for state management

const AuthPage = ({ onComplete, onError }) => {
  const { signUp, signIn } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  return (
    <div className="min-h-screen-mobile flex flex-col pt-safe-top">
      {/* Header */}
      <div className="px-6 pt-12 pb-8">
        <h1 className="text-3xl font-bold mb-2">
          Get Started
        </h1>
        <p className="text-graytxt text-base">
          Quick setup to start tracking your climbs
        </p>
      </div>

      {/* Simple Form */}
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
              placeholder="Enter any password" 
              value={form.password}
              onChange={e => update('password', e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
            />
          </div>

          <div className="text-xs text-graytxt">
            <p>Simple testing login. Your data is stored locally.</p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="px-6 pb-8 pt-6 pb-safe-bottom">
        <div className="space-y-3">
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
            {isSubmitting ? 'Getting Started...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
