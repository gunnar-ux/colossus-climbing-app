import { useState } from 'react';
import SessionCard from './SessionCard.jsx';

// Session History with filtering tabs
// Provides Week/Month/All Time filtering like Account page

const SessionHistory = ({ sessions = [] }) => {
  const [activeFilter, setActiveFilter] = useState('Week');
  
  // Filter sessions based on active tab
  const getFilteredSessions = () => {
    const now = Date.now();
    
    switch (activeFilter) {
      case 'Week':
        const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
        return sessions.filter(session => 
          session.timestamp && session.timestamp >= oneWeekAgo
        );
      
      case 'Month':
        const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
        return sessions.filter(session => 
          session.timestamp && session.timestamp >= oneMonthAgo
        );
      
      case 'All Time':
      default:
        return sessions;
    }
  };

  const filteredSessions = getFilteredSessions();

  // Simple Placeholder Session Card - Visual Spaceholder Only
  const PlaceholderSessionCard = () => {
    return (
      <div className="bg-card/50 border border-border/60 rounded-col px-4 pt-4 pb-3 opacity-80">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-base text-graytxt">
            Upcoming Session
          </div>
          <div className="text-sm text-graytxt/80">
            -- Climbs
          </div>
        </div>
        <div className="text-sm text-graytxt/80">
          Peak: -- • Flash Rate: --% • XP: --
        </div>
      </div>
    );
  };

  return (
    <section className="pt-4 pb-20">
      {/* Filter Tabs */}
      <div className="px-5 mb-4">
        <div className="flex bg-border/30 rounded-lg p-1">
          {['Week', 'Month', 'All Time'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-white text-black'
                  : 'text-graytxt hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Session List */}
      <div className="mx-5 space-y-3">
        {/* Sort sessions by timestamp (most recent first) and show them */}
        {[...filteredSessions]
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
          .map((session, i) => (
            <SessionCard key={i} session={session} index={i} />
          ))}
        
        {/* Show calibration placeholders if less than 5 total sessions - Simple visual spaceholders */}
        {sessions.length < 5 && (
          <>
            {Array.from({ length: 5 - sessions.length }, (_, i) => (
              <PlaceholderSessionCard 
                key={`placeholder-${sessions.length + i + 1}`}
              />
            ))}
          </>
        )}

        {/* Empty state for filtered views */}
        {filteredSessions.length === 0 && sessions.length > 0 && (
          <div className="text-center py-8">
            <div className="text-graytxt text-sm">
              No sessions found for {activeFilter.toLowerCase()}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SessionHistory;
