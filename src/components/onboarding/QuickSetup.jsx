import { useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getGradesForSystem, toStorageGrade } from '../../utils/gradeConversion.js';
import '../../styles/tracker-animations.css';

// Quick Setup - Collect flash grade and typical volume for personalized onboarding
// Modern design with tracker-style interactions and light theme

const QuickSetup = ({ userId, onComplete, onSkip }) => {
  const { refreshProfile } = useAuth();
  const [gradeSystem, setGradeSystem] = useState('v-scale');
  const [flashGrade, setFlashGrade] = useState(null);
  const [typicalVolume, setTypicalVolume] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const grades = getGradesForSystem(gradeSystem);
  const canSubmit = !!flashGrade && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    setIsSubmitting(true);
    setShowSuccess(false);
    setError('');

    try {
      // Convert flash grade to V-scale for storage
      const storageFlashGrade = toStorageGrade(flashGrade, gradeSystem);
      
      // Save to user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          grade_system: gradeSystem,
          flash_grade: storageFlashGrade,
          typical_volume: typicalVolume,
          onboarding_completed: true
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Try to generate synthetic sessions (non-blocking if it fails)
      generateSyntheticSessions(userId, storageFlashGrade, typicalVolume).catch(err => {
        console.warn('⚠️ Synthetic session generation failed (non-critical):', err);
      });

      // Success! Show confirmation animation
      console.log('✅ Quick setup completed successfully');
      setShowSuccess(true);
      
      // Wait for animation to complete (2.8 seconds)
      setTimeout(async () => {
        console.log('🔄 Refreshing profile in context...');
        
        // Refresh profile in AuthContext
        await refreshProfile(userId);
        
        console.log('✅ Profile refreshed, completing onboarding');
        
        // Complete onboarding - navigate to dashboard
        onComplete?.();
      }, 2800);
      
    } catch (err) {
      console.error('Quick setup error:', err);
      setError('Failed to save. Please try again.');
      setIsSubmitting(false);
      setShowSuccess(false);
    }
  };


  // Tracker-style button component
  const GradeButton = ({ grade, selected, onClick }) => (
    <button
      onClick={onClick}
      className={`h-10 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-95 relative overflow-hidden ${
        selected
          ? 'bg-white text-white'
          : 'bg-white text-black hover:bg-gray-50'
      }`}
    >
      <span className="relative z-10">{grade}</span>
      <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${
        selected 
          ? 'bg-black scale-100' 
          : 'bg-black scale-0'
      }`} style={{
        transformOrigin: 'center',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}></div>
    </button>
  );

  return (
    <div className="w-full min-h-screen overflow-y-auto hide-scrollbar relative" style={{ backgroundColor: '#EBEDEE' }}>
      {/* Success Animation Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: '#EBEDEE' }}>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              {/* Animated circle background */}
              <div 
                className="absolute inset-0 bg-black rounded-full transition-all duration-500 ease-out"
                style={{
                  transform: showSuccess ? 'scale(1)' : 'scale(0)',
                  animation: showSuccess ? 'pulse-once 0.6s ease-out' : 'none'
                }}
              ></div>
              
              {/* Checkmark */}
              <svg 
                width="80" 
                height="80" 
                viewBox="0 0 24 24" 
                fill="none" 
                className="relative z-10"
                style={{
                  animation: showSuccess ? 'checkmark-draw 0.8s ease-out 0.3s both' : 'none'
                }}
              >
                <path 
                  d="M9 12l2 2 4-4" 
                  stroke="white" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: '12',
                    strokeDashoffset: showSuccess ? '0' : '12',
                    transition: 'stroke-dashoffset 0.8s ease-out 0.3s'
                  }}
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">Calibrating Your Dashboard...</h2>
            <p className="text-gray-600">Setting up your personalized experience</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-6 pt-20 pb-32 space-y-4 max-w-2xl mx-auto">
        {/* Title - Left Aligned */}
        <div className="mb-6">
          <h1 
            className="text-2xl text-black mb-2"
            style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, letterSpacing: '0.02em' }}
          >
            WELCOME
          </h1>
          <p className="text-gray-600 text-sm">
            Enter your stats to get started.
          </p>
        </div>

        {/* Grade System Selector */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-black tracking-wide">
            GRADING SYSTEM
          </h3>
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => {
                setGradeSystem('v-scale');
                setFlashGrade(null); // Reset grade when switching systems
              }}
              className={`flex-1 py-2.5 px-3 rounded-md text-sm font-bold transition-colors ${
                gradeSystem === 'v-scale'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              V-Scale
            </button>
            <button
              onClick={() => {
                setGradeSystem('font');
                setFlashGrade(null); // Reset grade when switching systems
              }}
              className={`flex-1 py-2.5 px-3 rounded-md text-sm font-bold transition-colors ${
                gradeSystem === 'font'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Font
            </button>
          </div>
        </div>

        {/* Flash Grade Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-black tracking-wide">
            CURRENT FLASH GRADE
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {grades.map(grade => (
              <GradeButton
                key={grade}
                grade={grade}
                selected={flashGrade === grade}
                onClick={() => setFlashGrade(grade)}
              />
            ))}
          </div>
        </div>

        {/* Volume Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-black tracking-wide">
            CLIMBS PER SESSION
          </h3>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={typicalVolume}
                  onChange={(e) => setTypicalVolume(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-black slider-black"
                  style={{
                    background: `linear-gradient(to right, black 0%, black ${((typicalVolume - 1) / 49) * 100}%, #e5e7eb ${((typicalVolume - 1) / 49) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
              <span className="text-2xl font-black text-black min-w-[50px] text-right">{typicalVolume}</span>
            </div>
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-gray-500 text-[11px] text-center px-4 pt-2">
          This helps us provide personalized training recommendations from day one
        </p>

        {/* Error */}
        {error && (
          <div className="text-red-600 text-sm text-center mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Large Submit Button - Fixed at bottom (tracker style) */}
      <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center z-50" style={{ background: 'linear-gradient(to top, #EBEDEE 60%, #EBEDEE, transparent)' }}>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-64 h-16 rounded-full font-bold text-lg transition-all duration-300 transform ${
            canSubmit
              ? 'bg-black text-white shadow-2xl shadow-black/30 hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          style={{
            boxShadow: canSubmit 
              ? '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)' 
              : '0 8px 16px rgba(0, 0, 0, 0.05)'
          }}
        >
          {isSubmitting ? "✓ CALIBRATING" : "GET STARTED"}
        </button>
      </div>

      {/* Spacer for bottom button */}
      <div className="h-32"></div>
    </div>
  );
};

// Generate 2-3 synthetic sessions to seed baseline data
const generateSyntheticSessions = async (userId, flashGrade, typicalVolume) => {
  const gradeNum = parseInt(flashGrade.replace('V', ''));
  const now = new Date();
  
  // Create 3 sessions spread over the past 7-10 days
  const sessionDates = [
    new Date(now.getTime() - (9 * 24 * 60 * 60 * 1000)), // 9 days ago
    new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000)), // 5 days ago
    new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)), // 2 days ago
  ];

  for (const sessionDate of sessionDates) {
    try {
      // Create session
      const sessionTimestamp = sessionDate.toISOString();
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          user_id: userId,
          session_date: sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          start_time: sessionTimestamp,
          end_time: new Date(sessionDate.getTime() + (90 * 60 * 1000)).toISOString(), // 90 min session
          duration_minutes: 90,
          is_synthetic: true,
          climbs_count: 0, // Will be updated by trigger
          session_load: 0
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Generate climbs for this session
      const climbs = [];
      const volumeVariation = Math.floor(typicalVolume * 0.8); // 80% of typical volume
      const climbCount = volumeVariation + Math.floor(Math.random() * (typicalVolume - volumeVariation));

      for (let i = 0; i < climbCount; i++) {
        // Grade distribution: mostly around flash grade ±2
        const gradeOffset = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const climbGrade = Math.max(0, Math.min(15, gradeNum + gradeOffset));
        
        // Varied climb characteristics
        const wallAngles = ['SLAB', 'VERTICAL', 'OVERHANG'];
        const styles = ['SIMPLE', 'POWERFUL', 'TECHNICAL'];
        
        // RPE based on grade relative to flash grade
        const gradeRelativeToFlash = climbGrade - gradeNum;
        let rpe;
        if (gradeRelativeToFlash <= -2) rpe = 3 + Math.floor(Math.random() * 2); // Easy: 3-4
        else if (gradeRelativeToFlash <= 0) rpe = 5 + Math.floor(Math.random() * 2); // Flash: 5-6
        else if (gradeRelativeToFlash === 1) rpe = 7 + Math.floor(Math.random() * 2); // Hard: 7-8
        else rpe = 9 + Math.floor(Math.random() * 2); // Project: 9-10

        // Attempts based on grade difficulty
        let attempts;
        if (gradeRelativeToFlash <= -1) attempts = 1; // Flash easy ones
        else if (gradeRelativeToFlash === 0) attempts = Math.random() < 0.7 ? 1 : 2; // Flash most at-grade
        else if (gradeRelativeToFlash === 1) attempts = 2 + Math.floor(Math.random() * 3); // 2-4 attempts
        else attempts = 3 + Math.floor(Math.random() * 5); // 3-7 attempts for harder

        climbs.push({
          session_id: session.id,
          user_id: userId,
          grade: `V${climbGrade}`,
          wall_angle: wallAngles[Math.floor(Math.random() * wallAngles.length)],
          style: styles[Math.floor(Math.random() * styles.length)],
          rpe: Math.min(10, rpe),
          attempts: Math.min(50, attempts),
          climb_type: 'BOULDER',
          timestamp: new Date(sessionDate.getTime() + (i * 3 * 60 * 1000)).toISOString() // Space climbs 3 min apart
        });
      }

      // Insert all climbs for this session
      const { error: climbsError } = await supabase
        .from('climbs')
        .insert(climbs);

      if (climbsError) throw climbsError;

    } catch (err) {
      console.error('Error generating synthetic session:', err);
      // Continue with other sessions even if one fails
    }
  }
};

export default QuickSetup;

