import { useState, useRef } from 'react';
import Header from '../ui/Header.jsx';
import BottomNavigation from '../ui/BottomNavigation.jsx';
import FAB from '../ui/FAB.jsx';
import SessionStats from './SessionStats.jsx';
import SessionCard from './SessionCard.jsx';
import TimerCard from '../dashboard/TimerCard.jsx';


// Simple Placeholder Session Card - Visual Spaceholder Only
const PlaceholderSessionCard = () => {
  return (
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
  );
};

// SessionsPage component - standardized with consistent header behavior

const SessionsPage = ({ sessions = [], onNavigateBack, onNavigateToTracker, onNavigateToProgress, onNavigateToDashboard, onNavigateToAccount }) => {
  const containerRef = useRef(null);
  
  // Create calibration placeholder sessions (first 5 for calibration)
  const createCalibrationPlaceholders = () => {
    const placeholders = [];
    const actualSessionCount = sessions.length;
    const maxPlaceholders = 5;
    
    for (let i = 0; i < maxPlaceholders; i++) {
      const isCompleted = i < actualSessionCount;
      const sessionNumber = i + 1;
      
      placeholders.push({
        id: `placeholder-${i}`,
        date: `Session ${sessionNumber}`,
        isPlaceholder: true,
        isCompleted: isCompleted,
        isActive: i === actualSessionCount && actualSessionCount < maxPlaceholders,
        duration: '-- min',
        climbs: '--',
        medianGrade: '--',
        style: 'Mixed',
        timestamp: Date.now() + i * 1000
      });
    }
    
    return placeholders;
  };

  const handleBackClick = () => {
    onNavigateBack?.();
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
        title="SESSIONS"
        onTitleClick={handleScrollToTop}
      />
      
      <SessionStats sessions={sessions} onNavigateToTracker={onNavigateToTracker} />
      
      <TimerCard />
      
      <section className="pt-4 pb-20">
        <div className="mx-5 space-y-3">
          {/* Sort sessions by timestamp (most recent first) and show them */}
          {[...sessions]
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
            .map((session, i) => (
              <SessionCard key={i} session={session} index={i} />
            ))}
          
          {/* Show calibration placeholders if less than 5 sessions - Simple visual spaceholders */}
          {sessions.length < 5 && (
            <>
              {Array.from({ length: 5 - sessions.length }, (_, i) => (
                <PlaceholderSessionCard 
                  key={`placeholder-${sessions.length + i + 1}`}
                />
              ))}
            </>
          )}

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
        activeItem="Sessions"
        onNavigateTo={(route) => {
          if (route === '/dashboard') {
            onNavigateToDashboard?.();
          } else if (route === '/sessions') {
            // Already on sessions
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

export default SessionsPage;

