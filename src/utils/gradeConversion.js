// Grade conversion utilities for V-scale and Font (French) grading systems
// Supports bidirectional conversion and display formatting

// V-scale to Font mapping (approximate conversions)
const V_TO_FONT = {
  'V0': '4',
  'V1': '5',
  'V2': '5+',
  'V3': '6a+',
  'V4': '6b+',
  'V5': '6c',
  'V6': '7a',
  'V7': '7a+',
  'V8': '7b+',
  'V9': '7c',
  'V10': '7c+',
  'V11': '8a',
  'V12': '8a+',
  'V13': '8b',
  'V14': '8b+',
  'V15': '8c'
};

// Font to V-scale mapping (reverse lookup)
const FONT_TO_V = Object.fromEntries(
  Object.entries(V_TO_FONT).map(([v, font]) => [font, v])
);

// All Font grades in order
export const FONT_GRADES = [
  '4', '5', '5+', '6a+', '6b+', '6c', '7a', '7a+', '7b+', '7c', '7c+', '8a', '8a+', '8b', '8b+', '8c'
];

// All V grades in order (imported from climbing constants)
export const V_GRADES = [
  'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15'
];

/**
 * Convert V-scale grade to Font grade
 * @param {string} vGrade - V-scale grade (e.g., 'V5')
 * @returns {string} - Font grade (e.g., '6c')
 */
export const vToFont = (vGrade) => {
  return V_TO_FONT[vGrade] || vGrade;
};

/**
 * Convert Font grade to V-scale grade
 * @param {string} fontGrade - Font grade (e.g., '6c')
 * @returns {string} - V-scale grade (e.g., 'V5')
 */
export const fontToV = (fontGrade) => {
  return FONT_TO_V[fontGrade] || fontGrade;
};

/**
 * Convert grade based on target system
 * @param {string} grade - Grade to convert
 * @param {string} fromSystem - Source system ('v-scale' or 'font')
 * @param {string} toSystem - Target system ('v-scale' or 'font')
 * @returns {string} - Converted grade
 */
export const convertGrade = (grade, fromSystem, toSystem) => {
  if (fromSystem === toSystem) return grade;
  
  if (fromSystem === 'v-scale' && toSystem === 'font') {
    return vToFont(grade);
  }
  
  if (fromSystem === 'font' && toSystem === 'v-scale') {
    return fontToV(grade);
  }
  
  return grade;
};

/**
 * Display grade in user's preferred system
 * @param {string} grade - Grade stored in database (always V-scale)
 * @param {string} userGradeSystem - User's preferred grade system ('v-scale' or 'font')
 * @returns {string} - Grade formatted for display
 */
export const displayGrade = (grade, userGradeSystem = 'v-scale') => {
  if (userGradeSystem === 'font') {
    return vToFont(grade);
  }
  return grade;
};

/**
 * Get all grades for a specific system
 * @param {string} system - Grade system ('v-scale' or 'font')
 * @returns {Array<string>} - Array of grades
 */
export const getGradesForSystem = (system) => {
  return system === 'font' ? FONT_GRADES : V_GRADES;
};

/**
 * Convert user input grade to storage format (always V-scale)
 * @param {string} grade - Grade from user input
 * @param {string} userGradeSystem - User's current grade system
 * @returns {string} - Grade in V-scale format for storage
 */
export const toStorageGrade = (grade, userGradeSystem = 'v-scale') => {
  if (userGradeSystem === 'font') {
    return fontToV(grade);
  }
  return grade;
};

/**
 * Get grade system display name
 * @param {string} system - Grade system ('v-scale' or 'font')
 * @returns {string} - Display name
 */
export const getGradeSystemName = (system) => {
  return system === 'font' ? 'Font' : 'V-Scale';
};

/**
 * Parse grade number from grade string for sorting
 * @param {string} grade - Grade string (e.g., 'V5' or '6c')
 * @param {string} system - Grade system
 * @returns {number} - Numeric value for sorting
 */
export const getGradeValue = (grade, system = 'v-scale') => {
  if (system === 'v-scale' || grade.startsWith('V')) {
    return parseInt(grade.replace('V', ''));
  }
  // For Font grades, return the index in the FONT_GRADES array
  return FONT_GRADES.indexOf(grade);
};

