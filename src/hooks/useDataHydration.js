// Data hydration hook - loads user data from database on app start
import { useState, useEffect } from 'react';
import { database } from '../lib/supabase.js';
import { calculateSessionStats } from '../utils/sessionCalculations.js';

export function useDataHydration(user, profile) {
  const [sessions, setSessions] = useState([]);
  const [userData, setUserData] = useState({
    totalSessions: 0,
    totalClimbs: 0
  });
  const [dataLoading, setDataLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (user && profile && !dataLoaded && !dataLoading) {
      loadUserData();
    }
  }, [user, profile, dataLoaded, dataLoading]);

  // Update userData when profile changes (for calibration card sync)
  useEffect(() => {
    if (profile && dataLoaded) {
      setUserData(prev => ({
        ...prev,
        totalSessions: profile.total_sessions || 0,
        totalClimbs: profile.total_climbs || 0
      }));
    }
  }, [profile?.total_sessions, profile?.total_climbs, dataLoaded]);

  const loadUserData = async () => {
    if (!user?.id) return;
    
    setDataLoading(true);
    console.log('📊 Loading user data from database...');

    try {
      // Load sessions with climbs from database
      const { data: dbSessions, error: sessionsError } = await database.sessions.getByUserId(user.id, 50);
      
      if (sessionsError) {
        console.error('📊 Error loading sessions:', sessionsError);
        setDataLoading(false);
        return;
      }

      console.log('📊 Loaded sessions from database:', dbSessions?.length || 0);

      // Transform database sessions to app format
      const transformedSessions = transformDatabaseSessions(dbSessions || []);
      
      // Check for today's active session
      const todaySession = findTodaySession(transformedSessions);
      
      // If there's an active session today, make sure it shows as "Now"
      if (todaySession) {
        todaySession.date = "Now";
      }

      setSessions(transformedSessions);
      
      // Update user data totals from profile
      setUserData({
        totalSessions: profile.total_sessions || 0,
        totalClimbs: profile.total_climbs || 0
      });

      setDataLoaded(true);
      console.log('📊 Data hydration complete');

    } catch (error) {
      console.error('📊 Data hydration failed:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // Transform database sessions to match app's expected format
  const transformDatabaseSessions = (dbSessions) => {
    return dbSessions.map(session => {
      const rawClimbs = session.climbs || [];
      
      // Transform climbs first, then calculate stats from transformed data
      const transformedClimbs = rawClimbs.map(transformClimb);
      const sessionStats = calculateSessionStats(transformedClimbs);
      
      return {
        id: session.id,
        date: formatSessionDate(session.start_time),
        timestamp: new Date(session.start_time).getTime(),
        startTime: new Date(session.start_time).getTime(),
        endTime: session.end_time ? new Date(session.end_time).getTime() : null,
        duration: calculateDuration(session.start_time, session.end_time),
        climbs: rawClimbs.length,
        medianGrade: session.median_grade || calculateMedianGrade(rawClimbs),
        avgRPE: session.avg_rpe || calculateAvgRPE(rawClimbs),
        climbList: transformedClimbs,
        totalXP: session.total_xp || sessionStats.totalXP || 0, // Use database value with fallback
        ...sessionStats
      };
    });
  };

  // Transform database climb to app format
  const transformClimb = (climb) => ({
    id: climb.id,
    timestamp: new Date(climb.timestamp).getTime(),
    grade: climb.grade,
    style: normalizeStyle(climb.style),
    styles: [normalizeStyle(climb.style)],
    angle: normalizeAngle(climb.wall_angle),
    wall: normalizeAngle(climb.wall_angle),
    rpe: climb.rpe,
    attempts: climb.attempts,
    type: climb.climb_type || 'BOULDER'
  });

  // Find today's session
  const findTodaySession = (sessions) => {
    const today = new Date().toDateString();
    return sessions.find(session => 
      new Date(session.timestamp).toDateString() === today
    );
  };

  // Helper functions
  const formatSessionDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Now"; // Will be changed to "Now" for active sessions
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const calculateDuration = (startTime, endTime) => {
    if (!endTime) return "Active";
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins}m`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    }
  };


  const calculateMedianGrade = (climbs) => {
    if (climbs.length === 0) return 'V0';
    
    const gradeValues = climbs.map(climb => 
      parseInt(climb.grade.replace('V', '')) || 0
    ).sort((a, b) => a - b);
    
    const median = gradeValues[Math.floor(gradeValues.length / 2)];
    return `V${median}`;
  };

  const calculateAvgRPE = (climbs) => {
    if (climbs.length === 0) return 0;
    
    const total = climbs.reduce((sum, climb) => sum + (climb.rpe || 0), 0);
    return Math.round((total / climbs.length) * 2) / 2; // Round to nearest 0.5
  };

  const normalizeStyle = (style) => {
    if (style === 'POWERFUL') return 'Power';
    if (style === 'TECHNICAL') return 'Technical';
    if (style === 'SIMPLE') return 'Simple';
    return style;
  };

  const normalizeAngle = (angle) => {
    if (!angle || angle === null || angle === undefined) return 'Vertical'; // Default fallback
    if (angle === 'SLAB') return 'Slab';
    if (angle === 'VERTICAL') return 'Vertical';
    if (angle === 'OVERHANG') return 'Overhang';
    return angle;
  };

  return {
    sessions,
    userData,
    dataLoading,
    dataLoaded,
    setSessions,
    setUserData,
    refreshData: () => {
      setDataLoaded(false);
      loadUserData();
    }
  };
}
