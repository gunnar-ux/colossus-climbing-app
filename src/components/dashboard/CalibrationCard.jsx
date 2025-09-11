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
      {/* Single row: Title, Percent, Chevron */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-white">Dashboard calibrating...</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-green font-medium">{Math.round(overallProgress)}%</span>
          <ChevronDownIcon 
            className={`w-4 h-4 transition-transform duration-200 text-graytxt ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Expandable section - Simple progress tracking */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border/30">
          <div className="text-sm text-graytxt mb-3 text-center">More tracking = more reliable metrics</div>
          
          <div className="space-y-3">
            {requirements.map(req => (
              <div key={req.metric} className="flex items-center justify-between">
                <span className="text-white text-sm">{req.metric}</span>
                <div className="flex items-center gap-2">
                  <span className="text-graytxt text-sm">{req.current}/{req.needed}</span>
                  <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green transition-all duration-300" 
                      style={{width: `${Math.min((req.current / req.needed) * 100, 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
    </section>
  );
};

export default CalibrationCard;
