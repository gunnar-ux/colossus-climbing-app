import { instagramShareService } from './instagramShare.js';

/**
 * Service for generating and sharing social cards from session data
 * Creates beautiful, shareable Instagram Stories from climbing sessions
 */
export class SocialCardGenerator {
  
  /**
   * Generates and shares a social card for a given session
   * @param {Object} session - Session data
   * @param {Object} profile - User profile data
   * @param {Array} allSessions - All user sessions for XP calculation
   * @returns {Promise<boolean>} - Success status
   */
  async generateAndShare(session, profile, allSessions = []) {
    try {
      console.log('🎨 Generating social card for session:', session);
      
      // Create a temporary social card element
      const socialCardElement = this.createSocialCardElement(session, profile, allSessions);
      
      // Add to DOM temporarily for capture
      document.body.appendChild(socialCardElement);
      
      // Wait a moment for rendering
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Share the generated card
      const success = await instagramShareService.shareToInstagramStories(socialCardElement, {
        backgroundColor: '#000000',
        quality: 0.95
      });
      
      // Clean up
      document.body.removeChild(socialCardElement);
      
      return success;
      
    } catch (error) {
      console.error('🎨 Social card generation failed:', error);
      throw error;
    }
  }
  
  /**
   * Creates a social card DOM element from session data
   * Matches the exact original design from SocialCard.jsx
   * @param {Object} session - Session data
   * @param {Object} profile - User profile data
   * @param {Array} allSessions - All user sessions for XP calculation
   * @returns {HTMLElement} - Social card element
   */
  createSocialCardElement(session, profile, allSessions) {
    // Calculate session metrics
    const sessionMetrics = this.calculateSessionMetrics(session, allSessions);
    
    // Create the exact container structure from original SocialCard
    const section = document.createElement('section');
    section.style.cssText = 'padding: 0 20px; padding-top: 16px; position: fixed; top: -9999px; left: -9999px;';
    
    const container = document.createElement('div');
    container.style.cssText = `
      background: linear-gradient(135deg, rgba(8, 51, 68, 0.3) 0%, rgba(15, 23, 42, 0.4) 50%, rgba(23, 37, 84, 0.25) 100%);
      border: 1px solid rgba(14, 116, 144, 0.5);
      box-shadow: 0 25px 50px -12px rgba(8, 145, 178, 0.2);
      border-radius: 16px;
      overflow: hidden;
      aspect-ratio: 3/4;
      max-width: 384px;
      width: 300px;
      margin: 0 auto;
      position: relative;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: white;
    `;
    
    // Header Section - exact match to original
    const headerSection = document.createElement('div');
    headerSection.style.cssText = 'padding: 20px 20px 0 20px;';
    
    const headerContent = document.createElement('div');
    headerContent.style.cssText = 'margin-bottom: 8px;';
    
    // Row 1 - Name and XP
    const nameXPRow = document.createElement('div');
    nameXPRow.style.cssText = 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;';
    
    const nameDiv = document.createElement('div');
    nameDiv.style.cssText = 'font-weight: 600; font-size: 20px; color: white;';
    nameDiv.textContent = profile?.name || 'Climber';
    
    const xpDiv = document.createElement('div');
    xpDiv.style.cssText = 'display: flex; align-items: center; gap: 4px;';
    
    // Use the exact rocket SVG from your Icons
    const rocketSVG = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4.5 16.5c-1.5 1.5-1.5 4.5 0 6s4.5 1.5 6 0l.5-.5"/>
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
      </svg>
    `;
    
    const xpSpan = document.createElement('span');
    xpSpan.style.cssText = 'font-size: 14px; font-weight: 600; color: white;';
    xpSpan.textContent = `+${sessionMetrics.sessionXP.toLocaleString()} XP`;
    
    xpDiv.innerHTML = rocketSVG;
    xpDiv.appendChild(xpSpan);
    
    nameXPRow.appendChild(nameDiv);
    nameXPRow.appendChild(xpDiv);
    
    // Row 2 - Date and Focus
    const dateFocusRow = document.createElement('div');
    dateFocusRow.style.cssText = 'display: flex; align-items: center; justify-content: space-between; font-size: 14px; color: #94a3b8;';
    
    const dateDiv = document.createElement('div');
    dateDiv.textContent = this.formatDate(session.date);
    
    const focusDiv = document.createElement('div');
    focusDiv.textContent = `${sessionMetrics.sessionFocus} Focus`;
    
    dateFocusRow.appendChild(dateDiv);
    dateFocusRow.appendChild(focusDiv);
    
    headerContent.appendChild(nameXPRow);
    headerContent.appendChild(dateFocusRow);
    headerSection.appendChild(headerContent);
    
    // Grade Progression Chart Section - exact match
    const chartData = this.prepareGradeProgressionChart(session);
    let chartSection = null;
    
    if (chartData.values.length > 1) {
      chartSection = document.createElement('div');
      chartSection.style.cssText = 'padding: 0 20px; padding-bottom: 0;';
      
      const chartContainer = document.createElement('div');
      chartContainer.style.cssText = 'display: flex; justify-content: center; position: relative;';
      
      // Create the chart SVG
      const chartSVG = this.createGradeProgressionSVG(chartData);
      chartContainer.appendChild(chartSVG);
      
      // Session Summary overlay - exact match to original
      const summaryOverlay = document.createElement('div');
      summaryOverlay.style.cssText = 'position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); font-size: 12px; color: #94a3b8;';
      summaryOverlay.textContent = `${sessionMetrics.totalClimbs} climbs in ${sessionMetrics.actualDuration}`;
      chartContainer.appendChild(summaryOverlay);
      
      chartSection.appendChild(chartContainer);
    }
    
    // Main content section
    const mainContent = document.createElement('div');
    mainContent.style.cssText = 'padding: 0 20px;';
    
    // Hardest Send Section - exact match
    const hardestSendSection = document.createElement('div');
    hardestSendSection.style.cssText = 'margin-bottom: 8px;';
    
    const hardestTitle = document.createElement('div');
    hardestTitle.style.cssText = 'font-size: 14px; color: #94a3b8; margin-bottom: 8px;';
    hardestTitle.textContent = 'Hardest Send';
    
    const hardestClimb = sessionMetrics.hardestClimb;
    const hardestCard = document.createElement('div');
    hardestCard.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: 12px;
      padding: 12px 16px;
      border: 1px solid rgba(14, 116, 144, 0.5);
      background: linear-gradient(90deg, rgba(8, 51, 68, 0.2) 0%, rgba(23, 37, 84, 0.15) 100%);
    `;
    
    const hardestLeft = document.createElement('div');
    hardestLeft.style.cssText = 'display: flex; align-items: center; gap: 8px;';
    
    const gradeDiv = document.createElement('div');
    gradeDiv.style.cssText = 'font-size: 18px; font-weight: bold; color: white;';
    gradeDiv.textContent = hardestClimb.grade;
    
    const typeDiv = document.createElement('div');
    typeDiv.style.cssText = 'font-size: 12px; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(100, 116, 139, 0.4); color: white;';
    typeDiv.textContent = hardestClimb.type === 'BOARD' ? 'Board' : 'Boulder';
    
    hardestLeft.appendChild(gradeDiv);
    hardestLeft.appendChild(typeDiv);
    
    const hardestRight = document.createElement('div');
    hardestRight.style.cssText = 'text-align: right;';
    
    const styleDiv = document.createElement('div');
    styleDiv.style.cssText = 'font-size: 14px; color: white;';
    styleDiv.textContent = `${hardestClimb.style} ${hardestClimb.angle}`;
    
    const rpeDiv = document.createElement('div');
    rpeDiv.style.cssText = 'font-size: 14px; color: #94a3b8;';
    rpeDiv.textContent = `RPE: ${hardestClimb.rpe} • Att: ${hardestClimb.attempts}`;
    
    hardestRight.appendChild(styleDiv);
    hardestRight.appendChild(rpeDiv);
    
    hardestCard.appendChild(hardestLeft);
    hardestCard.appendChild(hardestRight);
    
    hardestSendSection.appendChild(hardestTitle);
    hardestSendSection.appendChild(hardestCard);
    
    // Stats Section - exact match
    const statsSection = document.createElement('div');
    statsSection.style.cssText = 'margin-bottom: 12px;';
    
    const statsContainer = document.createElement('div');
    statsContainer.style.cssText = `
      border: 1px solid rgba(14, 116, 144, 0.5);
      border-radius: 12px;
      padding: 16px;
      background: linear-gradient(90deg, rgba(8, 51, 68, 0.2) 0%, rgba(23, 37, 84, 0.15) 100%);
    `;
    
    const statsGrid = document.createElement('div');
    statsGrid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;';
    
    // Total Volume
    const volumeDiv = document.createElement('div');
    volumeDiv.style.cssText = 'text-align: center;';
    volumeDiv.innerHTML = `
      <div style="font-size: 18px; font-weight: bold; color: white;">${sessionMetrics.totalClimbs}</div>
      <div style="font-size: 12px; color: #94a3b8;">Total Volume</div>
    `;
    
    // Hardest Flash
    const flashDiv = document.createElement('div');
    flashDiv.style.cssText = 'text-align: center;';
    flashDiv.innerHTML = `
      <div style="font-size: 18px; font-weight: bold; color: white;">${sessionMetrics.hardestFlashGrade}</div>
      <div style="font-size: 12px; color: #94a3b8;">Hardest Flash</div>
    `;
    
    // Flash Rate
    const rateDiv = document.createElement('div');
    rateDiv.style.cssText = 'text-align: center;';
    const flashRateColor = sessionMetrics.flashRate >= 85 ? '#22d3ee' : 'white';
    rateDiv.innerHTML = `
      <div style="font-size: 18px; font-weight: bold; color: ${flashRateColor};">${sessionMetrics.flashRate}%</div>
      <div style="font-size: 12px; color: #94a3b8;">Flash Rate</div>
    `;
    
    statsGrid.appendChild(volumeDiv);
    statsGrid.appendChild(flashDiv);
    statsGrid.appendChild(rateDiv);
    statsContainer.appendChild(statsGrid);
    statsSection.appendChild(statsContainer);
    
    mainContent.appendChild(hardestSendSection);
    mainContent.appendChild(statsSection);
    
    // App Attribution - exact match
    const attribution = document.createElement('div');
    attribution.style.cssText = 'padding: 0 20px; padding-bottom: 16px;';
    
    const attributionText = document.createElement('div');
    attributionText.style.cssText = 'font-size: 12px; color: #94a3b8; text-align: center;';
    attributionText.innerHTML = 'powered by <span style="color: white; font-weight: 600;">POGO</span>';
    
    attribution.appendChild(attributionText);
    
    // Assemble the card - exact structure
    container.appendChild(headerSection);
    if (chartSection) {
      container.appendChild(chartSection);
    }
    container.appendChild(mainContent);
    container.appendChild(attribution);
    
    section.appendChild(container);
    return section;
  }
  
