import Progress from '../ui/Progress.jsx';

// CalibrationCard component extracted from dashboard HTML
// Preserves exact dark theme styling and progress tracking

const CalibrationCard = ({ sessions, climbs, onDismissCalibration }) => {
  const requirements = [
    { metric: 'Sessions', current: sessions, needed: 5, unit: 'tracked' },
    { metric: 'Climbs', current: climbs, needed: 50, unit: 'logged' }
  ];
  const overallProgress = Math.min((sessions / 5) * 100, (climbs / 50) * 100);

  if (sessions >= 5 && climbs >= 50) {
    return (
      <div className="mx-5 mt-3 p-4 bg-green/10 border border-green/30 rounded-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-green">✓ Fully Calibrated</span>
            <span className="text-xs text-green">All metrics active</span>
          </div>
          <button 
            onClick={onDismissCalibration}
            className="w-6 h-6 rounded-full bg-green/20 hover:bg-green/30 text-green flex items-center justify-center text-sm transition"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-5 mt-3 bg-card border border-border rounded-col p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">Dashboard Calibration</h3>
        <span className="text-xs text-graytxt">{Math.round(overallProgress)}%</span>
      </div>
      <Progress value={overallProgress} max={100} />
      <div className="grid grid-cols-2 gap-3 mt-3">
        {requirements.map(req => (
          <div key={req.metric} className="text-xs">
            <span className="text-graytxt">{req.metric}: </span>
            <span className={req.current >= req.needed ? 'text-green' : 'text-white'}>
              {req.current}/{req.needed}
            </span>
            <span className="text-graytxt"> {req.unit}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
        <div className="text-xs">
          <span className="text-graytxt">CRS Score: </span>
          <span className={sessions >= 3 ? 'text-green' : 'text-blue'}>
            {sessions >= 3 ? 'Available' : `${3 - sessions} more sessions needed`}
          </span>
        </div>
        <div className="text-xs">
          <span className="text-graytxt">Load Monitoring: </span>
          <span className={sessions >= 5 ? 'text-green' : 'text-blue'}>
            {sessions >= 5 ? 'Available' : `${5 - sessions} more sessions needed`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CalibrationCard;
