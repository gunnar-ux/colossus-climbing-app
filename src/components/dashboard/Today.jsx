import { readinessTextColor, readinessGradient, loadColor } from '../../utils/index.js';

// Today component extracted from dashboard HTML
// Preserves exact readiness indicators and load management logic

const Today = ({ score = 73, loadRatio = 1.2, sessions = 0, crsData, loadRatioData }) => {
  // Determine display state based on CRS data availability
  const isCalibrating = sessions < 5;
  const hasNoData = sessions < 3;
  
  // Use real data if available, fallback to props
  const currentScore = crsData ? crsData.score : score;
  const currentLoadRatio = loadRatioData ? loadRatioData.ratio : loadRatio;
  const crsStatus = crsData ? crsData.status : 'demo';
  const crsMessage = crsData ? crsData.message : null;

  const getCRSAdvice = (s) => {
    if (s >= 67) return { msg: 'Optimal. Peak performance ready.' };
    if (s >= 34) return { msg: 'Moderate. Balanced training recommended.' };
    return { msg: 'Limited. Focus on technique and recovery.' };
  };

  return (
    <section className="px-5 pt-4">
      <div className="bg-card border border-border rounded-col p-4 hover:border-white/10 transition">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-base">Climb Readiness</h3>
          {hasNoData ? (
            <span className="px-2 py-1 text-xs rounded-full bg-gray-600/40 text-gray-400">
              NEED DATA
            </span>
          ) : sessions >= 5 && loadRatioData ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-white/15 text-xs text-white/90">
              <span className="text-graytxt">Load</span>
              <span className={`font-semibold ${loadColor(currentLoadRatio)}`}>{currentLoadRatio.toFixed(1)}x</span>
              <span className="text-graytxt">baseline</span>
            </span>
          ) : (
            <span className={`px-2 py-1 text-xs rounded-full ${
              crsStatus === 'building' ? 'bg-blue/20 text-blue' : 
              crsStatus === 'calibrating' ? 'bg-orange/20 text-orange' : 
              'bg-green/20 text-green'
            }`}>
              {crsStatus === 'building' ? 'BUILDING' : 
               crsStatus === 'calibrating' ? 'CALIBRATING' : 
               'CALIBRATED'}
            </span>
          )}
        </div>

        {hasNoData ? (
          <>
            <div className="mt-1 flex items-center gap-3">
              <div className="text-5xl font-extrabold leading-none text-gray-600 min-w-[64px]">--</div>
              <div className="flex-1 h-3 bg-border rounded-full overflow-hidden">
                <div className={`h-full bg-white/30`} style={{width: `0%`}}></div>
              </div>
            </div>
            <div className="mt-2 text-sm text-blue text-center">Track 3 sessions to enable CRS.</div>
          </>
        ) : (
          <>
            <div className="mt-1 flex items-center gap-3">
              <div className={`text-5xl font-extrabold leading-none ${readinessTextColor(currentScore)} min-w-[64px]`}>{currentScore}</div>
              <div className="flex-1 h-3 bg-border rounded-full overflow-hidden">
                <div className={`bg-gradient-to-r ${readinessGradient(currentScore)} h-full`} style={{width: `${currentScore}%`}}></div>
              </div>
            </div>
            <div className="mt-2 text-sm text-graytxt text-center">
              {crsMessage || getCRSAdvice(currentScore).msg}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Today;

