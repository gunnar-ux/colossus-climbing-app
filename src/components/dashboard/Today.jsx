import { useState } from 'react';
import { readinessTextColor, readinessGradient, loadColor } from '../../utils/index.js';

// Today component extracted from dashboard HTML
// Expandable CRS card with tour information and proper mobile font sizes

const Today = ({ score = 73, loadRatio = 1.2, sessions = 0, crsData, loadRatioData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // Determine display state based on CRS data availability
  const isCalibrating = sessions < 5;
  const hasNoData = sessions < 3;
  
  // Use real data if available, fallback to props
  const currentScore = crsData ? crsData.score : score;
  const currentLoadRatio = loadRatioData ? loadRatioData.ratio : loadRatio;
  const crsStatus = crsData ? crsData.status : 'demo';
  const crsMessage = crsData ? crsData.message : null;

  const getCRSAdvice = (s) => {
    if (s >= 77) return { msg: 'Optimal. Peak performance ready.' };
    if (s >= 45) return { msg: 'Moderate. Balanced training recommended.' };
    return { msg: 'Limited. Focus on technique and recovery.' };
  };

  return (
    <section className="px-5 pt-4">
      <div className="bg-card border border-border rounded-col px-4 pt-4 pb-3 hover:border-white/10 transition cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-base">Climb Readiness</h3>
          {hasNoData ? (
            <span className="px-2 py-1 text-sm rounded-full bg-gradient-to-r from-blue/20 to-cyan/20 text-blue border border-blue/20">
              NEED DATA
            </span>
          ) : sessions >= 5 && loadRatioData ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-white/15 text-sm text-white/90">
              <span className="text-graytxt">Load</span>
              <span className={`font-semibold ${loadColor(currentLoadRatio)}`}>{currentLoadRatio.toFixed(1)}x</span>
              <span className="text-graytxt">baseline</span>
            </span>
          ) : (
            <span className={`px-2 py-1 text-sm rounded-full ${
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
              <div className="text-5xl font-extrabold leading-none text-graytxt min-w-[64px]">--</div>
              <div className="flex-1 h-3 bg-border rounded-full overflow-hidden">
                <div className={`h-full bg-white/30`} style={{width: `0%`}}></div>
              </div>
            </div>

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

        {/* Expandable section with CRS & Load information */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
            
            {/* Readiness Score Section */}
            <div className="border border-border/50 rounded-lg p-3">
              <div className="text-sm mb-1">
                <span className="text-white font-semibold">Readiness Score</span>
              </div>
              <p className="text-sm text-graytxt leading-relaxed mb-2">
                Daily readiness (0-100) based on recent training & recovery time.
              </p>
              <div className="text-sm text-graytxt space-y-1">
                <div>• <span className="text-red">0-44:</span> Limited readiness</div>
                <div>• <span className="text-blue">45-76:</span> Moderate readiness</div>
                <div>• <span className="text-green">77-100:</span> Optimal readiness</div>
              </div>
            </div>
            
            {/* Load Ratio Section */}
            <div className="border border-border/50 rounded-lg p-3">
              <div className="text-sm mb-1">
                <span className="text-white font-semibold">Load Ratio</span>
              </div>
              <p className="text-sm text-graytxt leading-relaxed mb-2">
                7-day vs 28-day training load comparison to prevent overtraining.
              </p>
              <div className="text-sm text-graytxt space-y-1">
                <div>• <span className="text-red">Under 0.8x:</span> Undertraining</div>
                <div>• <span className="text-green">0.8-1.3x:</span> Optimal training load</div>
                <div>• <span className="text-red">1.3x+:</span> Overtraining</div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom-right dropdown toggle */}
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm text-blue">
            {hasNoData ? `Track ${3 - sessions} more session${3 - sessions === 1 ? '' : 's'} to unlock insights` : 
             sessions >= 5 && loadRatioData ? 'Readiness calculated' : 
             'Building readiness model'}
          </div>
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
    </section>
  );
};

export default Today;

