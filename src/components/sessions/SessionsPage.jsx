import { useRef } from 'react';
import Header from '../ui/Header.jsx';
import BottomNavigation from '../ui/BottomNavigation.jsx';
import FAB from '../ui/FAB.jsx';
import SessionHistory from './SessionHistory.jsx';
import TimerCard from '../dashboard/TimerCard.jsx';



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
      
        {/* Session History - filtered session list */}
      <SessionHistory sessions={sessions} />

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

