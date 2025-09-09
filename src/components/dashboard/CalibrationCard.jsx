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
      <div className="mx-5 mt-3 p-4 bg-green/10 border border-green/30 rounded-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base font-medium text-green">✓ Fully Calibrated</span>
            <span className="text-sm text-green">All metrics active</span>
          </div>
          <button 
            onClick={onDismissCalibration}
            className="w-6 h-6 rounded-full bg-green/20 hover:bg-green/30 text-green flex items-center justify-center text-base transition"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="px-5 pt-4">
      <div className="bg-card border border-border rounded-col p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-base">Dashboard Calibration</h3>
        <span className="text-sm text-white font-medium">{Math.round(overallProgress)}%</span>
      </div>
      
      {/* Progress bar - custom green version */}
      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
        <div className="h-full bg-green" style={{width: `${Math.min(overallProgress, 100)}%`}}></div>
      </div>
      
      {/* Basic requirements (always visible) */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        {requirements.map(req => (
          <div key={req.metric} className="text-sm">
            <span className="text-white">{req.metric}: </span>
            <span className="text-blue">
              {req.current}/{req.needed}
            </span>
            <span className="text-blue"> {req.unit}</span>
          </div>
        ))}
      </div>

      {/* Bottom-right dropdown toggle */}
      <div className="mt-2 flex items-center justify-between">
        <div className="text-sm text-graytxt">
          {overallProgress >= 100 ? 'All systems calibrated' : 
           overallProgress >= 50 ? 'Calibration in progress' : 
           'Building baseline data'}
        </div>
        <ChevronDownIcon 
          className={`w-4 h-4 transition-transform duration-200 text-graytxt ${isExpanded ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Expandable section with advanced metrics */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
          <div className="space-y-3">
            <div>
              <div className="text-sm mb-1">
                <span className="text-white">Readiness: </span>
                <span className={sessions >= 3 ? 'text-green' : 'text-blue'}>
                  {sessions >= 3 ? 'Available' : `${3 - sessions} more sessions needed`}
                </span>
              </div>
            </div>
            
            <div>
              <div className="text-sm mb-1">
                <span className="text-white">Load Ratio: </span>
                <span className={sessions >= 5 ? 'text-green' : 'text-blue'}>
                  {sessions >= 5 ? 'Available' : `${5 - sessions} more sessions needed`}
                </span>
              </div>
            </div>
            
            <div className="border border-border/50 rounded-lg p-3">
              <div className="text-sm text-white font-semibold mb-3 text-center">Calibration Phases</div>
              <div className="space-y-3 text-sm">
                <div className="text-center">
                  <span className="px-2 py-1 text-sm rounded-full bg-blue/20 text-blue border border-blue/30">NEED DATA</span>
                  <div className="text-graytxt mt-1">0-2 sessions: Basic tracking only</div>
                </div>
                <div className="text-center">
                  <span className="px-2 py-1 text-sm rounded-full bg-orange/20 text-orange border border-orange/30">CALIBRATING</span>
                  <div className="text-graytxt mt-1">3-4 sessions: Readiness available</div>
                </div>
                <div className="text-center">
                  <span className="px-2 py-1 text-sm rounded-full bg-green/20 text-green border border-green/30">CALIBRATED</span>
                  <div className="text-graytxt mt-1">5+ sessions: All metrics active</div>
                </div>
              </div>
              <p className="text-sm text-graytxt leading-relaxed mt-3 pt-3 border-t border-border/30">
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
