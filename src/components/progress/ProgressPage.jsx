import { useState, useRef } from 'react';
import Header from '../ui/Header.jsx';
import NavigationMenu from '../ui/NavigationMenu.jsx';
import { LineChart, Trend } from '../ui/Charts.jsx';

// Progress & Achievements page component
// Displays climbing progress, achievement milestones, and performance trends

const ProgressPage = ({ userData, sessions, onNavigateBack, onNavigateToTracker, onNavigateToSessions }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef(null);

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

  // Check if user has reached 6-week mark for performance trends unlock
  const checkPerformanceTrendsUnlock = (sessions) => {
    if (!sessions || sessions.length === 0) return false;
    
    // Find the earliest session timestamp
    const validSessions = sessions.filter(s => s.timestamp);
    if (validSessions.length === 0) return false;
    
    const earliestSession = validSessions.reduce((earliest, session) => 
      session.timestamp < earliest.timestamp ? session : earliest
    );
    
    const sixWeeksAgo = Date.now() - (6 * 7 * 24 * 60 * 60 * 1000); // 6 weeks in milliseconds
    return earliestSession.timestamp <= sixWeeksAgo;
  };

  const performanceTrendsUnlocked = checkPerformanceTrendsUnlock(sessions);

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

  // Calculate level and experience points
  const totalPoints = Math.floor(userData.totalClimbs * 1.5 + userData.totalSessions * 20);
  const currentLevel = Math.floor(totalPoints / 150) + 1;
  const nextLevelPoints = currentLevel * 150;
  const pointsInCurrentLevel = totalPoints % 150;

  return (
    <div ref={containerRef} className="w-full h-screen overflow-y-auto hide-scrollbar relative">
      {/* Spacing to match dashboard layout */}
      <div className="h-10" />
      
      <Header 
        title="PROGRESS"
        showBackButton={true}
        onBackClick={handleBackClick}
        onMenuClick={() => setMenuOpen(true)} 
        onTitleClick={handleScrollToTop}
      />

      {/* Level Progress Card - Top Priority */}
      <section className="px-5 pt-4">
        <div className="bg-card border border-border rounded-col p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">Level Progress</h3>
            <span className="text-xs text-graytxt">Level {currentLevel}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-4xl font-extrabold text-white min-w-[48px]">{currentLevel}</div>
            <div className="flex-1">
              <div className="w-full h-3 bg-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white" 
                  style={{width: `${(pointsInCurrentLevel / 150) * 100}%`}}
                ></div>
              </div>
              <div className="mt-1 text-xs text-graytxt">
                {150 - pointsInCurrentLevel} points to Level {currentLevel + 1}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics Overview */}
      <section className="px-5">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-card border border-border rounded-col p-3 text-center">
            <div className="text-xs text-graytxt mb-1">Total Sends</div>
            <div className="text-2xl font-bold text-white">{userData.totalClimbs || 0}</div>
          </div>
          <div className="bg-card border border-border rounded-col p-3 text-center">
            <div className="text-xs text-graytxt mb-1">Peak Grade</div>
            <div className="text-2xl font-bold text-white">V{Math.min(Math.floor(userData.totalClimbs / 20) + 2, 8)}</div>
          </div>
          <div className="bg-card border border-border rounded-col p-3 text-center">
            <div className="text-xs text-graytxt mb-1">Sessions</div>
            <div className="text-2xl font-bold text-white">{userData.totalSessions || 0}</div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="px-5 pt-6">
        <h2 className="text-lg font-semibold mb-4">Achievements</h2>
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
                  <div className="text-xs text-graytxt mt-1">
                    {milestone.unlocked ? 'Unlocked!' : `${milestone.current}/${milestone.target}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Performance Graphs */}
      <section className="px-5 pt-6 space-y-4 pb-24 relative">
        <h2 className="text-lg font-semibold mb-4">Performance Trends</h2>
        
        <div className={`space-y-4 ${!performanceTrendsUnlocked ? 'blur-sm pointer-events-none' : ''}`}>
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
            <div className="bg-card border border-border rounded-col p-6 mx-5 text-center shadow-lg">
              <div className="text-white font-semibold mb-2">Performance Trends Locked</div>
              <div className="text-sm text-graytxt mb-3">
                Continue training for 6 weeks to unlock detailed performance analytics
              </div>
              <div className="flex items-center justify-center gap-1 text-xs text-graytxt">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-graytxt">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 13v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Track climbing sessions to build your profile
              </div>
            </div>
          </div>
        )}
      </section>
      
      <NavigationMenu 
        isOpen={menuOpen} 
        onClose={() => setMenuOpen(false)}
        onNavigateTo={(route) => {
          if (route === '/track') {
            onNavigateToTracker?.();
          } else if (route === '/dashboard') {
            onNavigateBack?.();
          } else if (route === '/sessions') {
            onNavigateToSessions?.();
          } else if (route === '/progress') {
            // Already on progress
          }
        }}
        onDevAction={(action) => {
          if (action === 'reset-onboarding') {
            localStorage.clear();
            window.location.reload();
          } else if (action === 'show-signup') {
            localStorage.clear();
            window.location.href = '/';
          } else if (action === 'show-welcome') {
            localStorage.setItem('colossus-user-data', JSON.stringify({
              name: 'Test User', hasCompletedOnboarding: true, hasSeenWelcomeTour: false
            }));
            window.location.href = '/';
          }
        }}
        activeItem="Progress"
      />
    </div>
  );
};

export default ProgressPage;
