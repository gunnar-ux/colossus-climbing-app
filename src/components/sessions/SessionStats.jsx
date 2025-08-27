// SessionStats component extracted from sessions.html
// Preserves exact dark theme styling and metrics calculations

const SessionStats = ({ sessions }) => {
  const totalClimbs = sessions.reduce((sum, s) => sum + s.climbs, 0);
  const avgRPE = sessions.length > 0 ? (sessions.reduce((sum, s) => sum + s.avgRPE, 0) / sessions.length).toFixed(1) : 0;
  const totalTime = sessions.reduce((sum, s) => {
    const [hours, minutes] = s.duration.replace('h', '').replace('m', '').split(' ').map(t => parseInt(t) || 0);
    return sum + (hours * 60) + minutes;
  }, 0);
  const totalHours = Math.floor(totalTime / 60);
  const totalMinutes = totalTime % 60;

  return (
    <section className="px-5 pt-4">
      <div className="bg-card border border-border rounded-col p-4">
        <h2 className="font-semibold text-base mb-3">Session Summary</h2>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{sessions.length}</div>
            <div className="text-sm text-graytxt">Total Sessions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalClimbs}</div>
            <div className="text-sm text-graytxt">Total Climbs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalHours}h {totalMinutes}m</div>
            <div className="text-sm text-graytxt">Time Climbing</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{avgRPE}</div>
            <div className="text-sm text-graytxt">Avg RPE</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SessionStats;
