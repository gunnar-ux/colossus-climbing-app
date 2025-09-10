import { useState, useRef } from 'react';
import Header from '../ui/Header.jsx';
import FAB from '../ui/FAB.jsx';

import { getMetricAvailability, clamp } from '../../utils/index.js';

import CalibrationCard from './CalibrationCard.jsx';
import TodaysTraining from './TodaysTraining.jsx';
import TimerCard from './TimerCard.jsx';
import ThisWeek from './ThisWeek.jsx';
import AllTime from './AllTime.jsx';
import SessionCard from '../sessions/SessionCard.jsx';


// Dashboard component extracted from dashboard HTML
// Preserves exact dark theme styling, pull-to-refresh, and metric aggregation

const Dashboard = ({ 
  userData = { totalSessions: 0, totalClimbs: 0 }, 
  sessions = [],
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
  onLogout
}) => {
  const avail = metricAvailability || getMetricAvailability(userData.totalSessions, userData.totalClimbs);

  
  // Use real CRS score or fallback to hardcoded for demo
  const currentScore = crsData ? crsData.score : 55;
  const currentLoadRatio = loadRatioData ? loadRatioData.ratio : 1.2;
  
  // Calculate peak grade from actual session data
  const calculatePeakGrade = (sessions) => {
    if (!sessions || sessions.length === 0) return null;
    
    let highestGrade = 0;
    sessions.forEach(session => {
      if (session.climbList && session.climbList.length > 0) {
        session.climbList.forEach(climb => {
          const gradeNum = parseInt(climb.grade.replace('V', ''));
          if (gradeNum > highestGrade) {
            highestGrade = gradeNum;
          }
        });
      }
    });
    
    return highestGrade > 0 ? `V${highestGrade}` : null;
  };
  
  const peakGrade = calculatePeakGrade(sessions);
  
  // Pull-to-refresh disabled to prevent data loss since sessions are stored locally
  const containerRef = useRef(null);
  const pull = 0;

  const handleStartTraining = () => {
    onNavigateToTracker?.();
  };

  const handleFABClick = () => {
    onNavigateToTracker?.();
  };

  const handleViewAchievements = () => {
    // Navigate to progress page instead of a separate achievements view
    onNavigateToProgress?.();
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
      
      <TodaysTraining 
        score={77} 
        loadRatio={1.0} 
        sessions={userData.totalSessions}
        crsData={userData.totalSessions >= 3 ? crsData : null}
        loadRatioData={userData.totalSessions >= 5 ? loadRatioData : null}
        recommendation={recommendedTraining}
        onStartTraining={handleStartTraining}
      />
      
      {/* Current Session - positioned after TodaysTraining for context */}
      <section className="pt-4">
        <div className="mx-5 space-y-3">
          {sessions.length > 0 ? (
            <SessionCard key={0} session={sessions[0]} index={0} />
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
      <TimerCard />
      <ThisWeek available={avail.weeklyTrends} currentSessions={userData.totalSessions} />
      <AllTime 
        available={avail.allMetrics} 
        onViewAchievements={handleViewAchievements}
        userData={userData}
        sessions={sessions}
        peakGrade={peakGrade}
      />
      
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
