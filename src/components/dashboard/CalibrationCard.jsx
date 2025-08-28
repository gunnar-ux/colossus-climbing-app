import { useState } from 'react';
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
    <div className="mx-5 mt-3 bg-card border border-border rounded-col px-5 pt-5 pb-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-base">Dashboard Calibration</h3>
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
            
            <div>
              <div className="text-sm mb-1">
                <span className="text-white">Calibration Process: </span>
              </div>
              <p className="text-sm text-graytxt leading-relaxed">
                Track sessions to establish your baseline performance patterns for accurate readiness and load calculations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expand/Collapse arrow at bottom center */}
      <div className="flex justify-center mt-2">
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={`transition-transform duration-200 text-graytxt ${isExpanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </div>
    </div>
  );
};

export default CalibrationCard;
