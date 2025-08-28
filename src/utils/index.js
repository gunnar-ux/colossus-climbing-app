// Utility functions extracted from HTML prototype

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export const readinessColor = (v) => (v <= 33 ? 'bg-red' : v <= 66 ? 'bg-blue' : 'bg-green');

export const readinessTextColor = (v) => (v <= 33 ? 'text-red' : v <= 66 ? 'text-blue' : 'text-green');

export const readinessGradient = (v) => {
  if (v <= 33) return 'from-red/80 to-red';
  if (v <= 66) return 'from-blue/40 to-blue';
  return 'from-green/80 to-green';
};

// Load ratio colors: Green for optimal range (0.8-1.4x), Red for under/over training
export const loadColor = (ratio) => (ratio >= 0.8 && ratio <= 1.4) ? 'text-green' : 'text-red';

export const getMetricAvailability = (sessions, climbs) => ({
  crs: sessions >= 3,
  crsAccurate: sessions >= 5,
  loadRatio: sessions >= 5,
  weeklyTrends: sessions >= 3,
  gradeProgression: climbs >= 30,
  allMetrics: sessions >= 3 && climbs >= 30
});

// Round RPE values to nearest 0.5 (e.g., 7.2 becomes 7.0, 7.3 becomes 7.5)
export const roundRPE = (rpe) => {
  if (typeof rpe !== 'number' || isNaN(rpe)) return 0;
  return Math.round(rpe * 2) / 2;
};
