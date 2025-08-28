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
          <h3 className="font-semibold text-base">This Week</h3>
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
        
        {!available && (
          <div className="mt-2 text-sm text-blue text-center">
            Track {3 - currentSessions} more session{3 - currentSessions === 1 ? '' : 's'} to enable rich insights.
          </div>
        )}

        
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
              <div className="relative rounded-lg overflow-hidden">
                {/* Blur overlay */}
                <div className="absolute inset-0 bg-card/80 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm text-white font-semibold mb-2">Coming Soon</div>
                    <div className="text-sm text-graytxt">Track more sessions to unlock</div>
                  </div>
                </div>
                
                {/* Blurred preview content */}
                <div className="space-y-4 opacity-60">
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
              </div>
            )}
          </div>
        )}

        {/* Expand/Collapse arrow at bottom center */}
        <div className="flex justify-center mt-2">
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
