import { useState } from 'react';
import { ChevronDownIcon, FireIcon } from '../ui/Icons.jsx';
import { readinessTextColor, readinessGradient, loadColor } from '../../utils/index.js';

// Unified TodaysTraining component combining readiness and recommendations
// Provides single decision point for daily training based on readiness

const TodaysTraining = ({ 
  score = 77, 
  loadRatio = 1.0, 
  sessions = [], 
  crsData, 
  loadRatioData,
  recommendation,
  onStartTraining,
  userData = { totalSessions: 0, totalClimbs: 0 }
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate week streak (placeholder - would need session data with dates)
  const calculateWeekStreak = () => {
    // For now, return a simple calculation based on sessions
    // In real implementation, this would check consecutive weeks with sessions
    return Math.min(Math.floor(userData.totalSessions / 2) + 1, 8); // Cap at 8 weeks for demo
  };
  
  const weekStreak = calculateWeekStreak();

  // Calculate total XP from sessions (same logic as Progress page)
  const calculateTotalXP = () => {
    if (!sessions || sessions.length === 0) {
      return 0; // No sessions = no XP
    }
    
    let totalXP = 0;
    
    sessions.forEach(session => {
      if (session.climbList && session.climbList.length > 0) {
        session.climbList.forEach(climb => {
          // Base XP
          const baseXP = 10;
          
          // Grade multiplier (V0=1x, V1=2x, V2=3x, etc.)
          const gradeNum = parseInt(climb.grade.replace('V', '')) || 0;
          const gradeMultiplier = gradeNum + 1;
          
          // Flash bonus (1.2x for first attempt)
          const flashBonus = climb.attempts === 1 ? 1.2 : 1.0;
          
          // Calculate climb XP
          const climbXP = baseXP * gradeMultiplier * flashBonus;
          totalXP += climbXP;
        });
      }
    });
    
    return Math.floor(totalXP);
  };

  // Calculate XP progress for display
  const totalXP = calculateTotalXP();
  const currentLevel = Math.floor(totalXP / 150) + 1;
  const pointsInCurrentLevel = totalXP % 150;
  const xpToNextLevel = 150 - pointsInCurrentLevel;
  
  // Determine display state based on CRS data availability
  const isCalibrating = userData.totalSessions < 5;
  const hasNoData = userData.totalSessions < 3;
  
  // Use real data only if we have enough sessions, otherwise use demo values
  const currentScore = (userData.totalSessions >= 3 && crsData) ? crsData.score : score;
  const currentLoadRatio = (userData.totalSessions >= 5 && loadRatioData) ? loadRatioData.ratio : loadRatio;
  const crsStatus = (userData.totalSessions >= 3 && crsData) ? crsData.status : 'demo';
  const crsMessage = (userData.totalSessions >= 3 && crsData) ? crsData.message : null;

  // Get status message based on readiness score
  const getStatusMessage = () => {
    if (currentScore >= 77) {
      return {
        status: 'OPTIMAL - PUSH YOUR LIMITS',
        color: 'text-green',
        bgColor: 'bg-green/10',
        borderColor: 'border-green/20',
        ctaText: 'CRUSH YOUR PROJECT'
      };
    } else if (currentScore >= 45) {
      return {
        status: 'MODERATE - TRAIN SMART',
        color: 'text-blue',
        bgColor: 'bg-blue/10',
        borderColor: 'border-blue/20',
        ctaText: 'BUILD STRENGTH'
      };
    } else {
      return {
        status: 'LIMITED - RECOVERY FOCUS',
        color: 'text-orange',
        bgColor: 'bg-orange/10',
        borderColor: 'border-orange/20',
        ctaText: 'MOVE EASY'
      };
    }
  };

  // Get focus message based on readiness score
  const getFocusMessage = () => {
    if (currentScore >= 77) {
      return 'Push yourself today to build power and capacity.';
    } else if (currentScore >= 45) {
      return 'Train smart with balanced volume and technique focus.';
    } else {
      return 'Focus on recovery with light movement and skill work.';
    }
  };

  // Smart recommendation logic based on readiness
  const getSmartRecommendation = () => {
    const baseRec = recommendation || {
      type: 'Track Climbs',
      volume: '10-15',
      rpe: '6-7'
    };

    // Adjust recommendations based on readiness score and load ratio
    if (sessions >= 3) {
      if (currentScore >= 77) {
        return {
          ...baseRec,
          volume: '12-18',
          rpe: '7-8'
        };
      } else if (currentScore >= 45) {
        return {
          ...baseRec,
          volume: '8-12',
          rpe: '6-7'
        };
      } else {
        return {
          ...baseRec,
          volume: '5-8',
          rpe: '5-6'
        };
      }
    }

    return baseRec;
  };

  const statusInfo = getStatusMessage();
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
      <div className="bg-card border border-border rounded-col px-5 pt-5 pb-5 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        
        {/* Header with title and week streak */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-base">Today's Readiness</h3>
          <div className="flex items-center gap-1 text-sm text-graytxt">
            <FireIcon className="w-4 h-4 text-orange-500" />
            <span>{weekStreak}</span>
          </div>
        </div>

        {/* CRS copy/message */}
        <div className="text-sm text-graytxt mb-3">
          {crsMessage || getCRSAdvice(currentScore).msg}
        </div>

        {/* CRS and Load Ratio containers */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Readiness container */}
          <div className="bg-border/30 border border-border/60 rounded-lg p-3 text-center shadow-inner">
            <div className="text-xs text-white font-bold mb-1 uppercase tracking-wide">Readiness</div>
            <div className={`text-3xl font-extrabold leading-none ${readinessTextColor(currentScore)} mb-2`}>{currentScore}%</div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div className={`bg-gradient-to-r ${readinessGradient(currentScore)} h-full`} style={{width: `${currentScore}%`}}></div>
            </div>
          </div>

          {/* Load Ratio container */}
          <div className="bg-border/30 border border-border/60 rounded-lg p-3 text-center shadow-inner">
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

        {/* Recommended Training header */}
        <div className="text-center mb-3">
          <div className="text-sm font-bold text-graytxt">Recommended Training</div>
        </div>

        {/* Training parameters - compact 2 rows */}
        <div className="space-y-2 mb-4">
          <div className="bg-border/20 border border-border/40 rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-white font-medium text-sm">Volume</span>
            <span className="text-white text-sm">{smartRec.volume}</span>
          </div>
          
          <div className="bg-border/20 border border-border/40 rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-white font-medium text-sm">Effort / RPE</span>
            <span className="text-white text-sm">{smartRec.rpe} / 10</span>
          </div>
        </div>

        {/* CTA Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleStartClick();
          }}
          className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-100 active:scale-95 transition-all duration-150"
        >
          Track Climbs
        </button>

        {/* Load warning if applicable */}
        {loadWarning && (
          <div className="text-sm text-orange mt-3">⚠️ {loadWarning}</div>
        )}

        {/* XP progress with expandable toggle */}
        <div className="flex items-center justify-between mt-3">
          <div className="text-sm text-graytxt flex-1 mr-3">
            <span className="text-white">{xpToNextLevel} XP</span> to Level {currentLevel + 1}
          </div>
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform duration-200 text-graytxt flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>

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
