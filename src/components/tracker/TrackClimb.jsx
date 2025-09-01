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
import BottomNavigation from '../ui/BottomNavigation.jsx';
import Header from '../ui/Header.jsx';
import '../../styles/tracker-animations.css';

const TrackClimb = ({ onBack, onClimbLogged, onNavigateToDashboard, onNavigateToSessions, onNavigateToProgress, onNavigateToAccount, onLogout }) => {
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
    <div className="w-full h-screen overflow-y-auto hide-scrollbar relative" style={{ backgroundColor: '#EBEDEE' }}>
      {/* Success Animation Overlay */}
      {saving && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: '#EBEDEE' }}>
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

      <Header 
        title="TRACK YOUR CLIMB"
        lightMode={true}
        showCloseButton={true}
        onCloseClick={() => onNavigateToDashboard?.()}
      />

      {/* Content */}
      <div className="flex-1 px-6 space-y-3 pb-20 overflow-y-auto">
        
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

        {/* Effort */}
        <Section title="EFFORT">
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

      {/* Irresistible CTA button at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center" style={{ background: 'linear-gradient(to top, #EBEDEE, #EBEDEE, transparent)' }}>
        <button
          onClick={handleLog}
          disabled={!canLog || saving}
          className="w-48 h-16 rounded-full font-bold text-lg transition-all duration-300 transform bg-black text-white shadow-2xl shadow-black/30 hover:shadow-3xl hover:scale-[1.02] active:scale-[0.98]"
          style={{
            boxShadow: canLog && !saving 
              ? '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)' 
              : '0 8px 16px rgba(0, 0, 0, 0.1)'
          }}
        >
          {saving ? "✓ SAVED" : "TRACK"}
        </button>
      </div>
      
      {/* Add padding to prevent content from being hidden behind the button */}
      <div className="h-24"></div>
     </div>
   );
};

export default TrackClimb;
