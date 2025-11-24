import { loadColor } from '../../utils/index.js';
import Header from '../ui/Header.jsx';

// Load Ratio info page - Weekly training load assessment
// Provides detailed explanation of macro (weekly) load ratio scoring

const LoadRatioInfoPage = ({ 
  loadRatio = 1.0,
  loadRatioData = null, // Full load ratio object with frequency, confidence, etc.
  onBack 
}) => {
  // Extract additional context if available
  const frequency = loadRatioData?.frequency || null;
  const confidence = loadRatioData?.confidence || 'establishing';
  return (
    <div className="w-full h-screen overflow-y-auto hide-scrollbar relative bg-bg">
      <div 
        className="flex items-center justify-between p-5"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1.25rem)' }}
      >
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
        {/* 1. What it is & How it works - Combined */}
        <div className="border border-border/30 rounded-lg p-6">
          <div className="text-white font-bold mb-3 text-sm">What it is</div>
          <div className="text-graytxt text-sm leading-relaxed mb-4">
            Your weekly training load fluctuation that compares recent volume to your typical training pattern.
          </div>
          
          <div className="text-white font-bold mb-3 text-sm">How it works</div>
          <div className="text-graytxt text-sm leading-relaxed">
            Compares your recent 7-day training volume to your 28-day average baseline. Values above 1.3x indicate potential overtraining, while values below 0.8x suggest you can safely increase volume.
          </div>
        </div>

        {/* 2. Big metric section & Ranges - Combined */}
        <div className="border border-border/30 rounded-lg p-6">
          <div className="flex flex-col items-center mb-6">
            <div className={`text-7xl font-extrabold ${loadColor(loadRatio)} mb-6 text-center`}>
              {loadRatio.toFixed(1)}x
            </div>
            
            {/* Visual indicator bar */}
            <div className="relative w-64 h-4 bg-border rounded-full overflow-hidden mb-2">
              {/* Center baseline marker (1.0x) */}
              <div className="absolute top-0 left-1/2 w-1 h-full bg-white transform -translate-x-0.5 z-10"></div>
              {/* Load ratio indicator bar */}
              <div 
                className={`absolute top-0 h-full ${loadColor(loadRatio) === 'text-cyan-400' ? 'bg-cyan-400' : 'bg-red'} transition-all duration-300`}
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

          <div className="text-white font-bold mb-4 text-sm">Load Ratio Ranges</div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-red font-medium">&lt;0.8x</span>
              <span className="text-graytxt">Low - Can increase volume</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-400 font-medium">0.8-1.3x</span>
              <span className="text-graytxt">Optimal - Balanced training</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-red font-medium">&gt;1.3x</span>
              <span className="text-graytxt">High - Overtraining risk</span>
            </div>
          </div>
        </div>

        {/* 3. Your Training Pattern - NEW */}
        {frequency && (
          <div className="border border-border/30 rounded-lg p-6">
            <div className="text-white font-bold mb-4 text-sm">Your Training Pattern</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-graytxt">Typical Frequency</span>
                <span className="text-white font-medium">{frequency} sessions/week</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-graytxt">Confidence Level</span>
                <span className={`font-medium ${
                  confidence === 'high' ? 'text-green' : 
                  confidence === 'establishing' ? 'text-yellow' : 'text-graytxt'
                }`}>
                  {confidence === 'high' ? 'High' : confidence === 'establishing' ? 'Building' : 'Low'}
                </span>
              </div>
            </div>
            <div className="mt-4 text-xs text-graytxt leading-relaxed">
              Your load ratio is normalized for your training frequency. 
              {frequency < 2 ? ' Light climbers need different baselines than frequent climbers.' :
               frequency < 3 ? ' Weekend warriors have patterns recognized by the system.' :
               frequency < 4 ? ' Regular training pattern detected and accounted for.' :
               ' High frequency training pattern detected and accounted for.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadRatioInfoPage;
