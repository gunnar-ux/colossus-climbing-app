// RecommendedTraining component extracted from dashboard HTML
// Preserves exact dark theme styling and navigation behavior

const RecommendedTraining = ({ onStartTraining, recommendation, sessions = 0 }) => {
  const handleStartClick = () => {
    onStartTraining?.();
  };

  // Determine display state based on session count (like Today component)
  const isCalibrating = sessions < 5;
  const hasNoData = sessions < 3;

  // Use dynamic recommendation or fallback
  const rec = recommendation || {
    type: 'Track Climbs',
    volume: 'Start with 10-15',
    rpe: '6-7',
    focus: 'Begin building your climbing profile'
  };

  return (
    <section className="px-5 pt-4">
      <div className="bg-card border border-border rounded-col p-4 hover:border-white/10 transition">
        <div className="flex items-center justify-between mb-1">
          <div className="font-bold text-base">Daily Training</div>
          {hasNoData ? (
            <span className="px-2 py-1 text-sm rounded-full bg-gradient-to-r from-blue/20 to-cyan/20 text-blue border border-blue/20">
              NEED DATA
            </span>
          ) : isCalibrating ? (
            <span className="px-2 py-1 text-sm rounded-full bg-orange/20 text-orange">
              CALIBRATING
            </span>
          ) : null}
        </div>
        
        {hasNoData || isCalibrating ? (
          <div className="text-sm mb-3">
            <span className="text-white">Volume:</span> <span className="text-graytxt">{rec.volume}</span> • <span className="text-white">Max RPE:</span> <span className="text-graytxt">{rec.rpe}</span>
          </div>
        ) : (
          <>
            <div className="text-sm">
              <span className="text-graytxt">{rec.type}</span> • <span className="text-white">Volume:</span> <span className="text-graytxt">{rec.volume}</span> • <span className="text-white">RPE:</span> <span className="text-graytxt">{rec.rpe}</span>
            </div>
            {rec.note && (
              <div className="text-sm text-orange mt-1">⚠️ {rec.note}</div>
            )}
            {rec.focus && (
              <div className="text-sm text-graytxt mt-1 mb-3">{rec.focus}</div>
            )}
          </>
        )}
        
        <button 
          onClick={handleStartClick} 
          className="w-full px-4 py-2 bg-white text-black rounded-lg font-semibold hover:opacity-90 active:scale-95 transition min-h-[44px]"
        >
          Track
        </button>
      </div>
    </section>
  );
};

export default RecommendedTraining;
