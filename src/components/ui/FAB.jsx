const FAB = ({ onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <button 
      onClick={handleClick} 
      className="fixed z-40 w-14 h-14 rounded-full shadow-lg shadow-black/50 bg-white text-black border border-border flex items-center justify-center active:scale-95 transition"
      style={{
        bottom: '90px',
        right: '20px',
        maxWidth: '430px'
      }}
    >
      <span className="text-2xl font-light">+</span>
    </button>
  );
};

export default FAB;
