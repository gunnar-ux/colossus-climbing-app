import { useState, useMemo } from 'react';
import { GRADES, WALLS, STYLES, RPES } from '../../constants/climbing.js';
import { 
  Section, 
  ButtonGrid, 
  GradeButton, 
  WallButton, 
  RPEButton, 
  StyleButton, 
  AttemptButton 
} from './TrackerButtons.jsx';
import '../../styles/tracker-animations.css';

const TrackClimb = ({ onBack, onClimbLogged }) => {
  // State
  const [type, setType] = useState("BOULDER");
  const [grade, setGrade] = useState(null);
  const [wall, setWall] = useState(null);
  const [styles, setStyles] = useState(new Set());
  const [rpe, setRpe] = useState(null);
  const [attempts, setAttempts] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const canLog = useMemo(() => !!type && !!grade && !!wall && styles.size > 0 && !!rpe && !!attempts, [type, grade, wall, styles, rpe, attempts]);

  // Helpers
  const toggleStyle = (s) => {
    const next = new Set(styles);
    next.has(s) ? next.delete(s) : next.add(s);
    setStyles(next);
  };

  const handleLog = async () => {
    if (!canLog || saving) return;
    setSaving(true);
    const payload = { 
      type, grade, wall, 
      styles: Array.from(styles), 
      rpe, attempts, 
      ts: Date.now() 
    };
    
    try {
      console.log('Logged climb:', payload);
      await new Promise((r) => setTimeout(r, 2000));
      
      // Call the onClimbLogged callback if provided
      if (onClimbLogged) {
        onClimbLogged(payload);
      }
      
      // Navigate back to dashboard after success animation
      onBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col relative safe-area-top max-w-[430px] mx-auto">
      {/* Success Animation Overlay */}
      {saving && (
        <div className="fixed inset-0 bg-white z-[60] flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              {/* Animated circle background */}
              <div 
                className="absolute inset-0 bg-black rounded-full transition-all duration-500 ease-out"
                style={{
                  transform: saving ? 'scale(1)' : 'scale(0)',
                  animation: saving ? 'pulse-once 0.6s ease-out' : 'none'
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
                  animation: saving ? 'checkmark-draw 0.8s ease-out 0.3s both' : 'none'
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
                    strokeDashoffset: saving ? '0' : '12',
                    transition: 'stroke-dashoffset 0.8s ease-out 0.3s'
                  }}
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">Climb Logged</h2>
            <p className="text-gray-600">Well Done. Keep Working Hard.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-6 pt-6 pb-3">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 text-gray-500 hover:text-black transition" 
            aria-label="Back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-black">Track Your Climb</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-6 space-y-3 pb-20 overflow-hidden">
        
        {/* Type */}
        <Section title="TYPE">
          <ButtonGrid cols={2}>
            {["BOULDER", "BOARD"].map((t) => (
              <GradeButton 
                key={t} 
                label={t} 
                selected={type === t} 
                onClick={() => setType(type === t ? null : t)} 
              />
            ))}
          </ButtonGrid>
        </Section>
        
        {/* Grade */}
        <Section title="GRADE">
          <ButtonGrid cols={5}>
            {GRADES.map((g) => (
              <GradeButton 
                key={g} 
                label={g} 
                selected={grade === g} 
                onClick={() => setGrade(grade === g ? null : g)} 
              />
            ))}
          </ButtonGrid>
        </Section>

        {/* Wall Angle */}
        <Section title="WALL ANGLE">
          <ButtonGrid cols={3}>
            {WALLS.map((w) => (
              <WallButton 
                key={w} 
                selected={wall === w} 
                label={w} 
                onClick={() => setWall(w)} 
              />
            ))}
          </ButtonGrid>
        </Section>

        {/* RPE */}
        <Section title="RPE">
          <ButtonGrid cols={5}>
            {RPES.map((n) => (
              <RPEButton 
                key={n} 
                label={String(n)} 
                selected={rpe === n} 
                onClick={() => setRpe(n)} 
              />
            ))}
          </ButtonGrid>
        </Section>

        {/* Style */}
        <Section title="STYLE">
          <ButtonGrid cols={3}>
            {STYLES.map((s) => (
              <StyleButton 
                key={s} 
                selected={styles.has(s)} 
                label={s} 
                onClick={() => toggleStyle(s)} 
              />
            ))}
          </ButtonGrid>
        </Section>

        {/* Attempts */}
        <Section title="ATTEMPTS">
          <ButtonGrid cols={5}>
            {[1, 2, 3, 4, 5].map((n) => (
              <AttemptButton 
                key={n} 
                label={String(n)} 
                selected={attempts === n} 
                onClick={() => setAttempts(attempts === n ? null : n)} 
              />
            ))}
          </ButtonGrid>
        </Section>

      </div>

      {/* Fixed CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-4 pt-3 bg-white border-t border-gray-200 z-50 safe-area-bottom max-w-[430px] mx-auto">
        <button
          onClick={handleLog}
          disabled={!canLog || saving}
          className={`w-full h-12 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-0 ${
            canLog && !saving
              ? 'bg-black text-white hover:bg-gray-800 focus:bg-black' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {saving ? "✓ SAVED" : "TRACK"}
        </button>
      </div>
     </div>
   );
};

export default TrackClimb;
