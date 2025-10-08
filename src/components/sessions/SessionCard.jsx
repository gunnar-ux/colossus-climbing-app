import { useState } from 'react';
import { ChevronDownIcon, LightningIcon, RocketLaunchIcon } from '../ui/Icons.jsx';
import Progress from '../ui/Progress.jsx';
import { LineChart } from '../dashboard/Charts.jsx';
import { roundRPE } from '../../utils/index.js';

// SessionCard component extracted from sessions.html
// Preserves exact dark theme styling, collapsible animations, and data visualization

const SessionCard = ({ session, index, profile, allSessions }) => {
  const [open, setOpen] = useState(false);
  
  // Get flash rate color based on performance ranges
  const getFlashRateColor = (rate) => {
    if (rate >= 85) return 'text-cyan-400';   // 85-100%: Exceptional (ice blue)
    return 'text-white';                      // 0-84%: Normal (white)
  };
  
  // Example: Check if this is an exceptional session (for demo purposes)
  const isExceptionalSession = session.flashRate >= 80 && session.climbs >= 10;
  
  // Prepare grade progression chart data (exact same logic as SocialCard)
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
    
    
    return { values, labels: [] }; // No labels for clean look in SessionCard
  };

  const chartData = prepareGradeProgressionChart();
  
  // Calculate session duration for x-axis title
  const calculateSessionDuration = () => {
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

  const sessionDuration = calculateSessionDuration();
  const totalClimbs = session.climbList ? session.climbList.length : 0;
  
  // Calculate session focus based on most common climb style
  const getSessionFocus = () => {
    if (!session.climbList || session.climbList.length === 0) return 'Mixed Session';
    
    const styleCounts = {};
    session.climbList.forEach(climb => {
      const style = climb.style || 'Technical';
      styleCounts[style] = (styleCounts[style] || 0) + 1;
    });
    
    const mostCommonStyle = Object.entries(styleCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Technical';
    
    // Map styles to session focus
    if (mostCommonStyle === 'Technical') return 'Skill Session';
    if (mostCommonStyle === 'Simple') return 'Capacity Session';  
    if (mostCommonStyle === 'Power') return 'Power Session';
    return 'Mixed Session';
  };

  // Calculate session XP
  const getSessionXP = () => {
    if (!session.climbList || session.climbList.length === 0) return 0;
    
    return session.climbList.reduce((sum, climb) => {
      const baseXP = 10;
      const gradeNum = parseInt(climb.grade.replace('V', '')) || 0;
      const gradeMultiplier = gradeNum + 1; // V0=1x, V1=2x, V2=3x, etc.
      const flashBonus = climb.attempts === 1 ? 1.2 : 1.0;
      const climbXP = baseXP * gradeMultiplier * flashBonus;
      return sum + climbXP;
    }, 0);
  };

  const sessionFocus = getSessionFocus();
  const sessionXP = Math.floor(getSessionXP());
  
  return (
    <div className={`${
      isExceptionalSession 
        ? 'bg-gradient-to-r from-cyan-950/25 to-blue-950/20 border border-cyan-700/40 shadow-cyan-900/15 shadow-lg' 
        : 'bg-card border border-border'
    } rounded-col px-4 pt-4 pb-3 cursor-pointer`} onClick={() => setOpen(!open)}>
        {/* Row 1: Session Focus and XP */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-base">{sessionFocus}</div>
            {isExceptionalSession && <LightningIcon className="w-4 h-4 text-cyan-400" />}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <RocketLaunchIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-white">+{sessionXP.toLocaleString()} XP</span>
          </div>
        </div>

        {/* Row 2: Date and Avg Effort */}
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm text-graytxt">
            {session.date === 'Now' ? 'Current Session' : session.date}
          </div>
          <div className="text-sm text-graytxt">
            Avg Effort: {session.avgRPE ? roundRPE(session.avgRPE) : '--'}
          </div>
        </div>
        
        {/* Grade Progression Chart - Multiple climbs */}
        {chartData.values.length >= 2 && (
          <div className="px-2 py-0">
            <div className="flex justify-center relative">
              <LineChart 
                values={chartData.values}
                labels={chartData.labels}
                height={140}
              />
            </div>
          </div>
        )}

        {/* Single Climb - Custom visualization */}
        {chartData.values.length === 1 && (
          <div className="px-2 py-0">
            <div className="flex justify-center relative" style={{ height: '140px' }}>
              {/* Custom single point chart */}
              <svg width="300" height="140" className="overflow-visible">
                {/* Background grid lines */}
                <defs>
                  <linearGradient id="singleClimbGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                
                {/* Grid lines for context */}
                {[8, 4, 0].map((grade, i) => {
                  const y = 20 + (i * 40);
                  return (
                    <g key={grade}>
                      <line x1="30" y1={y} x2="270" y2={y} stroke="#374151" strokeWidth="1" opacity="0.3" />
                      <text x="25" y={y + 4} textAnchor="end" className="fill-slate-400 text-xs">V{grade}</text>
                    </g>
                  );
                })}
                
                {/* Single climb point - upgraded for max grade */}
                {(() => {
                  const climbGrade = chartData.values[0];
                  const y = 20 + ((8 - climbGrade) / 8) * 80; // Position based on grade
                  return (
                    <g>
                      {/* Subtle glow for prominence */}
                      <circle cx="150" cy={y} r="6" fill="#22d3ee" opacity="0.2" />
                      <circle cx="150" cy={y} r="4" fill="#22d3ee" opacity="0.3" />
                      {/* Main point - slightly larger than LineChart */}
                      <circle cx="150" cy={y} r="3" fill="#22d3ee" stroke="#0891b2" strokeWidth="1" />
                      {/* Grade label above */}
                      <text x="150" y={y - 12} textAnchor="middle" className="fill-white text-xs font-medium">
                        V{climbGrade}
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>
        )}
        
        {/* No Climbs - Show placeholder */}
        {chartData.values.length === 0 && (
          <div className="px-2 py-3">
            <div className="text-center text-slate-500 text-sm">
              No climbs logged
            </div>
          </div>
        )}
        
        {/* Stats Tile - Like Social Card */}
        <div className="px-2 -mt-6 pb-2">
          <div className="border border-cyan-700/50 rounded-xl p-3 bg-gradient-to-r from-cyan-950/20 to-blue-950/15">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{totalClimbs}</div>
                <div className="text-xs text-slate-400">Total Volume</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{session.peakGrade || 'V0'}</div>
                <div className="text-xs text-slate-400">Hardest Send</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${getFlashRateColor(session.flashRate || 0)}`}>{session.flashRate || 0}%</div>
                <div className="text-xs text-slate-400">Flash Rate</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Row 2: Attribution and Expand Button */}
        <div className="flex items-center justify-center px-4 pb-3 relative">
          <div className="text-xs text-slate-400">
            powered by <span className="text-white font-semibold">POGO</span>
          </div>
          <ChevronDownIcon 
            className={`absolute right-4 w-4 h-4 transition-transform duration-200 ${isExceptionalSession ? 'text-slate-200' : 'text-graytxt'} ${open ? 'rotate-180' : ''}`}
          />
        </div>
      
      {/* Expandable content */}
      {open && (
        <div className={`mt-4 pt-4 space-y-4 ${isExceptionalSession ? 'border-t border-cyan-700/40' : 'border-t border-border/50'}`}>
          {/* Grade Distribution */}
          <div className={`rounded-lg p-3 ${isExceptionalSession ? 'border border-cyan-700/40' : 'border border-border/50'}`}>
            <div className="text-sm text-white font-semibold mb-3 text-center">Grade Distribution</div>
            {(session.grades || []).map((g, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className={isExceptionalSession ? 'text-slate-200' : 'text-graytxt'}>{g.label}</span>
                  <span>{g.val}% ({g.count || 0})</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isExceptionalSession ? 'bg-cyan-900/30' : 'bg-border'}`}>
                  <div className={`h-full ${isExceptionalSession ? 'bg-cyan-400' : 'bg-white/70'}`} style={{width: `${g.val}%`}}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Style Distribution */}
          <div className={`rounded-lg p-3 ${isExceptionalSession ? 'border border-cyan-700/40' : 'border border-border/50'}`}>
            <div className="text-sm text-white font-semibold mb-3 text-center">Style Distribution</div>
            {(session.styles || []).map((s, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className={isExceptionalSession ? 'text-slate-200' : 'text-graytxt'}>{s.label}</span>
                  <span>{s.val}% ({s.count || 0})</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isExceptionalSession ? 'bg-cyan-900/30' : 'bg-border'}`}>
                  <div className={`h-full ${isExceptionalSession ? 'bg-cyan-400' : 'bg-white/70'}`} style={{width: `${s.val}%`}}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Wall Angles */}
          <div className={`rounded-lg p-3 ${isExceptionalSession ? 'border border-cyan-700/40' : 'border border-border/30'}`}>
            <div className="text-sm text-white font-semibold mb-3 text-center">Wall Angle Distribution</div>
            {(session.angles || []).map((w, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className={isExceptionalSession ? 'text-slate-200' : 'text-graytxt'}>{w.label}</span>
                  <span>{w.val}% ({w.count || 0})</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isExceptionalSession ? 'bg-cyan-900/30' : 'bg-border'}`}>
                  <div className={`h-full ${isExceptionalSession ? 'bg-cyan-400' : 'bg-white/70'}`} style={{width: `${w.val}%`}}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Boulder vs Board Distribution */}
          <div className={`rounded-lg p-3 ${isExceptionalSession ? 'border border-cyan-700/40' : 'border border-border/50'}`}>
            <div className="text-sm text-white font-semibold mb-3 text-center">Boulder vs Board</div>
            {session.types?.map((t, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className={isExceptionalSession ? 'text-slate-200' : 'text-graytxt'}>{t.label}</span>
                  <span>{t.val}% ({t.count || 0})</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isExceptionalSession ? 'bg-cyan-900/30' : 'bg-border'}`}>
                  <div className={`h-full ${isExceptionalSession ? 'bg-cyan-400' : 'bg-white/70'}`} style={{width: `${t.val}%`}}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Average Perceived Effort */}
          <div className={`rounded-lg p-3 ${isExceptionalSession ? 'border border-cyan-700/40' : 'border border-border/50'}`}>
            <div className="text-sm text-white font-semibold mb-3 text-center">Average Perceived Effort</div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className={`w-full h-2 rounded-full overflow-hidden ${isExceptionalSession ? 'bg-cyan-900/30' : 'bg-border'}`}>
                  <div className={`h-full ${isExceptionalSession ? 'bg-cyan-400' : 'bg-white/70'}`} style={{width: `${Math.min((roundRPE(session.avgRPE) / 10) * 100, 100)}%`}}></div>
                </div>
              </div>
              <div className="text-sm">{roundRPE(session.avgRPE)}/10</div>
            </div>
          </div>

          {/* Individual Climbs List */}
          <div className="mt-4">
            <div className="text-sm text-white font-semibold mb-2 text-center">Individual Climbs</div>
            <ul className="space-y-2">
              {(session.climbList || []).map((c, i) => (
                <li key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 ${isExceptionalSession ? 'border border-cyan-700/40' : 'border border-border/60'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`text-lg font-bold ${isExceptionalSession ? 'text-cyan-400' : 'text-white'}`}>{c.grade}</div>
                    <div className={`text-sm px-1.5 py-0.5 rounded border border-border/40 ${isExceptionalSession ? 'text-slate-200' : 'text-graytxt'}`}>
                      {c.type === 'BOARD' ? 'Board' : 'Boulder'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${isExceptionalSession ? 'text-cyan-400' : 'text-white'}`}>
                      {c.allStyles && c.allStyles.length > 0 ? c.allStyles.join(', ') : c.style} {c.angle}
                    </div>
                    <div className={`text-sm ${isExceptionalSession ? 'text-slate-200' : 'text-graytxt'}`}>
                      Perceived Effort: {roundRPE(c.rpe)} • Att: {c.attempts}
                    </div>
                  </div>
                </li>
            ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionCard;
