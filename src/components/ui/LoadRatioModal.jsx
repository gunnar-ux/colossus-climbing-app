import { loadColor } from '../../utils/index.js';

const LoadRatioModal = ({ 
  isOpen = false,
  loadRatio = 1.0, 
  onClose 
}) => {
  if (!isOpen) return null;

  // Get status and message (Whoop-style: neutral, factual)
  const getLoadInfo = (ratio) => {
    if (ratio < 0.8) {
      return {
        status: 'LOW LOAD',
        color: 'text-cyan-400',
        message: 'Your recent training volume is below your typical pattern. You can safely increase training volume or intensity if desired.'
      };
    } else if (ratio <= 1.3) {
      return {
        status: 'OPTIMAL LOAD',
        color: 'text-cyan-400',
        message: 'Your recent training volume is well-balanced with your typical pattern. This is the sweet spot for consistent progress.'
      };
    } else if (ratio <= 1.5) {
      return {
        status: 'ELEVATED LOAD',
        color: 'text-yellow',
        message: 'Your recent training volume is elevated compared to your baseline. Monitor recovery and consider reducing volume if this persists.'
      };
    } else {
      return {
        status: 'HIGH LOAD',
        color: 'text-red',
        message: 'Your recent training volume is significantly elevated. High risk of overtraining if sustained. Consider reducing volume or taking rest days.'
      };
    }
  };

  const loadInfo = getLoadInfo(loadRatio);

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
        <div className="text-xs text-graytxt mb-3 uppercase tracking-wider">Load Ratio</div>

        {/* Big number */}
        <div className={`text-3xl font-extrabold leading-none ${loadColor(loadRatio)} mb-2`}>
          {loadRatio.toFixed(1)}x
        </div>

        {/* Status */}
        <div className={`text-sm font-bold uppercase tracking-wide mb-6 ${loadInfo.color}`}>
          {loadInfo.status}
        </div>

        {/* Explanation */}
        <div className="text-graytxt text-[14px] leading-relaxed mb-6">
          {loadInfo.message}
        </div>

        {/* What it measures */}
        <div className="border-t border-border/30 pt-4">
          <div className="text-white font-bold mb-2 text-xs uppercase tracking-wider">What this measures</div>
          <div className="text-graytxt text-[14px] leading-relaxed">
            Compares your recent 7-day training load to your 28-day baseline. 
            Values between 0.8-1.3x indicate balanced training progression.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadRatioModal;

