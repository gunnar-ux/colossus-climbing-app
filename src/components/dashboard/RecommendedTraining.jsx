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
          <div className="font-semibold">Recommended Training</div>
          {hasNoData ? (
            <span className="px-2 py-1 text-xs rounded-full bg-gray-600/40 text-gray-400">
              NEED DATA
            </span>
          ) : isCalibrating ? (
            <span className="px-2 py-1 text-xs rounded-full bg-orange/20 text-orange">
              CALIBRATING
            </span>
          ) : null}
        </div>
        
        {hasNoData || isCalibrating ? (
          <div className="text-sm text-graytxt mb-3">
            Volume: {rec.volume} • Max RPE: {rec.rpe}
          </div>
        ) : (
          <>
            <div className="text-sm text-graytxt">
              {rec.type} • Volume: {rec.volume} • RPE: {rec.rpe}
            </div>
            {rec.note && (
              <div className="text-xs text-orange mt-1">⚠️ {rec.note}</div>
            )}
            {rec.focus && (
              <div className="text-xs text-graytxt mt-1 mb-3">{rec.focus}</div>
            )}
          </>
        )}
        
        <button 
          onClick={handleStartClick} 
          className="w-full px-4 py-2 bg-white text-black rounded-lg font-semibold hover:opacity-90 active:scale-95 transition min-h-[44px]"
        >
          Start
        </button>
      </div>
    </section>
  );
};

export default RecommendedTraining;
