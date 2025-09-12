import { loadColor } from '../../utils/index.js';
import Header from '../ui/Header.jsx';

// Load Ratio info page - Weekly training load assessment
// Provides detailed explanation of macro (weekly) load ratio scoring

const LoadRatioInfoPage = ({ 
  loadRatio = 1.0, 
  onBack 
}) => {
  return (
    <div className="w-full h-screen overflow-y-auto hide-scrollbar relative bg-bg">
      <div className="flex items-center justify-between p-5">
        <div className="w-10"></div> {/* Spacer for centering */}
        <h1 className="text-sm font-bold text-white tracking-wider flex-1 text-center" style={{ fontFamily: 'Oswald, sans-serif' }}>
          LOAD RATIO
        </h1>
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors w-10 flex justify-center"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      {/* Main content */}
      <div className="px-8 py-4 pb-20 space-y-8">
        {/* 1. What it is section */}
        <div className="border border-border/30 rounded-lg p-6">
          <div className="text-white font-bold mb-3 text-sm">What it is</div>
          <div className="text-graytxt text-base leading-relaxed">
            Your weekly training load fluctuation that compares recent volume to your typical training pattern.
          </div>
        </div>

        {/* 2. Big metric section */}
        <div className="border border-border/30 rounded-lg p-6">
          <div className="flex flex-col items-center">
            <div className={`text-7xl font-extrabold ${loadColor(loadRatio)} mb-6 text-center`}>
              {loadRatio.toFixed(1)}x
            </div>
            
            {/* Visual indicator bar */}
            <div className="relative w-64 h-4 bg-border rounded-full overflow-hidden mb-2">
              {/* Center baseline marker (1.0x) */}
              <div className="absolute top-0 left-1/2 w-1 h-full bg-white transform -translate-x-0.5 z-10"></div>
              {/* Load ratio indicator bar */}
              <div 
                className={`absolute top-0 h-full ${loadColor(loadRatio) === 'text-green' ? 'bg-green' : 'bg-red'} transition-all duration-300`}
                style={{
                  left: loadRatio <= 1.0 ? `${50 - (1.0 - loadRatio) * 25}%` : '50%',
                  width: loadRatio <= 1.0 
                    ? `${(1.0 - loadRatio) * 25}%`
                    : `${Math.min(50, (loadRatio - 1.0) * 25)}%`
                }}
              ></div>
            </div>
            
            {/* Scale labels */}
            <div className="flex justify-between text-xs text-graytxt w-64">
              <span>0.5x</span>
              <span className="text-white font-medium">1.0x</span>
              <span>1.5x</span>
            </div>
          </div>
        </div>

        {/* 3. How it works section */}
        <div className="border border-border/30 rounded-lg p-6">
          <div className="text-white font-bold mb-3 text-sm">How it works</div>
          <div className="text-graytxt text-base leading-relaxed">
            Compares your recent 7-day training volume to your 28-day average baseline. Values above 1.3x indicate potential overtraining, while values below 0.8x suggest you can safely increase volume.
          </div>
        </div>

        {/* 4. Ranges section */}
        <div className="border border-border/30 rounded-lg p-6">
          <div className="text-white font-bold mb-4 text-sm">Load Ratio Ranges</div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-red font-medium">&lt;0.8x</span>
              <span className="text-graytxt">Low - Can increase volume</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green font-medium">0.8-1.3x</span>
              <span className="text-graytxt">Optimal - Balanced training</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-red font-medium">&gt;1.3x</span>
              <span className="text-graytxt">High - Overtraining risk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadRatioInfoPage;
