// Compact Session Overview - Single row with key stats
// Replaces the large SessionStats card with useful metrics

const CompactOverview = ({ sessions = [] }) => {
  const totalSessions = sessions.length;
  
  // Calculate average climbs per session
  const getAvgClimbsPerSession = () => {
    if (totalSessions === 0) return 0;
    const totalClimbs = sessions.reduce((sum, session) => {
      return sum + (session.climbs || 0);
    }, 0);
    return Math.round(totalClimbs / totalSessions * 10) / 10; // Round to 1 decimal
  };

  // Calculate sessions per week (last 4 weeks)
  const getSessionsPerWeek = () => {
    if (totalSessions === 0) return 0;
    
    const now = Date.now();
    const fourWeeksAgo = now - (4 * 7 * 24 * 60 * 60 * 1000); // 4 weeks in ms
    
    const recentSessions = sessions.filter(session => {
      return session.timestamp && session.timestamp >= fourWeeksAgo;
    });
    
    if (recentSessions.length === 0) return 0;
    
    // Calculate weeks span
    const timestamps = recentSessions.map(s => s.timestamp).sort((a, b) => a - b);
    const firstSession = timestamps[0];
    const lastSession = timestamps[timestamps.length - 1];
    const daysDiff = Math.max((lastSession - firstSession) / (1000 * 60 * 60 * 24), 7); // At least 1 week
    const weeksDiff = daysDiff / 7;
    
    return Math.round(recentSessions.length / weeksDiff * 10) / 10; // Round to 1 decimal
  };

  const avgClimbs = getAvgClimbsPerSession();
  const sessionsPerWeek = getSessionsPerWeek();

  return (
    <section className="px-5 pt-2">
      <div className="px-5 pt-2 pb-3">
        <div className="space-y-2">
          <div className="bg-border/30 border border-border/60 rounded-lg px-3 py-2 flex items-center justify-between shadow-inner">
            <span className="text-white font-medium text-sm">Total Sessions</span>
            <span className="text-white text-sm">{totalSessions}</span>
          </div>
          
          <div className="bg-border/30 border border-border/60 rounded-lg px-3 py-2 flex items-center justify-between shadow-inner">
            <span className="text-white font-medium text-sm">Climbs/Session</span>
            <span className="text-white text-sm">{avgClimbs}</span>
          </div>
          
          <div className="bg-border/30 border border-border/60 rounded-lg px-3 py-2 flex items-center justify-between shadow-inner">
            <span className="text-white font-medium text-sm">Sessions/Week</span>
            <span className="text-white text-sm">{sessionsPerWeek}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompactOverview;
