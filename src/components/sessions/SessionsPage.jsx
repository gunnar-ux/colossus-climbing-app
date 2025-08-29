import { useState, useRef } from 'react';
import Header from '../ui/Header.jsx';
import BottomNavigation from '../ui/BottomNavigation.jsx';
import FAB from '../ui/FAB.jsx';
import SessionStats from './SessionStats.jsx';
import SessionCard from './SessionCard.jsx';


// SessionsPage component - standardized with consistent header behavior

const SessionsPage = ({ sessions = [], onNavigateBack, onNavigateToTracker, onNavigateToProgress, onNavigateToDashboard, onNavigateToAccount }) => {
  const containerRef = useRef(null);

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
          {sessions.map((session, i) => (
            <SessionCard key={i} session={session} index={i} />
          ))}
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
