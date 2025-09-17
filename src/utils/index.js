// Utility functions extracted from HTML prototype

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export const readinessColor = (v) => (v < 45 ? 'bg-red' : v < 77 ? 'bg-blue' : 'bg-green');

export const readinessTextColor = (v) => (v < 45 ? 'text-red' : v < 77 ? 'text-cyan-400' : 'text-cyan-400');

export const readinessGradient = (v) => {
  if (v < 45) return 'from-red/80 to-red';
  if (v < 77) return 'from-cyan-600/40 to-cyan-400';
  return 'from-cyan-600/80 to-cyan-400';
};

// Load ratio colors: Ice blue for optimal range (0.8-1.3x), Red for under/over training
export const loadColor = (ratio) => (ratio >= 0.8 && ratio <= 1.3) ? 'text-cyan-400' : 'text-red';

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
