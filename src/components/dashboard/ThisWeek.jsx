import { useState } from 'react';
import { BarChart, Trend } from './Charts.jsx';
import { roundRPE } from '../../utils/index.js';

// ThisWeek component extracted from dashboard HTML
// Preserves exact dark theme styling and expandable content behavior

const ThisWeek = ({ available = false, currentSessions = 0 }) => {
  const [open, setOpen] = useState(false);
  const weeklyVolume = available ? [25, 21, 12, 28, 14, 6, 18] : [2, 2, 2, 2, 2, 2, 2];
  const total = weeklyVolume.reduce((a, b) => a + b, 0);
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
      <div className="mx-5 bg-card border border-border rounded-col px-4 pt-4 pb-3 hover:border-white/10 transition cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-base">This Week</h3>
          <div className="text-sm">
            <span className="text-white">Total:</span> <span className="text-graytxt font-medium">{available ? total : '--'}</span>
            {available && <> • <span className="text-white">Avg Perceived Effort:</span> <span className="text-graytxt font-medium">{avgRPE}</span></>}
          </div>
        </div>
        <div className="mt-2 flex justify-center">
          <BarChart values={weeklyVolume} labels={["S","M","T","W","T","F","S"]} height={90} />
        </div>
        
        {/* Flash Rate and Avg Grade - always shown */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <div><span className="text-white">Flash Rate:</span> <span className="text-graytxt font-medium">{available ? '68%' : '--'}</span> {available && <span className="text-green-400 text-sm">+12%</span>}</div>
          <div><span className="text-white">Avg Grade:</span> <span className="text-graytxt font-medium">{available ? 'V4.5' : '--'}</span> {available && <span className="text-green-400 text-sm">+0.3</span>}</div>
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
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white/70 mx-auto mb-3">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 15v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
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

        {/* Bottom-right dropdown toggle */}
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm text-blue">
            {available ? 'Weekly performance summary' : `Track ${3 - currentSessions} more session${3 - currentSessions === 1 ? '' : 's'} to unlock insights`}
          </div>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={`transition-transform duration-200 text-graytxt ${open ? 'rotate-180' : ''}`}
          >
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </div>

      </div>
    </section>
  );
};

export default ThisWeek;
