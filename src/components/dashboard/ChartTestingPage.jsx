import { useState } from 'react';
import Header from '../ui/Header.jsx';

// Chart Variation 1: High Performance Theme (Ice Blue)
const HighPerformanceChartVariation = ({ data, title }) => {
  const padding = 20;
  const rightPadding = 20;
  const width = 328;
  const height = 120;
  
  const values = data.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal;
  const chartMin = Math.max(0, minVal - range * 0.2);
  const chartMax = maxVal + range * 0.2;
  const chartRange = chartMax - chartMin;
  
  const stepX = (width - padding - rightPadding) / (values.length - 1);
  
  const points = values.map((v, i) => {
    const x = padding + i * stepX;
    const y = height - padding - ((v - chartMin) / chartRange) * (height - padding * 2);
    return { x, y, value: v };
  });
  
  const pathD = points.reduce((path, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    
    const prev = points[i - 1];
    const controlX1 = prev.x + (point.x - prev.x) / 3;
    const controlY1 = prev.y;
    const controlX2 = prev.x + 2 * (point.x - prev.x) / 3;
    const controlY2 = point.y;
    
    return path + ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${point.x} ${point.y}`;
  }, '');
  
  const fillPath = pathD + ` L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;
  
  return (
    <div className="bg-card border border-cyan-900/40 rounded-col px-4 pt-4 pb-3 relative overflow-hidden">
      {/* Ice blue gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/30 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-base text-white">
              Elite Session
            </div>
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-white">
              12 Climbs
            </div>
          </div>
        </div>
        
        {/* Subtitle row */}
        <div className="flex items-center justify-between mb-0.5">
          <div className="text-sm text-graytxt">
            Nov 6
          </div>
          <div className="text-sm text-graytxt">
            +890 XP
          </div>
        </div>
        
        <svg width={width} height={height} className="mb-2">
          <defs>
            <linearGradient id="iceBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
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
                  stroke="#164e63" 
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.5"
                />
                <text 
                  x={padding - 8} 
                  y={y + 4} 
                  textAnchor="end" 
                  className="fill-gray-500 text-[9px] font-medium"
                >
                  V{Math.round(value)}
                </text>
              </g>
            );
          })}
          
          {/* Gradient fill */}
          <path d={fillPath} fill="url(#iceBlueGradient)" />
          
          {/* Line with glow effect */}
          <path d={pathD} stroke="#67e8f9" strokeWidth="3.5" fill="none" strokeLinecap="round" filter="url(#glow)" />
          <path d={pathD} stroke="#a5f3fc" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Points with glow */}
          {points.map((point, i) => (
            <g key={i}>
              <circle cx={point.x} cy={point.y} r="5" className="fill-cyan-400/30" />
              <circle cx={point.x} cy={point.y} r="3" className="fill-cyan-300" />
            </g>
          ))}
          
          {/* Labels */}
          {data.map((item, i) => (
            <text
              key={i}
              x={points[i]?.x}
              y={height - 5}
              textAnchor="middle"
              className="fill-gray-400 text-[10px] font-medium"
            >
              {item.label}
            </text>
          ))}
        </svg>
        
        {/* Bottom stats row */}
        <div className="text-sm text-graytxt mb-2">
          Hardest: <span className="text-cyan-300 font-medium">V9</span> • Flash Rate: <span className="text-cyan-300 font-medium">92%</span>
        </div>
        
        {/* Powered by POGO footer */}
        <div className="flex items-center justify-center pt-2 border-t border-cyan-900/40">
          <span className="text-xs text-cyan-400/50">powered by </span>
          <span className="text-xs text-white font-semibold ml-1">POGO</span>
          <svg 
            className="w-4 h-4 text-cyan-400/50 ml-auto" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Chart Variation 2: Smooth Line Chart (inspired by analytics dashboards)
