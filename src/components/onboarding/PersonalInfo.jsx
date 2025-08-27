import { useState } from 'react';

// Personal info component - Step 2 of 3-step onboarding
// Collects name, age, gender, and location

const PersonalInfo = ({ onComplete, onBack, initialData = {} }) => {
  const [form, setForm] = useState({
    name: initialData.name || '',
    age: initialData.age || 28,
    gender: initialData.gender || '',
    location: initialData.location || ''
  });
  const [error, setError] = useState('');

  const update = (field, val) => setForm(f => ({...f, [field]: val}));

  const canContinue = form.name.trim() && form.age >= 13 && form.gender;

  const handleContinue = () => {
    if (!canContinue) return;
    
    setError('');
    
    // Validate age
    if (form.age < 13 || form.age > 100) {
      setError('Age must be between 13 and 100');
      return;
    }

    // Validate name
    if (form.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    onComplete(form);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && canContinue) {
      handleContinue();
    }
  };

  return (
    <div className="min-h-screen-mobile flex flex-col safe-area-top">
      {/* Header */}
      <div className="px-6 pt-12 pb-8">
        <h1 className="text-3xl font-bold mb-2">Tell Us About You</h1>
        <p className="text-graytxt text-base">Help us personalize your experience</p>
      </div>

      {/* Personal Info Form */}
      <div className="flex-1 px-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Name</label>
            <input 
              placeholder="Enter your name" 
              value={form.name}
              onChange={e => update('name', e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Age</label>
            <input 
              type="number" 
              min="13" 
              max="100" 
              placeholder="28" 
              value={form.age}
              onChange={e => update('age', +e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Gender</label>
            <div className="grid grid-cols-3 gap-3">
              {[{label:'M', value:'Male'}, {label:'F', value:'Female'}, {label:'Other', value:'Other'}].map(g => (
                <button 
                  key={g.value}
                  className={`min-h-[52px] px-4 py-3 rounded-col border transition text-sm font-medium ${
                    form.gender === g.value 
                      ? 'bg-white text-black border-white' 
                      : 'bg-card border-border text-white hover:border-white/30'
                  }`}
                  onClick={() => update('gender', g.value)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Location (Optional)</label>
            <input 
              placeholder="City, State" 
              value={form.location}
              onChange={e => update('location', e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
            />
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="px-6 pb-8 pt-6 safe-area-bottom">
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
            onClick={handleContinue}
            disabled={!canContinue}
            className={`w-full min-h-[52px] py-4 rounded-col font-semibold transition ${
              canContinue 
                ? 'bg-white text-black hover:bg-gray-100 active:scale-[0.98]' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
          
          <button 
            onClick={onBack}
            className="w-full min-h-[52px] py-4 bg-border text-white rounded-col font-semibold hover:bg-border/80 active:scale-[0.98] transition"
          >
            Previous
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
