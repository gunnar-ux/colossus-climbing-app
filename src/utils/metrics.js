// Core climbing metrics calculations for Colossus
// Implements CRS, Load Baseline (ACWR), and Recommended Training

/**
 * Get board angle multiplier based on degrees
 * Steeper angles are more dynamic and finger-intensive
 * @param {string} angle - Angle string like "35°"
 * @returns {number} - Angle multiplier
 */
function getBoardAngleMultiplier(angle) {
  // Extract numeric value from angle string (e.g., "35°" -> 35)
  const degrees = parseInt(angle);
  if (isNaN(degrees)) return 1.0;
  
  if (degrees <= 15) return 0.95;  // Low angle, slightly easier
  if (degrees <= 35) return 1.0;   // Moderate angle, vertical equivalent
  return 1.15;                     // Steep 40-60°, very dynamic & finger-intensive
}

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
    
    // FIXED: Exponential attempt factor - projecting is much more fatiguing than flashing
    // 1 att = 1.0x, 2 att = 1.15x, 3 att = 1.32x, 4 att = 1.52x, 5 att = 1.75x
    const attemptFactor = Math.pow(1.15, climb.attempts - 1);
    
    // Type multiplier: Board climbing is more finger-intensive than regular bouldering
    const typeMultiplier = climb.type === 'BOARD' ? 1.1 : 1.0;
    
    // Board angle multiplier: Steeper boards are significantly harder
    const angleMultiplier = climb.type === 'BOARD' && climb.angle 
      ? getBoardAngleMultiplier(climb.angle) 
      : 1.0;
    
    return total + (gradePoints * climb.rpe * styleMultiplier * attemptFactor * typeMultiplier * angleMultiplier);
  }, 0);
}

/**
 * Calculate load recovery component for CRS
 * @param {Array} sessions - Recent sessions array
 * @returns {number} - Recovery score (0-100)
 * 
 * FIXED: Recovery now peaks at 48h then decays to account for detraining
 */
function calculateLoadRecovery(sessions) {
  if (sessions.length === 0) return 50;
  
  const lastSession = sessions[sessions.length - 1];
  if (!lastSession.timestamp) return 50;
  
  const hoursSince = (Date.now() - lastSession.timestamp) / (1000 * 60 * 60);
  const optimalRecovery = 48; // 48 hours optimal recovery
  
  // Build up to peak recovery at 48 hours
  if (hoursSince <= optimalRecovery) {
    return (hoursSince / optimalRecovery) * 100;
  } else {
    // After 48h, start decaying for detraining effects
    // 100% at 48h → 85% at 7 days → 70% at 14 days
    const daysOver = (hoursSince - optimalRecovery) / 24;
    const decayRate = 2.14; // Points lost per day (~15% loss over 7 days)
    return Math.max(50, 100 - (daysOver * decayRate));
  }
}

/**
 * Calculate load trend component for CRS
 * @param {Array} recent - Recent 7-day sessions
 * @param {Array} baseline - Baseline 28-day sessions
 * @returns {number} - Trend score (0-100)
 * 
 * FIXED: Now penalizes both extremes - detraining AND overtraining
 */
function calculateLoadTrend(recent, baseline) {
  if (baseline.length === 0) return 75; // Default middle score
  
  const recentLoad = recent.reduce((sum, s) => sum + calculateSessionLoad(s), 0);
  const baselineAvg = baseline.reduce((sum, s) => sum + calculateSessionLoad(s), 0) / baseline.length;
  
  if (baselineAvg === 0) return 75;
  
  const ratio = recentLoad / (baselineAvg * 7);
  
  // IMPROVED CURVE - optimal training zone peaks, both extremes penalized
  if (ratio < 0.4) return 60;   // Detraining zone - not optimal, losing conditioning
  if (ratio < 0.7) return 85;   // Low load - good recovery but slightly undertrained
  if (ratio <= 1.3) return 100; // Optimal training zone - sweet spot
  if (ratio <= 1.5) return 70;  // Slightly elevated - manageable but watch closely
  if (ratio <= 1.8) return 45;  // Overreaching territory - fatigue accumulating
  return 25;                     // Danger zone - high overtraining risk
}

/**
 * Calculate cumulative fatigue component for CRS
 * @param {Array} sessions - Recent sessions (should be all sessions for proper weighting)
 * @returns {number} - Fatigue recovery score (0-100)
 * 
 * FIXED: Now tracks cumulative fatigue across recent sessions, not just last session
 * Uses exponential weighting - recent sessions matter more
 */
