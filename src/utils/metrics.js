// Core climbing metrics calculations for Colossus
// Implements CRS, Load Baseline (ACWR), and Recommended Training

/**
 * Calculate session load based on climbs data
 * @param {Object} session - Session with climbs array
 * @returns {number} - Total session load score
 */
export function calculateSessionLoad(session) {
  if (!session.climbList || session.climbList.length === 0) {
    return 0;
  }
  
  return session.climbList.reduce((total, climb) => {
    // Extract grade number from V-grade (V0 = 1, V1 = 2, etc.)
    const gradePoints = parseInt(climb.grade.replace('V', '')) + 1;
    
    // Style multiplier based on climb style
    const styleMultiplier = 
      climb.style.toLowerCase().includes('power') ? 1.2 :
      climb.style.toLowerCase().includes('technical') ? 1.0 : 0.8;
    
    // Attempt factor - more attempts = higher load
    const attemptFactor = 1 + ((climb.attempts - 1) * 0.1);
    
    return total + (gradePoints * climb.rpe * styleMultiplier * attemptFactor);
  }, 0);
}

/**
 * Calculate load recovery component for CRS
 * @param {Array} sessions - Recent sessions array
 * @returns {number} - Recovery score (0-100)
 */
function calculateLoadRecovery(sessions) {
  if (sessions.length === 0) return 50;
  
  const lastSession = sessions[sessions.length - 1];
  if (!lastSession.timestamp) return 50;
  
  const hoursSince = (Date.now() - lastSession.timestamp) / (1000 * 60 * 60);
  const optimalRecovery = 48; // 48 hours optimal recovery
  
  return Math.min(100, (hoursSince / optimalRecovery) * 100);
}

/**
 * Calculate load trend component for CRS
 * @param {Array} recent - Recent 7-day sessions
 * @param {Array} baseline - Baseline 28-day sessions
 * @returns {number} - Trend score (0-100)
 */
function calculateLoadTrend(recent, baseline) {
  if (baseline.length === 0) return 75; // Default middle score
  
  const recentLoad = recent.reduce((sum, s) => sum + calculateSessionLoad(s), 0);
  const baselineAvg = baseline.reduce((sum, s) => sum + calculateSessionLoad(s), 0) / baseline.length;
  
  if (baselineAvg === 0) return 75;
  
  const ratio = recentLoad / (baselineAvg * 7);
  
  if (ratio < 0.8) return 60;   // Undertraining
  if (ratio <= 1.3) return 100; // Optimal
  if (ratio <= 1.5) return 50;  // Caution
  return 20; // Danger - overreaching
}

/**
 * Calculate RPE recovery component for CRS
 * @param {Array} sessions - Recent sessions
 * @returns {number} - RPE recovery score (0-100)
 */
function calculateRPERecovery(sessions) {
  if (sessions.length === 0) return 50;
  
  const lastSession = sessions[sessions.length - 1];
  const lastRPE = lastSession.avgRPE || 5;
  
  // Higher RPE = more fatigue = longer recovery needed
  const fatigueComponent = (10 - lastRPE) * 10;
  return Math.max(0, Math.min(100, fatigueComponent));
}

/**
 * Calculate volume pattern component for CRS
 * @param {Array} sessions - Recent sessions
 * @returns {number} - Volume pattern score (0-100)
 */
function calculateVolumePattern(sessions) {
  if (sessions.length < 3) return 75;
  
  // Check for consistent training pattern
  const volumes = sessions.slice(-7).map(s => s.climbs || 0);
  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const variance = volumes.reduce((sum, v) => sum + Math.pow(v - avgVolume, 2), 0) / volumes.length;
  const consistency = Math.max(0, 100 - (variance * 2));
  
  return consistency;
}

/**
 * Get CRS advice message based on score
 * @param {number} score - CRS score (0-100)
 * @returns {string} - Advice message
 */
function getCRSMessage(score) {
  if (score >= 77) return 'Excellent. Ready for high intensity training.';
  if (score >= 67) return 'Good. Peak performance ready.';
  if (score >= 45) return 'Moderate. Balanced training recommended.';
  if (score >= 30) return 'Caution. Focus on recovery and technique.';
  return 'Poor. Prioritize rest and light movement.';
}

