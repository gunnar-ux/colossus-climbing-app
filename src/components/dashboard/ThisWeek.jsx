import { useState } from 'react';
import { ChevronDownIcon, LockClosedIcon } from '../ui/Icons.jsx';
import { BarChart, Trend } from './Charts.jsx';
import { roundRPE } from '../../utils/index.js';
import { getCapacityRecommendations, calculatePersonalBaseline } from '../../utils/metrics.js';

// ThisWeek component extracted from dashboard HTML
// Preserves exact dark theme styling and expandable content behavior

const ThisWeek = ({ available = false, currentSessions = 0, sessions = [] }) => {
  const [open, setOpen] = useState(false);
  const [weeksAgo, setWeeksAgo] = useState(0); // 0 = current week, 1 = last week, etc.
  
  // Get flash rate color based on performance ranges (same as SessionCard)
  const getFlashRateColor = (rate) => {
    if (rate >= 85) return 'text-cyan-400';   // 85-100%: Exceptional (ice blue)
    return 'text-white';                      // 0-84%: Normal (white)
  };
  
  // Calculate real weekly data from sessions with recommendation lines
  const calculateWeeklyData = (weekOffset = 0) => {
    if (!available || !sessions || sessions.length === 0) {
      return {
        weeklyVolume: [0, 0, 0, 0, 0, 0, 0], // Empty state
        recommendationLines: [0, 0, 0, 0, 0, 0, 0], // No recommendations
        flashRate: 0,
        totalClimbs: 0,
        grades: [],
        styles: [],
        angles: []
      };
    }

    // Get week boundaries (Sunday to Saturday) with offset
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDay - (weekOffset * 7)); // Apply week offset
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Filter sessions for this week
    const thisWeekSessions = sessions.filter(session => {
      const sessionDate = new Date(session.timestamp);
      return sessionDate >= startOfWeek && sessionDate < endOfWeek;
    });

    // Initialize weekly volume array [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
    const weeklyVolume = [0, 0, 0, 0, 0, 0, 0];
    const recommendationLines = [0, 0, 0, 0, 0, 0, 0];
    let totalClimbs = 0;
    let totalFlashes = 0;
    
    // Initialize distribution counters
    const gradeCounts = {};
    const styleCounts = {};
    const angleCounts = {};

    // Get user baseline for recommendations
    const baseline = calculatePersonalBaseline(sessions);

    // Process each session and calculate retrospective recommendations
    thisWeekSessions.forEach(session => {
      if (session.climbList && session.climbList.length > 0) {
        const sessionDate = new Date(session.timestamp);
        const dayOfWeek = sessionDate.getDay(); // 0 = Sunday
        
        // Add climbs to the correct day
        weeklyVolume[dayOfWeek] += session.climbList.length;
        totalClimbs += session.climbList.length;

        // Count flashes (attempts === 1) and distributions
        session.climbList.forEach(climb => {
          if (climb.attempts === 1) {
            totalFlashes++;
          }
          
          // Count grades
          const grade = climb.grade || 'V0';
          gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
          
          // Count styles
          const style = climb.style || 'Technical';
          styleCounts[style] = (styleCounts[style] || 0) + 1;
          
          // Count angles
          const angle = climb.angle || 'Vertical';
          angleCounts[angle] = (angleCounts[angle] || 0) + 1;
        });

        // Calculate what the recommendation would have been for that day
        // Vary recommendations based on day of week and training patterns
        let dayMultiplier = 1.0;
        if (dayOfWeek === 0 || dayOfWeek === 6) dayMultiplier = 0.8; // Weekend - lighter
        else if (dayOfWeek === 2 || dayOfWeek === 4) dayMultiplier = 1.2; // Tue/Thu - heavier
        else dayMultiplier = 1.0; // Mon/Wed/Fri - moderate
        
        const retrospectiveRecommendation = Math.round(baseline.avgVolume * dayMultiplier);
        recommendationLines[dayOfWeek] = retrospectiveRecommendation;
      }
    });

    // For today only, calculate actual recommendation if we have CRS data (only when viewing current week)
    if (weekOffset === 0) {
      const today = new Date();
      const todayOfWeek = today.getDay();
      if (todayOfWeek >= 0 && todayOfWeek <= 6 && recommendationLines[todayOfWeek] === 0) {
        // Apply same day-based multiplier for consistency
        let dayMultiplier = 1.0;
        if (todayOfWeek === 0 || todayOfWeek === 6) dayMultiplier = 0.8; // Weekend - lighter
        else if (todayOfWeek === 2 || todayOfWeek === 4) dayMultiplier = 1.2; // Tue/Thu - heavier
        else dayMultiplier = 1.0; // Mon/Wed/Fri - moderate
        
        recommendationLines[todayOfWeek] = Math.round(baseline.avgVolume * dayMultiplier);
      }
    }

    const flashRate = totalClimbs > 0 ? Math.round((totalFlashes / totalClimbs) * 100) : 0;

    // Convert distributions to percentages
    const grades = Object.entries(gradeCounts)
      .map(([label, count]) => ({
        label,
        count,
        val: Math.round((count / totalClimbs) * 100)
      }))
      .sort((a, b) => {
        const aNum = parseInt(a.label.replace('V', ''));
        const bNum = parseInt(b.label.replace('V', ''));
        return aNum - bNum;
      });
    
    const styles = Object.entries(styleCounts)
      .map(([label, count]) => ({
        label,
        count,
        val: Math.round((count / totalClimbs) * 100)
      }))
      .sort((a, b) => b.val - a.val);
    
    const angles = Object.entries(angleCounts)
      .map(([label, count]) => ({
        label,
        count,
        val: Math.round((count / totalClimbs) * 100)
      }))
      .sort((a, b) => b.val - a.val);

    return {
      weeklyVolume,
      recommendationLines,
      flashRate,
      totalClimbs,
      grades,
      styles,
      angles
    };
  };

  const weeklyData = calculateWeeklyData(weeksAgo);
  const weeklyVolume = weeklyData.weeklyVolume;
  const total = weeklyData.totalClimbs;
  const avgRPE = available ? roundRPE(6.8) : 0;
  
  // Get week date range (Sunday to Saturday) with offset
  const getWeekDateRange = (weekOffset = 0) => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDay - (weekOffset * 7)); // Apply week offset
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    
    const formatDate = (date) => {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}/${day}`;
    };
    
    return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
  };
  
  // Use calculated distributions from weeklyData
  const grades = available && weeklyData.grades.length > 0 ? weeklyData.grades : [
    {label:'V3', val:25, count:0}, {label:'V4', val:25, count:0}, {label:'V5', val:25, count:0}, {label:'V6', val:25, count:0},
  ];
  const styles = available && weeklyData.styles.length > 0 ? weeklyData.styles : [
    {label:'Power', val:33, count:0}, {label:'Technical', val:33, count:0}, {label:'Endurance', val:34, count:0},
  ];
  const angles = available && weeklyData.angles.length > 0 ? weeklyData.angles : [
    {label:'Overhang', val:33, count:0}, {label:'Vertical', val:34, count:0}, {label:'Slab', val:33, count:0},
  ];
  
  return (
    <section className="pt-4">
      <div className="mx-5 bg-card border border-border rounded-col px-5 pt-5 pb-4 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base">{weeksAgo === 0 ? 'This Week' : `${weeksAgo} Week${weeksAgo > 1 ? 's' : ''} Ago`}</h3>
            {!available && <LockClosedIcon className="w-4 h-4 text-graytxt/60" />}
          </div>
          <div className="text-sm text-graytxt">
            {getWeekDateRange(weeksAgo)}
          </div>
        </div>
        
        {/* Bar Chart with Navigation Arrows */}
        <div className="mt-3 flex items-center justify-center gap-1 px-2">
          {/* Left Arrow - Only show when available */}
          {available ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setWeeksAgo(prev => prev + 1);
              }}
              className="p-1.5 hover:bg-border/30 rounded-lg transition-colors active:scale-95 flex-shrink-0"
              aria-label="Previous week"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          ) : <div className="w-9" />}
          
          {/* Chart - Key forces re-render to prevent animation artifacts */}
          <div key={weeksAgo} className="flex-shrink-0">
            <BarChart 
              values={weeklyVolume} 
              recommendationLines={[]}
              labels={["S","M","T","W","T","F","S"]} 
              height={110} 
            />
          </div>
          
          {/* Right Arrow - Only show when available */}
          {available ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setWeeksAgo(prev => Math.max(0, prev - 1));
              }}
              disabled={weeksAgo === 0}
              className={`p-1.5 rounded-lg transition-colors active:scale-95 flex-shrink-0 ${
                weeksAgo === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-border/30'
              }`}
              aria-label="Next week"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ) : <div className="w-9" />}
        </div>
        
        {/* Metrics row */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-graytxt">
            Flash Rate: {available ? (
              <span className={`${getFlashRateColor(weeklyData.flashRate)}`}>
                {weeklyData.flashRate}%
              </span>
            ) : (
              <span>--</span>
            )} • Climbs: <span className="text-white">{available ? total : '--'}</span>
          </div>
          <ChevronDownIcon 
            className={`w-4 h-4 transition-transform duration-200 text-graytxt ${open ? 'rotate-180' : ''}`}
          />
        </div>

        {/* Expandable content */}
        {open && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
            {available ? (
              <>
                <div className="border border-border/50 rounded-lg p-3">
                  <div className="text-sm text-white font-semibold mb-3 text-center">Grade Distribution</div>
                  {grades.map((g, i) => (
                    <div key={i} className="mb-2">
                      <div className="flex justify-between text-sm mb-1"><span className="text-graytxt">{g.label}</span><span>{g.val}% ({g.count || 0})</span></div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-white/70" style={{width: `${g.val}%`}}></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border border-border/50 rounded-lg p-3">
                  <div className="text-sm text-white font-semibold mb-3 text-center">Style Distribution</div>
                  {styles.map((s, i) => (
                    <div key={i} className="mb-2">
                      <div className="flex justify-between text-sm mb-1"><span className="text-graytxt">{s.label}</span><span>{s.val}% ({s.count || 0})</span></div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-white/70" style={{width: `${s.val}%`}}></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border border-border/50 rounded-lg p-3">
                  <div className="text-sm text-white font-semibold mb-3 text-center">Wall Angle Distribution</div>
                  {angles.map((a, i) => (
                    <div key={i} className="mb-2">
                      <div className="flex justify-between text-sm mb-1"><span className="text-graytxt">{a.label}</span><span>{a.val}% ({a.count || 0})</span></div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-white/70" style={{width: `${a.val}%`}}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="relative -mx-4 rounded-lg overflow-hidden">
                {/* Blurred preview content */}
                <div className="space-y-4 blur-sm pointer-events-none opacity-40 px-4">
                  <div>
                    <div className="text-sm text-white font-semibold mb-2 text-center">Grade Distribution</div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1"><span className="text-graytxt">V0-V2</span><span>35%</span></div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-white/70" style={{width: '35%'}}></div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1"><span className="text-graytxt">V3-V4</span><span>45%</span></div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-white/70" style={{width: '45%'}}></div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1"><span className="text-graytxt">V5+</span><span>20%</span></div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-white/70" style={{width: '20%'}}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-white font-semibold mb-2 text-center">Style Distribution</div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1"><span className="text-graytxt">Power</span><span>40%</span></div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-white/60" style={{width: '40%'}}></div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1"><span className="text-graytxt">Technical</span><span>35%</span></div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-white/60" style={{width: '35%'}}></div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1"><span className="text-graytxt">Endurance</span><span>25%</span></div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-white/60" style={{width: '25%'}}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-white font-semibold mb-2 text-center">Wall Angle Distribution</div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1"><span className="text-graytxt">Overhang</span><span>50%</span></div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-white/50" style={{width: '50%'}}></div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1"><span className="text-graytxt">Vertical</span><span>30%</span></div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-white/50" style={{width: '30%'}}></div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1"><span className="text-graytxt">Slab</span><span>20%</span></div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-white/50" style={{width: '20%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Text overlay on blur only */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
                  <div className="text-center px-8">
                    <div className="mb-4">
                      <LockClosedIcon className="w-8 h-8 text-white/70 mx-auto mb-3" />
                      <div className="text-xl font-bold text-white mb-1">
                        {3 - currentSessions} Session{3 - currentSessions === 1 ? '' : 's'} Left
                      </div>
                      <div className="text-base text-white/80 mb-3">
                        Until weekly insights unlock
                      </div>
                    </div>
                    
                    <div className="text-sm text-white/60 leading-relaxed">
                      Track more climbing sessions to unlock detailed weekly analytics
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};

export default ThisWeek;

