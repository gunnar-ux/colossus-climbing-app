import { useState, useRef, useEffect } from 'react';
import { HomeIcon, ListIcon, TrendingIcon, UserIcon } from './Icons';

const MobileBottomNav = ({ activeRoute, onNavigate }) => {
  const navRef = useRef(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: <HomeIcon /> },
    { id: 'sessions', label: 'Sessions', icon: <ListIcon /> },
    { id: 'progress', label: 'Progress', icon: <TrendingIcon /> },
    { id: 'account', label: 'Account', icon: <UserIcon /> }
  ];

  const handleNavClick = (itemId) => {
    // Don't do anything if already on this page
    if (activeRoute === itemId) return;
    
    // Don't allow navigation during transition
    if (isTransitioning) return;
    
    // Start transition
    setIsTransitioning(true);
    
    // Small delay to show button feedback before navigation
    requestAnimationFrame(() => {
      onNavigate(itemId);
      
      // Reset transition state after navigation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    });
  };

  // Prevent layout shift on mount
  useEffect(() => {
    if (navRef.current) {
      navRef.current.style.height = `${navRef.current.offsetHeight}px`;
    }
  }, []);

  return (
    <>
      {/* Spacer to prevent content from going under nav */}
      <div className="h-16 pb-safe-bottom" />
      
      {/* The actual navigation */}
      <nav 
        ref={navRef}
        className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          transform: 'translate3d(0,0,0)', // Force layer creation
          backfaceVisibility: 'hidden'
        }}
      >
        <div className="flex h-16">
          {navItems.map((item) => {
            const isActive = activeRoute === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                disabled={isTransitioning}
                className={`
                  flex-1 flex flex-col items-center justify-center gap-1
                  transition-all duration-200 ease-out
                  ${isActive ? 'text-white' : 'text-gray-500'}
                  ${isTransitioning ? 'pointer-events-none' : ''}
                  active:scale-95
                `}
              >
                <div className={`
                  transition-transform duration-200
                  ${isActive ? 'scale-110' : 'scale-100'}
                `}>
                  {item.icon}
                </div>
                <span className={`
                  text-xs font-medium transition-all duration-200
                  ${isActive ? 'opacity-100' : 'opacity-70'}
                `}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
