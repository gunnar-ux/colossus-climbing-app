// SessionStats component extracted from sessions.html
// Preserves exact dark theme styling and metrics calculations

const SessionStats = ({ sessions, onNavigateToTracker }) => {
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

  // Calculate top style across all sessions
  const getTopStyle = () => {
    if (!sessions || sessions.length === 0) return '--';
    
    const styleCounts = {};
    
    sessions.forEach(session => {
      if (session.climbList && session.climbList.length > 0) {
        session.climbList.forEach(climb => {
          if (climb.style) {
            styleCounts[climb.style] = (styleCounts[climb.style] || 0) + 1;
          }
        });
      }
    });
    
    if (Object.keys(styleCounts).length === 0) return '--';
    
    const topStyle = Object.entries(styleCounts).reduce((a, b) => 
      styleCounts[a[0]] > styleCounts[b[0]] ? a : b
    )[0];
    
    return topStyle;
  };

  // Calculate top angle across all sessions
  const getTopAngle = () => {
    if (!sessions || sessions.length === 0) return '--';
    
    const angleCounts = {};
    
    sessions.forEach(session => {
      if (session.climbList && session.climbList.length > 0) {
        session.climbList.forEach(climb => {
          if (climb.angle) {
            angleCounts[climb.angle] = (angleCounts[climb.angle] || 0) + 1;
          }
        });
      }
    });
    
    if (Object.keys(angleCounts).length === 0) return '--';
    
    const topAngle = Object.entries(angleCounts).reduce((a, b) => 
      angleCounts[a[0]] > angleCounts[b[0]] ? a : b
    )[0];
    
    return topAngle;
  };

  return (
    <section className="px-5 pt-4">
      <div className="bg-card border border-border rounded-col p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-base text-white">Session Overview</h2>
            <div className="text-sm text-graytxt">Total Sessions</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{totalSessions}</div>
            <div className="text-sm text-graytxt">Total</div>
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Volume Metric */}
          <div className="border border-border/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M3 3l18 18M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Volume</div>
                  <div className="text-sm text-graytxt">Avg climbs per session</div>
                </div>
              </div>
              <div className="text-xl font-bold text-white">{avgClimbsPerSession}</div>
            </div>
          </div>

          {/* Frequency Metric */}
          <div className="border border-border/50 rounded-lg p-3">
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
                  <div className="text-sm text-graytxt">Avg sessions per week</div>
                </div>
              </div>
              <div className="text-xl font-bold text-white">{avgSessionsPerWeek()}</div>
            </div>
          </div>

          {/* Top Style Metric */}
          <div className="border border-border/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Top Style</div>
                  <div className="text-sm text-graytxt">Most common style</div>
                </div>
              </div>
              <div className="text-xl font-bold text-white">{getTopStyle()}</div>
            </div>
          </div>

          {/* Top Angle Metric */}
          <div className="border border-border/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M3 21l18-18M3 21v-6l6-6 6 6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Top Angle</div>
                  <div className="text-sm text-graytxt">Most common angle</div>
                </div>
              </div>
              <div className="text-xl font-bold text-white">{getTopAngle()}</div>
            </div>
          </div>
        </div>
        
        {/* Track Button */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <button 
            onClick={onNavigateToTracker}
            className="w-full py-3 bg-white text-black rounded-lg font-semibold hover:bg-white/90 transition"
          >
            Track
          </button>
        </div>
      </div>
    </section>
  );
};

export default SessionStats;
