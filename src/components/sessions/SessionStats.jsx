// SessionStats component extracted from sessions.html
// Preserves exact dark theme styling and metrics calculations

const SessionStats = ({ sessions }) => {
  const totalSessions = sessions.length;
  const totalClimbs = sessions.reduce((sum, s) => sum + s.climbs, 0);
  const avgClimbsPerSession = totalSessions > 0 ? Math.round(totalClimbs / totalSessions) : 0;
  
  // Calculate avg sessions per week (based on time span of sessions)
  const avgSessionsPerWeek = () => {
    if (totalSessions < 2) return totalSessions;
    
    const timestamps = sessions.map(s => s.timestamp).filter(t => t).sort((a, b) => a - b);
    if (timestamps.length < 2) return totalSessions;
    
    const firstSession = timestamps[0];
    const lastSession = timestamps[timestamps.length - 1];
    const daysDiff = (lastSession - firstSession) / (1000 * 60 * 60 * 24);
    const weeksDiff = Math.max(daysDiff / 7, 1); // At least 1 week
    
    return Math.round((totalSessions / weeksDiff) * 10) / 10; // Round to 1 decimal
  };

  return (
    <section className="px-5 pt-6">
      <div className="bg-card border border-border rounded-col p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-white">Session Overview</h2>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{totalSessions}</div>
            <div className="text-xs text-graytxt">Total</div>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Volume Metric */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M3 3l18 18M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-white">Volume</div>
                <div className="text-xs text-graytxt">Avg climbs per session</div>
              </div>
            </div>
            <div className="text-xl font-bold text-white">{avgClimbsPerSession}</div>
          </div>

          {/* Frequency Metric */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-white">Frequency</div>
                <div className="text-xs text-graytxt">Avg sessions per week</div>
              </div>
            </div>
            <div className="text-xl font-bold text-white">{avgSessionsPerWeek()}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SessionStats;