/**
 * Calculate CRS (Climb Readiness Score) - Progressive Implementation
 * @param {number} sessionCount - Total number of sessions
 * @param {number} climbCount - Total number of climbs
 * @param {Array} sessions - All sessions data with timestamps
 * @returns {Object|null} - CRS data or null if insufficient data
 */
export function calculateCRS(sessionCount, climbCount, sessions) {
  // Phase 1: No data (0-2 sessions)
  if (sessionCount < 3) {
    return null; // Display "--"
  }
  
  // Get sessions with valid timestamps
  const validSessions = sessions.filter(s => s.timestamp);
  const lastSession = validSessions[validSessions.length - 1];
  
  // Phase 2: Basic CRS (3-4 sessions)
  if (sessionCount < 5) {
    const hoursSinceLastSession = lastSession ? 
      (Date.now() - lastSession.timestamp) / (1000 * 60 * 60) : 48;
    const lastRPE = lastSession?.avgRPE || 5;
    
    // Simple formula: recovery time + fatigue
    const recoveryComponent = Math.min(100, (hoursSinceLastSession / 48) * 60);
    const fatigueComponent = (10 - lastRPE) * 4;
    
    return {
      score: Math.round(Math.max(0, Math.min(100, recoveryComponent + fatigueComponent))),
      status: 'building',
      message: 'Building baseline. Basic recovery tracking.',
      confidence: 'low'
    };
  }
  
  // Phase 3: Full CRS (5+ sessions)
  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  const twentyEightDaysAgo = now - (28 * 24 * 60 * 60 * 1000);
  
  const recentSessions = validSessions.filter(s => s.timestamp > sevenDaysAgo);
  const baselineSessions = validSessions.filter(s => s.timestamp > twentyEightDaysAgo);
  
  // Calculate components
  const loadRecovery = calculateLoadRecovery(recentSessions);
  const loadTrend = calculateLoadTrend(recentSessions, baselineSessions);
  const rpeRecovery = calculateRPERecovery(recentSessions);
  const volumePattern = calculateVolumePattern(recentSessions);
  
  const score = Math.round(
    loadRecovery * 0.35 +
    loadTrend * 0.25 +
    rpeRecovery * 0.20 +
    volumePattern * 0.20
  );
  
  return {
    score: Math.max(0, Math.min(100, score)),
    status: sessionCount >= 7 ? 'calibrated' : 'calibrating',
    message: getCRSMessage(score),
    confidence: sessionCount >= 7 ? 'high' : 'medium',
    components: {
      loadRecovery,
      loadTrend,
      rpeRecovery,
      volumePattern
    }
  };
}

/**
 * Get load status based on ratio
 * @param {number} ratio - Load ratio
 * @returns {string} - Status level
 */
function getLoadStatus(ratio) {
  if (ratio < 0.8) return 'low';
  if (ratio <= 1.3) return 'optimal';
  if (ratio <= 1.5) return 'elevated';
  return 'high';
}

/**
 * Get load message based on ratio
 * @param {number} ratio - Load ratio
 * @returns {string} - Load advice message
 */
function getLoadMessage(ratio) {
  if (ratio < 0.8) return 'Training load is low. Consider increasing volume.';
  if (ratio <= 1.3) return 'Training load is optimal. Maintain current pattern.';
  if (ratio <= 1.5) return 'Training load is elevated. Monitor recovery closely.';
  return 'Training load is high. Consider reducing volume or intensity.';
}

/**
 * Calculate Load Baseline (ACWR - Acute:Chronic Workload Ratio)
 * @param {Array} sessions - All sessions with timestamps
 * @returns {Object|null} - Load ratio data or null if insufficient data
 */
export function calculateLoadRatio(sessions) {
  // Only show after 5 sessions
  if (sessions.length < 5) {
    return null; // Hidden
  }
  
  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  const twentyEightDaysAgo = now - (28 * 24 * 60 * 60 * 1000);
  
  // Get relevant sessions with valid timestamps
  const validSessions = sessions.filter(s => s.timestamp);
  const acuteSessions = validSessions.filter(s => s.timestamp > sevenDaysAgo);
  const chronicSessions = validSessions.filter(s => s.timestamp > twentyEightDaysAgo);
  
  if (chronicSessions.length === 0) {
    return {
      ratio: 0,
      status: 'insufficient',
      message: 'Need more training history for accurate load tracking.'
    };
  }
  
  // Calculate loads
  const acuteLoad = acuteSessions.reduce((sum, s) => sum + calculateSessionLoad(s), 0);
  const chronicLoad = chronicSessions.reduce((sum, s) => sum + calculateSessionLoad(s), 0);
  const chronicDaily = chronicLoad / 28;
  
  const ratio = chronicDaily > 0 ? acuteLoad / (chronicDaily * 7) : 0;
  
  return {
    ratio: parseFloat(ratio.toFixed(2)),
    status: getLoadStatus(ratio),
    message: getLoadMessage(ratio),
    confidence: sessions.length >= 7 ? 'high' : 'establishing'
  };
}