function calculateCumulativeFatigue(sessions) {
  if (sessions.length === 0) return 50;
  
  // Take up to last 7 sessions for cumulative fatigue calculation
  const recentSessions = sessions.slice(-7);
  
  let weightedRPE = 0;
  let totalWeight = 0;
  
  // Weight recent sessions more heavily (exponential decay)
  recentSessions.forEach((session, index) => {
    const weight = Math.pow(0.75, index); // More recent = higher weight
    const sessionRPE = session.avgRPE || 5;
    weightedRPE += sessionRPE * weight;
    totalWeight += weight;
  });
  
  const avgWeightedRPE = totalWeight > 0 ? weightedRPE / totalWeight : 5;
  
  // Convert to recovery score (high RPE = low recovery)
  // RPE 10 = 0% recovered, RPE 5 = 50% recovered, RPE 1 = 90% recovered
  const recoveryScore = Math.max(0, Math.min(100, 100 - (avgWeightedRPE * 10)));
  
  return recoveryScore;
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
  // Load Recovery and Cumulative Fatigue should use ALL sessions,
  // not just sessions within the 7-day window
  const loadRecovery = calculateLoadRecovery(validSessions);
  const loadTrend = calculateLoadTrend(recentSessions, baselineSessions);
  const cumulativeFatigue = calculateCumulativeFatigue(validSessions);
  const volumePattern = calculateVolumePattern(recentSessions);
  
  const score = Math.round(
    loadRecovery * 0.35 +
    loadTrend * 0.25 +
    cumulativeFatigue * 0.20 +
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
      cumulativeFatigue,
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
 * 
 * FIXED: Now accounts for training frequency and sets minimum baseline threshold
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
      message: 'Need more training history for accurate load tracking.',
      confidence: 'establishing'
    };
  }
  
  // Calculate loads
  const acuteLoad = acuteSessions.reduce((sum, s) => sum + calculateSessionLoad(s), 0);
  const chronicLoad = chronicSessions.reduce((sum, s) => sum + calculateSessionLoad(s), 0);
  
  // FIXED: Calculate training frequency to normalize for sporadic climbers
  const avgSessionsPerWeek = (chronicSessions.length / 28) * 7;
  
  // FIXED: Use session-based average instead of daily average
  // This prevents weekend warriors from being falsely flagged
  const avgLoadPerSession = chronicSessions.length > 0 ? chronicLoad / chronicSessions.length : 0;
  const expectedWeeklyLoad = avgLoadPerSession * avgSessionsPerWeek;
  
  // FIXED: Minimum baseline threshold to prevent false positives with very low training
  const minExpectedLoad = 50; // Minimum expected weekly load
  const adjustedExpectedLoad = Math.max(expectedWeeklyLoad, minExpectedLoad);
  
  const ratio = adjustedExpectedLoad > 0 ? acuteLoad / adjustedExpectedLoad : 0;
  
  return {
    ratio: parseFloat(ratio.toFixed(2)),
    status: getLoadStatus(ratio),
    message: getLoadMessage(ratio),
    frequency: parseFloat(avgSessionsPerWeek.toFixed(1)), // sessions per week
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
 * Calculate conservative profile-based baseline for new users
 * SAFETY-FIRST: Assumes potential detraining and builds in safety margins
 * @param {Object} profile - User profile with flash_grade and typical_volume
 * @returns {Object} - Conservative baseline metrics
 */
function calculateProfileBasedBaseline(profile) {
  if (!profile || !profile.flash_grade || !profile.typical_volume) {
    return null; // Fall back to defaults if profile incomplete
  }

  // Parse grade (e.g., "V5" -> 5)
  const gradeNum = parseInt(profile.flash_grade.replace('V', ''));
  
  // EXPERIENCE-ADJUSTED VOLUME: Higher volume users get less conservative reduction
  // Reasoning: High-volume climbers (20+) are likely experienced and well-conditioned
  // Low-volume climbers (< 15) might be beginners who overestimate
  let conservativeMultiplier;
  if (profile.typical_volume >= 25) {
    conservativeMultiplier = 0.90; // 90% for high-volume (22-24 climbs from 25)
  } else if (profile.typical_volume >= 20) {
    conservativeMultiplier = 0.88; // 88% for moderate-high (17-18 from 20)
  } else if (profile.typical_volume >= 15) {
    conservativeMultiplier = 0.85; // 85% for moderate (12-13 from 15)
  } else {
    conservativeMultiplier = 0.80; // 80% for low-volume (8 from 10, 6 from 8)
  }
  
  const baseVolume = Math.round(profile.typical_volume * conservativeMultiplier);
  
  // Minimum floor and maximum cap for safety
  const avgVolume = Math.max(6, Math.min(25, baseVolume)); // Clamp between 6-25
  
  // CONSERVATIVE RPE: Cap at 7 for all new users
  // Reasoning: Allows moderate intensity while preventing max effort before real data
  const avgRPE = 7.0;
  
  // Grade-adjusted load estimate (conservative)
  // Lower grades = lower load per climb, higher grades = higher load per climb
  const gradeLoadFactor = 1 + (gradeNum * 0.08); // Gentler scaling than real sessions
  const avgSessionLoad = Math.round(avgVolume * avgRPE * gradeLoadFactor);
  
  return {
    avgSessionLoad,
    avgVolume,
    avgRPE,
    confidence: 'profile-based',
    source: 'onboarding',
    isConservative: true
  };
}

/**
 * Calculate personal baseline from user's session history OR profile
 * @param {Array} sessions - User's session history
 * @param {Object} userProfile - Optional user profile for new users
 * @returns {Object} - Personal baseline metrics
 */
export function calculatePersonalBaseline(sessions, userProfile = null) {
  // Priority 1: Use session history if we have enough data (3+ sessions)
  if (sessions && sessions.length >= 3) {
    const recentSessions = sessions.slice(0, Math.min(10, sessions.length));
    const validSessions = recentSessions.filter(s => s.climbList && s.climbList.length > 0);

    if (validSessions.length >= 3) {
      // Calculate averages from real session data
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
        confidence: validSessions.length >= 5 ? 'high' : validSessions.length >= 3 ? 'medium' : 'low',
        source: 'sessions'
      };
    }
  }
  
  // Priority 2: Use profile-based baseline if available (new users with onboarding data)
  if (userProfile) {
    const profileBaseline = calculateProfileBasedBaseline(userProfile);
    if (profileBaseline) {
      return profileBaseline;
    }
  }
  
  // Priority 3: Fall back to conservative defaults (no data at all)
  return {
    avgSessionLoad: 120,
    avgVolume: 12,
    avgRPE: 6.5,
    confidence: 'none',
    source: 'default'
  };
}

