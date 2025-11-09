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
 * 
 * Note: For CRS (readiness), low load = high readiness (fully recovered)
 */
function calculateLoadTrend(recent, baseline) {
  if (baseline.length === 0) return 75; // Default middle score
  
  const recentLoad = recent.reduce((sum, s) => sum + calculateSessionLoad(s), 0);
  const baselineAvg = baseline.reduce((sum, s) => sum + calculateSessionLoad(s), 0) / baseline.length;
  
  if (baselineAvg === 0) return 75;
  
  const ratio = recentLoad / (baselineAvg * 7);
  
  // CRS measures readiness, not training adherence
  // Low ratio = low fatigue = HIGH readiness
  if (ratio < 0.3) return 100;  // Very low load = fully recovered = maximum readiness
  if (ratio < 0.8) return 90;   // Low load = well recovered = high readiness
  if (ratio <= 1.3) return 100; // Optimal load = balanced readiness
  if (ratio <= 1.5) return 50;  // Elevated load = reduced readiness
  return 20; // High load = overreaching = low readiness
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
  if (score >= 88) return 'Optimal. Maximum capacity available.';
  if (score >= 75) return 'Good. High capacity ready.';
  if (score >= 60) return 'Moderate. Balanced training recommended.';
  if (score >= 45) return 'Caution. Reduced capacity today.';
  if (score >= 30) return 'Limited. Focus on recovery and technique.';
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
  // Load Recovery and RPE Recovery should use ALL sessions to find most recent,
  // not just sessions within the 7-day window
  const loadRecovery = calculateLoadRecovery(validSessions);
  const loadTrend = calculateLoadTrend(recentSessions, baselineSessions);
  const rpeRecovery = calculateRPERecovery(validSessions);
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
 * Calculate personal baseline from user's session history
 * @param {Array} sessions - User's session history
 * @returns {Object} - Personal baseline metrics
 */
export function calculatePersonalBaseline(sessions) {
  if (!sessions || sessions.length === 0) {
    return {
      avgSessionLoad: 120, // Conservative default
      avgVolume: 12,
      avgRPE: 6.5,
      confidence: 'none'
    };
  }

  // Use last 5-10 sessions for baseline calculation
  const recentSessions = sessions.slice(0, Math.min(10, sessions.length));
  const validSessions = recentSessions.filter(s => s.climbList && s.climbList.length > 0);

  if (validSessions.length === 0) {
    return {
      avgSessionLoad: 120,
      avgVolume: 12, 
      avgRPE: 6.5,
      confidence: 'none'
    };
  }

  // Calculate averages
  const totalLoad = validSessions.reduce((sum, s) => sum + calculateSessionLoad(s), 0);
  const totalVolume = validSessions.reduce((sum, s) => sum + s.climbList.length, 0);
  const totalRPE = validSessions.reduce((sum, s) => {
    const sessionRPE = s.climbList.reduce((rpeSum, c) => rpeSum + c.rpe, 0) / s.climbList.length;
    return sum + sessionRPE;
  }, 0);

  return {
    avgSessionLoad: Math.round(totalLoad / validSessions.length),
    avgVolume: Math.round(totalVolume / validSessions.length),
    avgRPE: Math.round((totalRPE / validSessions.length) * 2) / 2, // Round to 0.5
    confidence: validSessions.length >= 5 ? 'high' : validSessions.length >= 3 ? 'medium' : 'low'
  };
}

/**
 * Get load-based capacity recommendations (caps, not targets)
 * @param {Object|null} crs - CRS calculation result
 * @param {Object|null} loadRatio - Load ratio calculation result
 * @param {Array} sessions - User's session history
 * @returns {Object} - Capacity-based recommendations
 */
export function getCapacityRecommendations(crs, loadRatio, sessions) {
  const baseline = calculatePersonalBaseline(sessions);
  
  // No data state - conservative defaults
  if (!crs) {
    return {
      type: 'Start Easy',
      volumeCap: '8-12',
      rpeCap: '≤6',
      focus: 'Build your baseline safely',
      style: 'mixed'
    };
  }

  // Calculate capacity multiplier based on CRS
  let capacityMultiplier = 1.0;
  if (crs.score >= 88) capacityMultiplier = 1.3;      // 130% capacity
  else if (crs.score >= 75) capacityMultiplier = 1.15; // 115% capacity  
  else if (crs.score >= 60) capacityMultiplier = 1.0;  // 100% capacity
  else if (crs.score >= 45) capacityMultiplier = 0.8;  // 80% capacity
  else capacityMultiplier = 0.6;                       // 60% capacity

  // Adjust for load ratio if elevated
  if (loadRatio && loadRatio.ratio > 1.3) {
    capacityMultiplier *= 0.8; // Reduce by 20% if overreaching
  }

  // Calculate volume cap
  const volumeCap = Math.round(baseline.avgVolume * capacityMultiplier);
  const maxVolume = Math.min(volumeCap + 3, Math.round(volumeCap * 1.2)); // Small range

  // Calculate RPE cap
  let rpeCap = 6;
  if (crs.score >= 88) rpeCap = 9;
  else if (crs.score >= 75) rpeCap = 8; 
  else if (crs.score >= 60) rpeCap = 7;
  else if (crs.score >= 45) rpeCap = 6;
  else rpeCap = 5;

  // Determine training focus
  let focus, style;
  if (crs.score >= 88) {
    focus = 'Maximum intensity projects';
    style = 'power';
  } else if (crs.score >= 75) {
    focus = 'High intensity training';
    style = 'power';
  } else if (crs.score >= 60) {
    focus = 'Balanced volume and intensity';
    style = 'endurance';
  } else if (crs.score >= 45) {
    focus = 'Technique with light volume';
    style = 'technical';
  } else {
    focus = 'Recovery and movement quality';
    style = 'technical';
  }

  return {
    type: focus,
    volumeCap: volumeCap === maxVolume ? `${volumeCap}` : `${volumeCap}-${maxVolume}`,
    rpeCap: rpeCap <= 6 ? `≤${rpeCap}` : `${rpeCap - 1}-${rpeCap}`,
    focus,
    style,
    baselineLoad: baseline.avgSessionLoad,
    targetLoad: Math.round(baseline.avgSessionLoad * capacityMultiplier)
  };
}

/**
 * Get recommended training based on CRS and load (LEGACY - keeping for compatibility)
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
      effort: 'Listen to your body',
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
      effort: '≤9',
      focus: 'Projects and limit boulders',
      style: 'power'
    };
  } else if (crs.score >= 45) {
    // Yellow zone - moderate training
    recommendation = {
      type: 'Capacity',
      volume: '12-18',
      effort: '≤7',
      focus: 'Volume at moderate intensity',
      style: 'endurance'
    };
  } else {
    // Red zone - recovery needed
    recommendation = {
      type: 'Skill',
      volume: '8-12',
      effort: '≤5',
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
