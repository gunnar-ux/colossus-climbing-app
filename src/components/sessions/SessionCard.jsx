import { useState } from 'react';
import { ChevronDownIcon, TrophyIcon } from '../ui/Icons.jsx';
import Progress from '../ui/Progress.jsx';
import { roundRPE } from '../../utils/index.js';

// SessionCard component extracted from sessions.html
// Preserves exact dark theme styling, collapsible animations, and data visualization

const SessionCard = ({ session, index }) => {
  const [open, setOpen] = useState(false);
  
  // Get flash rate color based on performance ranges
  const getFlashRateColor = (rate) => {
    if (rate >= 80) return 'text-green';      // 80-100%: Excellent (green)
    if (rate >= 40) return 'text-blue';       // 40-79%: Good (blue)  
    return 'text-red';                        // 0-39%: Needs work (red)
  };
  
  // Example: Check if this is an exceptional session (for demo purposes)
  const isExceptionalSession = session.flashRate >= 80 && session.climbs >= 10;
  
  return (
    <div className={`${
      isExceptionalSession 
        ? 'bg-gradient-to-r from-emerald-950/25 to-green-900/20 border border-emerald-700/40 shadow-emerald-900/15 shadow-lg' 
        : 'bg-card border border-border'
    } rounded-col px-4 pt-4 pb-3 cursor-pointer`} onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-base">{session.date === 'Now' ? 'Current Session' : session.date}</div>
            {isExceptionalSession && <TrophyIcon className="w-4 h-4 text-emerald-400" />}
          </div>
          <div className="text-sm text-white">{session.climbs} Climbs</div>
        </div>
      <div className="flex items-center justify-between text-sm text-graytxt">
        <div>
          Peak: <span className="text-white">{session.peakGrade || 'V0'}</span> • Flash Rate: <span className={getFlashRateColor(session.flashRate || 0)}>{session.flashRate || 0}%</span> • XP: <span className="text-white">{session.totalXP || 0}</span>
        </div>
        <ChevronDownIcon 
          className={`w-4 h-4 transition-transform duration-200 text-graytxt ${open ? 'rotate-180' : ''}`}
        />
      </div>
      
      {/* Expandable content */}
      {open && (
        <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
          {/* Grade Distribution */}
          <div className="border border-border/50 rounded-lg p-3">
            <div className="text-sm text-white font-semibold mb-3 text-center">Grade Distribution</div>
            {(session.grades || []).map((g, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-graytxt">{g.label}</span>
                  <span>{g.val}% ({g.count || 0})</span>
                </div>
                <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-white/70" style={{width: `${g.val}%`}}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Style Distribution */}
          <div className="border border-border/50 rounded-lg p-3">
            <div className="text-sm text-white font-semibold mb-3 text-center">Style Distribution</div>
            {(session.styles || []).map((s, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between text-sm mb-1">
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
          <div className="border border-border/30 rounded-lg p-3">
            <div className="text-sm text-white font-semibold mb-3 text-center">Wall Angle Distribution</div>
            {(session.angles || []).map((w, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between text-sm mb-1">
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
          <div className="border border-border/50 rounded-lg p-3">
            <div className="text-sm text-white font-semibold mb-3 text-center">Boulder vs Board</div>
            {session.types?.map((t, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-graytxt">{t.label}</span>
                  <span>{t.val}% ({t.count || 0})</span>
                </div>
                <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-white/70" style={{width: `${t.val}%`}}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Average Perceived Effort */}
          <div className="border border-border/50 rounded-lg p-3">
            <div className="text-sm text-white font-semibold mb-3 text-center">Average Perceived Effort</div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-white/70" style={{width: `${Math.min((roundRPE(session.avgRPE) / 10) * 100, 100)}%`}}></div>
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
                <li key={i} className="flex items-center justify-between border border-border/60 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-white">{c.grade}</div>
                    <div className="text-sm text-graytxt px-1.5 py-0.5 rounded border border-border/40">
                      {c.type === 'BOARD' ? 'Board' : 'Boulder'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white">
                      {c.allStyles && c.allStyles.length > 0 ? c.allStyles.join(', ') : c.style} {c.angle}
                    </div>
                    <div className="text-sm text-graytxt">
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
