const Header = ({ onMenuClick, title = "DASHBOARD", showBackButton = false, onBackClick, onTitleClick }) => {
  const handleTitleClick = () => {
    // Scroll to top when title is clicked
    if (onTitleClick) {
      onTitleClick();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-bg/95 backdrop-blur-md supports-[backdrop-filter]:bg-bg/80 border-b border-border/20 safe-area-inset-top">
      <div className="px-5 pt-6 pb-4 flex items-center justify-between relative">
        {showBackButton ? (
          <div className="flex items-center gap-3">
            <button 
              onClick={onBackClick}
              className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center hover:bg-white/10 active:scale-95 transition" 
              aria-label="Back"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
            <button 
              onClick={handleTitleClick}
              className="text-xl font-semibold hover:text-white/80 transition-colors cursor-pointer"
              aria-label="Scroll to top"
            >
              {title}
            </button>
          </div>
        ) : (
          <button 
            onClick={handleTitleClick}
            className="text-xl font-semibold hover:text-white/80 transition-colors cursor-pointer"
            aria-label="Scroll to top"
          >
            {title}
          </button>
        )}
        <button 
          onClick={onMenuClick} 
          className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center hover:bg-white/10 active:scale-95 transition" 
          aria-label="Menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" x2="21" y1="6" y2="6"/>
            <line x1="3" x2="21" y1="12" y2="12"/>
            <line x1="3" x2="21" y1="18" y2="18"/>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
