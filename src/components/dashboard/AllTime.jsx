import Progress from '../ui/Progress.jsx';

// AllTime component extracted from dashboard HTML
// Preserves exact dark theme styling and gamification elements

const AllTime = ({ available = false, onViewAchievements, userData, sessions, peakGrade }) => {
  // Always show real data if we have any, regardless of 'available' status
  const hasAnyData = (userData?.totalClimbs > 0) || (userData?.totalSessions > 0);
  
  const lifetime = [
    {label:'Total Sends', value: hasAnyData ? (userData?.totalClimbs?.toLocaleString() || '0') : '--'},
    {label:'Peak Grade', value: hasAnyData ? (peakGrade || '--') : '--'},
    {label:'Sessions', value: hasAnyData ? (userData?.totalSessions?.toString() || '0') : '--'},
    {label:'3-Month Trend', value: available ? '--' : '--'}, // Only show trend when fully available
  ];
  // Calculate basic points from actual data, even if not fully "available"
  const totalPoints = hasAnyData ? Math.min(userData?.totalClimbs * 10 || 0, 1847) : 0;
  const nextLevelPoints = 2000;

  const handleViewAchievements = () => {
    if (onViewAchievements) {
      onViewAchievements();
    }
  };

  return (
    <section className="pt-4">
      <div className="mx-5 bg-card border border-border rounded-col p-4 hover:border-white/10 transition">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-base">Progress & Achievement</h3>
          <button 
            onClick={handleViewAchievements} 
            className="text-xs text-graytxt hover:text-white transition"
          >
            see all →
          </button>
        </div>

        {/* Level as prominent metric */}
        <div className="mt-1 flex items-center gap-3">
          <div className={`text-5xl font-extrabold leading-none ${hasAnyData ? 'text-white' : 'text-gray-600'} min-w-[64px]`}>
            {hasAnyData ? Math.floor(totalPoints / 200) + 1 : '--'}
          </div>
          <div className="flex-1">
            <div className="text-sm text-graytxt mb-1">Level</div>
            <Progress value={totalPoints} max={nextLevelPoints} />
            <div className="mt-1 text-xs text-graytxt">
              {hasAnyData ? `${nextLevelPoints - totalPoints} points to Level ${Math.floor(totalPoints / 200) + 2}` : 'Track sessions to unlock'}
            </div>
          </div>
        </div>

        {/* Key stats below */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {lifetime.slice(0, 3).map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-xs text-graytxt">{stat.label}</div>
              <div className={`text-lg font-semibold ${stat.value !== '--' ? 'text-white' : 'text-gray-600'}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AllTime;
