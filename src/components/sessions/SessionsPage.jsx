import { useState, useRef } from 'react';
import Header from '../ui/Header.jsx';
import BottomNavigation from '../ui/BottomNavigation.jsx';
import FAB from '../ui/FAB.jsx';
import SessionStats from './SessionStats.jsx';
import SessionCard from './SessionCard.jsx';


// Simple Placeholder Session Card - Visual Spaceholder Only
const PlaceholderSessionCard = ({ sessionNumber }) => {
  return (
    <div className="bg-card/30 border border-border/40 rounded-col px-4 pt-4 pb-3 opacity-60">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-base text-graytxt/80">
          Session {sessionNumber}
        </div>
        <div className="text-sm text-graytxt/60">
          Pending
        </div>
      </div>
      <div className="text-sm text-graytxt/60">
        <span>-- climbs</span> • -- median • Mixed focus
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
      
      <SessionStats sessions={sessions} />
      
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
                  sessionNumber={sessions.length + i + 1}
                />
              ))}
            </>
          )}
          
          {/* Empty state with CTA only when no sessions exist */}
          {sessions.length === 0 && (
            <div className="text-center py-8 mb-4">
              <div className="mb-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-graytxt/50 mx-auto">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Start Your Climbing Journey</h3>
              <p className="text-graytxt mb-4">Track your first session to begin calibration</p>
              <button 
                onClick={onNavigateToTracker}
                className="px-6 py-2 bg-blue text-white rounded-lg font-medium hover:bg-blue/90 transition"
              >
                Start First Session
              </button>
            </div>
          )}
        </div>
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

