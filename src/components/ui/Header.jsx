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

  const backgroundColor = lightMode ? 'white' : '#0a0a0a';
  const textColor = lightMode ? 'text-black' : 'text-white hover:text-white/80';

  return (
    <header className="sticky top-0 z-20 safe-area-inset-top" style={{ backgroundColor }}>
      <div className="px-5 pt-4 pb-3 flex items-center justify-center relative">
        {showCloseButton && (
          <button 
            onClick={onCloseClick}
            className="absolute left-5 w-9 h-9 flex items-center justify-center hover:opacity-70 active:scale-95 transition" 
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={lightMode ? "black" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" x2="6" y1="6" y2="18"/>
              <line x1="6" x2="18" y1="6" y2="18"/>
            </svg>
          </button>
        )}
        <button 
          onClick={handleTitleClick}
          className={`text-xl font-semibold transition-colors cursor-pointer ${textColor}`}
          aria-label="Scroll to top"
        >
          {title}
        </button>
      </div>
    </header>
  );
};

export default Header;
