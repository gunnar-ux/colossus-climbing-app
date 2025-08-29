import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';

// Physical stats component - Step 3 of 3-step onboarding
// Collects height, weight, ape index and creates user profile

const PhysicalStats = ({ onComplete, onBack, userData = {} }) => {
  const { user, updateProfile } = useAuth();
  const [unitHeight, setUnitHeight] = useState('ft');
  const [unitWeight, setUnitWeight] = useState('lbs');
  const [unitApeIndex, setUnitApeIndex] = useState('in');
  const [showApeHelp, setShowApeHelp] = useState(false);
  const [form, setForm] = useState({
    height: { feet: '', inches: '', cm: '' },
    weight: { value: '', unit: 'lbs' },
    apeIndex: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const update = (field, val) => setForm(f => ({...f, [field]: val}));



  const handleCreateProfile = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    setError('');
    
    try {
      
      // If user is not yet authenticated (email not confirmed), store data locally and proceed
      if (!user) {

        
        // Convert measurements for storage
        const height_cm = unitHeight === 'cm' 
          ? Number(form.height.cm) || 0
          : Math.round(((Number(form.height.feet) || 0) * 12 + (Number(form.height.inches) || 0)) * 2.54);
        
        const weight_kg = unitWeight === 'kg' 
          ? Number(form.weight.value) || 0
          : Math.round((Number(form.weight.value) || 0) * 0.453592);
        
        const ape_index_cm = unitApeIndex === 'cm' 
          ? Number(form.apeIndex) || 0
          : Math.round((Number(form.apeIndex) || 0) * 2.54);

        // Store profile data for when user becomes authenticated
        const profileData = {
          name: userData.name || 'Climber', // Provide fallback name for database constraint
          age: userData.age ? Number(userData.age) : null,
          gender: userData.gender || '',
          location: userData.location || '',
          height_cm,
          weight_kg,
          ape_index_cm,
          total_sessions: 0,
          total_climbs: 0
        };
        
        localStorage.setItem('pendingProfileData', JSON.stringify(profileData));
        
        // Complete onboarding with local data
        onComplete({
          ...userData,
          height: form.height,
          weight: form.weight,
          apeIndex: form.apeIndex,
          hasCompletedOnboarding: true,
          profilePending: true // Flag to indicate profile creation is pending
        });
        return;
      }

      // Convert all measurements to metric for database storage
      const height_cm = unitHeight === 'cm' 
        ? Number(form.height.cm) || 0
        : Math.round(((Number(form.height.feet) || 0) * 12 + (Number(form.height.inches) || 0)) * 2.54);
      
      const weight_kg = unitWeight === 'kg' 
        ? Number(form.weight.value) || 0
        : Math.round((Number(form.weight.value) || 0) * 0.453592);
      
      const ape_index_cm = unitApeIndex === 'cm' 
        ? Number(form.apeIndex) || 0
        : Math.round((Number(form.apeIndex) || 0) * 2.54);

      // Prepare user data for database
      const profileData = {
        name: userData.name || 'Climber', // Provide fallback name for database constraint
        age: userData.age ? Number(userData.age) : null,
        gender: userData.gender || '',
        location: userData.location || '',
        height_cm,
        weight_kg,
        ape_index_cm,
        total_sessions: 0,
        total_climbs: 0
      };


      
      // Use AuthContext to update profile
      const result = await updateProfile(profileData);

      if (!result.success) {
        setError(result.error || 'Failed to create profile');
        return;
      }
      
      onComplete({
        ...userData,
        height: form.height,
        weight: form.weight,
        apeIndex: form.apeIndex,
        hasCompletedOnboarding: true
      });
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen-mobile flex flex-col pt-safe-top">
      {/* Header */}
      <div className="px-6 pt-12 pb-8">
        <h1 className="text-3xl font-bold mb-2">Physical Stats</h1>
        <p className="text-graytxt text-base">Help us calculate your climbing metrics</p>
      </div>

      {/* Physical Stats Form */}
      <div className="flex-1 px-6 space-y-6">
        <div className="space-y-4">
          
          {/* Height */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white">Height</label>
              <div className="flex gap-1 text-xs font-medium">
                <button 
                  className={`px-3 py-1 rounded-col transition ${
                    unitHeight === 'ft' ? 'bg-white text-black' : 'bg-border/40 text-graytxt hover:bg-border/60'
                  }`} 
                  onClick={() => setUnitHeight('ft')}
                >
                  ft/in
                </button>
                <button 
                  className={`px-3 py-1 rounded-col transition ${
                    unitHeight === 'cm' ? 'bg-white text-black' : 'bg-border/40 text-graytxt hover:bg-border/60'
                  }`} 
                  onClick={() => setUnitHeight('cm')}
                >
                  cm
                </button>
              </div>
            </div>
            {unitHeight === 'ft' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input 
                    type="number" 
                    value={form.height.feet} 
                    onChange={e => update('height', {...form.height, feet: +e.target.value})} 
                    className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
                    placeholder="0"
                  />
                  <label className="text-xs text-graytxt mt-1 block text-center font-medium">feet</label>
                </div>
                <div>
                  <input 
                    type="number" 
                    value={form.height.inches} 
                    onChange={e => update('height', {...form.height, inches: +e.target.value})} 
                    className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
                    placeholder="0"
                  />
                  <label className="text-xs text-graytxt mt-1 block text-center font-medium">inches</label>
                </div>
              </div>
            ) : (
              <input 
                type="number" 
                value={form.height.cm} 
                onChange={e => update('height', {...form.height, cm: +e.target.value})} 
                className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
                placeholder="0"
              />
            )}
          </div>

          {/* Weight */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white">Weight</label>
              <div className="flex gap-1 text-xs font-medium">
                <button 
                  className={`px-3 py-1 rounded-col transition ${
                    unitWeight === 'lbs' ? 'bg-white text-black' : 'bg-border/40 text-graytxt hover:bg-border/60'
                  }`} 
                  onClick={() => setUnitWeight('lbs')}
                >
                  lbs
                </button>
                <button 
                  className={`px-3 py-1 rounded-col transition ${
                    unitWeight === 'kg' ? 'bg-white text-black' : 'bg-border/40 text-graytxt hover:bg-border/60'
                  }`} 
                  onClick={() => setUnitWeight('kg')}
                >
                  kg
                </button>
              </div>
            </div>
            <input 
              type="number" 
              value={form.weight.value} 
              onChange={e => update('weight', {value: +e.target.value, unit: unitWeight})} 
              className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
              placeholder="0" 
            />
          </div>

          {/* Ape Index */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white">Ape Index</label>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 text-xs font-medium">
                  <button 
                    className={`px-3 py-1 rounded-col transition ${
                      unitApeIndex === 'in' ? 'bg-white text-black' : 'bg-border/40 text-graytxt hover:bg-border/60'
                    }`} 
                    onClick={() => setUnitApeIndex('in')}
                  >
                    in
                  </button>
                  <button 
                    className={`px-3 py-1 rounded-col transition ${
                      unitApeIndex === 'cm' ? 'bg-white text-black' : 'bg-border/40 text-graytxt hover:bg-border/60'
                    }`} 
                    onClick={() => setUnitApeIndex('cm')}
                  >
                    cm
                  </button>
                </div>
                <button 
                  className="w-5 h-5 rounded-col bg-border/40 text-graytxt hover:bg-border/60 transition flex items-center justify-center text-xs" 
                  onClick={() => setShowApeHelp(s => !s)}
                >
                  ?
                </button>
              </div>
            </div>
            <input 
              type="number" 
              value={form.apeIndex} 
              onChange={e => update('apeIndex', +e.target.value)} 
              className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
              placeholder={unitApeIndex === 'in' ? '0' : '0'} 
            />
            {showApeHelp && (
              <div className="mt-3 text-sm text-graytxt bg-card border border-border rounded-col p-3">
                <div className="font-semibold text-white mb-1">What's Ape Index?</div>
                <div>Wingspan minus height. Positive = longer arms, which can help with reach on climbs.</div>
              </div>
            )}
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
                <div className="flex-1">
                  <span>{error}</span>

                </div>
              </div>
            </div>
          )}
          
          <button 
            onClick={handleCreateProfile}
            disabled={isCreating}
            className={`w-full min-h-[52px] py-4 rounded-col font-semibold transition ${
              isCreating 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-black hover:bg-gray-100 active:scale-[0.98]'
            }`}
          >
            {isCreating ? 'Setting Up Profile...' : 'Complete Setup'}
          </button>
          
          <button 
            onClick={onBack}
            disabled={isCreating}
            className={`w-full min-h-[52px] py-4 bg-border text-white rounded-col font-semibold transition ${
              isCreating 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-border/80 active:scale-[0.98]'
            }`}
          >
            Previous
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhysicalStats;
