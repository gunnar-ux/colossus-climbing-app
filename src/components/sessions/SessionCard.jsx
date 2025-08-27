import { useState } from 'react';
import Progress from '../ui/Progress.jsx';

// SessionCard component extracted from sessions.html
// Preserves exact dark theme styling, collapsible animations, and data visualization

const SessionCard = ({ session, index }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="bg-card border border-border rounded-col p-4 hover:border-white/10 transition">
      <button className="w-full text-left min-h-[44px]" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center justify-between">
          <div className="font-semibold flex items-center gap-2">
            {session.date}
            <span className="text-xs text-graytxt">
              {open ? '▼' : '▶'}
            </span>
          </div>
          <div className="text-sm text-graytxt">{session.duration}</div>
        </div>
        <div className="text-sm text-graytxt mt-1">
          <span className="text-white">{session.climbs} climbs</span> • {session.medianGrade} median • {session.style} focus
        </div>
      </button>
      
      <div className={`transition-[max-height,opacity] duration-300 ease-out overflow-hidden ${open ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="mt-3 grid gap-4">
          {/* Grade Distribution */}
          <div>
            <div className="text-sm text-white font-semibold mb-2 text-center">Grade Distribution</div>
            {session.grades.map((g, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-graytxt">{g.label}</span>
                  <span>{g.val}% ({g.count || 0})</span>
                </div>
                <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-white/80" style={{width: `${g.val}%`}}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Style Distribution */}
          <div>
            <div className="text-sm text-white font-semibold mb-2 text-center">Style Distribution</div>
            {session.styles.map((s, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-graytxt">{s.label}</span>
                  <span>{s.val}% ({s.count || 0})</span>
                </div>
                <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-white/70" style={{width: `${s.val}%`}}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Wall Angles */}
          <div>
            <div className="text-sm text-white font-semibold mb-2 text-center">Wall Angle Distribution</div>
            {session.angles.map((w, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-graytxt">{w.label}</span>
                  <span>{w.val}% ({w.count || 0})</span>
                </div>
                <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-white/70" style={{width: `${w.val}%`}}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Boulder vs Board Distribution */}
          <div>
            <div className="text-sm text-white font-semibold mb-2 text-center">Boulder vs Board</div>
            {session.types?.map((t, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-graytxt">{t.label}</span>
                  <span>{t.val}% ({t.count || 0})</span>
                </div>
                <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-white/70" style={{width: `${t.val}%`}}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Average RPE */}
          <div>
            <div className="text-sm text-white font-semibold mb-2 text-center">Average RPE</div>
            <div className="flex items-center gap-3">
              <div className="flex-1"><Progress value={session.avgRPE} max={10} /></div>
              <div className="text-sm">{session.avgRPE}/10</div>
            </div>
          </div>
        </div>

        {/* Individual Climbs List */}
        <div className="mt-4">
          <div className="text-sm text-white font-semibold mb-2 text-center">Individual Climbs</div>
          <ul className="space-y-2">
            {session.climbList.map((c, i) => (
              <li key={i} className="flex items-center justify-between border border-border/60 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold text-white">{c.grade}</div>
                  <div className="text-xs text-graytxt px-1.5 py-0.5 rounded border border-border/40">
                    {c.type === 'BOARD' ? 'Board' : 'Boulder'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white">
                    {c.allStyles && c.allStyles.length > 0 ? c.allStyles.join(', ') : c.style} {c.angle}
                  </div>
                  <div className="text-xs text-graytxt">
                    RPE: {c.rpe} • Att: {c.attempts}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
