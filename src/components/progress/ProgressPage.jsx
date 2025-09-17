import { useState, useRef } from 'react';
import Header from '../ui/Header.jsx';
import BottomNavigation from '../ui/BottomNavigation.jsx';
import FAB from '../ui/FAB.jsx';
import { LineChart, Trend } from '../ui/Charts.jsx';
import { MountainIcon, LightningIcon, TargetIcon, ChevronDownIcon, ClockIcon, ChartBarIcon, TrophyIcon, LockClosedIcon, RocketLaunchIcon } from '../ui/Icons.jsx';

// Progress & Achievements page component
// Displays climbing progress, achievement milestones, and performance trends

const ProgressPage = ({ userData, sessions, onNavigateBack, onNavigateToTracker, onNavigateToSessions, onNavigateToDashboard, onNavigateToAccount }) => {
  const containerRef = useRef(null);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);

  const handleBackClick = () => {
    onNavigateBack?.();
  };

  const handleScrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleFABClick = () => {
    onNavigateToTracker?.();
  };

  // Check if user has reached 6-week mark for performance trends unlock
  const checkPerformanceTrendsUnlock = (sessions) => {
    if (!sessions || sessions.length === 0) return { unlocked: false, weeksRemaining: 6, firstSessionDate: null };
    
    // Find the earliest session timestamp
    const validSessions = sessions.filter(s => s.timestamp);
    if (validSessions.length === 0) return { unlocked: false, weeksRemaining: 6, firstSessionDate: null };
    
    const earliestSession = validSessions.reduce((earliest, session) => 
      session.timestamp < earliest.timestamp ? session : earliest
    );
    
    const firstSessionDate = new Date(earliestSession.timestamp);
    const sixWeeksFromFirst = firstSessionDate.getTime() + (6 * 7 * 24 * 60 * 60 * 1000);
    const now = Date.now();
    
    const unlocked = now >= sixWeeksFromFirst;
    
    // Calculate weeks remaining (can be decimal)
    const timeRemaining = sixWeeksFromFirst - now;
    const weeksRemaining = Math.max(0, timeRemaining / (7 * 24 * 60 * 60 * 1000));
    
    return { 
      unlocked, 
      weeksRemaining: Math.ceil(weeksRemaining), 
      firstSessionDate: firstSessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      daysRemaining: Math.max(0, Math.ceil(timeRemaining / (24 * 60 * 60 * 1000)))
    };
  };

  const trendsStatus = checkPerformanceTrendsUnlock(sessions);
  const performanceTrendsUnlocked = trendsStatus.unlocked;

  // Calculate weekly data from sessions or show sample data
  const calculateWeeklyData = () => {
    if (!sessions || sessions.length === 0) {
      // Show sample data when no sessions exist - this gives users a preview of what charts will look like
      return {
        volume: [18, 22, 19, 25, 28, 31], // Sample climbs per week
        avgGrade: [4.0, 4.1, 4.2, 4.3, 4.4, 4.5], // Sample avg grade per week
        flashRate: [48, 55, 62, 59, 65, 67] // Sample flash rate % per week
      };
    }

    // For now, return sample data until we have enough sessions to calculate meaningful weekly trends
    // This will be populated with real data once user has 6+ weeks of climbing
    return {
      volume: [18, 22, 19, 25, 28, 31],
      avgGrade: [4.0, 4.1, 4.2, 4.3, 4.4, 4.5],
      flashRate: [48, 55, 62, 59, 65, 67]
    };
  };

  const weeklyData = calculateWeeklyData();
  const weekLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];


  // Achievement milestones
  const achievements = [
    {
      category: 'Boulders Climbed',
      icon: MountainIcon,
      milestones: [
        { target: 50, unlocked: userData.totalClimbs >= 50, current: userData.totalClimbs },
        { target: 100, unlocked: userData.totalClimbs >= 100, current: userData.totalClimbs },
        { target: 250, unlocked: userData.totalClimbs >= 250, current: userData.totalClimbs }
      ]
    },
    {
      category: 'Climbs Flashed',
      icon: LightningIcon,
      milestones: [
        { target: 10, unlocked: userData.totalClimbs >= 15, current: Math.floor(userData.totalClimbs * 0.65) },
        { target: 25, unlocked: userData.totalClimbs >= 40, current: Math.floor(userData.totalClimbs * 0.65) },
        { target: 100, unlocked: userData.totalClimbs >= 160, current: Math.floor(userData.totalClimbs * 0.65) }
      ]
    },
    {
      category: 'Sessions Tracked',
      icon: TargetIcon,
      milestones: [
        { target: 5, unlocked: userData.totalSessions >= 5, current: userData.totalSessions },
        { target: 25, unlocked: userData.totalSessions >= 25, current: userData.totalSessions },
        { target: 50, unlocked: userData.totalSessions >= 50, current: userData.totalSessions }
      ]
    }
  ];

  // Calculate level and experience points with enhanced system
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

  // Calculate metrics for 3x3 grid
  const calculateMaxGrade = () => {
    if (!sessions || sessions.length === 0) return '--';
    let maxGrade = 0;
    sessions.forEach(session => {
      if (session.climbList && session.climbList.length > 0) {
        session.climbList.forEach(climb => {
          const gradeNum = parseInt(climb.grade.replace('V', '')) || 0;
          maxGrade = Math.max(maxGrade, gradeNum);
        });
      }
    });
    return maxGrade > 0 ? `V${maxGrade}` : '--';
  };

  const calculateMaxFlash = () => {
    if (!sessions || sessions.length === 0) return '--';
    let maxFlash = 0;
    sessions.forEach(session => {
      if (session.climbList && session.climbList.length > 0) {
        session.climbList.forEach(climb => {
          if (climb.attempts === 1) {
            const gradeNum = parseInt(climb.grade.replace('V', '')) || 0;
            maxFlash = Math.max(maxFlash, gradeNum);
          }
        });
      }
    });
    return maxFlash > 0 ? `V${maxFlash}` : '--';
  };

  const calculateMaxVolume = () => {
    if (!sessions || sessions.length === 0) return '--';
    let maxVolume = 0;
    sessions.forEach(session => {
      if (session.climbList && session.climbList.length > 0) {
        maxVolume = Math.max(maxVolume, session.climbList.length);
      }
    });
    return maxVolume > 0 ? maxVolume : '--';
  };

  const calculateTotalFlashed = () => {
    if (!sessions || sessions.length === 0) return 0;
    let totalFlashed = 0;
    sessions.forEach(session => {
      if (session.climbList && session.climbList.length > 0) {
        session.climbList.forEach(climb => {
          if (climb.attempts === 1) {
            totalFlashed++;
          }
        });
      }
    });
    return totalFlashed;
  };

  const calculateAvgFlashRate = () => {
    if (!sessions || sessions.length === 0) return '--';
    let totalClimbs = 0;
    let totalFlashed = 0;
    sessions.forEach(session => {
      if (session.climbList && session.climbList.length > 0) {
        totalClimbs += session.climbList.length;
        session.climbList.forEach(climb => {
          if (climb.attempts === 1) {
            totalFlashed++;
          }
        });
      }
    });
    return totalClimbs > 0 ? Math.round((totalFlashed / totalClimbs) * 100) : '--';
  };

  const calculateAvgClimbsPerSession = () => {
    if (!sessions || sessions.length === 0) return '--';
    const validSessions = sessions.filter(s => s.climbList && s.climbList.length > 0);
    if (validSessions.length === 0) return '--';
    const totalClimbs = validSessions.reduce((sum, s) => sum + s.climbList.length, 0);
    return (totalClimbs / validSessions.length).toFixed(1);
  };

  const calculateSessionsPerWeek = () => {
    if (!sessions || sessions.length === 0) return '--';
    const validSessions = sessions.filter(s => s.timestamp);
    if (validSessions.length === 0) return '--';
    
    const now = Date.now();
    const fourWeeksAgo = now - (4 * 7 * 24 * 60 * 60 * 1000);
    const recentSessions = validSessions.filter(s => s.timestamp > fourWeeksAgo);
    
    if (recentSessions.length === 0) return '--';
    return (recentSessions.length / 4).toFixed(1);
  };

  return (
    <div ref={containerRef} className="w-full h-screen overflow-y-auto hide-scrollbar relative bg-bg">

      
      <Header 
        title="PROGRESS"
        onTitleClick={handleScrollToTop}
      />

      {/* Enhanced Performance Profile - Sharable Identity Card */}
      <section className="px-5 pt-4">
        <div className="bg-card border border-border rounded-col p-5 mb-4 shadow-lg">
          {/* Header with Name & XP Progress */}
          <div className="mb-6">
            {/* Row 1: Main titles */}
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="text-white text-lg font-bold">Performance Stats</h2>
              <div className="flex items-center gap-2">
                <RocketLaunchIcon className="w-4 h-4 text-cyan-400" />
                <div className="text-lg font-bold text-white">{totalPoints.toLocaleString()}</div>
              </div>
            </div>
            
            {/* Row 2: Subtitles */}
            <div className="flex items-baseline justify-between mb-3">
              <div className="text-graytxt text-sm">
                {150 - pointsInCurrentLevel} XP to Level {currentLevel + 1}
              </div>
              <div className="text-graytxt text-sm">Total XP</div>
            </div>
            <div className="w-full h-2 bg-border rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-cyan-400 transition-all duration-300" 
                style={{width: `${(pointsInCurrentLevel / 150) * 100}%`}}
              ></div>
            </div>
          </div>

          {/* 1x3 Metrics Cards - Compact with External Titles */}
          <div className="space-y-3 mb-6">
            {/* Records */}
            <div>
              <div className="text-sm text-white font-semibold mb-2 text-center">Records</div>
              <div className="bg-gradient-to-r from-cyan-950/25 to-blue-950/20 border border-cyan-700/40 rounded-lg p-3 shadow-cyan-900/15 shadow-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-cyan-400 text-base font-bold">{calculateMaxGrade()}</div>
                    <div className="text-white text-xs">Hardest</div>
                  </div>
                  <div className="text-center">
                    <div className="text-cyan-400 text-base font-bold">{calculateMaxFlash()}</div>
                    <div className="text-white text-xs">Max Flash</div>
                  </div>
                  <div className="text-center">
                    <div className="text-cyan-400 text-base font-bold">{calculateMaxVolume()}</div>
                    <div className="text-white text-xs">Max Vol</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Totals */}
            <div>
              <div className="text-sm text-white font-semibold mb-2 text-center">Totals</div>
              <div className="bg-gradient-to-r from-cyan-950/25 to-blue-950/20 border border-cyan-700/40 rounded-lg p-3 shadow-cyan-900/15 shadow-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-cyan-400 text-base font-bold">{userData.totalClimbs || 0}</div>
                    <div className="text-white text-xs">Climbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-cyan-400 text-base font-bold">{userData.totalSessions || 0}</div>
                    <div className="text-white text-xs">Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-cyan-400 text-base font-bold">{calculateTotalFlashed()}</div>
                    <div className="text-white text-xs">Flashed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Averages */}
            <div>
              <div className="text-sm text-white font-semibold mb-2 text-center">Averages</div>
              <div className="bg-gradient-to-r from-cyan-950/25 to-blue-950/20 border border-cyan-700/40 rounded-lg p-3 shadow-cyan-900/15 shadow-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-cyan-400 text-base font-bold">{calculateAvgFlashRate()}%</div>
                    <div className="text-white text-xs">Flash</div>
                  </div>
                  <div className="text-center">
                    <div className="text-cyan-400 text-base font-bold">{calculateAvgClimbsPerSession()}</div>
                    <div className="text-white text-xs">Climbs/S</div>
                  </div>
                  <div className="text-center">
                    <div className="text-cyan-400 text-base font-bold">{calculateSessionsPerWeek()}/wk</div>
                    <div className="text-white text-xs">Sessions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievement Milestones - With Container */}
      <section className="px-5 pt-2">
        <div className="bg-card border border-border rounded-col p-5 mb-4">
          <h3 className="text-white text-base font-bold mb-4">Achievement Milestones</h3>
          
          <div className="space-y-4">
            {achievements.map((achievement, index) => {
              const currentMilestone = achievement.milestones.find(m => !m.unlocked) || achievement.milestones[achievement.milestones.length - 1];
              const previousMilestone = achievement.milestones.find(m => m.unlocked && m.target < currentMilestone.target) || { target: 0 };
              const progress = Math.min(100, ((currentMilestone.current - previousMilestone.target) / (currentMilestone.target - previousMilestone.target)) * 100);
              
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <achievement.icon className="w-4 h-4 text-graytxt" />
                      <span className="text-white text-sm font-medium">{achievement.category}</span>
                    </div>
                    <span className="text-graytxt text-sm">
                      {currentMilestone.current} / {currentMilestone.target}
                    </span>
                  </div>
                  
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-900 to-cyan-400 transition-all duration-300" 
                      style={{width: `${Math.max(0, progress)}%`}}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Performance Graphs */}
      <section className="px-5 pt-6 space-y-4 pb-8 relative">
        <h2 className="text-base font-bold mb-4 text-white">Performance Trends</h2>
        
        <div className={`space-y-4 ${!performanceTrendsUnlocked ? 'blur-sm' : ''}`}>
          <div className="bg-card border border-border rounded-col p-4">
            <div className="text-sm mb-3 flex items-center justify-between">
              <span className="font-semibold text-white">Weekly Volume (Capacity)</span>
              <Trend dir="up">+72% in 6 weeks</Trend>
            </div>
            <div className="flex justify-center">
              <LineChart values={weeklyData.volume} labels={weekLabels} height={80} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-col p-4">
            <div className="text-sm mb-3 flex items-center justify-between">
              <span className="font-semibold text-white">Weekly Avg Grade (Intensity)</span>
              <Trend dir="up">+0.6 grades</Trend>
            </div>
            <div className="flex justify-center">
              <LineChart values={weeklyData.avgGrade} labels={weekLabels} height={80} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-col p-4">
            <div className="text-sm mb-3 flex items-center justify-between">
              <span className="font-semibold text-white">Weekly Flash Rate (Skill)</span>
              <Trend dir="up">+19% success rate</Trend>
            </div>
            <div className="flex justify-center">
              <LineChart values={weeklyData.flashRate} labels={weekLabels} height={80} />
            </div>
          </div>
        </div>

        {/* Unlock overlay when trends are locked */}
        {!performanceTrendsUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center px-8">
              <div className="mb-4">
                <LockClosedIcon className="w-10 h-10 text-white/70 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">
                  {trendsStatus.weeksRemaining === 0 ? 'Unlocking Soon' : `${trendsStatus.weeksRemaining} Week${trendsStatus.weeksRemaining === 1 ? '' : 's'} Left`}
                </div>
                <div className="text-base text-white/80 mb-4">
                  {trendsStatus.weeksRemaining === 0 
                    ? 'Performance insights will unlock in the next few days'
                    : 'Until performance insights unlock'
                  }
                </div>
              </div>
              
              <div className="text-sm text-white/60 leading-relaxed">
                {trendsStatus.firstSessionDate 
                  ? `First session tracked: ${trendsStatus.firstSessionDate}`
                  : 'Start tracking sessions to unlock insights'
                }
                <br />
                Continue climbing to build your performance profile
              </div>
            </div>
          </div>
        )}
      </section>
      
      {/* Bottom Logo Section - Whoop Style */}
      <section className="pt-2 pb-32 flex items-center justify-center">
        <img 
          src="/asset8.svg" 
          alt="POGO" 
          className="w-16 h-16"
        />
      </section>
      
      <FAB onClick={handleFABClick} />
      
      <BottomNavigation 
        activeItem="Progress"
        onNavigateTo={(route) => {
          if (route === '/dashboard') {
            onNavigateToDashboard?.();
          } else if (route === '/sessions') {
            onNavigateToSessions?.();
          } else if (route === '/progress') {
            // Already on progress
          } else if (route === '/account') {
            onNavigateToAccount?.();
          }
        }}
      />
    </div>
  );
};

export default ProgressPage;
