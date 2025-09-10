import { useState } from 'react';
import { ChevronDownIcon } from '../ui/Icons.jsx';
import { readinessTextColor, readinessGradient, loadColor } from '../../utils/index.js';

// Unified TodaysTraining component combining readiness and recommendations
// Provides single decision point for daily training based on readiness

const TodaysTraining = ({ 
  score = 77, 
  loadRatio = 1.0, 
  sessions = 0, 
  crsData, 
  loadRatioData,
  recommendation,
  onStartTraining 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Determine display state based on CRS data availability
  const isCalibrating = sessions < 5;
  const hasNoData = sessions < 3;
  
  // Use real data only if we have enough sessions, otherwise use demo values
  const currentScore = (sessions >= 3 && crsData) ? crsData.score : score;
  const currentLoadRatio = (sessions >= 5 && loadRatioData) ? loadRatioData.ratio : loadRatio;
  const crsStatus = (sessions >= 3 && crsData) ? crsData.status : 'demo';
  const crsMessage = (sessions >= 3 && crsData) ? crsData.message : null;

  // Smart recommendation logic based on readiness
  const getSmartRecommendation = () => {
    const baseRec = recommendation || {
      type: 'Track Climbs',
      volume: '10-15',
      rpe: '6-7',
      focus: 'Begin building your climbing profile'
    };

    // Adjust recommendations based on readiness score and load ratio
    if (sessions >= 3) {
      if (currentScore >= 77) {
        return {
          ...baseRec,
          volume: '12-18 climbs',
          rpe: '7-8',
          focus: 'Push your limits today - optimal readiness'
        };
      } else if (currentScore >= 45) {
        return {
          ...baseRec,
          volume: '8-12 climbs',
          rpe: '6-7',
          focus: 'Moderate training, focus on technique'
        };
      } else {
        return {
          ...baseRec,
          volume: '5-8 climbs',
          rpe: '5-6',
          focus: 'Recovery day, light technique work'
        };
      }
    }

    return baseRec;
  };

  const smartRec = getSmartRecommendation();

  // Add load ratio warnings
  const getLoadWarning = () => {
    if (sessions >= 5 && currentLoadRatio > 1.3) {
      return 'High training load - consider reducing volume';
    }
    if (sessions >= 5 && currentLoadRatio < 0.8) {
      return 'Training load low - consider increasing volume';
    }
    return null;
  };

  const loadWarning = getLoadWarning();

  const getCRSAdvice = (s) => {
    if (s >= 77) return { msg: 'Optimal. Peak performance ready.' };
    if (s >= 45) return { msg: 'Moderate. Balanced training recommended.' };
    return { msg: 'Limited. Focus on technique and recovery.' };
  };

  const handleStartClick = () => {
    onStartTraining?.();
  };

  return (
    <section className="px-5 pt-4">
      <div className="bg-card border border-border rounded-col px-4 pt-4 pb-3 hover:border-white/10 transition cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        
        {/* Header with title and calibrating badge */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-base">Today's Readiness</h3>
          {hasNoData ? (
            <span className="px-2 py-1 text-sm rounded-full bg-border text-graytxt">
              NEED DATA
            </span>
          ) : isCalibrating ? (
            <span className="px-2 py-1 text-sm rounded-full bg-border text-graytxt">
              CALIBRATING
            </span>
          ) : (
            <span className="px-2 py-1 text-sm rounded-full bg-border text-graytxt">
              CALIBRATED
            </span>
          )}
        </div>

        {/* CRS copy/message */}
        <div className="text-sm text-graytxt mb-3">
          {crsMessage || getCRSAdvice(currentScore).msg}
        </div>

        {/* CRS and Load Ratio containers */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Readiness container */}
          <div className="bg-border/20 border border-border/30 rounded-lg p-3 text-center">
            <div className="text-xs text-white font-bold mb-1 uppercase tracking-wide">Readiness</div>
            <div className={`text-3xl font-extrabold leading-none ${readinessTextColor(currentScore)} mb-2`}>{currentScore}</div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div className={`bg-gradient-to-r ${readinessGradient(currentScore)} h-full`} style={{width: `${currentScore}%`}}></div>
            </div>
          </div>

          {/* Load Ratio container */}
          <div className="bg-border/20 border border-border/30 rounded-lg p-3 text-center">
            <div className="text-xs text-white font-bold mb-1 uppercase tracking-wide">Load Ratio</div>
            <div className={`text-3xl font-extrabold leading-none ${loadColor(currentLoadRatio)} mb-2`}>{currentLoadRatio.toFixed(1)}x</div>
            {/* Balanced indicator with center baseline */}
            <div className="relative h-2 bg-border rounded-full overflow-hidden">
              {/* Center baseline marker (1.0x) */}
              <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white transform -translate-x-0.5 z-10"></div>
              {/* Load ratio indicator bar */}
              <div 
                className={`absolute top-0 h-full ${loadColor(currentLoadRatio) === 'text-green' ? 'bg-green' : 'bg-red'} transition-all duration-300`}
                style={{
                  left: currentLoadRatio <= 1.0 ? `${50 - (1.0 - currentLoadRatio) * 25}%` : '50%',
                  width: currentLoadRatio <= 1.0 
                    ? `${(1.0 - currentLoadRatio) * 25}%`
                    : `${Math.min(50, (currentLoadRatio - 1.0) * 25)}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Recommended Training subtext with dropdown arrow */}
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-white">Climb Volume:</span> <span className="text-graytxt">{smartRec.volume}</span> • <span className="text-white">Max Effort:</span> <span className="text-graytxt">{smartRec.rpe} / 10</span>
          </div>
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform duration-200 text-graytxt ml-3 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>

        {/* Load warning if applicable */}
        {loadWarning && (
          <div className="text-sm text-orange">⚠️ {loadWarning}</div>
        )}

        {/* Expandable section with combined details */}
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

            {/* Training Guidance Section */}
            <div className="border border-border/50 rounded-lg p-3">
              <div className="text-sm mb-1">
                <span className="text-white font-semibold">Training Guidance</span>
              </div>
              <p className="text-sm text-graytxt leading-relaxed mb-2">
                Volume and intensity recommendations adapt to your current readiness.
              </p>
              <div className="text-sm text-graytxt space-y-1">
                <div>• <span className="text-green">High readiness (77+):</span> Push limits, higher volume</div>
                <div>• <span className="text-blue">Moderate (45-76):</span> Balanced training, technique focus</div>
                <div>• <span className="text-red">Low readiness (0-44):</span> Recovery day, light work</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default TodaysTraining;
