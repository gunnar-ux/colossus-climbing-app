import { useState } from 'react';
import Progress from '../ui/Progress.jsx';

// AllTime component - redesigned for addictive gamification
// Focus on progression, achievements, and visual hierarchy

const AllTime = ({ available = false, onViewAchievements, userData, sessions, peakGrade }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Always show real data if we have any, regardless of 'available' status
  const hasAnyData = (userData?.totalClimbs > 0) || (userData?.totalSessions > 0);
  
  // Calculate metrics for the card
  const totalClimbs = hasAnyData ? (userData?.totalClimbs || 0) : 0;
  const totalSessions = hasAnyData ? (sessions?.length || 0) : 0;
  
  // Calculate XP and level (matching Performance Profile logic)
  const calculateTotalXP = () => {
    // Enhanced formula: Base XP (10) × Grade Multiplier × Flash Bonus (1.2x)
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
  
  const totalPoints = calculateTotalXP();
  const currentLevel = Math.floor(totalPoints / 150) + 1;
  const nextLevelPoints = currentLevel * 150;
  const pointsInCurrentLevel = totalPoints % 150;
  
  // Calculate flash rate from sessions data
  const flashRate = hasAnyData && sessions && sessions.length > 0 ? 
    sessions.reduce((total, session) => {
      if (session.climbList && session.climbList.length > 0) {
        const flashed = session.climbList.filter(climb => climb.attempts === 1).length;
        return total + (flashed / session.climbList.length);
      }
      return total;
    }, 0) / sessions.length * 100 : 0;
  
  // Calculate average flash grade from sessions data
  const avgFlashGrade = hasAnyData && sessions && sessions.length > 0 ? 
    (() => {
      const flashedClimbs = sessions.reduce((acc, session) => {
        if (session.climbList && session.climbList.length > 0) {
          const flashed = session.climbList.filter(climb => climb.attempts === 1);
          return acc.concat(flashed);
        }
        return acc;
      }, []);
      
      if (flashedClimbs.length === 0) return 0;
      
      const avgGradeNum = flashedClimbs.reduce((sum, climb) => {
        const gradeNum = parseInt(climb.grade.replace('V', ''));
        return sum + gradeNum;
      }, 0) / flashedClimbs.length;
      
      return Math.round(avgGradeNum);
    })() : 0;
  
  // Find hardest send from sessions data
  const hardestSend = hasAnyData && sessions && sessions.length > 0 ? 
    (() => {
      let highest = 0;
      sessions.forEach(session => {
        if (session.climbList && session.climbList.length > 0) {
          session.climbList.forEach(climb => {
            const gradeNum = parseInt(climb.grade.replace('V', ''));
            if (gradeNum > highest) {
              highest = gradeNum;
            }
          });
        }
      });
      return highest;
    })() : 0;
  
  // Achievement progress calculations - matching achievements page categories
  const totalBoulders = totalClimbs;
  
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
      <div className="mx-5 bg-card border border-border rounded-col p-4 hover:border-white/10 transition cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        
        {/* Header matching Performance Profile pattern */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-white text-base">Performance Statistics</h3>
            <div className="text-sm text-graytxt">Level {currentLevel} Climber</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{pointsInCurrentLevel}</div>
            <div className="text-sm text-graytxt">XP</div>
          </div>
        </div>

        {/* Progress bar for XP progress to next level */}
        <div className="w-full h-2 bg-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-300" 
            style={{width: `${(pointsInCurrentLevel / 150) * 100}%`}}
          ></div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm text-graytxt">
            {150 - pointsInCurrentLevel} XP to Level {currentLevel + 1}
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

        {/* Expandable section matching progress page format */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
            
            {/* Volume Metrics */}
            <div className="border border-border/50 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Volume
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-white">{totalClimbs}</div>
                  <div className="text-sm text-graytxt">Total Sends</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalSessions}</div>
                  <div className="text-sm text-graytxt">Sessions</div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="border border-border/50 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Performance
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-white">{Math.round(flashRate)}%</div>
                  <div className="text-sm text-graytxt">Flash Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">V{hardestSend}</div>
                  <div className="text-sm text-graytxt">Peak Grade</div>
                </div>
              </div>
            </div>

            {/* Grade Distribution */}
            <div className="border border-border/50 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M3 3l18 18M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Grades
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-white">V{Math.max(Math.floor(totalClimbs / 30) + 1, 1)}</div>
                  <div className="text-sm text-graytxt">Avg Send</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">V{avgFlashGrade}</div>
                  <div className="text-sm text-graytxt">Avg Flash</div>
                </div>
              </div>
            </div>
            
            {/* Achievement Progress Bars */}
            <div className="border border-border/50 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-white mb-3">Achievement Milestones</h4>
              <div className="space-y-3">
                {/* Boulders Tracked Achievement */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-graytxt">Boulders Tracked</span>
                    <span className="text-sm text-white">
                      {totalBoulders}/{nextBouldersTracked.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-300" 
                      style={{width: `${Math.min((totalBoulders / nextBouldersTracked) * 100, 100)}%`}}
                    ></div>
                  </div>
                </div>
                
                {/* Boulders Flashed Achievement */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-graytxt">Boulders Flashed</span>
                    <span className="text-sm text-white">
                      {bouldersFlashed}/{nextBouldersFlashed}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-300" 
                      style={{width: `${Math.min((bouldersFlashed / nextBouldersFlashed) * 100, 100)}%`}}
                    ></div>
                  </div>
                </div>
                
                {/* Sessions Tracked Achievement */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-graytxt">Sessions Tracked</span>
                    <span className="text-sm text-white">
                      {totalSessions}/{nextSessionsTracked}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-300" 
                      style={{width: `${Math.min((totalSessions / nextSessionsTracked) * 100, 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AllTime;
