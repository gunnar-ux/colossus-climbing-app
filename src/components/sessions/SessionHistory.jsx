import { useState } from 'react';
import SessionCard from './SessionCard.jsx';
import EmptySessionCard from './EmptySessionCard.jsx';

// Session History with filtering tabs
// Provides Week/Month/All Time filtering like Account page

const SessionHistory = ({ sessions = [], profile }) => {
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

  // PlaceholderSessionCard is now replaced by EmptySessionCard component

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
        {/* If user has no sessions at all, show single empty card with message */}
        {sessions.length === 0 ? (
          <>
            <EmptySessionCard title="Upcoming Session" />
            <div className="text-center py-2">
              <div className="text-graytxt text-sm">
                Track climbs to see session metrics.
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Sort sessions by timestamp (most recent first) and show them */}
            {[...filteredSessions]
              .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
              .map((session, i) => (
                <SessionCard key={session.id || i} session={session} index={i} profile={profile} allSessions={sessions} />
              ))}
            
            {/* Empty state for filtered views when user has sessions but none match the filter */}
            {filteredSessions.length === 0 && (
              <div className="text-center py-8">
                <div className="text-graytxt text-sm">
                  No sessions found for {activeFilter.toLowerCase()}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default SessionHistory;
