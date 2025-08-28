// Chart components extracted from dashboard HTML
// Preserves exact dark theme styling and visualization logic

export const BarChart = ({ values = [10, 20, 30], labels = [], height = 90, onClick }) => {
  const padding = 8, width = 260, gap = 6;
  const barW = (width - padding * 2 - gap * (values.length - 1)) / values.length;
  const maxVal = Math.max(1, ...values);
  
  return (
    <svg width={width} height={height} className="cursor-pointer" onClick={onClick}>
      {values.map((v, i) => {
        const h = Math.max(2, (v / maxVal) * (height - 24));
        const x = padding + i * (barW + gap);
        const y = height - h - 18;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} rx="4" className="fill-white/70" />
            {labels[i] && (
              <text x={x + barW / 2} y={height - 2} textAnchor="middle" className="fill-gray-300 text-sm">{labels[i]}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export const LineChart = ({ values = [4, 4.2, 4.1], labels = [], height = 90 }) => {
  const padding = 20, width = 260;
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal;
  
  // Add padding based on the range - smaller ranges need more padding
  const paddingPercent = range < 2 ? 0.3 : 0.1;
  const chartMin = minVal - (range * paddingPercent);
  const chartMax = maxVal + (range * paddingPercent);
  const chartRange = chartMax - chartMin;
  
  const stepX = (width - padding * 2) / (values.length - 1);
  
  const points = values.map((v, i) => {
    const x = padding + i * stepX;
    const y = height - padding - 18 - ((v - chartMin) / chartRange) * (height - padding * 2 - 18);
    return { x, y, value: v };
  });
  
  const pathD = points.reduce((path, point, i) => {
    return path + (i === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
  }, '');

  // Determine format based on value range
  const formatValue = (val) => {
    if (maxVal <= 10) return `V${val.toFixed(1)}`; // Grades
    if (maxVal <= 20) return val.toFixed(1); // RPE
    return Math.round(val).toString(); // Volume
  };

  return (
    <svg width={width} height={height}>
      {/* Grid lines */}
      {[chartMax, (chartMin + chartMax) / 2, chartMin].map((val, i) => {
        const y = padding + (i * (height - padding * 2 - 18) / 2);
        return (
          <g key={i}>
            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#2a2a2a" strokeWidth="1" />
            <text x={padding - 5} y={y + 3} textAnchor="end" className="fill-gray-400 text-sm">{formatValue(val)}</text>
          </g>
        );
      })}
      
      {/* Line */}
      <path d={pathD} stroke="#4ade80" strokeWidth="2" fill="none" />
      
      {/* Points */}
      {points.map((point, i) => (
        <circle key={i} cx={point.x} cy={point.y} r="2" className="fill-green" />
      ))}
      
      {/* Labels */}
      {labels.map((label, i) => (
        <text key={i} x={points[i]?.x} y={height - 2} textAnchor="middle" className="fill-gray-300 text-sm">{label}</text>
      ))}
    </svg>
  );
};

export const Trend = ({ dir = 'flat', children }) => {
  const color = dir === 'up' ? 'text-green' : dir === 'down' ? 'text-graytxt' : 'text-white';
  const arrow = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '→';
  return <span className={`inline-flex items-center gap-1 ${color}`}><span>{arrow}</span>{children}</span>;
};
