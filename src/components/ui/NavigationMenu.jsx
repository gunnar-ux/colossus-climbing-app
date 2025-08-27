const NavigationMenu = ({ isOpen, onClose, onNavigateTo, onLogout, onViewTour, activeItem = 'Dashboard' }) => {
  if (!isOpen) return null;

  const menuItems = [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Sessions', route: '/sessions', icon: 'list' },
    { label: 'Progress', route: '/progress', icon: 'trophy' },
    { label: 'Track Climb', route: '/track', icon: 'plus' },
    { type: 'separator' },
    { label: 'View Tour', action: 'view-tour', icon: 'info' },
    { label: 'Account', route: '/account', icon: 'user' },
    { label: 'Logout', action: 'logout', icon: 'logout' }
  ];

  const getIcon = (iconName) => {
    switch(iconName) {
      case 'home':
        return <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>;
      case 'list':
        return <><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></>;
      case 'trophy':
        return <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17a2 2 0 0 0 4 0v-2.34"/></>;
      case 'plus':
        return <><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></>;
      case 'user':
        return <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>;
      case 'info':
        return <><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></>;
      case 'logout':
        return <><path d="m9 21 5-5-5-5"/><path d="M20 16h-7a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h7"/></>;
      default:
        return null;
    }
  };

  const handleNavigation = (item, e) => {
    e.preventDefault();
    
    if (item.disabled || item.type === 'separator') {
      return; // Don't close menu for disabled items or separators
    }
    
    onClose();
    
    if (item.route) {
      // Navigate to React Router route
      onNavigateTo?.(item.route);
    } else if (item.action === 'logout') {
      // Handle logout action
      onLogout?.();
    } else if (item.action === 'view-tour') {
      // Handle view tour action
      onViewTour?.();
    }
  };

  return (
    <>
      {/* Full screen overlay backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 z-50"
        onClick={onClose}
        style={{ left: 0, right: 0, top: 0, bottom: 0 }}
      />
      
      {/* Menu positioned relative to the app container */}
      <div className="fixed z-50" style={{ 
        top: '80px', 
        right: '20px',
        maxWidth: '430px',
        width: 'calc(100vw - 40px)'
      }}>
        <div className="bg-card border border-border rounded-col p-4 min-w-[200px] max-w-[250px] ml-auto mr-1">
          <div className="space-y-2">
            {menuItems.map((item, i) => {
              if (item.type === 'separator') {
                return <div key={i} className="border-t border-border/50 my-2" />;
              }
              
              return (
                <button
                  key={i}
                  onClick={(e) => handleNavigation(item, e)}
                  disabled={item.disabled}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition text-left ${
                    item.disabled
                      ? 'text-white/40 cursor-default'
                      : item.label === activeItem 
                        ? 'bg-white text-black font-medium' 
                        : item.action === 'logout'
                          ? 'text-red-400 hover:bg-red-500/10'
                          : 'text-white hover:bg-white/10'
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {getIcon(item.icon)}
                  </svg>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default NavigationMenu;
