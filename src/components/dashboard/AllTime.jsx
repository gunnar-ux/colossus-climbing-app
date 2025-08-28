import { useState } from 'react';
import Progress from '../ui/Progress.jsx';

// AllTime component - redesigned for addictive gamification
// Focus on progression, achievements, and visual hierarchy

const AllTime = ({ available = false, onViewAchievements, userData, sessions, peakGrade }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Always show real data if we have any, regardless of 'available' status
  const hasAnyData = (userData?.totalClimbs > 0) || (userData?.totalSessions > 0);
  
  // Proper gamification system with exponential level thresholds
  const levelThresholds = [0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000, 13000, 16500, 20500, 25000];
  
  // Calculate metrics for subcards
  const totalPoints = hasAnyData ? Math.min(userData?.totalClimbs * 35 || 0, 25000) : 0; // ~35 avg points per climb
  const totalSessions = hasAnyData ? (sessions?.length || 0) : 0; // Use actual sessions array length
  const avgGrade = hasAnyData ? Math.min(Math.floor(userData?.totalClimbs / 20) + 2, 8) : 0; // Simplified avg grade calc
  
  // Find current level based on thresholds
  let currentLevel = 1;
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (totalPoints >= levelThresholds[i]) {
      currentLevel = i + 1;
      break;
    }
  }
  
  // Calculate progress to next level
  const currentThreshold = levelThresholds[currentLevel - 1] || 0;
  const nextThreshold = levelThresholds[currentLevel] || levelThresholds[levelThresholds.length - 1];
  const pointsToNext = nextThreshold - totalPoints;
  const progressPercent = nextThreshold > currentThreshold ? 
    ((totalPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100 : 100;
  
  // Achievement progress calculations - matching achievements page categories
  const totalBoulders = hasAnyData ? (userData?.totalClimbs || 0) : 0;
  
  // Count actual flashed boulders (climbed in 1 attempt) from sessions data
  const bouldersFlashed = hasAnyData && sessions ? 
    sessions.reduce((total, session) => {
      if (session.climbList && session.climbList.length > 0) {
        return total + session.climbList.filter(climb => climb.attempts === 1).length;
      }
      return total;
    }, 0) : 0;
  
  const nextBouldersTracked = totalBoulders < 50 ? 50 : totalBoulders < 100 ? 100 : totalBoulders < 500 ? 500 : totalBoulders < 1000 ? 1000 : 2500;
  const nextBouldersFlashed = bouldersFlashed < 25 ? 25 : bouldersFlashed < 75 ? 75 : bouldersFlashed < 250 ? 250 : bouldersFlashed < 500 ? 500 : 1000;
  const nextSessionsTracked = totalSessions < 5 ? 5 : totalSessions < 25 ? 25 : totalSessions < 50 ? 50 : totalSessions < 100 ? 100 : 250;

  const handleViewAchievements = () => {
    if (onViewAchievements) {
      onViewAchievements();
    }
  };

  return (
    <section className="pt-4">
      <div className="mx-5 bg-card border border-border rounded-col px-4 pt-4 pb-3 hover:border-white/10 transition cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        
        {/* Clean header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-base text-white">Progress & Achievement</h3>
        </div>

        {/* 3 Subcards */}
        <div className="grid grid-cols-3 gap-3">
          {/* Points Subcard */}
          <div className="bg-border/20 rounded-lg p-3 text-center">
            <div className="text-sm text-graytxt mb-1">Total XP</div>
            <div className={`text-lg font-bold ${hasAnyData ? 'text-white' : 'text-gray-600'}`}>
              {totalPoints.toLocaleString()}
            </div>
          </div>
          
          {/* Sessions Subcard */}
          <div className="bg-border/20 rounded-lg p-3 text-center">
            <div className="text-sm text-graytxt mb-1">Sessions</div>
            <div className={`text-lg font-bold ${hasAnyData ? 'text-white' : 'text-gray-600'}`}>
              {totalSessions}
            </div>
          </div>
          
          {/* Avg Grade Subcard */}
          <div className="bg-border/20 rounded-lg p-3 text-center">
            <div className="text-sm text-graytxt mb-1">Avg Grade</div>
            <div className={`text-lg font-bold ${hasAnyData ? 'text-white' : 'text-gray-600'}`}>
              {hasAnyData ? `V${avgGrade}` : 'V0'}
            </div>
          </div>
        </div>

        {/* Expandable progress section */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
            <div className="space-y-3">
              {/* Level Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white font-medium">Level Progress</span>
                  <span className="text-sm text-graytxt">
                    {Math.round(progressPercent)}% to Level {currentLevel + 1}
                  </span>
                </div>
                <Progress value={progressPercent} max={100} />
                <div className="mt-1 text-sm text-graytxt">
                  {hasAnyData ? 
                    (currentLevel >= levelThresholds.length ? 'Maximum level reached!' : `${pointsToNext} XP needed`) : 
                    'Start climbing to begin progressing'
                  }
                </div>
              </div>
              
              {/* Next Achievements */}
              <div>
                <div className="text-sm mb-2">
                  <span className="text-white font-medium">Next Achievement Goals:</span>
                </div>
                <div className="space-y-2">
                  {/* Boulders Tracked Achievement */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-graytxt">Boulders Tracked</span>
                    <span className="text-sm text-white">
                      {totalBoulders}/{nextBouldersTracked.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green/60 to-green transition-all duration-300" 
                      style={{width: `${Math.min((totalBoulders / nextBouldersTracked) * 100, 100)}%`}}
                    ></div>
                  </div>
                  
                  {/* Boulders Flashed Achievement */}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-graytxt">Boulders Flashed</span>
                    <span className="text-sm text-white">
                      {bouldersFlashed}/{nextBouldersFlashed}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green/60 to-green transition-all duration-300" 
                      style={{width: `${Math.min((bouldersFlashed / nextBouldersFlashed) * 100, 100)}%`}}
                    ></div>
                  </div>
                  
                  {/* Sessions Tracked Achievement */}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-graytxt">Sessions Tracked</span>
                    <span className="text-sm text-white">
                      {totalSessions}/{nextSessionsTracked}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green/60 to-green transition-all duration-300" 
                      style={{width: `${Math.min((totalSessions / nextSessionsTracked) * 100, 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expand/Collapse arrow at bottom center */}
        <div className="flex justify-center mt-2">
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

export default AllTime;
