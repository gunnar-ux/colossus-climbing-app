import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { displayGrade } from '../../utils/gradeConversion.js';
import Header from '../ui/Header.jsx';
import BottomNavigation from '../ui/BottomNavigation.jsx';
import FAB from '../ui/FAB.jsx';
import { LineChart, TrendChart, Trend } from '../ui/Charts.jsx';
import { LockClosedIcon, RocketLaunchIcon } from '../ui/Icons.jsx';

// Progress & Achievements page component
// Displays climbing progress, achievement milestones, and performance trends

const ProgressPage = ({ userData, sessions, onNavigateBack, onNavigateToTracker, onNavigateToSessions, onNavigateToDashboard, onNavigateToAccount }) => {
  const { profile } = useAuth();
  const userGradeSystem = profile?.grade_system || 'v-scale';
  const containerRef = useRef(null);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [activeStatsTab, setActiveStatsTab] = useState('records');
  const [gradeDistributionTimeframe, setGradeDistributionTimeframe] = useState('all');
  const [activeTrendChart, setActiveTrendChart] = useState('flash');

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

    // If performance trends are unlocked, calculate real data
    if (performanceTrendsUnlocked) {
      const validSessions = sessions.filter(s => s.timestamp);
      if (validSessions.length === 0) {
        return {
          volume: [18, 22, 19, 25, 28, 31],
          avgGrade: [4.0, 4.1, 4.2, 4.3, 4.4, 4.5],
          flashRate: [48, 55, 62, 59, 65, 67]
        };
      }

      // Get earliest session timestamp
      const earliestSession = validSessions.reduce((earliest, session) => 
        session.timestamp < earliest.timestamp ? session : earliest
      );
      const startTime = earliestSession.timestamp;
      const now = Date.now();

      // Calculate 6 weekly buckets from first session to now
      const weeklyBuckets = Array(6).fill(null).map((_, index) => {
        const weekStart = startTime + (index * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = weekStart + (7 * 24 * 60 * 60 * 1000);
        
        // Get sessions in this week
        const weekSessions = validSessions.filter(s => 
          s.timestamp >= weekStart && s.timestamp < weekEnd
        );

        // Calculate stats for this week
        let totalVolume = 0;
        let totalGradePoints = 0;
        let totalClimbs = 0;
        let totalFlashed = 0;

        weekSessions.forEach(session => {
          if (session.climbList && session.climbList.length > 0) {
            session.climbList.forEach(climb => {
              totalVolume++;
              totalClimbs++;
              const gradeNum = parseInt(climb.grade.replace('V', '')) || 0;
              totalGradePoints += gradeNum;
              if (climb.attempts === 1) totalFlashed++;
            });
          }
        });

        return {
          volume: totalVolume,
          avgGrade: totalClimbs > 0 ? totalGradePoints / totalClimbs : 0,
          flashRate: totalClimbs > 0 ? Math.round((totalFlashed / totalClimbs) * 100) : 0
        };
      });

      return {
        volume: weeklyBuckets.map(w => w.volume),
        avgGrade: weeklyBuckets.map(w => w.avgGrade),
        flashRate: weeklyBuckets.map(w => w.flashRate)
      };
    }

    // Still locked - show sample data
    return {
      volume: [18, 22, 19, 25, 28, 31],
      avgGrade: [4.0, 4.1, 4.2, 4.3, 4.4, 4.5],
      flashRate: [48, 55, 62, 59, 65, 67]
    };
  };

  const weeklyData = calculateWeeklyData();
  const weekLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];

  // Calculate trend percentages for charts
  const calculateTrend = (data) => {
    if (!data || data.length < 2) return { change: 0, percentage: 0, direction: 'flat' };
    
    const firstValue = data[0] || 0;
    const lastValue = data[data.length - 1] || 0;
    
    if (firstValue === 0) {
      return { change: lastValue, percentage: 0, direction: lastValue > 0 ? 'up' : 'flat' };
    }
    
    const change = lastValue - firstValue;
    const percentage = Math.round((change / firstValue) * 100);
    const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
    
    return { change, percentage, direction };
  };

  const volumeTrend = calculateTrend(weeklyData.volume);
  const gradeTrend = calculateTrend(weeklyData.avgGrade);
  const flashRateTrend = calculateTrend(weeklyData.flashRate);

  // Calculate level and experience points with climbing-grade inspired progression
  const calculateTotalXP = () => {
    // Original formula: Base XP (10) × Grade Multiplier × Flash Bonus (1.2x)
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
  
  // Level thresholds - inspired by climbing grades, V17 is the peak
  // Total XP needed to reach each level (matching V-grade progression)
  const LEVEL_THRESHOLDS = [
    0,          // Level 0 (absolute beginner, starting point)
    100,        // Level 1
    500,        // Level 2
    1000,       // Level 3
    2500,       // Level 4
    5000,       // Level 5
    7500,       // Level 6
    10000,      // Level 7
    25000,      // Level 8
    50000,      // Level 9
    100000,     // Level 10
    125000,     // Level 11
    150000,     // Level 12
    200000,     // Level 13
    250000,     // Level 14
    500000,     // Level 15
    1000000,    // Level 16
    5000000,    // Level 17 (legendary - matching V17)
  ];
  
  // Calculate level from XP using threshold array
  const calculateLevelFromXP = (xp) => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  };
  
  const totalPoints = calculateTotalXP();
  const currentLevel = calculateLevelFromXP(totalPoints);
  const maxLevel = LEVEL_THRESHOLDS.length;
  
  // Calculate XP progress for current level
  const currentLevelThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const nextLevelThreshold = LEVEL_THRESHOLDS[currentLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const nextLevelPoints = nextLevelThreshold;
  const pointsInCurrentLevel = totalPoints - currentLevelThreshold;
  const xpNeededForNextLevel = nextLevelThreshold - currentLevelThreshold;
  
  // Check if max level reached
  const isMaxLevel = currentLevel >= maxLevel;

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
    return maxGrade > 0 ? displayGrade(`V${maxGrade}`, userGradeSystem) : '--';
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
    return maxFlash > 0 ? displayGrade(`V${maxFlash}`, userGradeSystem) : '--';
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

  // Calculate grade distribution with timeframe filtering
  const calculateGradeDistribution = (timeframe) => {
    const allGrades = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9'];
    
    if (!sessions || sessions.length === 0) {
      return { 
        distribution: allGrades.map(grade => ({ label: grade, count: 0, percentage: 0, heightPercentage: 0 })),
        totalClimbs: 0
      };
    }
    
    // Filter sessions by timeframe
    const now = Date.now();
    let filteredSessions = sessions;
    
    if (timeframe === 'week') {
      const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
      filteredSessions = sessions.filter(s => s.timestamp && s.timestamp >= oneWeekAgo);
    } else if (timeframe === 'month') {
      const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
      filteredSessions = sessions.filter(s => s.timestamp && s.timestamp >= oneMonthAgo);
    }
    // 'all' uses all sessions (no filter)
    
    const gradeCounts = {};
    let totalClimbs = 0;
    
    // Initialize all grades to 0
    allGrades.forEach(grade => {
      gradeCounts[grade] = 0;
    });
    
    // Count climbs by grade from filtered sessions
    filteredSessions.forEach(session => {
      if (session.climbList && session.climbList.length > 0) {
        session.climbList.forEach(climb => {
          const grade = climb.grade || 'V0';
          if (gradeCounts[grade] !== undefined) {
            gradeCounts[grade]++;
            totalClimbs++;
          }
        });
      }
    });
    
    // Find max count for scaling bars
    const maxCount = Math.max(...Object.values(gradeCounts), 1);
    
    // Convert to array with percentages relative to max
    const distribution = allGrades.map(grade => ({
      label: grade,
      count: gradeCounts[grade],
      percentage: totalClimbs > 0 ? Math.round((gradeCounts[grade] / totalClimbs) * 100) : 0,
      heightPercentage: (gradeCounts[grade] / maxCount) * 100
    }));
    
    return { distribution, totalClimbs };
  };

  const { distribution: gradeDistribution, totalClimbs: totalGradeClimbs } = calculateGradeDistribution(gradeDistributionTimeframe);

  return (
    <div ref={containerRef} className="w-full h-screen overflow-y-auto hide-scrollbar relative bg-bg">

      
      <Header 
        title="PROGRESS"
        onTitleClick={handleScrollToTop}
      />

      {/* Level & Experience Card */}
      <section className="px-5 pt-4">
        <div className="bg-card border border-border rounded-col px-5 pt-5 pb-5 mb-4">
          {/* Row 1: Main titles */}
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-white text-base font-bold">Level & Experience</h2>
            <div className="flex items-center gap-2">
              <RocketLaunchIcon className="w-3.5 h-3.5 text-cyan-400" />
              <div className="text-base font-bold text-white">{totalPoints.toLocaleString()}</div>
            </div>
          </div>
          
          {/* Row 2: Subtitles */}
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-graytxt text-sm">
              {isMaxLevel 
                ? 'MAX LEVEL - Legendary Climber' 
                : `${xpNeededForNextLevel - pointsInCurrentLevel} XP to Level ${currentLevel + 1}`
              }
            </div>
            <div className="text-graytxt text-sm">Total XP</div>
          </div>
          <div className="w-full h-2 bg-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-400 transition-all duration-300" 
              style={{width: isMaxLevel ? '100%' : `${(pointsInCurrentLevel / xpNeededForNextLevel) * 100}%`}}
            ></div>
          </div>
        </div>
      </section>

      {/* Grade Distribution Card */}
      <section className="px-5 pt-0">
        <div className="bg-card border border-border rounded-col px-5 pt-5 pb-5 mb-4">
          {/* Header with Title and Total */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white text-base font-bold">Grade Distribution</h2>
            {totalGradeClimbs > 0 && (
              <div className="text-sm text-graytxt">
                Total: <span className="text-white font-medium">{totalGradeClimbs}</span>
              </div>
            )}
          </div>
          
          {/* Timeframe Segmented Control */}
          <div className="bg-border/30 border border-border/60 rounded-lg p-1 mb-3 flex gap-1">
            {[
              { id: 'all', label: 'All-Time' },
              { id: 'month', label: 'Month' },
              { id: 'week', label: 'Week' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setGradeDistributionTimeframe(tab.id)}
                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${
                  gradeDistributionTimeframe === tab.id
                    ? 'bg-cyan-900/60 text-cyan-400 shadow-sm'
                    : 'text-graytxt'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <div>
            {/* Histogram - always show with texture pattern */}
            <div className="relative h-36 mb-2">
              <div className="flex items-end justify-between gap-1 h-full">
                {gradeDistribution.map((grade, index) => (
                  <div key={index} className="flex-1 relative h-full">
                    {/* Diagonal pattern background */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 top-0 rounded"
                      style={{
                        background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(107, 114, 128, 0.25) 2px, rgba(107, 114, 128, 0.25) 4px)'
                      }}
                    ></div>
                    
                    {/* Bar */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 rounded border border-cyan-600/40 transition-all duration-300"
                      style={{
                        height: grade.count > 0 ? `${Math.max(grade.heightPercentage, 18)}%` : '2px',
                        minHeight: grade.count > 0 ? '28px' : '2px',
                        background: grade.count > 0 
                          ? 'linear-gradient(to top, rgba(8, 51, 68, 0.3), rgba(21, 94, 117, 0.2))'
                          : 'rgba(8, 51, 68, 0.2)',
                        opacity: grade.count > 0 ? 1 : 0.3
                      }}
                    >
                      {/* Count */}
                      {grade.count > 0 && (
                        <div className="absolute inset-x-0 bottom-1 text-center text-xs text-white font-bold">
                          {grade.count}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Grade Labels */}
            <div className="flex items-center justify-between gap-1">
              {gradeDistribution.map((grade, index) => (
                <div key={index} className="flex-1 text-center">
                  <div className={`text-[11px] font-medium ${grade.count > 0 ? 'text-white' : 'text-graytxt/50'}`}>
                    {displayGrade(grade.label.startsWith('V') ? grade.label : `V${grade.label}`, userGradeSystem)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Performance Stats Card - Tabbed with Segmented Control */}
      <section className="px-5 pt-0">
        <div className="bg-card border border-border rounded-col px-4 pt-4 pb-4 mb-4">
          <h2 className="text-white text-base font-bold mb-3">Performance Stats</h2>
          
          {/* Segmented Control */}
          <div className="bg-border/30 border border-border/60 rounded-lg p-1 mb-3 flex gap-1">
            {[
              { id: 'records', label: 'Records' },
              { id: 'totals', label: 'Totals' },
              { id: 'averages', label: 'Averages' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveStatsTab(tab.id)}
                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${
                  activeStatsTab === tab.id
                    ? 'bg-cyan-900/60 text-cyan-400 shadow-sm'
                    : 'text-graytxt'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Records Stats */}
          {activeStatsTab === 'records' && (
            <div className="space-y-2">
              <div className="relative rounded-lg px-3 py-2 flex items-center justify-between shadow-inner overflow-hidden" style={{border: '1px solid rgba(8, 145, 178, 0.4)'}}>
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <pattern id="diagonalHatch-records-1" patternUnits="userSpaceOnUse" width="4" height="4">
                      <path d="m0,4 l4,-4 M-1,1 l2,-2 M3,5 l2,-2" stroke="#6b7280" strokeWidth="0.6" opacity="0.4"/>
                    </pattern>
                    <linearGradient id="iceBlueGradient-records-1" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#083344" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#155e75" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#diagonalHatch-records-1)" rx="8"/>
                  <rect width="100%" height="100%" fill="url(#iceBlueGradient-records-1)" rx="8"/>
                </svg>
                <span className="relative text-white font-medium text-sm">Hardest Send</span>
                <span className="relative text-cyan-400 font-bold text-sm">{calculateMaxGrade()}</span>
              </div>
              
              <div className="relative rounded-lg px-3 py-2 flex items-center justify-between shadow-inner overflow-hidden" style={{border: '1px solid rgba(8, 145, 178, 0.4)'}}>
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <pattern id="diagonalHatch-records-2" patternUnits="userSpaceOnUse" width="4" height="4">
                      <path d="m0,4 l4,-4 M-1,1 l2,-2 M3,5 l2,-2" stroke="#6b7280" strokeWidth="0.6" opacity="0.4"/>
                    </pattern>
                    <linearGradient id="iceBlueGradient-records-2" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#083344" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#155e75" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#diagonalHatch-records-2)" rx="8"/>
                  <rect width="100%" height="100%" fill="url(#iceBlueGradient-records-2)" rx="8"/>
                </svg>
                <span className="relative text-white font-medium text-sm">Max Flash</span>
                <span className="relative text-cyan-400 font-bold text-sm">{calculateMaxFlash()}</span>
              </div>
              
              <div className="relative rounded-lg px-3 py-2 flex items-center justify-between shadow-inner overflow-hidden" style={{border: '1px solid rgba(8, 145, 178, 0.4)'}}>
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <pattern id="diagonalHatch-records-3" patternUnits="userSpaceOnUse" width="4" height="4">
                      <path d="m0,4 l4,-4 M-1,1 l2,-2 M3,5 l2,-2" stroke="#6b7280" strokeWidth="0.6" opacity="0.4"/>
                    </pattern>
                    <linearGradient id="iceBlueGradient-records-3" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#083344" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#155e75" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#diagonalHatch-records-3)" rx="8"/>
                  <rect width="100%" height="100%" fill="url(#iceBlueGradient-records-3)" rx="8"/>
                </svg>
                <span className="relative text-white font-medium text-sm">Max Volume</span>
                <span className="relative text-cyan-400 font-bold text-sm">{calculateMaxVolume()}</span>
              </div>
            </div>
          )}

          {/* Totals Stats */}
          {activeStatsTab === 'totals' && (
            <div className="space-y-2">
              <div className="relative rounded-lg px-3 py-2 flex items-center justify-between shadow-inner overflow-hidden" style={{border: '1px solid rgba(8, 145, 178, 0.4)'}}>
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <pattern id="diagonalHatch-totals-1" patternUnits="userSpaceOnUse" width="4" height="4">
                      <path d="m0,4 l4,-4 M-1,1 l2,-2 M3,5 l2,-2" stroke="#6b7280" strokeWidth="0.6" opacity="0.4"/>
                    </pattern>
                    <linearGradient id="iceBlueGradient-totals-1" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#083344" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#155e75" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#diagonalHatch-totals-1)" rx="8"/>
                  <rect width="100%" height="100%" fill="url(#iceBlueGradient-totals-1)" rx="8"/>
                </svg>
                <span className="relative text-white font-medium text-sm">Total Climbs</span>
                <span className="relative text-cyan-400 font-bold text-sm">{userData.totalClimbs || 0}</span>
              </div>
              
              <div className="relative rounded-lg px-3 py-2 flex items-center justify-between shadow-inner overflow-hidden" style={{border: '1px solid rgba(8, 145, 178, 0.4)'}}>
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <pattern id="diagonalHatch-totals-2" patternUnits="userSpaceOnUse" width="4" height="4">
                      <path d="m0,4 l4,-4 M-1,1 l2,-2 M3,5 l2,-2" stroke="#6b7280" strokeWidth="0.6" opacity="0.4"/>
                    </pattern>
                    <linearGradient id="iceBlueGradient-totals-2" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#083344" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#155e75" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#diagonalHatch-totals-2)" rx="8"/>
                  <rect width="100%" height="100%" fill="url(#iceBlueGradient-totals-2)" rx="8"/>
                </svg>
                <span className="relative text-white font-medium text-sm">Total Sessions</span>
                <span className="relative text-cyan-400 font-bold text-sm">{userData.totalSessions || 0}</span>
              </div>
              
              <div className="relative rounded-lg px-3 py-2 flex items-center justify-between shadow-inner overflow-hidden" style={{border: '1px solid rgba(8, 145, 178, 0.4)'}}>
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <pattern id="diagonalHatch-totals-3" patternUnits="userSpaceOnUse" width="4" height="4">
                      <path d="m0,4 l4,-4 M-1,1 l2,-2 M3,5 l2,-2" stroke="#6b7280" strokeWidth="0.6" opacity="0.4"/>
                    </pattern>
                    <linearGradient id="iceBlueGradient-totals-3" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#083344" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#155e75" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#diagonalHatch-totals-3)" rx="8"/>
                  <rect width="100%" height="100%" fill="url(#iceBlueGradient-totals-3)" rx="8"/>
                </svg>
                <span className="relative text-white font-medium text-sm">Total Flashed</span>
                <span className="relative text-cyan-400 font-bold text-sm">{calculateTotalFlashed()}</span>
              </div>
            </div>
          )}

          {/* Averages Stats */}
          {activeStatsTab === 'averages' && (
            <div className="space-y-2">
              <div className="relative rounded-lg px-3 py-2 flex items-center justify-between shadow-inner overflow-hidden" style={{border: '1px solid rgba(8, 145, 178, 0.4)'}}>
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <pattern id="diagonalHatch-averages-1" patternUnits="userSpaceOnUse" width="4" height="4">
                      <path d="m0,4 l4,-4 M-1,1 l2,-2 M3,5 l2,-2" stroke="#6b7280" strokeWidth="0.6" opacity="0.4"/>
                    </pattern>
                    <linearGradient id="iceBlueGradient-averages-1" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#083344" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#155e75" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#diagonalHatch-averages-1)" rx="8"/>
                  <rect width="100%" height="100%" fill="url(#iceBlueGradient-averages-1)" rx="8"/>
                </svg>
                <span className="relative text-white font-medium text-sm">Flash Rate</span>
                <span className="relative text-cyan-400 font-bold text-sm">{calculateAvgFlashRate()}%</span>
              </div>
              
              <div className="relative rounded-lg px-3 py-2 flex items-center justify-between shadow-inner overflow-hidden" style={{border: '1px solid rgba(8, 145, 178, 0.4)'}}>
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <pattern id="diagonalHatch-averages-2" patternUnits="userSpaceOnUse" width="4" height="4">
                      <path d="m0,4 l4,-4 M-1,1 l2,-2 M3,5 l2,-2" stroke="#6b7280" strokeWidth="0.6" opacity="0.4"/>
                    </pattern>
                    <linearGradient id="iceBlueGradient-averages-2" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#083344" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#155e75" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#diagonalHatch-averages-2)" rx="8"/>
                  <rect width="100%" height="100%" fill="url(#iceBlueGradient-averages-2)" rx="8"/>
                </svg>
                <span className="relative text-white font-medium text-sm">Climbs per Session</span>
                <span className="relative text-cyan-400 font-bold text-sm">{calculateAvgClimbsPerSession()}</span>
              </div>
              
              <div className="relative rounded-lg px-3 py-2 flex items-center justify-between shadow-inner overflow-hidden" style={{border: '1px solid rgba(8, 145, 178, 0.4)'}}>
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <pattern id="diagonalHatch-averages-3" patternUnits="userSpaceOnUse" width="4" height="4">
                      <path d="m0,4 l4,-4 M-1,1 l2,-2 M3,5 l2,-2" stroke="#6b7280" strokeWidth="0.6" opacity="0.4"/>
                    </pattern>
                    <linearGradient id="iceBlueGradient-averages-3" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#083344" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#155e75" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#diagonalHatch-averages-3)" rx="8"/>
                  <rect width="100%" height="100%" fill="url(#iceBlueGradient-averages-3)" rx="8"/>
                </svg>
                <span className="relative text-white font-medium text-sm">Sessions per Week</span>
                <span className="relative text-cyan-400 font-bold text-sm">{calculateSessionsPerWeek()}/wk</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Performance Trends - Combined with Tabs */}
      <section className="px-5 pt-0 pb-8 relative">
        <div className={`${!performanceTrendsUnlocked ? 'blur-sm' : ''}`}>
          <div className="bg-card border border-border rounded-col px-4 pt-4 pb-4">
            <h2 className="text-white text-base font-bold mb-3">Performance Trends</h2>
            
            {/* Chart Type Segmented Control */}
            <div className="bg-border/30 border border-border/60 rounded-lg p-1 mb-3 flex gap-1">
              {[
                { id: 'flash', label: 'Skill' },
                { id: 'grade', label: 'Intensity' },
                { id: 'volume', label: 'Volume' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTrendChart(tab.id)}
                  className={`flex-1 py-1.5 px-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${
                    activeTrendChart === tab.id
                      ? 'bg-cyan-900/60 text-cyan-400 shadow-sm'
                      : 'text-graytxt'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Chart Display */}
            <div className="flex justify-center">
              {activeTrendChart === 'volume' && (
                <TrendChart values={weeklyData.volume} labels={weekLabels} height={110} formatType="number" />
              )}
              {activeTrendChart === 'grade' && (
                <TrendChart values={weeklyData.avgGrade} labels={weekLabels} height={110} formatType="decimal" />
              )}
              {activeTrendChart === 'flash' && (
                <TrendChart values={weeklyData.flashRate} labels={weekLabels} height={110} formatType="percentage" />
              )}
            </div>

            {/* Chart Caption */}
            <div className="text-center text-xs text-graytxt mt-2">
              {activeTrendChart === 'volume' && 'Total Climbs Per Week'}
              {activeTrendChart === 'grade' && 'Average Grade Per Week'}
              {activeTrendChart === 'flash' && 'Flash Rate Per Week'}
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
