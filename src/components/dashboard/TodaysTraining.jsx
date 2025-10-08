import { useState } from 'react';
import { ChevronRightIcon } from '../ui/Icons.jsx';
import { readinessTextColor, readinessGradient, loadColor } from '../../utils/index.js';
import { getCapacityRecommendations } from '../../utils/metrics.js';

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
  userData = { totalSessions: 0, totalClimbs: 0 },
  onNavigateToReadinessInfo,
  onNavigateToLoadRatioInfo,
}) => {
  
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
    if (currentScore >= 88) {
      return {
        status: 'OPTIMAL - MAXIMUM CAPACITY',
        color: 'text-green',
        bgColor: 'bg-green/10',
        borderColor: 'border-green/20',
        ctaText: 'CRUSH YOUR PROJECT'
      };
    } else if (currentScore >= 75) {
      return {
        status: 'GOOD - HIGH CAPACITY',
        color: 'text-green',
        bgColor: 'bg-green/10',
        borderColor: 'border-green/20',
        ctaText: 'PUSH INTENSITY'
      };
    } else if (currentScore >= 60) {
      return {
        status: 'MODERATE - BALANCED TRAINING',
        color: 'text-blue',
        bgColor: 'bg-blue/10',
        borderColor: 'border-blue/20',
        ctaText: 'TRAIN SMART'
      };
    } else if (currentScore >= 45) {
      return {
        status: 'CAUTION - REDUCED CAPACITY',
        color: 'text-yellow',
        bgColor: 'bg-yellow/10',
        borderColor: 'border-yellow/20',
        ctaText: 'LIGHT TRAINING'
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
    if (currentScore >= 88) {
      return 'Maximum capacity available - push your limits.';
    } else if (currentScore >= 75) {
      return 'High capacity ready - train with intensity.';
    } else if (currentScore >= 60) {
      return 'Balanced training recommended - moderate intensity.';
    } else if (currentScore >= 45) {
      return 'Reduced capacity - focus on technique and light volume.';
    } else {
      return 'Recovery focus - prioritize movement quality and rest.';
    }
  };

  // Load-based capacity recommendations
  const capacityRec = getCapacityRecommendations(
    userData.totalSessions >= 3 ? crsData : null,
    userData.totalSessions >= 5 ? loadRatioData : null,
    sessions
  );

  const statusInfo = getStatusMessage();

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
    if (s >= 88) return { msg: 'Optimal. Maximum capacity available.' };
    if (s >= 75) return { msg: 'Good. High capacity ready.' };
    if (s >= 60) return { msg: 'Moderate. Balanced training recommended.' };
    if (s >= 45) return { msg: 'Caution. Reduced capacity today.' };
    return { msg: 'Limited. Focus on technique and recovery.' };
  };

  const handleStartClick = () => {
    onStartTraining?.();
  };

  // Get today's date formatted
  const getTodaysDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <section className="px-5 pt-4">
      <div className="bg-card border border-border rounded-col px-5 pt-5 pb-5">
        
        {/* Header with title and today's date */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-base">Today's Readiness</h3>
          <div className="text-sm text-graytxt">
            {getTodaysDate()}
          </div>
        </div>

        {/* CRS copy/message */}
        <div className="text-sm text-graytxt mb-3">
          {crsMessage || getCRSAdvice(currentScore).msg}
        </div>

        {/* CRS and Load Ratio containers */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Readiness container - clickable */}
          <div 
            className="bg-border/30 border border-border/60 rounded-lg p-3 shadow-inner cursor-pointer hover:border-border/80 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateToReadinessInfo?.();
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-white font-bold uppercase tracking-wide">Readiness</div>
              <ChevronRightIcon className="w-3 h-3 text-graytxt" />
            </div>
            <div className={`text-3xl font-extrabold leading-none ${readinessTextColor(currentScore)} mb-2`}>{currentScore}%</div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div className={`bg-gradient-to-r ${readinessGradient(currentScore)} h-full`} style={{width: `${currentScore}%`}}></div>
            </div>
          </div>

          {/* Load Ratio container - clickable */}
          <div 
            className="bg-border/30 border border-border/60 rounded-lg p-3 shadow-inner cursor-pointer hover:border-border/80 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateToLoadRatioInfo?.();
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-white font-bold uppercase tracking-wide">Load Ratio</div>
              <ChevronRightIcon className="w-3 h-3 text-graytxt" />
            </div>
            <div className={`text-3xl font-extrabold leading-none ${loadColor(currentLoadRatio)} mb-2`}>{currentLoadRatio.toFixed(1)}x</div>
            {/* Balanced indicator with center baseline */}
            <div className="relative h-2 bg-border rounded-full overflow-hidden">
              {/* Center baseline marker (1.0x) */}
              <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white transform -translate-x-0.5 z-10"></div>
              {/* Load ratio indicator bar */}
              <div 
                className={`absolute top-0 h-full ${loadColor(currentLoadRatio) === 'text-cyan-400' ? 'bg-cyan-400' : 'bg-red'} transition-all duration-300`}
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

        {/* Training parameters - compact 2 rows with diagonal lines, blue hue, and blue outline */}
        <div className="space-y-2 mb-4">
          <div className="relative rounded-lg px-3 py-2 flex items-center justify-between shadow-inner overflow-hidden" style={{border: '1px solid rgba(8, 145, 178, 0.4)'}}>
            {/* Diagonal pattern background */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <pattern id="diagonalHatch1" patternUnits="userSpaceOnUse" width="4" height="4">
                  <path d="m0,4 l4,-4 M-1,1 l2,-2 M3,5 l2,-2" stroke="#6b7280" strokeWidth="0.6" opacity="0.4"/>
                </pattern>
                <linearGradient id="iceBlueGradient1" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#083344" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#155e75" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#diagonalHatch1)" rx="8"/>
              <rect width="100%" height="100%" fill="url(#iceBlueGradient1)" rx="8"/>
            </svg>
            <span className="relative text-white font-medium text-sm">Total Volume</span>
            <span className="relative text-white text-sm">{capacityRec.volumeCap}</span>
          </div>
          
          <div className="relative rounded-lg px-3 py-2 flex items-center justify-between shadow-inner overflow-hidden" style={{border: '1px solid rgba(8, 145, 178, 0.4)'}}>
            {/* Diagonal pattern background */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <pattern id="diagonalHatch2" patternUnits="userSpaceOnUse" width="4" height="4">
                  <path d="m0,4 l4,-4 M-1,1 l2,-2 M3,5 l2,-2" stroke="#6b7280" strokeWidth="0.6" opacity="0.4"/>
                </pattern>
                <linearGradient id="iceBlueGradient2" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#083344" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#155e75" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#diagonalHatch2)" rx="8"/>
              <rect width="100%" height="100%" fill="url(#iceBlueGradient2)" rx="8"/>
            </svg>
            <span className="relative text-white font-medium text-sm">Max Effort</span>
            <span className="relative text-white text-sm">{capacityRec.rpeCap}</span>
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

      </div>
    </section>
  );
};

export default TodaysTraining;
