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

  // Generate 7-day week view with placeholders
  const getWeekViewSessions = () => {
    if (activeFilter !== 'Week') return getFilteredSessions();
    
    const weekSessions = [];
    const today = new Date();
    const hasMultipleSessions = sessions.length >= 3; // User has established sessions
    
    // Generate last 7 days (including today)
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toDateString();
      const isToday = i === 0;
      const isFuture = false; // We're only looking at past 7 days, so no future dates
      
      // Find session for this date
      const sessionForDate = sessions.find(session => {
        if (!session.timestamp) return false;
        return new Date(session.timestamp).toDateString() === dateString;
      });
      
      if (sessionForDate) {
        weekSessions.push(sessionForDate);
      } else {
        // Determine what to show for empty days
        let displayText;
        if (!hasMultipleSessions) {
          // Early user state - show "Upcoming Session" to fill screen
          displayText = 'Upcoming Session';
        } else if (isToday) {
          // Today with no session yet
          displayText = 'Today';
        } else {
          // Past date with no session - show the actual date
          displayText = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });
        }
        
        // Create placeholder for empty day
        weekSessions.push({
          id: `placeholder-${i}`,
          date: displayText,
          isPlaceholder: true,
          timestamp: date.getTime(),
          isEmpty: true // Flag to indicate this is an empty day, not upcoming
        });
      }
    }
    
    return weekSessions;
  };

  const filteredSessions = activeFilter === 'Week' ? getWeekViewSessions() : getFilteredSessions();

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
        {/* Sort sessions by timestamp (most recent first) and show them */}
        {[...filteredSessions]
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
          .map((session, i) => {
            if (session.isPlaceholder) {
              return <EmptySessionCard key={session.id} title={session.date} />;
            }
            return <SessionCard key={session.id || i} session={session} index={i} profile={profile} allSessions={sessions} />;
          })}
        
        {/* Show calibration placeholders if less than 5 total sessions - Only for non-Week views */}
        {activeFilter !== 'Week' && sessions.length < 5 && (
          <>
            {Array.from({ length: 5 - sessions.length }, (_, i) => (
              <EmptySessionCard 
                key={`placeholder-${sessions.length + i + 1}`}
                title="Upcoming Session"
              />
            ))}
          </>
        )}

        {/* Empty state for filtered views */}
        {filteredSessions.length === 0 && sessions.length > 0 && activeFilter !== 'Week' && (
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
