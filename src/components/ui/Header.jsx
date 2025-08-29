const Header = ({ 
  title = "DASHBOARD", 
  onTitleClick, 
  lightMode = false,
  showCloseButton = false,
  onCloseClick
}) => {
  const handleTitleClick = () => {
    // Scroll to top when title is clicked
    if (onTitleClick) {
      onTitleClick();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const backgroundColor = lightMode ? '#EBEDEE' : '#0a0a0a';
  const textColor = lightMode ? 'text-black' : 'text-white hover:text-white/80';

  return (
    <header className="sticky top-0 z-20 pt-safe-top" style={{ 
      background: lightMode ? 'rgba(235, 237, 238, 0.95)' : 'rgba(10, 10, 10, 0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)'
    }}>
      <div className="px-10 pt-4 pb-3 flex items-center justify-between relative">
        <button 
          onClick={handleTitleClick}
          className={`text-2xl transition-colors cursor-pointer ${textColor}`}
          style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, letterSpacing: '0.02em' }}
          aria-label="Scroll to top"
        >
          {title}
        </button>
        {showCloseButton && (
          <button 
            onClick={onCloseClick}
            className="w-9 h-9 flex items-center justify-center hover:opacity-70 active:scale-95 transition" 
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={lightMode ? "black" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" x2="6" y1="6" y2="18"/>
              <line x1="6" x2="18" y1="6" y2="18"/>
            </svg>
          </button>
        )}
      </div>
      {/* Gradient fade overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none" style={{
        background: `linear-gradient(to bottom, transparent, ${lightMode ? 'rgba(235, 237, 238, 0.8)' : 'rgba(10, 10, 10, 0.8)'})`
      }}></div>
    </header>
  );
};

export default Header;
