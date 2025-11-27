import { readinessTextColor } from '../../utils/index.js';

const ReadinessModal = ({ 
  isOpen = false,
  score = 77, 
  onClose 
}) => {
  if (!isOpen) return null;

  // Get zone and guidance (neutral, factual)
  const getZoneInfo = (s) => {
    if (s >= 77) {
      return {
        zone: 'Optimal Readiness',
        message: 'Body is recovered and ready for high-intensity training. Can handle high RPE (8-9) climbing and limit boulders.'
      };
    } else if (s >= 45) {
      return {
        zone: 'Balanced Training Recommended',
        message: 'Body is partially recovered. Moderate training recommended. Keep RPE moderate (6-7) and focus on volume over intensity.'
      };
    } else {
      return {
        zone: 'Rest Recommended',
        message: 'Elevated fatigue detected. Body needs recovery. Low intensity only (RPE ≤5) or consider a rest day.'
      };
    }
  };

  const zoneInfo = getZoneInfo(score);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      onClick={onClose}
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div 
        className="bg-[#141414] border border-border rounded-2xl p-6 max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        {/* Title */}
        <div className="text-xs text-graytxt mb-3 uppercase tracking-wider">Readiness</div>

        {/* Big score */}
        <div className={`text-3xl font-extrabold leading-none ${readinessTextColor(score)} mb-2`}>
          {score}%
        </div>

        {/* Zone label */}
        <div className="text-sm font-bold uppercase tracking-wide mb-6 text-white">
          {zoneInfo.zone}
        </div>

        {/* Explanation */}
        <div className="text-graytxt text-[14px] leading-relaxed mb-6">
          {zoneInfo.message}
        </div>

        {/* What it measures */}
        <div className="border-t border-border/30 pt-4">
          <div className="text-white font-bold mb-2 text-xs uppercase tracking-wider">What this measures</div>
          <div className="text-graytxt text-[14px] leading-relaxed">
            Your daily readiness calculated from recovery time since last session, 
            recent training intensity patterns, and overall consistency.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadinessModal;

