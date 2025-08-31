import { useState, useRef } from 'react';
import Header from '../ui/Header.jsx';
import BottomNavigation from '../ui/BottomNavigation.jsx';
import FAB from '../ui/FAB.jsx';
import { LineChart, Trend } from '../ui/Charts.jsx';

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

  // Sample 6-week data - this would come from actual user data
  const weeklyData = {
    volume: [18, 22, 19, 25, 28, 31], // Climbs per week
    avgGrade: [4.0, 4.1, 4.2, 4.3, 4.4, 4.5], // Avg grade per week
    flashRate: [48, 55, 62, 59, 65, 67] // Flash rate % per week
  };
  const weekLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];

  // Icon components for achievements
  const BoulderIcon = ({ className }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 18h18l-9-15-9 15z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 18l4-7 4 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const FlashIcon = ({ className }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const TrackIcon = ({ className }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>
  );

  // Achievement milestones
  const achievements = [
    {
      category: 'Boulders Climbed',
      icon: BoulderIcon,
      milestones: [
        { target: 50, unlocked: userData.totalClimbs >= 50, current: userData.totalClimbs },
        { target: 100, unlocked: userData.totalClimbs >= 100, current: userData.totalClimbs },
        { target: 250, unlocked: userData.totalClimbs >= 250, current: userData.totalClimbs }
      ]
    },
    {
      category: 'Climbs Flashed',
      icon: FlashIcon,
      milestones: [
        { target: 10, unlocked: userData.totalClimbs >= 15, current: Math.floor(userData.totalClimbs * 0.65) },
        { target: 25, unlocked: userData.totalClimbs >= 40, current: Math.floor(userData.totalClimbs * 0.65) },
        { target: 100, unlocked: userData.totalClimbs >= 160, current: Math.floor(userData.totalClimbs * 0.65) }
      ]
    },
    {
      category: 'Sessions Tracked',
      icon: TrackIcon,
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

  return (
    <div ref={containerRef} className="w-full h-screen overflow-y-auto hide-scrollbar relative bg-bg">

      
      <Header 
        title="PROGRESS"
        onTitleClick={handleScrollToTop}
      />

      {/* Performance Profile - Clean & Sophisticated */}
      <section className="px-5 pt-4">
        {/* Level & XP Header - Expandable */}
        <div className="bg-card border border-border rounded-col p-4 mb-4 hover:border-white/10 transition cursor-pointer" onClick={() => setIsProfileExpanded(!isProfileExpanded)}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-white text-base">Performance Profile</h3>
              <div className="text-sm text-graytxt">Level {currentLevel} Climber</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{pointsInCurrentLevel}</div>
              <div className="text-sm text-graytxt">XP</div>
            </div>
          </div>
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
              className={`transition-transform duration-200 text-graytxt ${isProfileExpanded ? 'rotate-180' : ''}`}
            >
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>

          {/* Expandable XP & Level Info */}
          {isProfileExpanded && (
            <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
              
              {/* XP Calculation */}
              <div className="border border-border/50 rounded-lg p-3">
                <div className="text-sm text-white font-semibold mb-3 text-center">XP Calculation</div>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-white font-medium mb-2">Per Climb Formula:</div>
                    <div className="text-graytxt text-xs bg-border/20 rounded p-2">
                      Base XP (10) × Grade Multiplier × Flash Bonus
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-graytxt">V0 send</span>
                      <span className="text-white">10 XP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-graytxt">V0 flash</span>
                      <span className="text-white">12 XP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-graytxt">V5 send</span>
                      <span className="text-white">60 XP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-graytxt">V5 flash</span>
                      <span className="text-white">72 XP</span>
                    </div>
                  </div>

                </div>
                <div className="text-xs text-graytxt mt-3 pt-3 border-t border-border/30 text-center">
                  Flash Bonus: 1.2× (20% extra XP for first-try sends)
                </div>
              </div>

              {/* Level Milestones */}
              <div className="border border-border/50 rounded-lg p-3">
                <div className="text-sm text-white font-semibold mb-3 text-center">Level Milestones</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-graytxt">Level 1</span>
                    <span className="text-white">0 XP</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-graytxt">Level 2</span>
                    <span className="text-white">150 XP</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-graytxt">Level 3</span>
                    <span className="text-white">350 XP</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-graytxt">Level 4</span>
                    <span className="text-white">600 XP</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-graytxt">Level 5</span>
                    <span className="text-white">900 XP</span>
                  </div>
                  <div className="text-xs text-graytxt mt-3 text-center border-t border-border/30 pt-2">
                    Each level requires progressively more XP to unlock advanced insights
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Core Metrics */}
        <div className="space-y-4">
          {/* Volume Metrics */}
          <div className="bg-card border border-border rounded-col p-4">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Volume
            </h4>
            <div className="space-y-4">
              {/* First row: Total Climbs & Total Sessions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-white">{userData.totalClimbs || 0}</div>
                  <div className="text-sm text-graytxt">Total Climbs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{userData.totalSessions || 0}</div>
                  <div className="text-sm text-graytxt">Total Sessions</div>
                </div>
              </div>
              
              {/* Second row: Climbs/Session & Sessions/Week */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {userData.totalSessions > 0 ? Math.round((userData.totalClimbs || 0) / userData.totalSessions * 10) / 10 : 0}
                  </div>
                  <div className="text-sm text-graytxt">Climbs/Session</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {(() => {
                      if (!sessions || sessions.length === 0) return 0;
                      
                      // Calculate weeks since first session
                      const validSessions = sessions.filter(s => s.timestamp);
                      if (validSessions.length === 0) return 0;
                      
                      const firstSession = validSessions.reduce((earliest, session) => 
                        session.timestamp < earliest.timestamp ? session : earliest
                      );
                      
                      const weeksSinceFirst = Math.max(1, Math.ceil((Date.now() - firstSession.timestamp) / (7 * 24 * 60 * 60 * 1000)));
                      return Math.round((userData.totalSessions || 0) / weeksSinceFirst * 10) / 10;
                    })()}
                  </div>
                  <div className="text-sm text-graytxt">Sessions/Week</div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-card border border-border rounded-col p-4">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Performance
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-white">{Math.round(Math.random() * 30 + 45)}%</div>
                <div className="text-sm text-graytxt">Flash Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">V{Math.min(Math.floor(userData.totalClimbs / 20) + 2, 8)}</div>
                <div className="text-sm text-graytxt">Peak Grade</div>
              </div>
            </div>
          </div>

          {/* Grade Distribution */}
          <div className="bg-card border border-border rounded-col p-4">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M3 3l18 18M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Grades
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-white">V{Math.max(Math.floor(userData.totalClimbs / 30) + 1, 1)}</div>
                <div className="text-sm text-graytxt">Avg Send</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">V{Math.max(Math.floor(userData.totalClimbs / 25) + 2, 2)}</div>
                <div className="text-sm text-graytxt">Avg Flash</div>
              </div>
            </div>
          </div>

          {/* Session Records */}
          <div className="bg-card border border-border rounded-col p-4">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M6 2l3 6 5-4-3 7h4l-8 6 3-7H6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Records
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-white">{Math.max(Math.floor(userData.totalClimbs / 3), 1)}</div>
                <div className="text-sm text-graytxt">Best Session</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {userData.totalClimbs > 30 ? 'Power' : 
                   userData.totalClimbs > 15 ? 'Technical' : 
                   'Balanced'}
                </div>
                <div className="text-sm text-graytxt">Top Style</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="px-5 pt-6">
        <h2 className="text-base font-bold mb-4">Achievements</h2>
        {achievements.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-6">
            <h3 className="font-semibold text-base mb-3 text-center">{category.category}</h3>
            <div className="grid grid-cols-3 gap-3">
              {category.milestones.map((milestone, i) => (
                <div key={i} className={`border rounded-xl p-4 text-center transition ${
                  milestone.unlocked 
                    ? 'border-green bg-green/10' 
                    : 'border-border bg-card'
                }`}>
                  <div className="flex justify-center mb-2">
                    <category.icon className={milestone.unlocked ? 'text-green' : 'text-gray-600'} />
                  </div>
                  <div className={`text-xl font-bold ${
                    milestone.unlocked ? 'text-green' : 'text-gray-600'
                  }`}>
                    {milestone.target}
                  </div>
                  <div className="text-sm text-graytxt mt-1">
                    {milestone.unlocked ? 'Unlocked!' : `${milestone.current}/${milestone.target}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
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
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-white/70 mx-auto mb-4">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 15v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
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
