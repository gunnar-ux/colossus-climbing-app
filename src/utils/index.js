// Utility functions extracted from HTML prototype

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export const readinessColor = (v) => (v < 45 ? 'bg-red' : v < 77 ? 'bg-blue' : 'bg-green');

export const readinessTextColor = (v) => (v < 45 ? 'text-red' : v < 77 ? 'text-cyan-400' : 'text-cyan-400');

export const readinessGradient = (v) => {
  if (v < 45) return 'from-red/80 to-red';
  if (v < 77) return 'from-cyan-600/40 to-cyan-400';
  return 'from-cyan-600/80 to-cyan-400';
};

// Load ratio colors: Ice blue for optimal range (0.8-1.3x), Red for under/over training
export const loadColor = (ratio) => (ratio >= 0.8 && ratio <= 1.3) ? 'text-cyan-400' : 'text-red';

export const getMetricAvailability = (sessions, climbs) => ({
  crs: sessions >= 3,
  crsAccurate: sessions >= 5,
  loadRatio: sessions >= 5,
  weeklyTrends: sessions >= 3,
  gradeProgression: climbs >= 30,
  allMetrics: sessions >= 3 && climbs >= 30
});

// Round RPE values to nearest 0.5 (e.g., 7.2 becomes 7.0, 7.3 becomes 7.5)
export const roundRPE = (rpe) => {
  if (typeof rpe !== 'number' || isNaN(rpe)) return 0;
  return Math.round(rpe * 2) / 2;
};

// Get session display date with session number for days with multiple sessions
export const getSessionDisplayDate = (session, allSessions) => {
  // Handle "Now" special case
  if (session.date === 'Now') {
    // Check if there are other sessions today
    const today = new Date().toDateString();
    const todaySessions = allSessions.filter(s => {
      if (!s.timestamp) return false;
      return new Date(s.timestamp).toDateString() === today;
    });
    
    if (todaySessions.length > 1) {
      // Find which number this session is
      const sortedTodaySessions = todaySessions.sort((a, b) => a.timestamp - b.timestamp);
      const sessionNumber = sortedTodaySessions.findIndex(s => s.id === session.id) + 1;
      return `Now • Session ${sessionNumber}`;
    }
    return 'Now';
  }
  
  // For completed sessions, check if there are multiple sessions on the same day
  if (!session.timestamp) return session.date;
  
  const sessionDate = new Date(session.timestamp).toDateString();
  const sameDaySessions = allSessions.filter(s => {
    if (!s.timestamp) return false;
    // Exclude "Now" sessions from counting
    if (s.date === 'Now') return false;
    return new Date(s.timestamp).toDateString() === sessionDate;
  });
  
  // Only show session numbers if there are multiple sessions on this day
  if (sameDaySessions.length > 1) {
    // Sort by timestamp to determine session order
    const sortedSessions = sameDaySessions.sort((a, b) => a.timestamp - b.timestamp);
    const sessionNumber = sortedSessions.findIndex(s => s.id === session.id) + 1;
    return `${session.date} • Session ${sessionNumber}`;
  }
  
  return session.date;
};
