import { HomeIcon, ListIcon, TrendingIcon, UserIcon } from './Icons';

const BottomNavigation = ({ activeItem, onNavigateTo }) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      route: '/dashboard',
      icon: <HomeIcon />
    },
    {
      id: 'sessions',
      label: 'Sessions',
      route: '/sessions',
      icon: <ListIcon />
    },
    {
      id: 'progress',
      label: 'Progress',
      route: '/progress',
      icon: <TrendingIcon />
    },
    {
      id: 'account',
      label: 'Account',
      route: '/account',
      icon: <UserIcon />
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
