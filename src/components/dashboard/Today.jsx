import { useState } from 'react';
import { ChevronDownIcon } from '../ui/Icons.jsx';
import { readinessTextColor, readinessGradient, loadColor } from '../../utils/index.js';

// Today component extracted from dashboard HTML
// Expandable CRS card with tour information and proper mobile font sizes

const Today = ({ score = 77, loadRatio = 1.0, sessions = 0, crsData, loadRatioData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // Determine display state based on CRS data availability
  const isCalibrating = sessions < 5;
  const hasNoData = sessions < 3;
  
  // Use real data only if we have enough sessions, otherwise use demo values
  const currentScore = (sessions >= 3 && crsData) ? crsData.score : score;
  const currentLoadRatio = (sessions >= 5 && loadRatioData) ? loadRatioData.ratio : loadRatio;
  const crsStatus = (sessions >= 3 && crsData) ? crsData.status : 'demo';
  const crsMessage = (sessions >= 3 && crsData) ? crsData.message : null;

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
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-white/15 text-sm text-white/90">
            <span className="text-graytxt">Load</span>
            <span className={`font-semibold ${loadColor(currentLoadRatio)}`}>{currentLoadRatio.toFixed(1)}x</span>
            <span className="text-graytxt">baseline</span>
          </span>
        </div>

        <div className="mt-1 flex items-center gap-3">
          <div className={`text-5xl font-extrabold leading-none ${readinessTextColor(currentScore)} min-w-[64px]`}>{currentScore}</div>
          <div className="flex-1 h-3 bg-border rounded-full overflow-hidden">
            <div className={`bg-gradient-to-r ${readinessGradient(currentScore)} h-full`} style={{width: `${currentScore}%`}}></div>
          </div>
        </div>
        <div className="mt-2 text-sm text-graytxt text-center">
          {crsMessage || getCRSAdvice(currentScore).msg}
        </div>

        {/* Bottom-right dropdown toggle */}
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm text-blue">
            {hasNoData ? `Track ${3 - sessions} more session${3 - sessions === 1 ? '' : 's'} to unlock insights` : 
             sessions >= 5 && loadRatioData ? 'Readiness calculated' : 
             'Building readiness model'}
          </div>
          <ChevronDownIcon 
            className={`w-4 h-4 transition-transform duration-200 text-graytxt ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>

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

      </div>
    </section>
  );
};

export default Today;

