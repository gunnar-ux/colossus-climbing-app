const BottomNavigation = ({ activeItem, onNavigateTo }) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      route: '/dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
      )
    },
    {
      id: 'sessions',
      label: 'Sessions',
      route: '/sessions',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" x2="21" y1="6" y2="6"/>
          <line x1="8" x2="21" y1="12" y2="12"/>
          <line x1="8" x2="21" y1="18" y2="18"/>
          <line x1="3" x2="3.01" y1="6" y2="6"/>
          <line x1="3" x2="3.01" y1="12" y2="12"/>
          <line x1="3" x2="3.01" y1="18" y2="18"/>
        </svg>
      )
    },
    {
      id: 'progress',
      label: 'Progress',
      route: '/progress',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
        </svg>
      )
    },
    {
      id: 'account',
      label: 'Account',
      route: '/account',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    }
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-30" 
      style={{
        background: 'rgba(26, 26, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: `max(env(safe-area-inset-bottom), 4px)`,
        paddingTop: '8px'
      }}
    >
      <div className="flex items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive = activeItem?.toLowerCase() === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigateTo?.(item.route)}
                className={`flex flex-col items-center justify-center px-3 py-1 min-h-[40px] transition-colors ${
                  isActive 
                    ? 'text-white' 
                    : 'text-graytxt hover:text-white'
                }`}
                aria-label={item.label}
              >
                <div className="mb-1">
                  {item.icon}
                </div>
                <span className="text-xs font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
  );
};

export default BottomNavigation;
