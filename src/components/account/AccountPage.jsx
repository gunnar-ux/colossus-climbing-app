import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Header from '../ui/Header.jsx';
import BottomNavigation from '../ui/BottomNavigation.jsx';
import FAB from '../ui/FAB.jsx';

// Account management page - allows users to update their profile information
// Includes email, password, personal info, and physical stats sections

const AccountPage = ({ onNavigateBack, onNavigateToDashboard, onNavigateToSessions, onNavigateToProgress, onNavigateToTracker, onLogout, sessions = [] }) => {
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
  
  // Tab state
  const [activeTab, setActiveTab] = useState('email');

  // Calculate climbing statistics from sessions
  const calculateClimbingStats = () => {
    if (!sessions || sessions.length === 0) {
      return {
        totalClimbs: 0,
        totalFlashed: 0,
        totalSessions: 0,
        maxGrade: '--',
        avgGrade: '--',
        flashRate: '--',
        xp: 0
      };
    }

    let totalClimbs = 0;
    let totalFlashed = 0;
    let allGrades = [];
    let xp = 0;

    // Grade to numeric mapping for calculations
    const gradeToNumber = (grade) => {
      if (!grade || typeof grade !== 'string') return 0;
      const match = grade.match(/V(\d+)/);
      return match ? parseInt(match[1]) : 0;
    };

    // XP calculation based on grade difficulty
    const gradeToXP = (grade) => {
      const gradeNum = gradeToNumber(grade);
      return Math.max(10, gradeNum * 15); // Base 10 XP, +15 per grade level
    };

    sessions.forEach(session => {
      if (session.climbList && Array.isArray(session.climbList)) {
        session.climbList.forEach(climb => {
          totalClimbs++;
          allGrades.push(gradeToNumber(climb.grade));
          xp += gradeToXP(climb.grade);
          
          // Count as flash if attempts = 1
          if (climb.attempts === 1) {
            totalFlashed++;
          }
        });
      }
    });

    // Calculate max grade
    const maxGradeNum = allGrades.length > 0 ? Math.max(...allGrades) : 0;
    const maxGrade = maxGradeNum > 0 ? `V${maxGradeNum}` : '--';

    // Calculate average grade
    const avgGradeNum = allGrades.length > 0 
      ? Math.round(allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length)
      : 0;
    const avgGrade = avgGradeNum > 0 ? `V${avgGradeNum}` : '--';

    // Calculate flash rate
    const flashRate = totalClimbs > 0 
      ? `${Math.round((totalFlashed / totalClimbs) * 100)}%`
      : '--';

    // Calculate level based on XP (every 1000 XP = 1 level)
    const level = Math.floor(xp / 1000) + 1;

    return {
      totalClimbs,
      totalFlashed,
      totalSessions: sessions.length,
      maxGrade,
      avgGrade,
      flashRate,
      xp,
      level
    };
  };

  const climbingStats = calculateClimbingStats();

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

  const handleFABClick = () => {
    onNavigateToTracker?.();
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
      <div className="w-full h-screen overflow-y-auto hide-scrollbar relative bg-bg">
        <Header 
          title="ACCOUNT"
        />
        <div className="flex-1 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="text-xl font-semibold mb-2">Loading...</div>
            <div className="text-graytxt">Getting your account info</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-y-auto hide-scrollbar relative bg-bg">
      <Header 
        title="ACCOUNT"
      />

      {/* Status Messages */}
      {(success || error) && (
        <div className={`mx-5 mt-4 p-3 rounded-col border-l-4 mb-6 ${
          success ? 'bg-green/5 border-green text-green' : 'bg-red-500/5 border-red-400 text-red-400'
        }`}>
          <div className="flex items-start gap-2">
            <span className="mt-0.5">{success ? '✓' : '⚠️'}</span>
            <span>{success || error}</span>
          </div>
        </div>
      )}

      {/* Comprehensive Profile Card */}
      <section className="px-5 pt-4">
        <div className="bg-card border border-border rounded-col p-4 mb-8">
          {/* Header with Avatar and Name */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {personalForm.name ? personalForm.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'C'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl text-white" style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600 }}>{personalForm.name || 'Climber'}</h3>
              <p className="text-graytxt">{user?.email}</p>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-white font-semibold">Level: {climbingStats.level}</span>
                <span className="text-sm text-white font-semibold">XP: {climbingStats.xp.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          {/* Physical Stats Row 1 */}
          <div className="grid grid-cols-3 gap-4 text-sm mb-4">
            <div className="text-center">
              <div className="text-graytxt text-xs mb-1">Age</div>
              <div className="text-white font-semibold">{personalForm.age || '--'}</div>
            </div>
            <div className="text-center">
              <div className="text-graytxt text-xs mb-1">Height</div>
              <div className="text-white font-semibold">
                {(() => {
                  if (physicalForm.height.feet && physicalForm.height.inches && 
                      !isNaN(physicalForm.height.feet) && !isNaN(physicalForm.height.inches)) {
                    return `${physicalForm.height.feet}'${physicalForm.height.inches}"`;
                  }
                  if (physicalForm.height.cm && !isNaN(physicalForm.height.cm)) {
                    return `${physicalForm.height.cm}cm`;
                  }
                  if (profile?.height_cm && !isNaN(profile.height_cm)) {
                    const feet = Math.floor(profile.height_cm / 30.48);
                    const inches = Math.round((profile.height_cm / 2.54) % 12);
                    return unitHeight === 'ft' ? `${feet}'${inches}"` : `${profile.height_cm}cm`;
                  }
                  return '--';
                })()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-graytxt text-xs mb-1">Ape</div>
              <div className="text-white font-semibold">
                {(() => {
                  if (physicalForm.apeIndex && !isNaN(physicalForm.apeIndex)) {
                    return `${physicalForm.apeIndex}"`;
                  }
                  if (profile?.ape_index_cm && !isNaN(profile.ape_index_cm)) {
                    const apeInches = Math.round(profile.ape_index_cm / 2.54);
                    return unitApeIndex === 'in' ? `${apeInches}"` : `${profile.ape_index_cm}cm`;
                  }
                  return '--';
                })()}
              </div>
            </div>
          </div>

          {/* Climbing Performance Row 2 */}
          <div className="grid grid-cols-3 gap-4 text-sm mb-4">
            <div className="text-center">
              <div className="text-graytxt text-xs mb-1">Max Grade</div>
              <div className="text-white font-semibold">{climbingStats.maxGrade}</div>
            </div>
            <div className="text-center">
              <div className="text-graytxt text-xs mb-1">Avg Grade</div>
              <div className="text-white font-semibold">{climbingStats.avgGrade}</div>
            </div>
            <div className="text-center">
              <div className="text-graytxt text-xs mb-1">Flash Rate</div>
              <div className="text-white font-semibold">{climbingStats.flashRate}</div>
            </div>
          </div>

          {/* Volume Stats Row 3 */}
          <div className="grid grid-cols-3 gap-4 text-sm mb-6">
            <div className="text-center">
              <div className="text-graytxt text-xs mb-1">Total Climbs</div>
              <div className="text-white font-semibold">{climbingStats.totalClimbs.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-graytxt text-xs mb-1">Total Flashed</div>
              <div className="text-white font-semibold">{climbingStats.totalFlashed.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-graytxt text-xs mb-1">Total Sessions</div>
              <div className="text-white font-semibold">{climbingStats.totalSessions.toLocaleString()}</div>
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={onLogout}
            className="w-full px-4 py-2 bg-white text-black rounded-lg font-semibold hover:opacity-90 active:scale-95 transition min-h-[44px]"
          >
            Sign Out
          </button>
        </div>
      </section>

      <div className="px-5">
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex bg-card border border-border rounded-col p-1">
            {[
              { id: 'email', label: 'Email' },
              { id: 'password', label: 'Password' },
              { id: 'personal', label: 'Personal' },
              { id: 'physical', label: 'Physical' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-white text-black'
                    : 'text-graytxt hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Form Section */}
        <div className="space-y-4">
          {activeTab === 'email' && (
            <>
              <div>
                <label className="block text-sm text-graytxt mb-2">Current Email</label>
                <div className="text-white text-base">{user?.email}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">New Email</label>
                <input 
                  type="email" 
                  value={emailForm.newEmail}
                  onChange={e => updateEmailForm('newEmail', e.target.value)}
                  className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
                  placeholder="new@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Confirm New Email</label>
                <input 
                  type="email" 
                  value={emailForm.confirmEmail}
                  onChange={e => updateEmailForm('confirmEmail', e.target.value)}
                  className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
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
            </>
          )}

          {activeTab === 'password' && (
            <>
              <div>
                <label className="block text-sm font-medium text-white mb-2">New Password</label>
                <input 
                  type="password" 
                  value={passwordForm.newPassword}
                  onChange={e => updatePasswordForm('newPassword', e.target.value)}
                  className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwordForm.confirmPassword}
                  onChange={e => updatePasswordForm('confirmPassword', e.target.value)}
                  className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
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
            </>
          )}

          {activeTab === 'personal' && (
            <>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Name</label>
                <input 
                  type="text" 
                  value={personalForm.name}
                  onChange={e => updatePersonalForm('name', e.target.value)}
                  className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
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
                    className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
                    placeholder="Age"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Gender</label>
                  <div className="relative">
                    <select 
                      value={personalForm.gender}
                      onChange={e => updatePersonalForm('gender', e.target.value)}
                      className="w-full min-h-[52px] p-4 pr-12 rounded-col bg-card border border-border text-white focus:border-white/30 transition appearance-none"
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
                  className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
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
            </>
          )}

          {activeTab === 'physical' && (
            <>
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
                        className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
                        placeholder="0"
                      />
                      <label className="text-xs text-graytxt mt-1 block text-center font-medium">feet</label>
                    </div>
                    <div>
                      <input 
                        type="number" 
                        value={physicalForm.height.inches} 
                        onChange={e => updatePhysicalForm('height', {...physicalForm.height, inches: e.target.value})} 
                        className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
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
                  value={physicalForm.weight.value} 
                  onChange={e => updatePhysicalForm('weight', {value: e.target.value, unit: unitWeight})} 
                  className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
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
                  className="w-full min-h-[52px] p-4 rounded-col bg-card border border-border text-white placeholder-graytxt focus:border-white/30 transition" 
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
            </>
          )}
        </div>

        {/* Bottom Logo Section - Whoop Style */}
        <section className="pt-2 pb-32 flex items-center justify-center">
          <img 
            src="/asset8.svg" 
            alt="POGO" 
            className="w-16 h-16"
          />
        </section>
      </div>

      <FAB onClick={handleFABClick} />

      <BottomNavigation 
        activeItem="Account"
        onNavigateTo={(route) => {
          if (route === '/dashboard') {
            onNavigateToDashboard?.();
          } else if (route === '/sessions') {
            onNavigateToSessions?.();
          } else if (route === '/progress') {
            onNavigateToProgress?.();
          } else if (route === '/account') {
            // Already on account
          }
        }}
      />
    </div>
  );
};

export default AccountPage;
