import { useState } from 'react';

// Testing page for Load Ratio visualization variations
// Goal: Make it clear and intuitive whether user is undertraining, optimal, or overtraining

const LoadRatioTestingPage = () => {
  // Test different load ratio values
  const [testValue, setTestValue] = useState(1.2);
  
  // Helper to determine status
  const getStatus = (ratio) => {
    if (ratio < 0.8) return { label: 'Undertraining', color: 'text-gray-400' };
    if (ratio >= 0.8 && ratio <= 1.3) return { label: 'Optimal Range', color: 'text-cyan-400' };
    if (ratio > 1.3 && ratio <= 1.5) return { label: 'Elevated', color: 'text-yellow' };
    return { label: 'Overtraining Risk', color: 'text-red' };
  };

  const status = getStatus(testValue);

  return (
    <div className="w-full min-h-screen bg-bg p-5 space-y-6">
      <h1 className="text-white text-2xl font-bold mb-4">Load Ratio Variations</h1>
      
      {/* Test Value Slider */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <label className="text-white text-sm font-semibold mb-2 block">
          Test Value: {testValue.toFixed(1)}x - <span className={status.color}>{status.label}</span>
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={testValue}
          onChange={(e) => setTestValue(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-graytxt mt-1">
          <span>0.0x</span>
          <span>0.8x</span>
          <span>1.0x</span>
          <span>1.3x</span>
          <span>2.0x</span>
        </div>
      </div>

      {/* Variation 1: Traffic Light Bar */}
      <div className="space-y-2">
        <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
          Variation 1: Traffic Light Style
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-white font-bold uppercase tracking-wide">Load Ratio</div>
            <div className={`text-3xl font-extrabold ${status.color}`}>{testValue.toFixed(1)}x</div>
          </div>
          
          {/* Color-coded bar with zones */}
          <div className="relative h-3 bg-border rounded-full overflow-hidden">
            {/* Background zones */}
            <div className="absolute inset-0 flex">
              <div className="flex-[0.8] bg-gray-700/30"></div>
              <div className="flex-[0.5] bg-cyan-900/30"></div>
              <div className="flex-[0.2] bg-yellow/10"></div>
              <div className="flex-[0.5] bg-red/10"></div>
            </div>
            
            {/* Indicator */}
            <div 
              className={`absolute top-0 h-full w-1 ${
                testValue < 0.8 ? 'bg-gray-400' :
                testValue <= 1.3 ? 'bg-cyan-400' :
                testValue <= 1.5 ? 'bg-yellow' :
                'bg-red'
              }`}
              style={{ left: `${Math.min(100, (testValue / 2) * 100)}%` }}
            ></div>
          </div>
          
          <div className="text-xs text-graytxt mt-2 text-center">{status.label}</div>
        </div>
      </div>

      {/* Variation 2: Gauge/Speedometer Style */}
      <div className="space-y-2">
        <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
          Variation 2: Gauge Style
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-white font-bold uppercase tracking-wide">Load Ratio</div>
            <div className={`text-3xl font-extrabold ${status.color}`}>{testValue.toFixed(1)}x</div>
          </div>
          
          {/* Semi-circle gauge */}
          <div className="relative h-24 overflow-hidden">
            <svg width="100%" height="48" viewBox="0 0 200 100" className="overflow-visible">
              {/* Background arc zones */}
              <path d="M 20 90 A 80 80 0 0 1 60 20" stroke="#4b5563" strokeWidth="16" fill="none" opacity="0.3"/>
              <path d="M 60 20 A 80 80 0 0 1 140 20" stroke="#22d3ee" strokeWidth="16" fill="none" opacity="0.3"/>
              <path d="M 140 20 A 80 80 0 0 1 180 90" stroke="#ef4444" strokeWidth="16" fill="none" opacity="0.3"/>
              
              {/* Active arc */}
              <path 
                d={`M 20 90 A 80 80 0 0 1 ${20 + (Math.min(testValue, 2) / 2) * 160} ${90 - Math.sin(Math.min(testValue, 2) / 2 * Math.PI) * 80}`}
                stroke={
                  testValue < 0.8 ? '#9ca3af' :
                  testValue <= 1.3 ? '#22d3ee' :
                  testValue <= 1.5 ? '#eab308' :
                  '#ef4444'
                }
                strokeWidth="16"
                fill="none"
                strokeLinecap="round"
              />
              
              {/* Center dot */}
              <circle cx="100" cy="90" r="4" fill="#fff"/>
            </svg>
            <div className="text-center mt-2">
              <div className="text-xs text-graytxt">{status.label}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Variation 3: Zone Indicator with Pills */}
      <div className="space-y-2">
        <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
          Variation 3: Zone Pills
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-white font-bold uppercase tracking-wide">Load Ratio</div>
            <div className={`text-3xl font-extrabold ${status.color}`}>{testValue.toFixed(1)}x</div>
          </div>
          
          {/* Zone pills */}
          <div className="flex gap-2 mb-2">
            <div className={`flex-1 py-2 px-3 rounded-lg text-center text-xs font-bold transition-all ${
              testValue < 0.8 
                ? 'bg-gray-700 text-white border-2 border-gray-400' 
                : 'bg-gray-700/20 text-graytxt border border-border/40'
            }`}>
              Low<br/>&lt;0.8x
            </div>
            
            <div className={`flex-1 py-2 px-3 rounded-lg text-center text-xs font-bold transition-all ${
              testValue >= 0.8 && testValue <= 1.3
                ? 'bg-cyan-900/60 text-cyan-400 border-2 border-cyan-600' 
                : 'bg-cyan-900/10 text-graytxt border border-border/40'
            }`}>
              Optimal<br/>0.8-1.3x
            </div>
            
            <div className={`flex-1 py-2 px-3 rounded-lg text-center text-xs font-bold transition-all ${
              testValue > 1.3
                ? 'bg-red/20 text-red border-2 border-red' 
                : 'bg-red/5 text-graytxt border border-border/40'
            }`}>
              High<br/>&gt;1.3x
            </div>
          </div>
          
          <div className="text-xs text-graytxt text-center mt-2">{status.label}</div>
        </div>
      </div>

      {/* Variation 4: Simple Progress Bar with Safe Zone Highlight */}
      <div className="space-y-2">
        <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
          Variation 4: Safe Zone Highlight
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-white font-bold uppercase tracking-wide">Load Ratio</div>
            <div className={`text-3xl font-extrabold ${status.color}`}>{testValue.toFixed(1)}x</div>
          </div>
          
          {/* Bar with highlighted safe zone */}
          <div className="relative h-3 bg-border/30 rounded-full overflow-visible mb-1">
            {/* Safe zone (0.8-1.3) highlighted */}
            <div 
              className="absolute h-full bg-cyan-900/40 border-x-2 border-cyan-600/50"
              style={{ left: '40%', width: '25%' }}
            ></div>
            
            {/* Current position indicator */}
            <div 
              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 ${
                testValue < 0.8 ? 'bg-gray-400 border-gray-300' :
                testValue <= 1.3 ? 'bg-cyan-400 border-cyan-300' :
                testValue <= 1.5 ? 'bg-yellow border-yellow-300' :
                'bg-red border-red-300'
              }`}
              style={{ left: `${Math.min(100, (testValue / 2) * 100)}%`, transform: 'translateX(-50%) translateY(-50%)' }}
            ></div>
          </div>
          
          {/* Labels */}
          <div className="flex justify-between text-[10px] text-graytxt">
            <span>Rest</span>
            <span className="text-cyan-400">← Optimal →</span>
            <span className="text-red">Risk</span>
          </div>
        </div>
      </div>

      {/* Variation 5: Vertical Thermometer */}
      <div className="space-y-2">
        <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
          Variation 5: Vertical Thermometer
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-start gap-4">
            {/* Vertical bar */}
            <div className="flex flex-col items-center">
              <div className="relative w-8 h-32 bg-border/30 rounded-full overflow-hidden">
                {/* Fill from bottom */}
                <div 
                  className={`absolute bottom-0 w-full transition-all ${
                    testValue < 0.8 ? 'bg-gray-400' :
                    testValue <= 1.3 ? 'bg-cyan-400' :
                    testValue <= 1.5 ? 'bg-yellow' :
                    'bg-red'
                  }`}
                  style={{ height: `${Math.min(100, (testValue / 2) * 100)}%` }}
                ></div>
                
                {/* Zone markers */}
                <div className="absolute w-full border-t-2 border-cyan-600/50" style={{ bottom: '40%' }}></div>
                <div className="absolute w-full border-t-2 border-cyan-600/50" style={{ bottom: '65%' }}></div>
              </div>
              <div className="text-xs text-white font-bold mt-2 uppercase tracking-wide">Load</div>
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className={`text-3xl font-extrabold ${status.color} mb-2`}>{testValue.toFixed(1)}x</div>
              <div className="text-sm text-white font-semibold mb-1">{status.label}</div>
              <div className="text-xs text-graytxt">
                {testValue < 0.8 && "Consider increasing training volume"}
                {testValue >= 0.8 && testValue <= 1.3 && "Perfect balance between stress and recovery"}
                {testValue > 1.3 && testValue <= 1.5 && "Monitor fatigue levels closely"}
                {testValue > 1.5 && "High risk - prioritize recovery"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadRatioTestingPage;

