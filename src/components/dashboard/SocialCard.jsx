import { useRef } from 'react';
import { RocketLaunchIcon } from '../ui/Icons.jsx';
import { LineChart } from './Charts.jsx';

// SocialCard component for sharing climbing session summaries
// Designed to be shareable on social media platforms like Instagram

const SocialCard = ({ 
  session, 
  profile, 
  userData,
  sessions = []
}) => {
  const cardRef = useRef(null);
  
  if (!session || !session.climbList || session.climbList.length === 0) {
    return null; // Don't render if no session data
  }

  // Calculate user level and XP
  const calculateTotalXP = () => {
    if (!sessions || sessions.length === 0) return 0;
    
    let totalXP = 0;
    sessions.forEach(s => {
      if (s.climbList && s.climbList.length > 0) {
        s.climbList.forEach(climb => {
          const baseXP = 10;
          const gradeNum = parseInt(climb.grade.replace('V', '')) || 0;
          const gradeMultiplier = gradeNum + 1;
          const flashBonus = climb.attempts === 1 ? 1.2 : 1.0;
          const climbXP = baseXP * gradeMultiplier * flashBonus;
          totalXP += climbXP;
        });
      }
    });
    return Math.floor(totalXP);
  };

  const totalXP = calculateTotalXP();
  const currentLevel = Math.floor(totalXP / 150) + 1;
  const pointsInCurrentLevel = totalXP % 150;

  // Calculate XP gained from this session only
  const calculateSessionXP = () => {
    if (!session.climbList || session.climbList.length === 0) return 0;
    
    let sessionXP = 0;
    session.climbList.forEach(climb => {
      const baseXP = 10;
      const gradeNum = parseInt(climb.grade.replace('V', '')) || 0;
      const gradeMultiplier = gradeNum + 1;
      const flashBonus = climb.attempts === 1 ? 1.2 : 1.0;
      const climbXP = baseXP * gradeMultiplier * flashBonus;
      sessionXP += climbXP;
    });
    
    return Math.floor(sessionXP);
  };

  const sessionXP = calculateSessionXP();

  // Calculate actual session duration for social card (even if session is "Active")
  const calculateActualDuration = () => {
    if (!session.climbList || session.climbList.length === 0) return "0m";
    
    const startTime = session.startTime;
    const lastClimbTime = Math.max(...session.climbList.map(climb => climb.timestamp));
    
    const durationMs = lastClimbTime - startTime;
    const durationMins = Math.floor(durationMs / (1000 * 60));
    
    if (durationMins < 60) {
      return `${Math.max(durationMins, 1)}m`; // Minimum 1 minute
    } else {
      const hours = Math.floor(durationMins / 60);
      const mins = durationMins % 60;
      return `${hours}h ${mins}m`;
    }
  };

  const actualDuration = calculateActualDuration();

  // Get flash rate color based on performance ranges (same logic as SessionCard)
  const getFlashRateColor = (rate) => {
    if (rate >= 85) return 'text-cyan-400';   // 85-100%: Exceptional (ice blue)
    return 'text-white';                      // 0-84%: Normal (white)
  };

  // Calculate session metrics
  const totalClimbs = session.climbList.length;
  const flashedClimbs = session.climbList.filter(climb => climb.attempts === 1).length;
  const flashRate = Math.round((flashedClimbs / totalClimbs) * 100);
  
  // Find hardest grade
  const hardestGrade = session.climbList.reduce((max, climb) => {
    const gradeNum = parseInt(climb.grade.replace('V', '')) || 0;
    const maxNum = parseInt(max.replace('V', '')) || 0;
    return gradeNum > maxNum ? climb.grade : max;
  }, 'V0');

  // Find hardest flash
  const flashedClimbGrades = session.climbList
    .filter(climb => climb.attempts === 1)
    .map(climb => parseInt(climb.grade.replace('V', '')) || 0);
  const hardestFlashGrade = flashedClimbGrades.length > 0 
    ? `V${Math.max(...flashedClimbGrades)}` 
    : '--';

  // Session focus (most common style) - map to Skill/Capacity/Power
  const styleCounts = {};
  session.climbList.forEach(climb => {
    const style = climb.style || 'Technical';
    styleCounts[style] = (styleCounts[style] || 0) + 1;
  });
  const mostCommonStyle = Object.entries(styleCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Technical';
  
  // Map styles to focus categories
  const getSessionFocus = (style) => {
    if (style === 'Technical') return 'Skill';
    if (style === 'Simple') return 'Capacity';  
    if (style === 'Power') return 'Power';
    return 'Skill'; // default fallback
  };
  
  const sessionFocus = getSessionFocus(mostCommonStyle);

  // Prepare chronological grade progression chart
  const prepareGradeProgressionChart = () => {
    if (!session.climbList || session.climbList.length === 0) return { values: [], labels: [] };
    
    // Sort climbs by timestamp to get chronological order
    const sortedClimbs = [...session.climbList].sort((a, b) => 
      (a.timestamp || 0) - (b.timestamp || 0)
    );

    // Extract grade values in chronological order
    const values = sortedClimbs.map(climb => 
      parseInt(climb.grade.replace('V', '')) || 0
    );
    
    // Create evenly spaced labels based on climb count
    const labels = [];
    const totalClimbs = values.length;
    
    // Show labels for key points in the session
    for (let i = 0; i < totalClimbs; i++) {
      if (totalClimbs <= 10) {
        // For short sessions, show every climb number
        labels.push((i + 1).toString());
      } else if (i === 0 || i === Math.floor(totalClimbs / 2) || i === totalClimbs - 1) {
        // For longer sessions, show start, middle, end
        labels.push((i + 1).toString());
      } else {
        labels.push('');
      }
    }

    return { values, labels };
  };

  const chartData = prepareGradeProgressionChart();
  
  // Format date for display
  const formatDate = () => {
    if (session.date === 'Now') {
      // Return full date for "Now" sessions
      const today = new Date();
      return today.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
    return session.date;
  };



  return (
    <section className="px-5 pt-4">
      <div 
        ref={cardRef}
        data-testid="social-card"
        className="bg-card border border-border rounded-col overflow-hidden max-w-sm mx-auto relative"
        style={{
          // Reduced height to minimize negative space
          minHeight: '320px',
          minWidth: '300px'
        }}
      >
        {/* Header Section */}
        <div className="px-5 pt-5 pb-0">
          <div className="mb-2">
            {/* Row 1 - Name and XP */}
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-xl text-white">
                {profile?.name || 'Climber'}
              </div>
              <div className="flex items-center gap-1">
                <RocketLaunchIcon className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-white">+{sessionXP.toLocaleString()} XP</span>
              </div>
            </div>
            
            {/* Row 2 - Date and Focus */}
            <div className="flex items-center justify-between text-sm text-slate-400">
              <div>{formatDate()}</div>
              <div>{sessionFocus} Focus</div>
            </div>
          </div>


        </div>

        {/* Grade Progression Chart - THE MOST IMPORTANT VISUALIZATION */}
        {chartData.values.length > 0 && (
          <div className="px-5">
            <div className="flex justify-center relative">
              <LineChart 
                values={chartData.values}
                labels={[]} // Remove x-axis climb count numbers
                height={140} // Reduced height
              />
              {/* Session Summary - positioned closer to chart */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-400">
                {totalClimbs} climbs in {actualDuration}
              </div>
            </div>
          </div>
        )}

        <div className="px-5 -mt-2">
          {/* Stats Section - Streamlined with Hardest Send */}
          <div className="mb-2">
            <div className="border border-cyan-700/50 rounded-xl p-3 bg-gradient-to-r from-cyan-950/20 to-blue-950/15">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{totalClimbs}</div>
                  <div className="text-xs text-slate-400">Total Volume</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{(() => {
                    // Find the hardest climb grade
                    const hardestClimb = session.climbList.reduce((max, climb) => {
                      const gradeNum = parseInt(climb.grade.replace('V', '')) || 0;
                      const maxNum = parseInt(max.grade.replace('V', '')) || 0;
                      return gradeNum > maxNum ? climb : max;
                    }, session.climbList[0]);
                    return hardestClimb.grade;
                  })()}</div>
                  <div className="text-xs text-slate-400">Hardest Send</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${getFlashRateColor(flashRate)}`}>{flashRate}%</div>
                  <div className="text-xs text-slate-400">Flash Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* App Attribution */}
        <div className="px-5 pb-3">
          <div className="text-xs text-slate-400 text-center">
            powered by <span className="text-white font-semibold">POGO</span>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default SocialCard;


