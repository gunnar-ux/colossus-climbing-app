import { useState } from 'react';
import { ChevronDownIcon, LockClosedIcon } from '../ui/Icons.jsx';
import { BarChart, Trend } from './Charts.jsx';
import { roundRPE } from '../../utils/index.js';

// ThisWeek component extracted from dashboard HTML
// Preserves exact dark theme styling and expandable content behavior

const ThisWeek = ({ available = false, currentSessions = 0, sessions = [] }) => {
  const [open, setOpen] = useState(false);
  
  // Calculate real weekly data from sessions
  const calculateWeeklyData = () => {
    if (!available || !sessions || sessions.length === 0) {
      return {
        weeklyVolume: [2, 2, 2, 2, 2, 2, 2], // Demo data
        flashRate: 0,
        totalClimbs: 0
      };
    }

    // Get current week boundaries (Sunday to Saturday)
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDay);
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
    let totalClimbs = 0;
    let totalFlashes = 0;

    // Process each session
    thisWeekSessions.forEach(session => {
      if (session.climbList && session.climbList.length > 0) {
        const sessionDate = new Date(session.timestamp);
        const dayOfWeek = sessionDate.getDay(); // 0 = Sunday
        
        // Add climbs to the correct day
        weeklyVolume[dayOfWeek] += session.climbList.length;
        totalClimbs += session.climbList.length;

        // Count flashes (attempts === 1)
        session.climbList.forEach(climb => {
          if (climb.attempts === 1) {
            totalFlashes++;
          }
        });
      }
    });

    const flashRate = totalClimbs > 0 ? Math.round((totalFlashes / totalClimbs) * 100) : 0;

    return {
      weeklyVolume,
      flashRate,
      totalClimbs
    };
  };

  const weeklyData = calculateWeeklyData();
  const weeklyVolume = weeklyData.weeklyVolume;
  const total = weeklyData.totalClimbs;
  const avgRPE = available ? roundRPE(6.8) : 0;
  const grades = available ? [
    {label:'V3', val:20}, {label:'V4', val:40}, {label:'V5', val:30}, {label:'V6', val:10},
  ] : [
    {label:'V3', val:25}, {label:'V4', val:25}, {label:'V5', val:25}, {label:'V6', val:25},
  ];
  // Style distribution for this week
  const styles = available ? [
    {label:'Power', val:40}, {label:'Technical', val:35}, {label:'Endurance', val:25},
  ] : [
    {label:'Power', val:33}, {label:'Technical', val:33}, {label:'Endurance', val:34},
  ];
  // Wall angle distribution for this week
  const angles = available ? [
    {label:'Overhang', val:45}, {label:'Vertical', val:40}, {label:'Slab', val:15},
  ] : [
    {label:'Overhang', val:33}, {label:'Vertical', val:34}, {label:'Slab', val:33},
  ];
  
  return (
    <section className="pt-4">
      <div className="mx-5 bg-card border border-border rounded-col px-4 pt-4 pb-3 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base">This Week</h3>
            {!available && <LockClosedIcon className="w-4 h-4 text-graytxt/60" />}
          </div>
          <div className="text-sm">
            <span className="text-white">Sessions:</span> <span className="text-graytxt font-medium">{available ? currentSessions : '--'}</span>
          </div>
        </div>
        <div className="mt-2 flex justify-center">
          <BarChart values={weeklyVolume} labels={["S","M","T","W","T","F","S"]} height={90} />
        </div>
        
        {/* Flash Rate with trend indicator - simplified */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm">
            <span className="text-white">Flash Rate:</span> <span className="text-graytxt font-medium">{available ? `${weeklyData.flashRate}%` : '--'}</span> {available && weeklyData.flashRate > 0 && <span className="text-green text-sm ml-1">↑12%</span>}
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
                <div>
                  <div className="text-sm text-white font-semibold mb-2 text-center">Grade Distribution</div>
                  {grades.map((g, i) => (
                    <div key={i} className="mb-2">
                      <div className="flex justify-between text-sm mb-1"><span className="text-graytxt">{g.label}</span><span>{g.val}%</span></div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-white/70" style={{width: `${g.val}%`}}></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div>
                  <div className="text-sm text-white font-semibold mb-2 text-center">Style Distribution</div>
                  {styles.map((s, i) => (
                    <div key={i} className="mb-2">
                      <div className="flex justify-between text-sm mb-1"><span className="text-graytxt">{s.label}</span><span>{s.val}%</span></div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-white/60" style={{width: `${s.val}%`}}></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div>
                  <div className="text-sm text-white font-semibold mb-2 text-center">Wall Angle Distribution</div>
                  {angles.map((a, i) => (
                    <div key={i} className="mb-2">
                      <div className="flex justify-between text-sm mb-1"><span className="text-graytxt">{a.label}</span><span>{a.val}%</span></div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-white/50" style={{width: `${a.val}%`}}></div>
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