/**
 * Get profile-based recommendations for new users (< 3 sessions)
 * SAFETY-FIRST: Conservative recommendations assuming potential detraining
 * @param {Object} baseline - Profile-based baseline metrics
 * @param {Object} userProfile - User profile data
 * @returns {Object} - Conservative capacity recommendations
 */
function getProfileBasedRecommendations(baseline, userProfile) {
  const gradeNum = parseInt(userProfile.flash_grade.replace('V', ''));
  const volume = baseline.avgVolume;
  
  // Conservative volume range: 86-94% of conservative baseline
  // Baseline is 85% of stated, so total = ~73-80% of stated typical volume
  // Primary safety is RPE ≤7 cap, not volume reduction
  const volumeMin = Math.max(5, Math.round(volume * 0.86));
  const volumeMax = Math.round(volume * 0.94);
  
  // RPE capped at 7 for all new users
  // Reasoning: Allows moderate intensity while preventing max effort before real data
  const rpeCap = '≤7';
  
  // Experience-based focus messaging (but same conservative caps)
  let focus, style, welcomeMessage;
  
  if (gradeNum <= 2) {
    // Beginner: V0-V2
    focus = 'Establish movement patterns and consistency';
    style = 'technical';
    welcomeMessage = 'Building your baseline - start conservatively';
  } else if (gradeNum <= 5) {
    // Intermediate: V3-V5
    focus = 'Build capacity while establishing baseline';
    style = 'endurance';
    welcomeMessage = 'Building your baseline - ease in gradually';
  } else {
    // Advanced: V6+
    focus = 'Maintain technique while establishing baseline';
    style = 'technical'; // Keep it technical/controlled for safety
    welcomeMessage = 'Building your baseline - start controlled';
  }
  
  return {
    type: 'Calibration',
    volumeCap: `${volumeMin}-${volumeMax}`,
    rpeCap,
    focus,
    style,
    baselineLoad: baseline.avgSessionLoad,
    targetLoad: baseline.avgSessionLoad,
    isProfileBased: true,
    calibrationMessage: welcomeMessage,
    note: 'Personalized from your profile • Will adapt after 3 sessions'
  };
}

/**
 * Get load-based capacity recommendations (caps, not targets)
 * @param {Object|null} crs - CRS calculation result
 * @param {Object|null} loadRatio - Load ratio calculation result
 * @param {Array} sessions - User's session history
 * @param {Object} userProfile - Optional user profile for new users
 * @returns {Object} - Capacity-based recommendations
 */
export function getCapacityRecommendations(crs, loadRatio, sessions, userProfile = null) {
  const baseline = calculatePersonalBaseline(sessions, userProfile);
  
  // No CRS data BUT we have profile data - use profile-based recommendations
  if (!crs && baseline.source === 'onboarding' && userProfile) {
    return getProfileBasedRecommendations(baseline, userProfile);
  }
  
  // No data at all - generic conservative defaults
  if (!crs) {
    return {
      type: 'Start Easy',
      volumeCap: '8-12',
      rpeCap: '≤7',
      focus: 'Build your baseline safely',
      style: 'mixed',
      note: 'Complete onboarding for personalized recommendations'
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
