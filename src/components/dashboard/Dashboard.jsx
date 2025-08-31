import { useState, useRef } from 'react';
import Header from '../ui/Header.jsx';
import BottomNavigation from '../ui/BottomNavigation.jsx';
import FAB from '../ui/FAB.jsx';

import { getMetricAvailability, clamp } from '../../utils/index.js';

import CalibrationCard from './CalibrationCard.jsx';
import Today from './Today.jsx';
import TimerCard from './TimerCard.jsx';
import RecommendedTraining from './RecommendedTraining.jsx';
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
      
      <Today 
        score={currentScore} 
        loadRatio={currentLoadRatio} 
        sessions={userData.totalSessions}
        crsData={crsData}
        loadRatioData={loadRatioData}
      />
      <TimerCard />
      <RecommendedTraining 
        onStartTraining={handleStartTraining}
        recommendation={recommendedTraining}
        sessions={userData.totalSessions}
      />
      <ThisWeek available={avail.weeklyTrends} currentSessions={userData.totalSessions} />
      <AllTime 
        available={avail.allMetrics} 
        onViewAchievements={handleViewAchievements}
        userData={userData}
        sessions={sessions}
        peakGrade={peakGrade}
      />
      
      {/* Recent Sessions */}
      <section className="pt-4">
        <div className="mx-5 space-y-3">
          {sessions.slice(0, 3).map((session, i) => (
            <SessionCard key={i} session={session} index={i} />
          ))}
        </div>
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
        activeItem="Dashboard"
        onNavigateTo={(route) => {
          if (route === '/dashboard') {
            // Already on dashboard
          } else if (route === '/sessions') {
            onNavigateToSessions?.();
          } else if (route === '/progress') {
            onNavigateToProgress?.();
          } else if (route === '/account') {
            onNavigateToAccount?.();
          }
        }}
      />
    </div>
  );
};

export default Dashboard;
