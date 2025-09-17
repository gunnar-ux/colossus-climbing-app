const FAB = ({ onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <button 
      onClick={handleClick} 
      className="fixed z-40 w-14 h-14 rounded-full shadow-lg shadow-cyan-900/15 text-cyan-400 border border-cyan-400 flex items-center justify-center active:scale-95 transition"
      style={{
        bottom: `calc(env(safe-area-inset-bottom) + 70px)`,
        right: '20px',
        background: 'linear-gradient(135deg, #141e24 0%, #0a0b0a 100%)'
      }}
    >
      <span className="text-2xl font-light">+</span>
    </button>
  );
};

export default FAB;
