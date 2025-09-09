// Data hydration hook - loads user data from database on app start
import { useState, useEffect } from 'react';
import { database } from '../lib/supabase.js';

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
      const climbs = session.climbs || [];
      
      // Calculate session stats from climbs
      const sessionStats = calculateSessionStats(climbs);
      
      return {
        id: session.id,
        date: formatSessionDate(session.start_time),
        timestamp: new Date(session.start_time).getTime(),
        startTime: new Date(session.start_time).getTime(),
        endTime: session.end_time ? new Date(session.end_time).getTime() : null,
        duration: calculateDuration(session.start_time, session.end_time),
        climbs: climbs.length,
        medianGrade: session.median_grade || calculateMedianGrade(climbs),
        avgRPE: session.avg_rpe || calculateAvgRPE(climbs),
        climbList: climbs.map(transformClimb),
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
    styles: [climb.style],
    angle: normalizeAngle(climb.wall_angle),
    wall: climb.wall_angle,
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

  const calculateSessionStats = (climbs) => {
    // Implement basic session stats calculation
    // This matches the logic from sessionCalculations.js
    const gradeCounts = {};
    const styleCounts = { 'Power': 0, 'Technical': 0, 'Simple': 0 };
    const angleCounts = { 'Slab': 0, 'Vertical': 0, 'Overhang': 0 };

    climbs.forEach(climb => {
      // Count grades
      const grade = climb.grade || 'Unknown';
      gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;

      // Count styles
      const style = normalizeStyle(climb.style);
      if (styleCounts.hasOwnProperty(style)) {
        styleCounts[style]++;
      }

      // Count angles
      const angle = normalizeAngle(climb.wall_angle);
      if (angleCounts.hasOwnProperty(angle)) {
        angleCounts[angle]++;
      }
    });

    const total = climbs.length;
    if (total === 0) {
      return {
        grades: [],
        styles: [],
        angles: [],
        types: []
      };
    }

    // Convert to percentages
    const grades = Object.entries(gradeCounts)
      .map(([label, count]) => ({
        label,
        count,
        val: Math.round((count / total) * 100)
      }))
      .sort((a, b) => {
        const aNum = parseInt(a.label.replace('V', ''));
        const bNum = parseInt(b.label.replace('V', ''));
        return aNum - bNum;
      });

    const styles = Object.entries(styleCounts)
      .map(([label, count]) => ({
        label,
        count,
        val: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.val - a.val);

    const angles = Object.entries(angleCounts)
      .map(([label, count]) => ({
        label,
        count,
        val: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.val - a.val);

    return { grades, styles, angles, types: [] };
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
