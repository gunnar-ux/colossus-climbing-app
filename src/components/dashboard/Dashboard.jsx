import { useState, useRef } from 'react';
import Header from '../ui/Header.jsx';
import FAB from '../ui/FAB.jsx';

import { getMetricAvailability, clamp } from '../../utils/index.js';

import TodaysTraining from './TodaysTraining.jsx';
import TimerCard from './TimerCard.jsx';
import SessionCard from '../sessions/SessionCard.jsx';
import EmptySessionCard from '../sessions/EmptySessionCard.jsx';


// Dashboard component extracted from dashboard HTML
// Preserves exact dark theme styling, pull-to-refresh, and metric aggregation

const Dashboard = ({ 
  userData = { totalSessions: 0, totalClimbs: 0 }, 
  sessions = [],
  profile,
  metricAvailability,
  crsData,
  loadRatioData,
  recommendedTraining,
  onNavigateToTracker,
  onNavigateToSessions,
  onNavigateToProgress,
  onNavigateToAccount,
  onViewAchievements,
  onLogout,
  onShowReadinessModal,
  onShowLoadRatioModal
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
        userProfile={profile} // Pass profile for personalized recommendations
        onShowReadinessModal={onShowReadinessModal}
        onShowLoadRatioModal={onShowLoadRatioModal}
        onNavigateToProgress={onNavigateToProgress}
      />
      
      {/* Current Session - Contextual information when active */}
      <section className="pt-4">
        <div className="mx-5 space-y-3">
          {sessions.length > 0 ? (
            <SessionCard key={0} session={sessions[0]} index={0} profile={profile} allSessions={sessions} />
          ) : (
            <EmptySessionCard title="Upcoming Session" />
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
      
      {/* Floating Action Button */}
      <FAB onClick={handleFABClick} />
    </div>
  );
};

export default Dashboard;