/**
 * Reduce training volume recommendation
 * @param {string} volume - Original volume recommendation
 * @returns {string} - Reduced volume
 */
function reduceVolume(volume) {
  // Extract numbers and reduce by ~20%
  const match = volume.match(/(\d+)-(\d+)/);
  if (match) {
    const lower = Math.max(1, Math.round(parseInt(match[1]) * 0.8));
    const upper = Math.max(lower + 1, Math.round(parseInt(match[2]) * 0.8));
    return `${lower}-${upper}`;
  }
  return volume;
}

/**
 * Get recommended training based on CRS and load
 * @param {Object|null} crs - CRS calculation result
 * @param {Object|null} loadRatio - Load ratio calculation result
 * @param {Array} recentSessions - Recent session data
 * @returns {Object} - Training recommendation
 */
export function getRecommendedTraining(crs, loadRatio, recentSessions) {
  // No data state
  if (!crs) {
    return {
      type: 'Track Climbs',
      volume: 'Start with 10-15',
      rpe: 'Listen to your body',
      focus: 'Begin building your climbing profile',
      style: 'mixed'
    };
  }
  
  // Based on CRS zones
  let recommendation = {};
  
  if (crs.score >= 77) {
    // Green zone - ready for hard training
    recommendation = {
      type: 'Power',
      volume: '15-20',
      rpe: '≤9',
      focus: 'Projects and limit boulders',
      style: 'power'
    };
  } else if (crs.score >= 45) {
    // Yellow zone - moderate training
    recommendation = {
      type: 'Capacity',
      volume: '12-18',
      rpe: '≤7',
      focus: 'Volume at moderate intensity',
      style: 'endurance'
    };
  } else {
    // Red zone - recovery needed
    recommendation = {
      type: 'Skill',
      volume: '8-12',
      rpe: '≤5',
      focus: 'Technique and movement quality',
      style: 'technical'
    };
  }
  
  // Adjust based on load ratio
  if (loadRatio && loadRatio.ratio > 1.3) {
    recommendation.volume = reduceVolume(recommendation.volume);
    recommendation.note = 'Load elevated - reduced volume recommended';
  }
  
  return recommendation;
}

/**
 * Enhanced metric availability with progressive disclosure
 * @param {number} sessions - Total sessions
 * @param {number} climbs - Total climbs
 * @param {Array} sessionData - Session array for date range checks
 * @returns {Object} - Availability flags and confidence levels
 */
export function getEnhancedMetricAvailability(sessions, climbs, sessionData = []) {
  const validSessions = sessionData.filter(s => s.timestamp);
  const now = Date.now();
  const fourteenDaysAgo = now - (14 * 24 * 60 * 60 * 1000);
  const hasRecentData = validSessions.some(s => s.timestamp > fourteenDaysAgo);
  
  return {
    // Core metrics
    crs: sessions >= 3,
    crsAccurate: sessions >= 7 && hasRecentData,
    loadRatio: sessions >= 5,
    loadRatioAccurate: sessions >= 7 && hasRecentData,
    
    // Dashboard features
    weeklyTrends: sessions >= 3,
    gradeProgression: climbs >= 30,
    allMetrics: sessions >= 3 && climbs >= 30,
    
    // Training recommendations
    recommendations: sessions >= 1,
    personalizedRecommendations: sessions >= 5,
    
    // Confidence levels
    confidence: {
      overall: sessions >= 7 && hasRecentData ? 'high' : 
               sessions >= 5 ? 'medium' : 'low',
      crs: sessions >= 7 ? 'high' : sessions >= 5 ? 'medium' : 'low',
      load: sessions >= 7 && hasRecentData ? 'high' : 'establishing'
    }
  };
}
