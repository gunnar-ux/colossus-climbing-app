// Progress Overview - Consolidated key metrics
// Replaces volume, performance, grades, and records sections with compact overview

const ProgressOverview = ({ sessions = [], userData = {} }) => {
  // Calculate total climbs from sessions
  const getTotalClimbs = () => {
    if (!sessions || sessions.length === 0) return userData.totalClimbs || 0;
    return sessions.reduce((total, session) => total + (session.climbs || 0), 0);
  };

  // Calculate total sessions
  const getTotalSessions = () => {
    return sessions.length || userData.totalSessions || 0;
  };

  // Calculate total flashed climbs
  const getTotalFlashed = () => {
    if (!sessions || sessions.length === 0) return 0;
    
    let totalFlashed = 0;
    sessions.forEach(session => {
      if (session.climbList && session.climbList.length > 0) {
        session.climbList.forEach(climb => {
          if (climb.attempts === 1) {
            totalFlashed++;
          }
        });
      }
    });
    return totalFlashed;
  };

  // Get hardest send (highest grade climbed)
  const getHardestSend = () => {
    if (!sessions || sessions.length === 0) return userData.peakGrade || 'V0';
    
    let hardestGrade = 'V0';
    let hardestGradeNum = 0;
    
    sessions.forEach(session => {
      if (session.climbList && session.climbList.length > 0) {
        session.climbList.forEach(climb => {
          const gradeNum = parseInt(climb.grade?.replace('V', '')) || 0;
          if (gradeNum > hardestGradeNum) {
            hardestGradeNum = gradeNum;
            hardestGrade = climb.grade;
          }
        });
      }
    });
    
    return hardestGrade;
  };

  // Calculate average flash rate
  const getAvgFlashRate = () => {
    if (!sessions || sessions.length === 0) return 0;
    
    let totalClimbs = 0;
    let totalFlashed = 0;
    
    sessions.forEach(session => {
      if (session.climbList && session.climbList.length > 0) {
        session.climbList.forEach(climb => {
          totalClimbs++;
          if (climb.attempts === 1) {
            totalFlashed++;
          }
        });
      }
    });
    
    if (totalClimbs === 0) return 0;
    return Math.round((totalFlashed / totalClimbs) * 100);
  };

  const totalClimbs = getTotalClimbs();
  const totalSessions = getTotalSessions();
  const totalFlashed = getTotalFlashed();
  const hardestSend = getHardestSend();
  const avgFlashRate = getAvgFlashRate();

  return (
    <section className="px-5 pt-2">
      <div className="px-5 pt-2 pb-3">
        <div className="space-y-2">
          <div className="bg-border/30 border border-border/60 rounded-lg px-3 py-2 flex items-center justify-between shadow-inner">
            <span className="text-white font-medium text-sm">Total Climbs</span>
            <span className="text-white text-sm">{totalClimbs}</span>
          </div>
          
          <div className="bg-border/30 border border-border/60 rounded-lg px-3 py-2 flex items-center justify-between shadow-inner">
            <span className="text-white font-medium text-sm">Total Sessions</span>
            <span className="text-white text-sm">{totalSessions}</span>
          </div>
          
          <div className="bg-border/30 border border-border/60 rounded-lg px-3 py-2 flex items-center justify-between shadow-inner">
            <span className="text-white font-medium text-sm">Total Flashed</span>
            <span className="text-white text-sm">{totalFlashed}</span>
          </div>
          
          <div className="bg-border/30 border border-border/60 rounded-lg px-3 py-2 flex items-center justify-between shadow-inner">
            <span className="text-white font-medium text-sm">Hardest Send</span>
            <span className="text-white text-sm">{hardestSend}</span>
          </div>
          
          <div className="bg-border/30 border border-border/60 rounded-lg px-3 py-2 flex items-center justify-between shadow-inner">
            <span className="text-white font-medium text-sm">Avg Flash Rate</span>
            <span className="text-white text-sm">{avgFlashRate}%</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProgressOverview;