const LineChartVariation = ({ data, title }) => {
  const padding = 20;
  const rightPadding = 20;
  const width = 328; // Adjusted for consistent padding
  const height = 120;
  
  const values = data.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal;
  const chartMin = Math.max(0, minVal - range * 0.2);
  const chartMax = maxVal + range * 0.2;
  const chartRange = chartMax - chartMin;
  
  const stepX = (width - padding - rightPadding) / (values.length - 1);
  
  const points = values.map((v, i) => {
    const x = padding + i * stepX;
    const y = height - padding - ((v - chartMin) / chartRange) * (height - padding * 2);
    return { x, y, value: v };
  });
  
  const pathD = points.reduce((path, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    
    const prev = points[i - 1];
    const controlX1 = prev.x + (point.x - prev.x) / 3;
    const controlY1 = prev.y;
    const controlX2 = prev.x + 2 * (point.x - prev.x) / 3;
    const controlY2 = point.y;
    
    return path + ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${point.x} ${point.y}`;
  }, '');
  
  // Create gradient path for fill
  const fillPath = pathD + ` L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;
  
  return (
    <div className="bg-card border border-border rounded-col px-4 pt-4 pb-3">
      {/* Header matching session card style */}
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-base text-white">
          Power Session
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-white">
            8 Climbs
          </div>
        </div>
      </div>
      
      {/* Subtitle row */}
      <div className="flex items-center justify-between mb-0.5">
        <div className="text-sm text-graytxt">
          Oct 10
        </div>
        <div className="text-sm text-graytxt">
          +522 XP
        </div>
      </div>
      
      <svg width={width} height={height} className="mb-2">
        <defs>
          <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
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
                stroke="#2a2a2a" 
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text 
                x={padding - 8} 
                y={y + 4} 
                textAnchor="end" 
                className="fill-gray-500 text-[9px] font-medium"
              >
                V{Math.round(value)}
              </text>
            </g>
          );
        })}
        
        {/* Gradient fill */}
        <path d={fillPath} fill="url(#lineGradient2)" />
        
        {/* Line */}
        <path d={pathD} stroke="#22d3ee" strokeWidth="3" fill="none" strokeLinecap="round" />
        
        {/* Points */}
        {points.map((point, i) => (
          <circle key={i} cx={point.x} cy={point.y} r="4" className="fill-cyan-400" />
        ))}
        
        {/* Labels */}
        {data.map((item, i) => (
          <text
            key={i}
            x={points[i]?.x}
            y={height - 5}
            textAnchor="middle"
            className="fill-gray-400 text-[10px] font-medium"
          >
            {item.label}
          </text>
        ))}
      </svg>
      
      {/* Powered by POGO footer - moved above metrics */}
      <div className="flex items-center justify-center pt-2 mb-2 border-t border-border/40">
        <span className="text-xs text-graytxt/60">powered by </span>
        <span className="text-xs text-white font-semibold ml-1">POGO</span>
      </div>
      
      {/* Bottom stats row matching session card */}
      <div className="flex items-center pt-2 border-t border-border/40">
        <div className="text-sm text-graytxt">
          Hardest: <span className="text-white font-medium">V8</span> • Flash Rate: <span className="text-cyan-400 font-medium">88%</span>
        </div>
        <svg 
          className="w-4 h-4 text-graytxt/60 ml-auto" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

