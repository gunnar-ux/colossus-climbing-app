// Calculate session statistics from climb list
export function calculateSessionStats(climbList) {
  // Initialize with all possible values set to 0
  const gradeCounts = {};
  const styleCounts = {
    'Power': 0,
    'Technical': 0,
    'Simple': 0
  };
  const angleCounts = {
    'Slab': 0,
    'Vertical': 0,
    'Overhang': 0,
    'Roof': 0
  };
  const typeCounts = {
    'BOULDER': 0,
    'BOARD': 0
  };

  if (!climbList || climbList.length === 0) {
    return {
      grades: [],
      styles: Object.entries(styleCounts).map(([label, count]) => ({ label, count, val: 0 })),
      angles: Object.entries(angleCounts).map(([label, count]) => ({ label, count, val: 0 })),
      types: Object.entries(typeCounts).map(([label, count]) => ({ 
        label: label === 'BOARD' ? 'Board' : 'Boulder', 
        count, 
        val: 0 
      }))
    };
  }

  // Count actual values
  climbList.forEach(climb => {
    // Count grades
    const grade = climb.grade || 'Unknown';
    gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;

    // Count styles
    const style = climb.style || 'Unknown';
    if (styleCounts.hasOwnProperty(style)) {
      styleCounts[style]++;
    } else {
      styleCounts[style] = 1;
    }

    // Count angles
    const angle = climb.angle || climb.wall || 'Unknown';
    if (angleCounts.hasOwnProperty(angle)) {
      angleCounts[angle]++;
    } else {
      angleCounts[angle] = 1;
    }

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

  return {
    grades,
    styles,
    angles,
    types
  };
}
