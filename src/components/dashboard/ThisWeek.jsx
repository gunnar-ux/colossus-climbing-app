import { useState } from 'react';
import { BarChart, Trend } from './Charts.jsx';

// ThisWeek component extracted from dashboard HTML
// Preserves exact dark theme styling and expandable content behavior

const ThisWeek = ({ available = false, currentSessions = 0 }) => {
  const [open, setOpen] = useState(false);
  const weeklyVolume = available ? [25, 21, 12, 28, 14, 6, 18] : [2, 2, 2, 2, 2, 2, 2];
  const total = weeklyVolume.reduce((a, b) => a + b, 0);
  const avgRPE = available ? 6.8 : 0;
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
      <div className="mx-5 bg-card border border-border rounded-col p-4 hover:border-white/10 transition">
        <button className="w-full text-left min-h-[44px]" onClick={() => setOpen(o => !o)}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base flex items-center gap-2">
              This Week
              <span className="text-xs text-graytxt">
                {open ? '▼' : '▶'}
              </span>
            </h3>
            <div className="text-sm text-graytxt">
              Total: <span className="text-white font-medium">{available ? total : '--'}</span>
              {available && <> • Avg RPE: <span className="text-white font-medium">{avgRPE}</span></>}
            </div>
          </div>
        </button>
        <div className="mt-2 flex justify-center">
          <BarChart values={weeklyVolume} labels={["S","M","T","W","T","F","S"]} height={90} onClick={() => setOpen(o => !o)} />
        </div>
        {!available && (
          <div className="mt-2 text-sm text-blue text-center">
            Track {3 - currentSessions} more session{3 - currentSessions === 1 ? '' : 's'} to enable rich insights.
          </div>
        )}
        {available && (
          <div className="mt-3 flex items-center justify-between text-sm">
            <div>Flash Rate: <span className="font-medium">68%</span> <Trend dir="up">+12% from last week</Trend></div>
            <div>Median: <span className="font-medium">V4.5</span> <Trend dir="up">+0.3</Trend></div>
          </div>
        )}
        
        {/* Expandable content */}
        <div className={`transition-[max-height,opacity] duration-300 ease-out overflow-hidden ${open ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {available && (
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-sm text-white font-semibold mb-2 text-center">Grade Distribution</div>
                {grades.map((g, i) => (
                  <div key={i} className="mb-2">
                    <div className="flex justify-between text-xs mb-1"><span className="text-graytxt">{g.label}</span><span>{g.val}%</span></div>
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
                    <div className="flex justify-between text-xs mb-1"><span className="text-graytxt">{s.label}</span><span>{s.val}%</span></div>
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
                    <div className="flex justify-between text-xs mb-1"><span className="text-graytxt">{a.label}</span><span>{a.val}%</span></div>
                    <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-white/50" style={{width: `${a.val}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ThisWeek;
