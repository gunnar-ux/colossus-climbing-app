import { useState } from 'react';

// Testing page for Performance Stats layout variations
// Goal: Improve scannability by reducing eye travel distance

const StatsTestingPage = () => {
  const [activeTab1, setActiveTab1] = useState('records');
  const [activeTab2, setActiveTab2] = useState('records');
  const [activeTab3, setActiveTab3] = useState('records');
  
  // Sample data organized by category
  const statsData = {
    records: [
      { label: 'Hardest Send', value: 'V9' },
      { label: 'Max Flash', value: 'V9' },
      { label: 'Max Volume', value: '17' }
    ],
    totals: [
      { label: 'Total Climbs', value: '112' },
      { label: 'Total Sessions', value: '17' },
      { label: 'Total Flashed', value: '99' }
    ],
    averages: [
      { label: 'Flash Rate', value: '88%' },
      { label: 'Climbs per Session', value: '6.6' },
      { label: 'Sessions per Week', value: '0.3/wk' }
    ]
  };

  return (
    <div className="w-full min-h-screen bg-bg p-5 space-y-6">
      <h1 className="text-white text-2xl font-bold mb-8">Performance Stats - Tabbed Variations</h1>

      {/* Variation 1: Pill Tabs (Original) */}
      <div className="space-y-2">
        <div className="text-xs text-cyan-400 font-bold mb-2 uppercase tracking-wider">
          Variation 1: Pill Tabs
        </div>
        <div className="bg-card border border-border rounded-col px-5 pt-5 pb-5">
          <h2 className="text-white text-base font-bold mb-4">Performance Stats</h2>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-4">
            {[
              { id: 'records', label: 'Records' },
              { id: 'totals', label: 'Totals' },
              { id: 'averages', label: 'Averages' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab1(tab.id)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                  activeTab1 === tab.id
                    ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-800/60'
                    : 'bg-border/20 text-graytxt border border-border/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Stats Content with Texture Pattern */}
          <div className="space-y-2">
            {statsData[activeTab1].map((stat, i) => (
              <div 
                key={i}
                className="relative rounded-lg px-3 py-3 flex items-center justify-between shadow-inner overflow-hidden" 
                style={{border: '1px solid rgba(8, 145, 178, 0.4)'}}
              >
                {/* Diagonal pattern background */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <pattern id={`diagonalHatch-v1-${activeTab1}-${i}`} patternUnits="userSpaceOnUse" width="4" height="4">
                      <path d="m0,4 l4,-4 M-1,1 l2,-2 M3,5 l2,-2" stroke="#6b7280" strokeWidth="0.6" opacity="0.4"/>
                    </pattern>
                    <linearGradient id={`iceBlueGradient-v1-${activeTab1}-${i}`} x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#083344" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#155e75" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#diagonalHatch-v1-${activeTab1}-${i})`} rx="8"/>
                  <rect width="100%" height="100%" fill={`url(#iceBlueGradient-v1-${activeTab1}-${i})`} rx="8"/>
                </svg>
                <span className="relative text-white font-medium text-sm">{stat.label}</span>
                <span className="relative text-cyan-400 font-bold text-sm">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Variation 2: Segmented Control (iOS Style) */}
      <div className="space-y-2">
        <div className="text-xs text-cyan-400 font-bold mb-2 uppercase tracking-wider">
          Variation 2: Segmented Control
        </div>
        <div className="bg-card border border-border rounded-col px-5 pt-5 pb-5">
          <h2 className="text-white text-base font-bold mb-4">Performance Stats</h2>
          
          {/* Segmented Control */}
          <div className="bg-border/30 border border-border/60 rounded-lg p-1 mb-4 flex gap-1">
            {[
              { id: 'records', label: 'Records' },
              { id: 'totals', label: 'Totals' },
              { id: 'averages', label: 'Averages' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab2(tab.id)}
                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${
                  activeTab2 === tab.id
                    ? 'bg-cyan-900/60 text-cyan-400 shadow-sm'
                    : 'text-graytxt'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Stats Content with Texture Pattern */}
          <div className="space-y-2">
            {statsData[activeTab2].map((stat, i) => (
              <div 
                key={i}
                className="relative rounded-lg px-3 py-3 flex items-center justify-between shadow-inner overflow-hidden" 
                style={{border: '1px solid rgba(8, 145, 178, 0.4)'}}
              >
                {/* Diagonal pattern background */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <pattern id={`diagonalHatch-v2-${activeTab2}-${i}`} patternUnits="userSpaceOnUse" width="4" height="4">
                      <path d="m0,4 l4,-4 M-1,1 l2,-2 M3,5 l2,-2" stroke="#6b7280" strokeWidth="0.6" opacity="0.4"/>
                    </pattern>
                    <linearGradient id={`iceBlueGradient-v2-${activeTab2}-${i}`} x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#083344" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#155e75" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#diagonalHatch-v2-${activeTab2}-${i})`} rx="8"/>
                  <rect width="100%" height="100%" fill={`url(#iceBlueGradient-v2-${activeTab2}-${i})`} rx="8"/>
                </svg>
                <span className="relative text-white font-medium text-sm">{stat.label}</span>
                <span className="relative text-cyan-400 font-bold text-sm">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Variation 3: Dot Indicators Below */}
      <div className="space-y-2">
        <div className="text-xs text-cyan-400 font-bold mb-2 uppercase tracking-wider">
          Variation 3: Dots Below (Swipe UI)
        </div>
        <div className="bg-card border border-border rounded-col px-5 pt-5 pb-5">
          <h2 className="text-white text-base font-bold mb-4">Performance Stats</h2>
          
          {/* Stats Content with Texture Pattern */}
          <div className="space-y-2 mb-3">
            {statsData[activeTab3].map((stat, i) => (
              <div 
                key={i}
                className="relative rounded-lg px-3 py-3 flex items-center justify-between shadow-inner overflow-hidden" 
                style={{border: '1px solid rgba(8, 145, 178, 0.4)'}}
              >
                {/* Diagonal pattern background */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <pattern id={`diagonalHatch-v3-${activeTab3}-${i}`} patternUnits="userSpaceOnUse" width="4" height="4">
                      <path d="m0,4 l4,-4 M-1,1 l2,-2 M3,5 l2,-2" stroke="#6b7280" strokeWidth="0.6" opacity="0.4"/>
                    </pattern>
                    <linearGradient id={`iceBlueGradient-v3-${activeTab3}-${i}`} x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#083344" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#155e75" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#diagonalHatch-v3-${activeTab3}-${i})`} rx="8"/>
                  <rect width="100%" height="100%" fill={`url(#iceBlueGradient-v3-${activeTab3}-${i})`} rx="8"/>
                </svg>
                <span className="relative text-white font-medium text-sm">{stat.label}</span>
                <span className="relative text-cyan-400 font-bold text-sm">{stat.value}</span>
              </div>
            ))}
          </div>
          
          {/* Dot Indicators + Category Label */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'records', label: 'Records' },
                { id: 'totals', label: 'Totals' },
                { id: 'averages', label: 'Averages' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab3(tab.id)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeTab3 === tab.id
                      ? 'bg-cyan-400 w-6'
                      : 'bg-border/60'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs text-graytxt font-medium uppercase tracking-wide">
              {activeTab3 === 'records' ? 'Records' : activeTab3 === 'totals' ? 'Totals' : 'Averages'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsTestingPage;
