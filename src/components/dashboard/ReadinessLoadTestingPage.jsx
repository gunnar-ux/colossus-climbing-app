import { useState } from 'react';
import { ChevronRightIcon } from '../ui/Icons.jsx';

// Testing page for combined CRS + Load Ratio visualization
// Goal: Show both metrics in a cohesive, scannable way on Today card

const ReadinessLoadTestingPage = () => {
  // Test values
  const [crsValue, setCrsValue] = useState(92);
  const [loadValue, setLoadValue] = useState(1.2);
  
  // Helper functions
  const getCRSColor = (score) => {
    if (score >= 88) return 'text-green';
    if (score >= 75) return 'text-cyan-400';
    if (score >= 60) return 'text-yellow';
    return 'text-orange';
  };

  const getCRSGradient = (score) => {
    if (score >= 88) return 'from-green-900 to-green';
    if (score >= 75) return 'from-cyan-900 to-cyan-400';
    if (score >= 60) return 'from-yellow-900 to-yellow';
    return 'from-orange-900 to-orange';
  };

  const getLoadColor = (ratio) => {
    if (ratio < 0.8) return 'text-gray-400';
    if (ratio <= 1.3) return 'text-cyan-400';
    if (ratio <= 1.5) return 'text-yellow';
    return 'text-red';
  };

  const getLoadStatus = (ratio) => {
    if (ratio < 0.8) return 'Low';
    if (ratio <= 1.3) return 'Optimal';
    if (ratio <= 1.5) return 'Elevated';
    return 'High';
  };

  return (
    <div className="w-full min-h-screen bg-bg p-5 space-y-6">
      <h1 className="text-white text-2xl font-bold mb-4">CRS + Load Ratio Paired</h1>
      
      {/* Test Value Controls */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6 space-y-3">
        <div>
          <label className="text-white text-sm font-semibold mb-2 block">
            CRS: {crsValue}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={crsValue}
            onChange={(e) => setCrsValue(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-white text-sm font-semibold mb-2 block">
            Load Ratio: {loadValue.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={loadValue}
            onChange={(e) => setLoadValue(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Variation 1: Current Style + Zone Pills for Load */}
      <div className="space-y-2">
        <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
          Variation 1: Standard Bar + Zone Pills
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* CRS */}
          <div className="bg-border/30 border border-border/60 rounded-lg p-3 shadow-inner cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-white font-bold uppercase tracking-wide">Readiness</div>
              <ChevronRightIcon className="w-3 h-3 text-graytxt" />
            </div>
            <div className={`text-3xl font-extrabold leading-none ${getCRSColor(crsValue)} mb-2`}>{crsValue}%</div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div className={`bg-gradient-to-r ${getCRSGradient(crsValue)} h-full`} style={{width: `${crsValue}%`}}></div>
            </div>
          </div>

          {/* Load Ratio */}
          <div className="bg-border/30 border border-border/60 rounded-lg p-3 shadow-inner cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-white font-bold uppercase tracking-wide">Load Ratio</div>
              <ChevronRightIcon className="w-3 h-3 text-graytxt" />
            </div>
            <div className={`text-3xl font-extrabold leading-none ${getLoadColor(loadValue)} mb-2`}>{loadValue.toFixed(1)}x</div>
            
            {/* Zone indicators */}
            <div className="flex gap-1">
              <div className={`flex-1 h-2 rounded-sm transition-all ${
                loadValue < 0.8 ? 'bg-gray-400' : 'bg-border/40'
              }`}></div>
              <div className={`flex-1 h-2 rounded-sm transition-all ${
                loadValue >= 0.8 && loadValue <= 1.3 ? 'bg-cyan-400' : 'bg-border/40'
              }`}></div>
              <div className={`flex-1 h-2 rounded-sm transition-all ${
                loadValue > 1.3 ? 'bg-red' : 'bg-border/40'
              }`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Variation 2: Both with Safe Zone Highlight */}
      <div className="space-y-2">
        <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
          Variation 2: Both with Zone Ranges
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* CRS */}
          <div className="bg-border/30 border border-border/60 rounded-lg p-3 shadow-inner cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-white font-bold uppercase tracking-wide">Readiness</div>
              <ChevronRightIcon className="w-3 h-3 text-graytxt" />
            </div>
            <div className={`text-3xl font-extrabold leading-none ${getCRSColor(crsValue)} mb-2`}>{crsValue}%</div>
            
            <div className="relative h-2 bg-border/30 rounded-full overflow-visible">
              {/* Optimal zone (75-100) highlighted */}
              <div 
                className="absolute h-full bg-cyan-900/40 border-x border-cyan-600/50 rounded-r-full"
                style={{ left: '75%', width: '25%' }}
              ></div>
              
              {/* Position indicator */}
              <div 
                className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${
                  crsValue >= 75 ? 'bg-cyan-400' : 'bg-yellow'
                }`}
                style={{ left: `${crsValue}%`, transform: 'translateX(-50%) translateY(-50%)' }}
              ></div>
            </div>
          </div>

          {/* Load Ratio */}
          <div className="bg-border/30 border border-border/60 rounded-lg p-3 shadow-inner cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-white font-bold uppercase tracking-wide">Load Ratio</div>
              <ChevronRightIcon className="w-3 h-3 text-graytxt" />
            </div>
            <div className={`text-3xl font-extrabold leading-none ${getLoadColor(loadValue)} mb-2`}>{loadValue.toFixed(1)}x</div>
            
            <div className="relative h-2 bg-border/30 rounded-full overflow-visible">
              {/* Safe zone (0.8-1.3) highlighted */}
              <div 
                className="absolute h-full bg-cyan-900/40 border-x border-cyan-600/50"
                style={{ left: '40%', width: '25%' }}
              ></div>
              
              {/* Position indicator */}
              <div 
                className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${
                  loadValue < 0.8 ? 'bg-gray-400' :
                  loadValue <= 1.3 ? 'bg-cyan-400' :
                  loadValue <= 1.5 ? 'bg-yellow' :
                  'bg-red'
                }`}
                style={{ left: `${Math.min(100, (loadValue / 2) * 100)}%`, transform: 'translateX(-50%) translateY(-50%)' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Variation 3: Compact with Status Labels */}
      <div className="space-y-2">
        <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
          Variation 3: With Status Text
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* CRS */}
          <div className="bg-border/30 border border-border/60 rounded-lg p-3 shadow-inner cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-white font-bold uppercase tracking-wide">Readiness</div>
              <ChevronRightIcon className="w-3 h-3 text-graytxt" />
            </div>
            <div className={`text-3xl font-extrabold leading-none ${getCRSColor(crsValue)} mb-1`}>{crsValue}%</div>
            <div className="text-[9px] text-graytxt uppercase tracking-wide mb-1.5">
              {crsValue >= 88 ? 'Optimal' : crsValue >= 75 ? 'Good' : crsValue >= 60 ? 'Moderate' : 'Caution'}
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div className={`bg-gradient-to-r ${getCRSGradient(crsValue)} h-full`} style={{width: `${crsValue}%`}}></div>
            </div>
          </div>

          {/* Load Ratio */}
          <div className="bg-border/30 border border-border/60 rounded-lg p-3 shadow-inner cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-white font-bold uppercase tracking-wide">Load Ratio</div>
              <ChevronRightIcon className="w-3 h-3 text-graytxt" />
            </div>
            <div className={`text-3xl font-extrabold leading-none ${getLoadColor(loadValue)} mb-1`}>{loadValue.toFixed(1)}x</div>
            <div className="text-[9px] text-graytxt uppercase tracking-wide mb-1.5">{getLoadStatus(loadValue)}</div>
            <div className="flex gap-0.5">
              <div className={`flex-1 h-1.5 rounded-sm ${loadValue < 0.8 ? 'bg-gray-400' : 'bg-border/40'}`}></div>
              <div className={`flex-1 h-1.5 rounded-sm ${loadValue >= 0.8 && loadValue <= 1.3 ? 'bg-cyan-400' : 'bg-border/40'}`}></div>
              <div className={`flex-1 h-1.5 rounded-sm ${loadValue > 1.3 ? 'bg-red' : 'bg-border/40'}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Variation 4: Minimal with Dots */}
      <div className="space-y-2">
        <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
          Variation 4: Minimal Dots
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* CRS */}
          <div className="bg-border/30 border border-border/60 rounded-lg p-3 shadow-inner cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-white font-bold uppercase tracking-wide">Readiness</div>
              <ChevronRightIcon className="w-3 h-3 text-graytxt" />
            </div>
            <div className={`text-3xl font-extrabold leading-none ${getCRSColor(crsValue)} mb-2`}>{crsValue}%</div>
            <div className="flex items-center gap-1">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    i < Math.floor(crsValue / 10) 
                      ? crsValue >= 75 ? 'bg-cyan-400' : 'bg-yellow'
                      : 'bg-border/40'
                  }`}
                ></div>
              ))}
            </div>
          </div>

          {/* Load Ratio */}
          <div className="bg-border/30 border border-border/60 rounded-lg p-3 shadow-inner cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-white font-bold uppercase tracking-wide">Load Ratio</div>
              <ChevronRightIcon className="w-3 h-3 text-graytxt" />
            </div>
            <div className={`text-3xl font-extrabold leading-none ${getLoadColor(loadValue)} mb-2`}>{loadValue.toFixed(1)}x</div>
            <div className="flex items-center gap-1 justify-center">
              <div className={`w-2 h-2 rounded-full ${loadValue < 0.8 ? 'bg-gray-400 scale-125' : 'bg-border/40'}`}></div>
              <div className={`w-2 h-2 rounded-full ${loadValue >= 0.8 && loadValue <= 1.3 ? 'bg-cyan-400 scale-125' : 'bg-border/40'}`}></div>
              <div className={`w-2 h-2 rounded-full ${loadValue > 1.3 ? 'bg-red scale-125' : 'bg-border/40'}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Variation 5: Stacked Compact */}
      <div className="space-y-2">
        <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
          Variation 5: Stacked Info Dense
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* CRS */}
          <div className="bg-border/30 border border-border/60 rounded-lg p-2.5 shadow-inner cursor-pointer">
            <div className="flex items-center justify-between mb-0.5">
              <div className="text-[10px] text-white font-bold uppercase tracking-wide">Readiness</div>
              <ChevronRightIcon className="w-3 h-3 text-graytxt" />
            </div>
            <div className="flex items-end justify-between mb-1">
              <div className={`text-3xl font-extrabold leading-none ${getCRSColor(crsValue)}`}>{crsValue}%</div>
              <div className="text-[9px] text-graytxt uppercase">{crsValue >= 75 ? 'Ready' : 'Rest'}</div>
            </div>
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <div className={`bg-gradient-to-r ${getCRSGradient(crsValue)} h-full`} style={{width: `${crsValue}%`}}></div>
            </div>
          </div>

          {/* Load Ratio */}
          <div className="bg-border/30 border border-border/60 rounded-lg p-2.5 shadow-inner cursor-pointer">
            <div className="flex items-center justify-between mb-0.5">
              <div className="text-[10px] text-white font-bold uppercase tracking-wide">Load Ratio</div>
              <ChevronRightIcon className="w-3 h-3 text-graytxt" />
            </div>
            <div className="flex items-end justify-between mb-1">
              <div className={`text-3xl font-extrabold leading-none ${getLoadColor(loadValue)}`}>{loadValue.toFixed(1)}x</div>
              <div className={`text-[9px] uppercase font-bold ${
                loadValue > 1.3 ? 'text-red' : 'text-cyan-400'
              }`}>
                {loadValue > 1.3 ? '⚠ High' : '✓ Safe'}
              </div>
            </div>
            <div className="flex gap-0.5">
              <div className={`h-1 rounded-sm transition-all ${loadValue < 0.8 ? 'flex-[0.8] bg-gray-400' : 'flex-[0.8] bg-border/40'}`}></div>
              <div className={`h-1 rounded-sm transition-all ${loadValue >= 0.8 && loadValue <= 1.3 ? 'flex-[0.5] bg-cyan-400' : 'flex-[0.5] bg-border/40'}`}></div>
              <div className={`h-1 rounded-sm transition-all ${loadValue > 1.3 ? 'flex-[0.7] bg-red' : 'flex-[0.7] bg-border/40'}`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadinessLoadTestingPage;

