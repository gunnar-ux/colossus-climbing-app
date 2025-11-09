import { useState } from 'react';
import { ChevronDownIcon } from '../ui/Icons.jsx';

// Empty Session Card - Expandable placeholder matching real session card structure
// Used for placeholder sessions on Dashboard and Sessions page

const EmptySessionCard = ({ title = "Upcoming Session" }) => {
  const [open, setOpen] = useState(false);

  return (
    <div 
      className="bg-card border border-border rounded-col px-4 pt-4 pb-3 cursor-pointer opacity-80"
      onClick={() => setOpen(!open)}
    >
      <div>
        {/* Header Row: Title + Climbs count */}
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-base text-graytxt">
            {title}
          </div>
          <div className="text-sm text-graytxt">
            -- Climbs
          </div>
        </div>

        {/* Subtitle Row: Date and XP placeholder */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-graytxt/60">
            --
          </div>
          <div className="text-sm text-graytxt/60">
            -- XP
          </div>
        </div>
        
        {/* Metrics row - Hardest & Flash Rate */}
        <div className="text-sm text-graytxt mb-2">
          Hardest: <span className="text-white/40 font-medium">--</span> • Flash Rate: <span className="text-white/40 font-medium">--%</span>
        </div>
        
        {/* Powered by POGO footer with divider */}
        <div className="flex items-center justify-center pt-2 border-t border-border/40">
          <span className="text-xs text-graytxt/60">powered by </span>
          <span className="text-xs font-semibold ml-1 text-white">POGO</span>
          <ChevronDownIcon 
            className={`w-4 h-4 transition-transform duration-200 ml-auto text-graytxt/60 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </div>
      
              {/* Expandable content - Empty tables */}
              {open && (
                <div className="mt-4 pt-4 space-y-4 border-t border-border/50">
                  {/* Grade Distribution */}
                  <div className="rounded-lg p-3 border border-border/50">
                    <div className="text-sm text-white font-semibold mb-3 text-center">Grade Distribution</div>
                    <div className="text-center text-graytxt/60 text-sm py-2">
                      No Data
                    </div>
                  </div>

                  {/* Style Distribution */}
                  <div className="rounded-lg p-3 border border-border/50">
                    <div className="text-sm text-white font-semibold mb-3 text-center">Style Distribution</div>
                    <div className="text-center text-graytxt/60 text-sm py-2">
                      No Data
                    </div>
                  </div>

                  {/* Wall Angles */}
                  <div className="rounded-lg p-3 border border-border/50">
                    <div className="text-sm text-white font-semibold mb-3 text-center">Wall Angle Distribution</div>
                    <div className="text-center text-graytxt/60 text-sm py-2">
                      No Data
                    </div>
                  </div>

                  {/* Boulder vs Board */}
                  <div className="rounded-lg p-3 border border-border/50">
                    <div className="text-sm text-white font-semibold mb-3 text-center">Boulder vs Board</div>
                    <div className="text-center text-graytxt/60 text-sm py-2">
                      No Data
                    </div>
                  </div>

                  {/* Average Perceived Effort */}
                  <div className="rounded-lg p-3 border border-border/50">
                    <div className="text-sm text-white font-semibold mb-3 text-center">Average Perceived Effort</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="w-full h-2 rounded-full overflow-hidden bg-border">
                          <div className="h-full bg-white/20" style={{width: '0%'}}></div>
                        </div>
                      </div>
                      <div className="text-sm text-graytxt/60">--/10</div>
                    </div>
                  </div>

                  {/* Individual Climbs List */}
                  <div className="mt-4">
                    <div className="text-sm text-white font-semibold mb-2 text-center">Individual Climbs</div>
                    <div className="text-center text-graytxt/60 text-sm py-4 border border-border/50 rounded-lg">
                      No Data
                    </div>
                  </div>
                </div>
              )}
    </div>
  );
};

export default EmptySessionCard;