  /**
   * Calculates metrics for a session
   * @param {Object} session - Session data
   * @param {Array} allSessions - All user sessions
   * @returns {Object} - Calculated metrics
   */
  calculateSessionMetrics(session, allSessions) {
    const climbList = session.climbList || [];
    
    // Calculate session XP
    let sessionXP = 0;
    climbList.forEach(climb => {
      const baseXP = 10;
      const gradeNum = parseInt(climb.grade.replace('V', '')) || 0;
      const gradeMultiplier = gradeNum + 1;
      const flashBonus = climb.attempts === 1 ? 1.2 : 1.0;
      const climbXP = baseXP * gradeMultiplier * flashBonus;
      sessionXP += climbXP;
    });
    sessionXP = Math.floor(sessionXP);
    
    // Session focus (most common style)
    const styleCounts = {};
    climbList.forEach(climb => {
      const style = climb.style || 'Technical';
      styleCounts[style] = (styleCounts[style] || 0) + 1;
    });
    const mostCommonStyle = Object.entries(styleCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Technical';
    
    const sessionFocus = mostCommonStyle === 'Technical' ? 'Skill' :
                        mostCommonStyle === 'Simple' ? 'Capacity' :
                        mostCommonStyle === 'Power' ? 'Power' : 'Skill';
    
    // Hardest climb
    const hardestClimb = climbList.reduce((max, climb) => {
      const gradeNum = parseInt(climb.grade.replace('V', '')) || 0;
      const maxNum = parseInt(max.grade.replace('V', '')) || 0;
      return gradeNum > maxNum ? climb : max;
    }, climbList[0] || { grade: 'V0', style: 'Technical', angle: 'Vertical', rpe: 5, attempts: 1, type: 'BOULDER' });
    
    // Flash calculations
    const totalClimbs = climbList.length;
    const flashedClimbs = climbList.filter(climb => climb.attempts === 1).length;
    const flashRate = totalClimbs > 0 ? Math.round((flashedClimbs / totalClimbs) * 100) : 0;
    
    const flashedClimbGrades = climbList
      .filter(climb => climb.attempts === 1)
      .map(climb => parseInt(climb.grade.replace('V', '')) || 0);
    const hardestFlashGrade = flashedClimbGrades.length > 0 
      ? `V${Math.max(...flashedClimbGrades)}` 
      : '--';
    
    // Duration calculation
    const actualDuration = this.calculateActualDuration(session);
    
    return {
      sessionXP,
      sessionFocus,
      hardestClimb,
      totalClimbs,
      flashRate,
      hardestFlashGrade,
      actualDuration
    };
  }
  
  /**
   * Calculates actual session duration
   * @param {Object} session - Session data
   * @returns {string} - Formatted duration
   */
  calculateActualDuration(session) {
    const climbList = session.climbList || [];
    if (climbList.length === 0) return "0m";
    
    const startTime = session.startTime;
    const lastClimbTime = Math.max(...climbList.map(climb => climb.timestamp));
    
    const durationMs = lastClimbTime - startTime;
    const durationMins = Math.floor(durationMs / (1000 * 60));
    
    if (durationMins < 60) {
      return `${Math.max(durationMins, 1)}m`;
    } else {
      const hours = Math.floor(durationMins / 60);
      const mins = durationMins % 60;
      return `${hours}h ${mins}m`;
    }
  }
  
  /**
   * Prepares grade progression chart data
   * @param {Object} session - Session data
   * @returns {Object} - Chart data with values and labels
   */
  prepareGradeProgressionChart(session) {
    const climbList = session.climbList || [];
    if (climbList.length === 0) return { values: [], labels: [] };
    
    // Sort climbs by timestamp to get chronological order
    const sortedClimbs = [...climbList].sort((a, b) => 
      (a.timestamp || 0) - (b.timestamp || 0)
    );

    // Extract grade values in chronological order
    const values = sortedClimbs.map(climb => 
      parseInt(climb.grade.replace('V', '')) || 0
    );
    
    // Create evenly spaced labels based on climb count
    const labels = [];
    const totalClimbs = values.length;
    
    // Show labels for key points in the session
    for (let i = 0; i < totalClimbs; i++) {
      if (totalClimbs <= 10) {
        // For short sessions, show every climb number
        labels.push((i + 1).toString());
      } else if (i === 0 || i === Math.floor(totalClimbs / 2) || i === totalClimbs - 1) {
        // For longer sessions, show start, middle, end
        labels.push((i + 1).toString());
      } else {
        labels.push('');
      }
    }

    return { values, labels };
  }

  /**
   * Creates an SVG grade progression chart
   * @param {Object} chartData - Chart data with values and labels
   * @returns {SVGElement} - SVG chart element
   */
  createGradeProgressionSVG(chartData) {
    const { values } = chartData;
    const width = 260;
    const height = 140;
    const padding = 20;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.cssText = 'display: block; margin: 0 auto;';
    
    // Find min and max values for scaling
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1; // Avoid division by zero
    
    // Create path data
    const points = values.map((value, index) => {
      const x = padding + (index / (values.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      return { x, y, value };
    });
    
    // Create the line path
    const pathData = points.map((point, index) => {
      return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    }).join(' ');
    
    // Add gradient definition
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'lineGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '0%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#22d3ee');
    stop1.setAttribute('stop-opacity', '0.8');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#06b6d4');
    stop2.setAttribute('stop-opacity', '1');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);
    
    // Add the line path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', 'url(#lineGradient)');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    
    // Add data points
    points.forEach((point, index) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', point.x);
      circle.setAttribute('cy', point.y);
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', '#22d3ee');
      circle.setAttribute('stroke', '#0891b2');
      circle.setAttribute('stroke-width', '1');
      svg.appendChild(circle);
    });
    
    // Add Y-axis labels (grade values)
    const uniqueValues = [...new Set(values)].sort((a, b) => b - a);
    uniqueValues.slice(0, 4).forEach(value => { // Show max 4 labels
      const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', padding - 8);
      text.setAttribute('y', y + 4);
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, sans-serif');
      text.setAttribute('fill', '#94a3b8');
      text.textContent = `V${value}`;
      svg.appendChild(text);
    });
    
    return svg;
  }

  /**
   * Formats date for display
   * @param {string} date - Date string
   * @returns {string} - Formatted date
   */
  formatDate(date) {
    if (date === 'Now') {
      const today = new Date();
      return today.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
    return date;
  }
}

// Export singleton instance
export const socialCardGenerator = new SocialCardGenerator();
