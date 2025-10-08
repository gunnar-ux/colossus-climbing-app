import { useState, useRef } from 'react';
import Header from '../ui/Header.jsx';
import FAB from '../ui/FAB.jsx';

import { getMetricAvailability, clamp } from '../../utils/index.js';

import CalibrationCard from './CalibrationCard.jsx';
import TodaysTraining from './TodaysTraining.jsx';
import TimerCard from './TimerCard.jsx';
import SessionCard from '../sessions/SessionCard.jsx';


// Dashboard component extracted from dashboard HTML
// Preserves exact dark theme styling, pull-to-refresh, and metric aggregation

const Dashboard = ({ 
  userData = { totalSessions: 0, totalClimbs: 0 }, 
  sessions = [],
  profile,
  metricAvailability,
  isCalibrationDismissed = false,
  onCalibrationDismiss,
  crsData,
  loadRatioData,
  recommendedTraining,
  onNavigateToTracker,
  onNavigateToSessions,
  onNavigateToProgress,
  onNavigateToAccount,
  onViewAchievements,
  onLogout,
  onNavigateToReadinessInfo,
  onNavigateToLoadRatioInfo
}) => {
  const avail = metricAvailability || getMetricAvailability(userData.totalSessions, userData.totalClimbs);

  
  // Use real CRS score or fallback to hardcoded for demo
  const currentScore = crsData ? crsData.score : 55;
  const currentLoadRatio = loadRatioData ? loadRatioData.ratio : 1.2;
  
  // Calculate peak grade from actual session data
  
  // Pull-to-refresh disabled to prevent data loss since sessions are stored locally
  const containerRef = useRef(null);
  const pull = 0;

  const handleStartTraining = () => {
    onNavigateToTracker?.();
  };

  const handleFABClick = () => {
    onNavigateToTracker?.();
  };


  const handleScrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div ref={containerRef} className="w-full h-screen overflow-y-auto hide-scrollbar relative bg-bg">
      <Header 
        title="DASHBOARD"
        onTitleClick={handleScrollToTop}
      />
      
      {!isCalibrationDismissed && (userData.totalSessions < 5 || userData.totalClimbs < 50) && (
        <CalibrationCard 
          sessions={userData.totalSessions} 
          climbs={userData.totalClimbs} 
          onDismissCalibration={onCalibrationDismiss}
        />
      )}
      
      {/* Hero Card: Today's Readiness - Primary decision making */}
      <TodaysTraining 
        score={77} 
        loadRatio={1.0} 
        sessions={sessions}
        crsData={userData.totalSessions >= 3 ? crsData : null}
        loadRatioData={userData.totalSessions >= 5 ? loadRatioData : null}
        recommendation={recommendedTraining}
        onStartTraining={handleStartTraining}
        userData={userData}
        onNavigateToReadinessInfo={onNavigateToReadinessInfo}
        onNavigateToLoadRatioInfo={onNavigateToLoadRatioInfo}
        onNavigateToProgress={onNavigateToProgress}
      />
      
      {/* Current Session - Contextual information when active */}
      <section className="pt-4">
        <div className="mx-5 space-y-3">
          {sessions.length > 0 ? (
            <SessionCard key={0} session={sessions[0]} index={0} profile={profile} allSessions={sessions} />
          ) : (
            // Empty state session card - matches sessions page placeholder style
            <div className="bg-card/50 border border-border/60 rounded-col px-4 pt-4 pb-3 opacity-80">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-base text-graytxt">
                  Upcoming Session
                </div>
                <div className="text-sm text-graytxt/80">
                  -- Climbs
                </div>
              </div>
              <div className="text-sm text-graytxt/80">
                Peak: -- • Flash Rate: --% • XP: --
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Training Timer - Preparation for session */}
      <TimerCard />
      
      {/* Bottom Logo Section - Whoop Style */}
      <section className="pt-2 pb-32 flex items-center justify-center">
        <img 
          src="/asset8.svg" 
          alt="POGO" 
          className="w-16 h-16"
        />
      </section>
      
      <FAB onClick={handleFABClick} />
    </div>
  );
};

export default Dashboard;