// Chart Variation 3: Crypto/Finance Style (bold, gradient background, detailed stats)
const FinanceChartVariation = ({ data, title }) => {
  const padding = 20;
  const width = 280;
  const height = 140;
  
  const values = data.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal;
  const chartMin = Math.max(0, minVal - range * 0.2);
  const chartMax = maxVal + range * 0.2;
  const chartRange = chartMax - chartMin;
  
  const stepX = (width - padding * 2) / (values.length - 1);
  
  const points = values.map((v, i) => {
    const x = padding + i * stepX;
    const y = height - padding - 20 - ((v - chartMin) / chartRange) * (height - padding * 2 - 20);
    return { x, y, value: v };
  });
  
  const pathD = points.reduce((path, point, i) => {
    return path + (i === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
  }, '');
  
  // Create gradient path for fill
  const fillPath = pathD + ` L ${points[points.length - 1].x} ${height - 20} L ${padding} ${height - 20} Z`;
  
  return (
    <div className="bg-card border border-border rounded-col p-5 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
            <div className="text-graytxt text-xs">Power Session</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white mb-0.5">V8</div>
            <div className="text-cyan-400 text-xs font-bold">+2 grades ↑</div>
          </div>
        </div>
        
        <svg width={width} height={height} className="mb-3">
          <defs>
            <linearGradient id="financeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Gradient fill */}
          <path d={fillPath} fill="url(#financeGradient)" />
          
          {/* Line */}
          <path d={pathD} stroke="#06b6d4" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Points with glow */}
          {points.map((point, i) => (
            <g key={i}>
              <circle cx={point.x} cy={point.y} r="6" className="fill-cyan-400/20" />
              <circle cx={point.x} cy={point.y} r="3" className="fill-cyan-400" />
            </g>
          ))}
          
          {/* Labels */}
          {data.map((item, i) => (
            <text
              key={i}
              x={points[i]?.x}
              y={height - 5}
              textAnchor="middle"
              className="fill-gray-400 text-[10px] font-medium"
            >
              {item.label}
            </text>
          ))}
          
          {/* Current value label */}
          <g>
            <rect 
              x={points[points.length - 1].x - 20} 
              y={points[points.length - 1].y - 25} 
              width="40" 
              height="18" 
              rx="4" 
              className="fill-cyan-400"
            />
            <text
              x={points[points.length - 1].x}
              y={points[points.length - 1].y - 14}
              textAnchor="middle"
              className="fill-black text-[11px] font-bold"
            >
              V{Math.round(values[values.length - 1])}
            </text>
          </g>
        </svg>
        
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <div className="text-graytxt">Hardest</div>
            <div className="text-white font-bold">V8</div>
          </div>
          <div>
            <div className="text-graytxt">Flash Rate</div>
            <div className="text-cyan-400 font-bold">88%</div>
          </div>
          <div>
            <div className="text-graytxt">Total XP</div>
            <div className="text-white font-bold">+522</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Testing Page
const ChartTestingPage = () => {
  // Dummy session data - grade progression for an 8-climb session
  const sessionData = [
    { label: '1', value: 2 },
    { label: '2', value: 4 },
    { label: '3', value: 5 },
    { label: '4', value: 5 },
    { label: '5', value: 7 },
    { label: '6', value: 4 },
    { label: '7', value: 5 },
    { label: '8', value: 8 },
  ];
  
  // High performance session data - 12 climbs with higher grades
  const highPerformanceData = [
    { label: '1', value: 5 },
    { label: '2', value: 6 },
    { label: '3', value: 7 },
    { label: '4', value: 7 },
    { label: '5', value: 8 },
    { label: '6', value: 7 },
    { label: '7', value: 8 },
    { label: '8', value: 8 },
    { label: '9', value: 9 },
    { label: '10', value: 8 },
    { label: '11', value: 9 },
    { label: '12', value: 9 },
  ];

  return (
    <div className="w-full min-h-screen bg-bg overflow-y-auto pb-20">
      <Header title="CHART TESTING LAB" />
      
      <div className="px-5 py-4">
        <div className="text-graytxt text-sm mb-6">
          Compare chart variations for the Today's Training card
        </div>
        
        <div className="space-y-6">
          {/* Variation 1 */}
          <div>
            <div className="text-xs text-cyan-400 font-bold mb-2 uppercase tracking-wider">
              Variation 1: High Performance Theme (Ice Blue)
            </div>
            <HighPerformanceChartVariation data={highPerformanceData} title="Elite Session" />
          </div>
          
          {/* Variation 2 */}
          <div>
            <div className="text-xs text-cyan-400 font-bold mb-2 uppercase tracking-wider">
              Variation 2: Smooth Line (Analytics Style)
            </div>
            <LineChartVariation data={sessionData} title="Grade Progression" />
          </div>
          
          {/* Variation 3 */}
          <div>
            <div className="text-xs text-cyan-400 font-bold mb-2 uppercase tracking-wider">
              Variation 3: Finance/Crypto Style (Bold & Detailed)
            </div>
            <FinanceChartVariation data={sessionData} title="Session Performance" />
          </div>
        </div>
        
        <div className="mt-8 bg-border/20 border border-border/40 rounded-lg p-4">
          <div className="text-white text-sm font-semibold mb-2">Testing Notes</div>
          <div className="text-graytxt text-xs space-y-1">
            <div>• All charts use the same dummy data (8 climbs: V2→V4→V5→V5→V7→V4→V5→V8)</div>
            <div>• Each variation emphasizes different aspects (volume, progression, stats)</div>
            <div>• Consider which feels most "shareable" for social media</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartTestingPage;

