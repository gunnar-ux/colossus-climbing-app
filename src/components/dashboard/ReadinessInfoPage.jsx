import { readinessTextColor, readinessGradient } from '../../utils/index.js';
import ReadinessChart from '../ui/ReadinessChart.jsx';

const ReadinessInfoPage = ({ 
  score = 77,
  crsData = null,
  sessions = [],
  onBack 
}) => {
  // Get zone-based guidance (Whoop-style: neutral, factual)
  const getZoneInfo = (s) => {
    if (s >= 77) {
      return {
        zone: 'GREEN ZONE',
        color: 'text-green',
        meaning: 'Body is recovered and ready for high-intensity training.',
        guidance: [
          'Can handle high RPE (8-9) climbing',
          'Good day for projects and limit boulders',
          'Focus on strength and power development'
        ]
      };
    } else if (s >= 45) {
      return {
        zone: 'BLUE ZONE',
        color: 'text-blue',
        meaning: 'Body is partially recovered. Moderate training recommended.',
        guidance: [
          'Keep RPE moderate (6-7)',
          'Focus on volume over intensity',
          'Technical training and endurance work'
        ]
      };
    } else {
      return {
        zone: 'RED ZONE',
        color: 'text-red',
        meaning: 'Elevated fatigue detected. Body needs recovery.',
        guidance: [
          'Low intensity only (RPE ≤5)',
          'Consider a rest day or active recovery',
          'If sustained 3+ days, take full rest'
        ]
      };
    }
  };

  const zoneInfo = getZoneInfo(score);

  return (
    <div className="w-full h-screen overflow-y-auto hide-scrollbar relative bg-bg">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-5"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1.25rem)' }}
      >
        <div className="w-10"></div>
        <h1 className="text-sm font-bold text-white tracking-wider flex-1 text-center" style={{ fontFamily: 'Oswald, sans-serif' }}>
          READINESS
        </h1>
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors w-10 flex justify-center"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      {/* Main content */}
      <div className="px-5 pb-20">
        
        {/* Top 1/3: Chart */}
        <div className="mb-8">
          <div className="text-xs text-graytxt mb-3 uppercase tracking-wider">7-Day Trend</div>
          <div className="-mx-2">
            <ReadinessChart sessions={sessions} currentScore={score} />
          </div>
        </div>

        {/* Combined Score & Guidance Card */}
        <div className="border border-border/30 rounded-lg p-6 mb-6">
          {/* Score display */}
          <div className="flex flex-col items-center mb-4">
            <div className={`text-5xl font-bold leading-none ${readinessTextColor(score)} mb-2`}>
              {score}%
            </div>
            <div className={`text-xs font-bold uppercase tracking-wide ${zoneInfo.color} mb-4`}>
              {zoneInfo.zone}
            </div>
            
            {/* Progress bar */}
            <div className="w-full max-w-xs">
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div 
                  className={`bg-gradient-to-r ${readinessGradient(score)} h-full transition-all duration-1000`} 
                  style={{width: `${score}%`}}
                ></div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/30 my-4"></div>

          {/* Guidance */}
          <div className="text-graytxt text-sm leading-relaxed mb-3">
            {zoneInfo.meaning}
          </div>
          <div className="space-y-2">
            {zoneInfo.guidance.map((item, index) => (
              <div key={index} className="text-graytxt text-sm flex items-start">
                <span className="text-white mr-2">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How it's calculated (vague) */}
        <div className="border border-border/30 rounded-lg p-5">
          <div className="text-white font-bold mb-3 text-sm">How readiness works</div>
          <div className="text-graytxt text-sm leading-relaxed">
            Your readiness score is calculated from recovery time since your last session, 
            recent training intensity patterns, and overall training consistency. 
            Higher scores indicate your body is prepared for high-intensity work.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadinessInfoPage;
