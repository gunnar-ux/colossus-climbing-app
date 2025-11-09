import { useState } from 'react';
import { ChevronRightIcon } from '../ui/Icons.jsx';

// Iteration 2: Focused on compact + accessible text + training terminology
// Based on Variation 5 feedback: better language, larger text where possible

const ReadinessLoadV2TestingPage = () => {
  const [crsValue, setCrsValue] = useState(92);
  const [loadValue, setLoadValue] = useState(1.2);
  
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
      <h1 className="text-white text-2xl font-bold mb-4">Compact Variations v2</h1>
      
      <div className="bg-card border border-border rounded-lg p-4 mb-6 space-y-3">
        <div>
          <label className="text-white text-sm font-semibold mb-2 block">
            CRS: {crsValue}%
          </label>
          <input type="range" min="0" max="100" step="1" value={crsValue} onChange={(e) => setCrsValue(parseInt(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-white text-sm font-semibold mb-2 block">
            Load Ratio: {loadValue.toFixed(1)}x (Text size notes below each)
          </label>
          <input type="range" min="0" max="2" step="0.1" value={loadValue} onChange={(e) => setLoadValue(parseFloat(e.target.value))} className="w-full" />
        </div>
      </div>

      {/* Variation 1: Slightly larger text (11px labels, remove status) */}
      <div className="space-y-2">
        <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
          V1: Minimal - No Status Text (11px labels only)
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-border/30 border border-border/60 rounded-lg p-2.5 shadow-inner cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[11px] text-white font-bold uppercase tracking-wide">Readiness</div>
              <ChevronRightIcon className="w-3 h-3 text-graytxt" />
            </div>
            <div className={`text-3xl font-extrabold leading-none ${getCRSColor(crsValue)} mb-2`}>{crsValue}%</div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div className={`bg-gradient-to-r ${getCRSGradient(crsValue)} h-full`} style={{width: `${crsValue}%`}}></div>
            </div>
          </div>

          <div className="bg-border/30 border border-border/60 rounded-lg p-2.5 shadow-inner cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[11px] text-white font-bold uppercase tracking-wide">Load Ratio</div>
              <ChevronRightIcon className="w-3 h-3 text-graytxt" />
            </div>
            <div className={`text-3xl font-extrabold leading-none ${getLoadColor(loadValue)} mb-2`}>{loadValue.toFixed(1)}x</div>
            <div className="flex gap-0.5">
              <div className={`h-1.5 rounded-sm ${loadValue < 0.8 ? 'flex-[0.8] bg-gray-400' : 'flex-[0.8] bg-border/40'}`}></div>
              <div className={`h-1.5 rounded-sm ${loadValue >= 0.8 && loadValue <= 1.3 ? 'flex-[0.5] bg-cyan-400' : 'flex-[0.5] bg-border/40'}`}></div>
              <div className={`h-1.5 rounded-sm ${loadValue > 1.3 ? 'flex-[0.7] bg-red' : 'flex-[0.7] bg-border/40'}`}></div>
            </div>
          </div>
        </div>
        <div className="text-xs text-graytxt italic">Labels: 11px • Status: None</div>
      </div>

      {/* Variation 2: Zone text below (11px) */}
      <div className="space-y-2">
        <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
          V2: Zone Labels Below (11px)
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-border/30 border border-border/60 rounded-lg p-2.5 shadow-inner cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[11px] text-white font-bold uppercase tracking-wide">Readiness</div>
              <ChevronRightIcon className="w-3 h-3 text-graytxt" />
            </div>
            <div className={`text-3xl font-extrabold leading-none ${getCRSColor(crsValue)} mb-2`}>{crsValue}%</div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden mb-1">
              <div className={`bg-gradient-to-r ${getCRSGradient(crsValue)} h-full`} style={{width: `${crsValue}%`}}></div>
            </div>
            <div className="text-[11px] text-graytxt text-center uppercase tracking-wide">
              {crsValue >= 88 ? 'Peak' : crsValue >= 75 ? 'Ready' : crsValue >= 60 ? 'Moderate' : 'Fatigued'}
            </div>
          </div>

          <div className="bg-border/30 border border-border/60 rounded-lg p-2.5 shadow-inner cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[11px] text-white font-bold uppercase tracking-wide">Load Ratio</div>
              <ChevronRightIcon className="w-3 h-3 text-graytxt" />
            </div>
            <div className={`text-3xl font-extrabold leading-none ${getLoadColor(loadValue)} mb-2`}>{loadValue.toFixed(1)}x</div>
            <div className="flex gap-0.5 mb-1">
              <div className={`h-1.5 rounded-sm ${loadValue < 0.8 ? 'flex-[0.8] bg-gray-400' : 'flex-[0.8] bg-border/40'}`}></div>
              <div className={`h-1.5 rounded-sm ${loadValue >= 0.8 && loadValue <= 1.3 ? 'flex-[0.5] bg-cyan-400' : 'flex-[0.5] bg-border/40'}`}></div>
              <div className={`h-1.5 rounded-sm ${loadValue > 1.3 ? 'flex-[0.7] bg-red' : 'flex-[0.7] bg-border/40'}`}></div>
            </div>
            <div className="text-[11px] text-graytxt text-center uppercase tracking-wide">
              {loadValue < 0.8 ? 'Low Load' : loadValue <= 1.3 ? 'Balanced' : loadValue <= 1.5 ? 'Elevated' : 'Overtrained'}
            </div>
          </div>
        </div>
        <div className="text-xs text-graytxt italic">Labels: 11px • Status: 11px below bars</div>
      </div>

      {/* Variation 3: Side-by-side value and status (10px/11px) */}
      <div className="space-y-2">
        <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
          V3: Value + Status Inline (10-11px)
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-border/30 border border-border/60 rounded-lg p-2.5 shadow-inner cursor-pointer">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[11px] text-white font-bold uppercase tracking-wide">Readiness</div>
              <ChevronRightIcon className="w-3 h-3 text-graytxt" />
            </div>
            <div className="flex items-baseline justify-between mb-1.5">
              <div className={`text-3xl font-extrabold leading-none ${getCRSColor(crsValue)}`}>{crsValue}%</div>
              <div className="text-[10px] text-graytxt uppercase font-semibold tracking-wide">
                {crsValue >= 75 ? 'Ready' : 'Rest'}
              </div>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div className={`bg-gradient-to-r ${getCRSGradient(crsValue)} h-full`} style={{width: `${crsValue}%`}}></div>
            </div>
          </div>

          <div className="bg-border/30 border border-border/60 rounded-lg p-2.5 shadow-inner cursor-pointer">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[11px] text-white font-bold uppercase tracking-wide">Load Ratio</div>
              <ChevronRightIcon className="w-3 h-3 text-graytxt" />
            </div>
            <div className="flex items-baseline justify-between mb-1.5">
              <div className={`text-3xl font-extrabold leading-none ${getLoadColor(loadValue)}`}>{loadValue.toFixed(1)}x</div>
              <div className={`text-[10px] uppercase font-semibold tracking-wide ${loadValue > 1.3 ? 'text-red' : 'text-cyan-400'}`}>
                {loadValue < 0.8 ? 'Low' : loadValue <= 1.3 ? 'Good' : 'High'}
              </div>
            </div>
            <div className="flex gap-0.5">
              <div className={`h-1.5 rounded-sm ${loadValue < 0.8 ? 'flex-[0.8] bg-gray-400' : 'flex-[0.8] bg-border/40'}`}></div>
              <div className={`h-1.5 rounded-sm ${loadValue >= 0.8 && loadValue <= 1.3 ? 'flex-[0.5] bg-cyan-400' : 'flex-[0.5] bg-border/40'}`}></div>
              <div className={`h-1.5 rounded-sm ${loadValue > 1.3 ? 'flex-[0.7] bg-red' : 'flex-[0.7] bg-border/40'}`}></div>
            </div>
          </div>
        </div>
        <div className="text-xs text-graytxt italic">Labels: 11px • Status: 10px inline • Compromise approach</div>
      </div>

      {/* Variation 4: Icon indicators instead of text (accessible) */}
      <div className="space-y-2">
        <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
          V4: Icon Indicators (11px labels, no micro text)
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-border/30 border border-border/60 rounded-lg p-2.5 shadow-inner cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[11px] text-white font-bold uppercase tracking-wide">Readiness</div>
              <ChevronRightIcon className="w-3 h-3 text-graytxt" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className={`text-3xl font-extrabold leading-none ${getCRSColor(crsValue)}`}>{crsValue}%</div>
              <div className="text-lg">
                {crsValue >= 88 ? '🔥' : crsValue >= 75 ? '✓' : crsValue >= 60 ? '–' : '⚠'}
              </div>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div className={`bg-gradient-to-r ${getCRSGradient(crsValue)} h-full`} style={{width: `${crsValue}%`}}></div>
            </div>
          </div>

          <div className="bg-border/30 border border-border/60 rounded-lg p-2.5 shadow-inner cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[11px] text-white font-bold uppercase tracking-wide">Load Ratio</div>
              <ChevronRightIcon className="w-3 h-3 text-graytxt" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className={`text-3xl font-extrabold leading-none ${getLoadColor(loadValue)}`}>{loadValue.toFixed(1)}x</div>
              <div className="text-lg">
                {loadValue > 1.3 ? '⚠' : loadValue >= 0.8 ? '✓' : '↓'}
              </div>
            </div>
            <div className="flex gap-0.5">
              <div className={`h-1.5 rounded-sm ${loadValue < 0.8 ? 'flex-[0.8] bg-gray-400' : 'flex-[0.8] bg-border/40'}`}></div>
              <div className={`h-1.5 rounded-sm ${loadValue >= 0.8 && loadValue <= 1.3 ? 'flex-[0.5] bg-cyan-400' : 'flex-[0.5] bg-border/40'}`}></div>
              <div className={`h-1.5 rounded-sm ${loadValue > 1.3 ? 'flex-[0.7] bg-red' : 'flex-[0.7] bg-border/40'}`}></div>
            </div>
          </div>
        </div>
        <div className="text-xs text-graytxt italic">Labels: 11px • Status: Icons (✓ ⚠ 🔥) • Most accessible</div>
      </div>

      {/* Variation 5: Thicker bars with embedded tiny text (creative) */}
      <div className="space-y-2">
        <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
          V5: Text in Bars (11px labels, 9px in bars)
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-border/30 border border-border/60 rounded-lg p-2.5 shadow-inner cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[11px] text-white font-bold uppercase tracking-wide">Readiness</div>
              <ChevronRightIcon className="w-3 h-3 text-graytxt" />
            </div>
            <div className={`text-3xl font-extrabold leading-none ${getCRSColor(crsValue)} mb-2`}>{crsValue}%</div>
            <div className="relative h-3 bg-border rounded-full overflow-hidden">
              <div className={`bg-gradient-to-r ${getCRSGradient(crsValue)} h-full flex items-center justify-end pr-2`} style={{width: `${crsValue}%`}}>
                <span className="text-[9px] text-white/80 font-bold uppercase tracking-wider">
                  {crsValue >= 75 ? 'Ready' : 'Rest'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-border/30 border border-border/60 rounded-lg p-2.5 shadow-inner cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[11px] text-white font-bold uppercase tracking-wide">Load Ratio</div>
              <ChevronRightIcon className="w-3 h-3 text-graytxt" />
            </div>
            <div className={`text-3xl font-extrabold leading-none ${getLoadColor(loadValue)} mb-2`}>{loadValue.toFixed(1)}x</div>
            <div className="flex gap-0.5 h-3">
              <div className={`rounded-sm flex items-center justify-center ${loadValue < 0.8 ? 'flex-[0.8] bg-gray-400' : 'flex-[0.8] bg-border/40'}`}>
                {loadValue < 0.8 && <span className="text-[9px] text-white/80 font-bold">LOW</span>}
              </div>
              <div className={`rounded-sm flex items-center justify-center ${loadValue >= 0.8 && loadValue <= 1.3 ? 'flex-[0.5] bg-cyan-400' : 'flex-[0.5] bg-border/40'}`}>
                {loadValue >= 0.8 && loadValue <= 1.3 && <span className="text-[9px] text-white/80 font-bold">OK</span>}
              </div>
              <div className={`rounded-sm flex items-center justify-center ${loadValue > 1.3 ? 'flex-[0.7] bg-red' : 'flex-[0.7] bg-border/40'}`}>
                {loadValue > 1.3 && <span className="text-[9px] text-white/80 font-bold">HIGH</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="text-xs text-graytxt italic">Labels: 11px • Status: 9px embedded in bars • Creative but micro</div>
      </div>
    </div>
  );
};

export default ReadinessLoadV2TestingPage;

