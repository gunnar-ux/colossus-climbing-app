// Calculate session statistics from climb list
export function calculateSessionStats(climbList) {
  // Helper function to normalize style values
  const normalizeStyle = (style) => {
    if (style === 'POWERFUL') return 'Power';
    if (style === 'TECHNICAL') return 'Technical';
    if (style === 'SIMPLE') return 'Simple';
    return style;
  };

  // Helper function to normalize angle values
  const normalizeAngle = (angle) => {
    if (!angle || angle === null || angle === undefined) return 'Vertical'; // Default fallback
    if (angle === 'SLAB') return 'Slab';
    if (angle === 'VERTICAL') return 'Vertical';
    if (angle === 'OVERHANG') return 'Overhang';
    // Board angles come through as degrees (e.g., "30°")
    if (angle.includes('°')) return angle; // Return as-is for board angles
    return angle;
  };

  // Initialize with all possible values set to 0
  const gradeCounts = {};
  const styleCounts = {
    'Power': 0,
    'Technical': 0,
    'Simple': 0
  };
  // angleCounts now dynamically handles both boulder angles and board degrees
  const angleCounts = {};
  const typeCounts = {
    'BOULDER': 0,
    'BOARD': 0
  };

  if (!climbList || climbList.length === 0) {
    return {
      grades: [],
      styles: Object.entries(styleCounts).map(([label, count]) => ({ label, count, val: 0 })),
      angles: [],
      types: Object.entries(typeCounts).map(([label, count]) => ({ 
        label: label === 'BOARD' ? 'Board' : 'Boulder', 
        count, 
        val: 0 
      })),
      avgRPE: 0,
      medianGrade: 'V0'
    };
  }

  // Count actual values
  climbList.forEach(climb => {
    // Count grades
    const grade = climb.grade || 'Unknown';
    gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;

    // Count styles (normalize first)
    const rawStyle = climb.style || 'Unknown';
    const normalizedStyle = normalizeStyle(rawStyle);
    if (styleCounts.hasOwnProperty(normalizedStyle)) {
      styleCounts[normalizedStyle]++;
    } else {
      styleCounts[normalizedStyle] = 1;
    }

    // Count angles (normalize first)
    const rawAngle = climb.angle || climb.wall || 'Unknown';
    const normalizedAngle = normalizeAngle(rawAngle);
    // Dynamically add angle keys as we encounter them
    angleCounts[normalizedAngle] = (angleCounts[normalizedAngle] || 0) + 1;

    // Count types
    const type = climb.type || 'BOULDER';
    if (typeCounts.hasOwnProperty(type)) {
      typeCounts[type]++;
    }
  });

  const total = climbList.length;

  // Convert to percentages
  const grades = Object.entries(gradeCounts)
    .map(([label, count]) => ({
      label,
      count,
      val: Math.round((count / total) * 100)
    }))
    .sort((a, b) => {
      // Sort grades numerically
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

  const types = Object.entries(typeCounts)
    .map(([label, count]) => ({
      label: label === 'BOARD' ? 'Board' : 'Boulder',
      count,
      val: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.val - a.val);

  // Calculate average RPE
  const avgRPE = climbList.reduce((sum, climb) => sum + (climb.rpe || 0), 0) / climbList.length;

  // Calculate median grade (simplified)
  const gradeValues = climbList.map(climb => parseInt(climb.grade.replace('V', '')) || 0);
  gradeValues.sort((a, b) => a - b);
  const medianGradeValue = gradeValues[Math.floor(gradeValues.length / 2)];
  const medianGrade = `V${medianGradeValue}`;

  // Calculate peak grade (highest grade in session)
  const peakGradeValue = gradeValues.length > 0 ? Math.max(...gradeValues) : 0;
  const peakGrade = `V${peakGradeValue}`;

  // Calculate total XP for session
  const totalXP = climbList.reduce((sum, climb) => {
    const baseXP = 10;
    const gradeNum = parseInt(climb.grade.replace('V', '')) || 0;
    const gradeMultiplier = gradeNum + 1; // V0=1x, V1=2x, V2=3x, etc.
    const flashBonus = climb.attempts === 1 ? 1.2 : 1.0;
    const climbXP = baseXP * gradeMultiplier * flashBonus;
    return sum + climbXP;
  }, 0);

  // Calculate flash rate
  const flashedClimbs = climbList.filter(climb => climb.attempts === 1).length;
  const flashRate = total > 0 ? Math.round((flashedClimbs / total) * 100) : 0;

  // Determine session focus (most common style)
  const sessionFocus = styles.length > 0 && styles[0].count > 0 ? styles[0].label : '--';

  return {
    grades,
    styles,
    angles,
    types,
    avgRPE,
    medianGrade,
    peakGrade,
    totalXP: Math.round(totalXP),
    flashRate,
    style: sessionFocus // Add the session focus/style
  };
}
