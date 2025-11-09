import { clamp } from '../../utils/index.js';

// Bar Chart Component for weekly volume tracking
export const BarChart = ({ values = [10, 20, 30], labels = [], height = 90, onClick }) => {
  const padding = 8;
  const width = 260;
  const gap = 6;
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
              <text
                x={x + barW / 2}
                y={height - 5}
                textAnchor="middle"
                className="fill-gray-300 text-[10px]"
              >
                {labels[i]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// Line Chart Component for session grade progression with smooth curves
export const LineChart = ({ values = [4, 4.2, 4.1], labels = [], height = 120, isExceptional = false, formatType = 'grade' }) => {
  const padding = 24;
  const rightPadding = 16;
  const width = 328;
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal;

  // Add padding based on the range - smaller ranges need more padding
  const paddingPercent = range < 2 ? 0.3 : 0.1;
  const chartMin = Math.max(0, minVal - range * paddingPercent);
  const chartMax = maxVal + range * paddingPercent;
  const chartRange = chartMax - chartMin;

  const stepX = (width - padding - rightPadding) / (values.length - 1);

  const points = values.map((v, i) => {
    const x = padding + i * stepX;
    const y = height - padding - ((v - chartMin) / chartRange) * (height - padding * 2);
    return { x, y, value: v };
  });

  // Create smooth Bézier curve path
  const pathD = points.reduce((path, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    
    const prev = points[i - 1];
    const controlX1 = prev.x + (point.x - prev.x) / 3;
    const controlY1 = prev.y;
    const controlX2 = prev.x + 2 * (point.x - prev.x) / 3;
    const controlY2 = point.y;
    
    return path + ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${point.x} ${point.y}`;
  }, '');

  // Create gradient fill path
  const fillPath = pathD + ` L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  // Format Y-axis values based on type
  const formatValue = (val) => {
    if (formatType === 'grade') return `V${Math.round(val)}`;
    if (formatType === 'percentage') return `${Math.round(val)}%`;
    if (formatType === 'decimal') return val.toFixed(1);
    return Math.round(val).toString(); // 'number' or default
  };

  // Color scheme based on exceptional status
  const lineColor = isExceptional ? '#67e8f9' : '#22d3ee';
  const lineColorLight = isExceptional ? '#a5f3fc' : '#22d3ee';
  const pointColor = isExceptional ? 'fill-cyan-300' : 'fill-cyan-400';
  const gridColor = isExceptional ? '#164e63' : '#2a2a2a';
  const textColor = isExceptional ? 'fill-gray-500' : 'fill-gray-500';
  const labelColor = isExceptional ? 'fill-gray-400' : 'fill-gray-400';
  const gradientId = isExceptional ? 'iceBlueGradient' : 'lineGradient';
  const glowId = isExceptional ? 'glowExceptional' : 'glow';

  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={isExceptional ? '#67e8f9' : '#22d3ee'} stopOpacity={isExceptional ? '0.5' : '0.4'} />
          <stop offset="100%" stopColor={isExceptional ? '#06b6d4' : '#22d3ee'} stopOpacity="0" />
        </linearGradient>
        
        {isExceptional && (
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        )}
      </defs>
      
      {/* Grid lines */}
      {[0, 0.5, 1].map((percent, i) => {
        const y = padding + (1 - percent) * (height - padding * 2);
        const value = chartMin + percent * chartRange;
        return (
          <g key={i}>
            <line 
              x1={padding} 
              y1={y} 
              x2={width - rightPadding} 
              y2={y} 
              stroke={gridColor} 
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity={isExceptional ? '0.5' : '1'}
            />
            <text 
              x={padding - 8} 
              y={y + 4} 
              textAnchor="end" 
              className={`${textColor} text-[9px] font-medium`}
            >
              {formatValue(value)}
            </text>
          </g>
        );
      })}
      
      {/* Gradient fill */}
      <path d={fillPath} fill={`url(#${gradientId})`} />
      
      {/* Line with optional glow */}
      {isExceptional ? (
        <>
          <path d={pathD} stroke={lineColor} strokeWidth="3.5" fill="none" strokeLinecap="round" filter={`url(#${glowId})`} />
          <path d={pathD} stroke={lineColorLight} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <path d={pathD} stroke={lineColor} strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      
      {/* Points with optional glow */}
      {points.map((point, i) => (
        <g key={i}>
          {isExceptional && <circle cx={point.x} cy={point.y} r="5" className="fill-cyan-400/30" />}
          <circle cx={point.x} cy={point.y} r={isExceptional ? '3' : '4'} className={pointColor} />
        </g>
      ))}
      
      {/* Number labels - auto-generate if not provided */}
      {Array.from({ length: values.length }, (_, i) => (
        <text
          key={i}
          x={points[i]?.x}
          y={height - 5}
          textAnchor="middle"
          className={`${labelColor} text-[10px] font-medium`}
        >
          {i + 1}
        </text>
      ))}
    </svg>
  );
};

// Trend Chart Component - optimized for Performance Trends page with wider Y-axis spacing
export const TrendChart = ({ values = [4, 4.2, 4.1], labels = [], height = 110, formatType = 'number' }) => {
  const padding = 40; // More left padding for Y-axis labels
  const rightPadding = 20;
  const width = 320; // Adjusted total width
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal;

  // Add padding based on the range - smaller ranges need more padding
  const paddingPercent = range < 2 ? 0.3 : 0.1;
  const chartMin = Math.max(0, minVal - range * paddingPercent);
  const chartMax = maxVal + range * paddingPercent;
  const chartRange = chartMax - chartMin;

  const stepX = (width - padding - rightPadding) / (values.length - 1);

  const points = values.map((v, i) => {
    const x = padding + i * stepX;
    const y = height - 24 - ((v - chartMin) / chartRange) * (height - 44);
    return { x, y, value: v };
  });

  // Create smooth Bézier curve path
  const pathD = points.reduce((path, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    
    const prev = points[i - 1];
    const controlX1 = prev.x + (point.x - prev.x) / 3;
    const controlY1 = prev.y;
    const controlX2 = prev.x + 2 * (point.x - prev.x) / 3;
    const controlY2 = point.y;
    
    return path + ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${point.x} ${point.y}`;
  }, '');

  // Create gradient fill path
  const fillPath = pathD + ` L ${points[points.length - 1].x} ${height - 24} L ${padding} ${height - 24} Z`;

  // Format Y-axis values based on type
  const formatValue = (val) => {
    if (formatType === 'percentage') return `${Math.round(val)}%`;
    if (formatType === 'decimal') return val.toFixed(1);
    return Math.round(val).toString(); // 'number' or default
  };

  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Grid lines */}
      {[0, 0.5, 1].map((percent, i) => {
        const y = 20 + (1 - percent) * (height - 44);
        const value = chartMin + percent * chartRange;
        return (
          <g key={i}>
            <line 
              x1={padding} 
              y1={y} 
              x2={width - rightPadding} 
              y2={y} 
              stroke="#2a2a2a" 
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text 
              x={padding - 10} 
              y={y + 4} 
              textAnchor="end" 
              className="fill-gray-500 text-[10px] font-medium"
            >
              {formatValue(value)}
            </text>
          </g>
        );
      })}
      
      {/* Gradient fill */}
      <path d={fillPath} fill="url(#trendGradient)" />
      
      {/* Line */}
      <path d={pathD} stroke="#22d3ee" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      
      {/* Points */}
      {points.map((point, i) => (
        <circle key={i} cx={point.x} cy={point.y} r="3" className="fill-cyan-400" />
      ))}
      
      {/* X-axis labels */}
      {labels.map((label, i) => (
        <text
          key={i}
          x={points[i]?.x}
          y={height - 8}
          textAnchor="middle"
          className="fill-gray-400 text-[10px] font-medium"
        >
          {label}
        </text>
      ))}
    </svg>
  );
};

// Trend indicator component
export const Trend = ({ dir = 'flat', children }) => {
  const color = dir === 'up' ? 'text-cyan-400' : dir === 'down' ? 'text-graytxt' : 'text-white';
  const arrow = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '→';
  return (
    <span className={`inline-flex items-center gap-1 ${color}`}>
      <span>{arrow}</span>
      {children}
    </span>
  );
};
