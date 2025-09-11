import { useState } from 'react';
import { ChevronDownIcon } from '../ui/Icons.jsx';
import Progress from '../ui/Progress.jsx';

// CalibrationCard component extracted from dashboard HTML
// Expandable card with proper mobile font sizes (14px minimum)

const CalibrationCard = ({ sessions, climbs, onDismissCalibration }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const requirements = [
    { metric: 'Sessions', current: sessions, needed: 5, unit: 'tracked' },
    { metric: 'Climbs', current: climbs, needed: 50, unit: 'logged' }
  ];
  const overallProgress = Math.min((sessions / 5) * 100, (climbs / 50) * 100);

  if (sessions >= 5 && climbs >= 50) {
    return (
      <div className="mx-5 mt-3 p-3 bg-green/5 border border-green/20 border-l-2 border-l-green/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base font-medium text-green/90">✓ Fully Calibrated</span>
            <span className="text-sm text-green/80">All metrics active</span>
          </div>
          <button 
            onClick={onDismissCalibration}
            className="w-6 h-6 rounded-full bg-green/15 hover:bg-green/25 text-green/80 flex items-center justify-center text-base transition"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="px-5 pt-3">
      <div className="bg-border/15 border border-border/30 border-l-2 border-l-green/40 p-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm text-white">Dashboard calibrating...</h3>
        <span className="text-sm text-green font-medium">{Math.round(overallProgress)}%</span>
      </div>
      
      {/* Basic requirements with dropdown arrow */}
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 gap-3 flex-1">
          {requirements.map(req => (
            <div key={req.metric} className="text-sm">
              <span className="text-graytxt">{req.metric}: </span>
              <span className="text-graytxt">
                {req.current}/{req.needed}
              </span>
              <span className="text-graytxt"> {req.unit}</span>
            </div>
          ))}
        </div>
        <ChevronDownIcon 
          className={`w-4 h-4 transition-transform duration-200 text-graytxt ml-3 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Expandable section with advanced metrics */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border/30 space-y-4">
          <div className="space-y-3">
            <div>
              <div className="text-sm mb-1">
                <span className="text-white/70">Readiness: </span>
                <span className={sessions >= 3 ? 'text-green/80' : 'text-blue/80'}>
                  {sessions >= 3 ? 'Available' : `${3 - sessions} more sessions needed`}
                </span>
              </div>
            </div>
            
            <div>
              <div className="text-sm mb-1">
                <span className="text-white/70">Load Ratio: </span>
                <span className={sessions >= 5 ? 'text-green/80' : 'text-blue/80'}>
                  {sessions >= 5 ? 'Available' : `${5 - sessions} more sessions needed`}
                </span>
              </div>
            </div>
            
            <div className="border border-border/30 rounded-lg p-3">
              <div className="text-sm text-white/80 font-semibold mb-3 text-center">Calibration Phases</div>
              <div className="space-y-3 text-sm">
                <div className="text-center">
                  <span className="px-2 py-1 text-sm rounded-full bg-border text-graytxt">NEED DATA</span>
                  <div className="text-graytxt/80 mt-1">0-2 sessions: Basic tracking only</div>
                </div>
                <div className="text-center">
                  <span className="px-2 py-1 text-sm rounded-full bg-orange/15 text-orange/80 border border-orange/20">CALIBRATING</span>
                  <div className="text-graytxt/80 mt-1">3-4 sessions: Readiness available</div>
                </div>
                <div className="text-center">
                  <span className="px-2 py-1 text-sm rounded-full bg-green/15 text-green/80 border border-green/20">CALIBRATED</span>
                  <div className="text-graytxt/80 mt-1">5+ sessions: All metrics active</div>
                </div>
              </div>
              <p className="text-sm text-graytxt/80 leading-relaxed mt-3 pt-3 border-t border-border/20">
                More data = more accurate insights. Keep tracking to unlock the full POGO experience.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
    </section>
  );
};

export default CalibrationCard;
