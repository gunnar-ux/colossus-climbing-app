// Data validation utilities for Colossus climbing app

/**
 * Validate user account data
 * @param {Object} userData - User account data
 * @returns {Object} - Validation result with isValid and errors
 */
export function validateUserData(userData) {
  const errors = [];
  
  if (!userData.name || userData.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (!userData.age || userData.age < 13 || userData.age > 100) {
    errors.push('Age must be between 13 and 100');
  }
  
  if (!userData.gender || !['Male', 'Female', 'Other'].includes(userData.gender)) {
    errors.push('Gender must be specified');
  }
  
  // Height validation
  if (userData.height) {
    if (userData.height.feet && (userData.height.feet < 3 || userData.height.feet > 8)) {
      errors.push('Height must be reasonable (3-8 feet)');
    }
    if (userData.height.cm && (userData.height.cm < 90 || userData.height.cm > 250)) {
      errors.push('Height must be reasonable (90-250 cm)');
    }
  }
  
  // Weight validation
  if (userData.weight && userData.weight.value) {
    const weight = userData.weight.value;
    const unit = userData.weight.unit;
    if (unit === 'lbs' && (weight < 60 || weight > 500)) {
      errors.push('Weight must be reasonable (60-500 lbs)');
    }
    if (unit === 'kg' && (weight < 25 || weight > 225)) {
      errors.push('Weight must be reasonable (25-225 kg)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate climb data
 * @param {Object} climbData - Individual climb data
 * @returns {Object} - Validation result
 */
export function validateClimbData(climbData) {
  const errors = [];
  
  if (!climbData.type || !['BOULDER', 'BOARD'].includes(climbData.type)) {
    errors.push('Climb type must be BOULDER or BOARD');
  }
  
  if (!climbData.grade || !climbData.grade.match(/^V\d+$/)) {
    errors.push('Grade must be in V-scale format (V0-V17)');
  }
  
  if (!climbData.wall || !['SLAB', 'VERTICAL', 'OVERHANG'].includes(climbData.wall)) {
    errors.push('Wall angle must be SLAB, VERTICAL, or OVERHANG');
  }
  
  if (!climbData.rpe || climbData.rpe < 1 || climbData.rpe > 10) {
    errors.push('RPE must be between 1 and 10');
  }
  
  if (!climbData.attempts || climbData.attempts < 1 || climbData.attempts > 50) {
    errors.push('Attempts must be between 1 and 50');
  }
  
  if (!climbData.styles || climbData.styles.length === 0) {
    errors.push('At least one style must be selected');
  } else {
    // Validate each style
    const validStyles = ['SIMPLE', 'POWERFUL', 'TECHNICAL'];
    const invalidStyles = climbData.styles.filter(style => !validStyles.includes(style));
    if (invalidStyles.length > 0) {
      errors.push(`Invalid styles: ${invalidStyles.join(', ')}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate session data
 * @param {Object} sessionData - Session data
 * @returns {Object} - Validation result
 */
export function validateSessionData(sessionData) {
  const errors = [];
  
  if (!sessionData.timestamp || isNaN(sessionData.timestamp)) {
    errors.push('Session must have valid timestamp');
  }
  
  if (!sessionData.climbList || !Array.isArray(sessionData.climbList)) {
    errors.push('Session must have climb list');
  }
  
  if (sessionData.climbList && sessionData.climbList.length === 0) {
    errors.push('Session must have at least one climb');
  }
  
  // Validate each climb in session
  if (sessionData.climbList) {
    sessionData.climbList.forEach((climb, index) => {
      const climbValidation = validateClimbData(climb);
      if (!climbValidation.isValid) {
        errors.push(`Climb ${index + 1}: ${climbValidation.errors.join(', ')}`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize and clean user input
 * @param {string} input - Raw user input
 * @returns {string} - Cleaned input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, 100); // Limit length and trim whitespace
}

/**
 * Validate and parse numeric input
 * @param {*} value - Input value
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number|null} - Parsed number or null if invalid
 */
export function parseNumber(value, min = -Infinity, max = Infinity) {
  const num = parseFloat(value);
  if (isNaN(num) || num < min || num > max) {
    return null;
  }
  return num;
}

/**
 * Check if sessions data is sufficient for reliable metrics
 * @param {Array} sessions - Sessions array
 * @returns {Object} - Data sufficiency information
 */
export function checkDataSufficiency(sessions) {
  const validSessions = sessions.filter(s => s.timestamp && s.climbList && s.climbList.length > 0);
  const totalClimbs = validSessions.reduce((sum, s) => sum + s.climbList.length, 0);
  
  const now = Date.now();
  const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = now - (14 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
  
  const recentSessions = validSessions.filter(s => s.timestamp > oneWeekAgo);
  const twoWeekSessions = validSessions.filter(s => s.timestamp > twoWeeksAgo);
  const monthSessions = validSessions.filter(s => s.timestamp > oneMonthAgo);
  
  return {
    total: {
      sessions: validSessions.length,
      climbs: totalClimbs,
      sufficient: validSessions.length >= 3 && totalClimbs >= 30
    },
    recent: {
      sessions: recentSessions.length,
      climbs: recentSessions.reduce((sum, s) => sum + s.climbList.length, 0),
      hasData: recentSessions.length > 0
    },
    trends: {
      twoWeek: twoWeekSessions.length,
      month: monthSessions.length,
      canCalculateTrends: twoWeekSessions.length >= 2
    },
    recommendations: {
      crs: validSessions.length >= 3 ? 'available' : `need ${3 - validSessions.length} more sessions`,
      loadRatio: validSessions.length >= 5 ? 'available' : `need ${5 - validSessions.length} more sessions`,
      fullAccuracy: validSessions.length >= 7 && monthSessions.length >= 5 ? 'available' : 'building'
    }
  };
}

/**
 * Safe JSON parse with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*} - Parsed object or fallback
 */
export function safeJSONParse(jsonString, fallback = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return fallback;
  }
}

/**
 * Safe localStorage operations
 */
export const storage = {
  get: (key, fallback = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? safeJSONParse(item, fallback) : fallback;
    } catch (error) {
      console.warn('Failed to get from localStorage:', error);
      return fallback;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
      return false;
    }
  }
};
