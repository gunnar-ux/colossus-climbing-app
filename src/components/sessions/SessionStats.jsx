// SessionStats component extracted from sessions.html
// Preserves exact dark theme styling and metrics calculations


const SessionStats = ({ sessions, onNavigateToTracker }) => {
  const totalSessions = sessions.length;
  
  // Calculate weeks active (from first to last session)
  const getWeeksActive = () => {
    if (totalSessions < 2) return totalSessions > 0 ? 1 : 0;
    
    const timestamps = sessions.map(s => s.timestamp).filter(t => t).sort((a, b) => a - b);
    if (timestamps.length < 2) return 1;
    
    const firstSession = timestamps[0];
    const lastSession = timestamps[timestamps.length - 1];
    const daysDiff = (lastSession - firstSession) / (1000 * 60 * 60 * 24);
    const weeksDiff = Math.max(daysDiff / 7, 1); // At least 1 week
    
    return Math.ceil(weeksDiff); // Round up to show full weeks
  };

  const weeksActive = getWeeksActive();

  return (
    <section className="px-5 pt-4">
      <div className="bg-card border border-border rounded-col p-4">
        <h2 className="font-bold text-base text-white mb-4">Session Overview</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalSessions}</div>
            <div className="text-sm text-graytxt">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{weeksActive}</div>
            <div className="text-sm text-graytxt">Weeks Active</div>
          </div>
        </div>
        
        {/* Track Button */}
        <button 
          onClick={onNavigateToTracker}
          className="w-full py-3 bg-white text-black rounded-lg font-semibold hover:bg-white/90 transition"
        >
          Track Climb
        </button>
      </div>
    </section>
  );
};

export default SessionStats;
