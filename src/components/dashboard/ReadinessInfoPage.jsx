import { readinessTextColor, readinessGradient } from '../../utils/index.js';
import Header from '../ui/Header.jsx';

// Readiness Score info page - Daily readiness assessment
// Provides detailed explanation of micro (daily) readiness scoring

const ReadinessInfoPage = ({ 
  score = 77, 
  onBack 
}) => {
  return (
    <div className="w-full h-screen overflow-y-auto hide-scrollbar relative bg-bg">
      <div 
        className="flex items-center justify-between p-5"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1.25rem)' }}
      >
        <div className="w-10"></div> {/* Spacer for centering */}
        <h1 className="text-sm font-bold text-white tracking-wider flex-1 text-center" style={{ fontFamily: 'Oswald, sans-serif' }}>
          CLIMBER READINESS SCORE
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
            Your daily readiness score that indicates your body's capacity for high-intensity climbing today.
          </div>
        </div>

        {/* 2. Big metric section */}
        <div className="border border-border/30 rounded-lg p-6">
          <div className="flex flex-col items-center">
            <div className={`text-6xl font-extrabold leading-none ${readinessTextColor(score)} mb-4`}>{score}%</div>
            <div className="w-full max-w-xs">
              <div className="h-3 bg-border rounded-full overflow-hidden">
                <div className={`bg-gradient-to-r ${readinessGradient(score)} h-full transition-all duration-1000`} style={{width: `${score}%`}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. How it works section */}
        <div className="border border-border/30 rounded-lg p-6">
          <div className="text-white font-bold mb-3 text-sm">How it works</div>
          <div className="text-graytxt text-base leading-relaxed">
            Analyzes your recent training load and recovery time to calculate daily readiness. Higher scores indicate you can safely push harder, while lower scores suggest focusing on technique or recovery.
          </div>
        </div>

        {/* 4. Ranges section */}
        <div className="border border-border/30 rounded-lg p-6">
          <div className="text-white font-bold mb-4 text-sm">Readiness Ranges</div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-green font-medium">77-100%</span>
              <span className="text-graytxt">Optimal - Push your limits</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue font-medium">45-76%</span>
              <span className="text-graytxt">Moderate - Train smart</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-red font-medium">0-44%</span>
              <span className="text-graytxt">Low - Focus on recovery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadinessInfoPage;
