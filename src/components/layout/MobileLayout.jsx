import { useState, useEffect, useRef } from 'react';
import MobileBottomNav from '../ui/MobileBottomNav';

const MobileLayout = ({ 
  children, 
  currentPage, 
  onNavigate, 
  showNav = true 
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedPage, setDisplayedPage] = useState(currentPage);
  const contentRef = useRef(null);

  useEffect(() => {
    if (currentPage !== displayedPage) {
      // Start transition
      setIsTransitioning(true);
      
      // Small delay for exit animation
      setTimeout(() => {
        setDisplayedPage(currentPage);
        
        // Reset scroll position
        if (contentRef.current) {
          contentRef.current.scrollTop = 0;
        }
        
        // End transition after enter animation
        setTimeout(() => {
          setIsTransitioning(false);
        }, 200);
      }, 150);
    }
  }, [currentPage, displayedPage]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Main content area */}
      <div 
        ref={contentRef}
        className={`
          absolute inset-0 overflow-y-auto overflow-x-hidden
          transition-all duration-200 ease-out
          ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
          ${showNav ? 'pb-16' : ''}
        `}
        style={{
          paddingBottom: showNav ? 'calc(4rem + env(safe-area-inset-bottom))' : 0,
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {children}
      </div>
      
      {/* Navigation */}
      {showNav && (
        <MobileBottomNav 
          activeRoute={currentPage}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};

export default MobileLayout;
