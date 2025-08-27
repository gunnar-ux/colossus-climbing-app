import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Header from '../ui/Header.jsx';

// Account management page - allows users to update their profile information
// Includes email, password, personal info, and physical stats sections

const AccountPage = ({ onNavigateBack }) => {
  const { user, profile, updateProfile, updateEmail, updatePassword } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form state for different sections
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    confirmEmail: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [personalForm, setPersonalForm] = useState({
    name: '',
    age: '',
    gender: '',
    location: ''
  });

  const [physicalForm, setPhysicalForm] = useState({
    height: { feet: '', inches: '', cm: '' },
    weight: { value: '', unit: 'lbs' },
    apeIndex: ''
  });

  const [unitHeight, setUnitHeight] = useState('ft');
  const [unitWeight, setUnitWeight] = useState('lbs');
  const [unitApeIndex, setUnitApeIndex] = useState('in');

  // Load profile data on mount
  useEffect(() => {
    if (profile) {
      // Convert database values back to form format
      const heightFeet = Math.floor(profile.height_cm / 30.48);
      const heightInches = Math.round((profile.height_cm / 2.54) % 12);
      const weightLbs = Math.round(profile.weight_kg * 2.20462);
      const apeIndexInches = Math.round(profile.ape_index_cm / 2.54);

      setPersonalForm({
        name: profile.name || '',
        age: profile.age?.toString() || '',
        gender: profile.gender || '',
        location: profile.location || ''
      });

      setPhysicalForm({
        height: {
          feet: heightFeet?.toString() || '',
          inches: heightInches?.toString() || '',
          cm: profile.height_cm?.toString() || ''
        },
        weight: {
          value: weightLbs?.toString() || '',
          unit: 'lbs'
        },
        apeIndex: apeIndexInches?.toString() || ''
      });

      setEmailForm({
        newEmail: user?.email || '',
        confirmEmail: ''
      });
    }
    setLoading(false);
  }, [profile, user]);

  // Update handlers
  const updateEmailForm = (field, value) => setEmailForm(f => ({...f, [field]: value}));
  const updatePasswordForm = (field, value) => setPasswordForm(f => ({...f, [field]: value}));
  const updatePersonalForm = (field, value) => setPersonalForm(f => ({...f, [field]: value}));
  const updatePhysicalForm = (field, value) => setPhysicalForm(f => ({...f, [field]: value}));

  // Save handlers for each section
  const saveEmail = async () => {
    if (emailForm.newEmail !== emailForm.confirmEmail) {
      setError('Email addresses do not match');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateEmail(emailForm.newEmail);
      if (result.success) {
        setSuccess('Email updated successfully. Please check your new email to confirm the change.');
        setEmailForm(f => ({...f, confirmEmail: ''}));
      } else {
        setError(result.error || 'Failed to update email');
      }
    } catch (error) {
      setError('Something went wrong updating your email');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const result = await updatePassword(passwordForm.newPassword);
      if (result.success) {
        setSuccess('Password updated successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(result.error || 'Failed to update password');
      }
    } catch (error) {
      setError('Something went wrong updating your password');
    } finally {
      setSaving(false);
    }
  };

  const savePersonalInfo = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updates = {
        name: personalForm.name,
        age: personalForm.age ? Number(personalForm.age) : null,
        gender: personalForm.gender,
        location: personalForm.location
      };

      const result = await updateProfile(updates);
      if (result.success) {
        setSuccess('Personal information updated successfully');
      } else {
        setError(result.error || 'Failed to update personal information');
      }
    } catch (error) {
      setError('Something went wrong updating your information');
    } finally {
      setSaving(false);
    }
  };

  const savePhysicalStats = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Convert to metric for storage
      const height_cm = unitHeight === 'cm' 
        ? Number(physicalForm.height.cm) || 0
        : Math.round(((Number(physicalForm.height.feet) || 0) * 12 + (Number(physicalForm.height.inches) || 0)) * 2.54);
      
      const weight_kg = unitWeight === 'kg' 
        ? Number(physicalForm.weight.value) || 0
        : Math.round((Number(physicalForm.weight.value) || 0) * 0.453592);
      
      const ape_index_cm = unitApeIndex === 'cm' 
        ? Number(physicalForm.apeIndex) || 0
        : Math.round((Number(physicalForm.apeIndex) || 0) * 2.54);

      const updates = {
        height_cm,
        weight_kg,
        ape_index_cm
      };

      const result = await updateProfile(updates);
      if (result.success) {
        setSuccess('Physical stats updated successfully');
      } else {
        setError(result.error || 'Failed to update physical stats');
      }
    } catch (error) {
      setError('Something went wrong updating your stats');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen-mobile flex flex-col safe-area-top bg-bg">
        <Header 
          title="ACCOUNT" 
          showBackButton={true} 
          onBackClick={onNavigateBack}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl font-semibold mb-2">Loading...</div>
            <div className="text-graytxt">Getting your account info</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen-mobile flex flex-col safe-area-top bg-bg">
      <Header 
        title="ACCOUNT" 
        showBackButton={true} 
        onBackClick={onNavigateBack}
      />

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        
        {/* Status Messages */}
        {(success || error) && (
          <div className={`p-3 rounded-col border-l-4 ${
            success ? 'bg-green/5 border-green text-green' : 'bg-red-500/5 border-red-400 text-red-400'
          }`}>
            <div className="flex items-start gap-2">
              <span className="mt-0.5">{success ? '✓' : '⚠️'}</span>
              <span>{success || error}</span>
            </div>
          </div>
        )}

        {/* Email Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Email Address</h2>
          <div className="bg-card border border-border rounded-col p-4 space-y-4">
            <div>
              <label className="block text-sm text-graytxt mb-2">Current Email</label>
              <div className="text-white">{user?.email}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">New Email</label>
              <input 
                type="email" 
                value={emailForm.newEmail}
                onChange={e => updateEmailForm('newEmail', e.target.value)}
                className="w-full min-h-[52px] p-4 rounded-col bg-bg border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
                placeholder="new@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Confirm New Email</label>
              <input 
                type="email" 
                value={emailForm.confirmEmail}
                onChange={e => updateEmailForm('confirmEmail', e.target.value)}
                className="w-full min-h-[52px] p-4 rounded-col bg-bg border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
                placeholder="Confirm new email"
              />
            </div>

            <button 
              onClick={saveEmail}
              disabled={saving || !emailForm.newEmail || emailForm.newEmail === user?.email}
              className={`w-full py-3 rounded-col font-semibold transition ${
                saving || !emailForm.newEmail || emailForm.newEmail === user?.email
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {saving ? 'Updating...' : 'Update Email'}
            </button>
          </div>
        </section>

        {/* Password Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Password</h2>
          <div className="bg-card border border-border rounded-col p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">New Password</label>
              <input 
                type="password" 
                value={passwordForm.newPassword}
                onChange={e => updatePasswordForm('newPassword', e.target.value)}
                className="w-full min-h-[52px] p-4 rounded-col bg-bg border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Confirm New Password</label>
              <input 
                type="password" 
                value={passwordForm.confirmPassword}
                onChange={e => updatePasswordForm('confirmPassword', e.target.value)}
                className="w-full min-h-[52px] p-4 rounded-col bg-bg border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
                placeholder="Confirm new password"
              />
            </div>

            <button 
              onClick={savePassword}
              disabled={saving || !passwordForm.newPassword || passwordForm.newPassword.length < 6}
              className={`w-full py-3 rounded-col font-semibold transition ${
                saving || !passwordForm.newPassword || passwordForm.newPassword.length < 6
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </section>

        {/* Personal Information Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="bg-card border border-border rounded-col p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Name</label>
              <input 
                type="text" 
                value={personalForm.name}
                onChange={e => updatePersonalForm('name', e.target.value)}
                className="w-full min-h-[52px] p-4 rounded-col bg-bg border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
                placeholder="Your name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Age</label>
                <input 
                  type="number" 
                  value={personalForm.age}
                  onChange={e => updatePersonalForm('age', e.target.value)}
                  className="w-full min-h-[52px] p-4 rounded-col bg-bg border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
                  placeholder="Age"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Gender</label>
                <div className="relative">
                  <select 
                    value={personalForm.gender}
                    onChange={e => updatePersonalForm('gender', e.target.value)}
                    className="w-full min-h-[52px] p-4 pr-12 rounded-col bg-bg border border-border text-white focus:border-white/30 transition appearance-none"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-graytxt">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Location</label>
              <input 
                type="text" 
                value={personalForm.location}
                onChange={e => updatePersonalForm('location', e.target.value)}
                className="w-full min-h-[52px] p-4 rounded-col bg-bg border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
                placeholder="City, State/Country"
              />
            </div>

            <button 
              onClick={savePersonalInfo}
              disabled={saving}
              className={`w-full py-3 rounded-col font-semibold transition ${
                saving
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {saving ? 'Updating...' : 'Update Personal Info'}
            </button>
          </div>
        </section>

        {/* Physical Stats Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Physical Stats</h2>
          <div className="bg-card border border-border rounded-col p-4 space-y-4">
            
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
                      value={physicalForm.height.feet} 
                      onChange={e => updatePhysicalForm('height', {...physicalForm.height, feet: e.target.value})} 
                      className="w-full min-h-[52px] p-4 rounded-col bg-bg border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
                      placeholder="0"
                    />
                    <label className="text-xs text-graytxt mt-1 block text-center font-medium">feet</label>
                  </div>
                  <div>
                    <input 
                      type="number" 
                      value={physicalForm.height.inches} 
                      onChange={e => updatePhysicalForm('height', {...physicalForm.height, inches: e.target.value})} 
                      className="w-full min-h-[52px] p-4 rounded-col bg-bg border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
                      placeholder="0"
                    />
                    <label className="text-xs text-graytxt mt-1 block text-center font-medium">inches</label>
                  </div>
                </div>
              ) : (
                <input 
                  type="number" 
                  value={physicalForm.height.cm} 
                  onChange={e => updatePhysicalForm('height', {...physicalForm.height, cm: e.target.value})} 
                  className="w-full min-h-[52px] p-4 rounded-col bg-bg border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
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
                value={physicalForm.weight.value} 
                onChange={e => updatePhysicalForm('weight', {value: e.target.value, unit: unitWeight})} 
                className="w-full min-h-[52px] p-4 rounded-col bg-bg border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
                placeholder="0" 
              />
            </div>

            {/* Ape Index */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white">Ape Index</label>
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
              </div>
              <input 
                type="number" 
                value={physicalForm.apeIndex} 
                onChange={e => updatePhysicalForm('apeIndex', e.target.value)} 
                className="w-full min-h-[52px] p-4 rounded-col bg-bg border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
                placeholder="0" 
              />
            </div>

            <button 
              onClick={savePhysicalStats}
              disabled={saving}
              className={`w-full py-3 rounded-col font-semibold transition ${
                saving
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {saving ? 'Updating...' : 'Update Physical Stats'}
            </button>
          </div>
        </section>

        {/* Bottom spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
};

export default AccountPage;
