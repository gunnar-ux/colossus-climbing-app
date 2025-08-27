import { useState, useRef } from 'react';
import Header from '../ui/Header.jsx';
import NavigationMenu from '../ui/NavigationMenu.jsx';
import FAB from '../ui/FAB.jsx';
import SessionStats from './SessionStats.jsx';
import SessionCard from './SessionCard.jsx';


// SessionsPage component extracted from sessions.html
// Preserves exact dark theme styling, layout, and interactive behavior

const SessionsPage = ({ sessions = [], onNavigateBack, onNavigateToTracker, onNavigateToProgress }) => {
  const [menuOpen, setMenuOpen] = useState(false);
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
    <div ref={containerRef} className="w-full h-screen overflow-y-auto hide-scrollbar relative">
      {/* Spacing to match dashboard pull-to-refresh indicator position */}
      <div className="h-10" />
      
      <Header 
        title="SESSIONS"
        showBackButton={true}
        onBackClick={handleBackClick}
        onMenuClick={() => setMenuOpen(true)} 
        onTitleClick={handleScrollToTop}
      />
      
      <SessionStats sessions={sessions} />
      
      <section className="pt-4 pb-24">
        <div className="mx-5 space-y-3">
          {sessions.map((session, i) => (
            <SessionCard key={i} session={session} index={i} />
          ))}
        </div>
      </section>

      <FAB onClick={handleFABClick} />
      
      <NavigationMenu 
        isOpen={menuOpen} 
        onClose={() => setMenuOpen(false)}
        onNavigateTo={(route) => {
          if (route === '/track') {
            onNavigateToTracker?.();
          } else if (route === '/dashboard') {
            onNavigateBack?.();
          } else if (route === '/progress') {
            onNavigateToProgress?.();
          } else if (route === '/sessions') {
            // Already on sessions
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
        activeItem="Sessions"
      />
    </div>
  );
};

export default SessionsPage;
