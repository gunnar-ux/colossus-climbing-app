import React, { useState } from 'react';
// Note: authService removed - using simplified auth system
import { useAuth } from '../../auth/useAuth.js';

const AccountUpgrade = ({ onClose, onUpgrade, climbCount = 0, message, reason }) => {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleUpgrade = async () => {
    if (!email || !password || password.length < 6) {
      setError('Please provide a valid email and password (min 6 characters)');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await authService.upgradeToFullAccount(email, password);
      
      if (result.success) {
        onUpgrade();
      } else {
        setError(result.error?.message || 'Failed to create account. Please try again.');
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = async () => {
    // Track dismissal
    if (user?.id) {
      await authService.dismissAccountPrompt(user.id);
    }
    onClose();
  };

  if (!showForm) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-fade-in">
        <div className="bg-card w-full max-w-lg rounded-t-2xl p-6 pb-8 animate-slide-up">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>
                {message || `You've logged ${climbCount} climbs`}
              </h2>
              <p className="text-graytxt mt-1">
                {reason === 'time_milestone' ? 'Ready to secure your progress?' : 'Ready to track your journey?'}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-graytxt hover:text-white transition-colors p-1"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div>
                <p className="text-white font-medium">Never lose your progress</p>
                <p className="text-graytxt text-sm">
                  Your data syncs across all your devices
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div>
                <p className="text-white font-medium">Track long-term progress</p>
                <p className="text-graytxt text-sm">
                  See your improvement over weeks and months
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div>
                <p className="text-white font-medium">Unlock personalized training</p>
                <p className="text-graytxt text-sm">
                  Get AI-powered recommendations based on your data
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 bg-white text-black rounded-col font-semibold hover:bg-gray-100 transition-colors active:scale-[0.98]"
            >
              Create Free Account
            </button>
            
            <button
              onClick={handleDismiss}
              className="w-full py-3 text-graytxt hover:text-white transition-colors"
            >
              Keep Climbing
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show email/password form
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 animate-fade-in">
      <div className="bg-card w-full max-w-md rounded-col p-6 animate-scale-in">
        <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Oswald, sans-serif' }}>
          Secure Your Progress
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-black/50 rounded-col border border-border text-white placeholder-graytxt focus:border-white/30 focus:outline-none transition-colors"
              placeholder="your@email.com"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-black/50 rounded-col border border-border text-white placeholder-graytxt focus:border-white/30 focus:outline-none transition-colors"
              placeholder="Create a password (min 6 characters)"
            />
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-col text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <div className="mt-6 space-y-3">
          <button
            onClick={handleUpgrade}
            disabled={!email || !password || isLoading}
            className={`w-full py-3 rounded-col font-semibold transition-all ${
              !email || !password || isLoading
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-white text-black hover:bg-gray-100 active:scale-[0.98]'
            }`}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
          
          <button
            onClick={() => setShowForm(false)}
            className="w-full py-3 text-graytxt hover:text-white transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountUpgrade;
