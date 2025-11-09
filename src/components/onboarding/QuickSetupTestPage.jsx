import { useState } from 'react';
import '../../styles/tracker-animations.css';

// Quick Setup Testing Page - Mimics tracker form button style and interactions
// Uses same button animations, large submit button, and clean layout

const QuickSetupTestPage = () => {
  const [flashGrade, setFlashGrade] = useState(null);
  const [typicalVolume, setTypicalVolume] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const grades = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15'];
  const canSubmit = !!flashGrade && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(r => setTimeout(r, 2000));
    
    setIsSubmitting(false);
    alert('Submitted! (This is just a test page)');
  };

  // Exact copy of BaseTrackerButton from tracker - ensures animation works
  const GradeButton = ({ grade, selected, onClick }) => (
    <button
      onClick={onClick}
      className={`h-10 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-95 relative overflow-hidden ${
        selected
          ? 'bg-white text-white'
          : 'bg-white text-black hover:bg-gray-50'
      }`}
    >
      <span className="relative z-10">{grade}</span>
      <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${
        selected 
          ? 'bg-black scale-100' 
          : 'bg-black scale-0'
      }`} style={{
        transformOrigin: 'center',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}></div>
    </button>
  );

  return (
    <div className="w-full min-h-screen overflow-y-auto hide-scrollbar relative" style={{ backgroundColor: '#EBEDEE' }}>
      {/* Success Animation Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: '#EBEDEE' }}>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              {/* Animated circle background */}
              <div 
                className="absolute inset-0 bg-black rounded-full transition-all duration-500 ease-out"
                style={{
                  transform: isSubmitting ? 'scale(1)' : 'scale(0)',
                  animation: isSubmitting ? 'pulse-once 0.6s ease-out' : 'none'
                }}
              ></div>
              
              {/* Checkmark */}
              <svg 
                width="80" 
                height="80" 
                viewBox="0 0 24 24" 
                fill="none" 
                className="relative z-10"
                style={{
                  animation: isSubmitting ? 'checkmark-draw 0.8s ease-out 0.3s both' : 'none'
                }}
              >
                <path 
                  d="M9 12l2 2 4-4" 
                  stroke="white" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: '12',
                    strokeDashoffset: isSubmitting ? '0' : '12',
                    transition: 'stroke-dashoffset 0.8s ease-out 0.3s'
                  }}
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">Calibrating Your Dashboard...</h2>
            <p className="text-gray-600">Setting up your personalized experience</p>
          </div>
        </div>
      )}

      {/* Skip button - top right */}
      <div className="absolute top-6 right-6 z-10">
        <button 
          className="text-gray-600 hover:text-black text-sm font-semibold transition-colors px-4 py-2"
          disabled={isSubmitting}
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-20 pb-32 space-y-4 max-w-2xl mx-auto">
        {/* Title - Left Aligned */}
        <div className="mb-6">
          <h1 
            className="text-2xl text-black mb-2"
            style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, letterSpacing: '0.02em' }}
          >
            WELCOME
          </h1>
          <p className="text-gray-600 text-sm">
            Enter your stats to get started.
          </p>
        </div>

        {/* Flash Grade Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-black tracking-wide">
            CURRENT FLASH GRADE
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {grades.map(grade => (
              <GradeButton
                key={grade}
                grade={grade}
                selected={flashGrade === grade}
                onClick={() => setFlashGrade(grade)}
              />
            ))}
          </div>
        </div>

        {/* Volume Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-black tracking-wide">
            CLIMBS PER SESSION
          </h3>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 text-sm font-medium">Volume</span>
              <span className="text-3xl font-black text-black">{typicalVolume}</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={typicalVolume}
              onChange={(e) => setTypicalVolume(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black slider-black"
              style={{
                background: `linear-gradient(to right, black 0%, black ${((typicalVolume - 5) / 45) * 100}%, #e5e7eb ${((typicalVolume - 5) / 45) * 100}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-600 font-medium mt-2">
              <span>5</span>
              <span>25</span>
              <span>50</span>
            </div>
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-gray-500 text-[11px] text-center px-4 pt-2">
          This helps us provide personalized training recommendations from day one
        </p>
      </div>

      {/* Large Submit Button - Fixed at bottom (tracker style) */}
      <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center z-50" style={{ background: 'linear-gradient(to top, #EBEDEE 60%, #EBEDEE, transparent)' }}>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-64 h-16 rounded-full font-bold text-lg transition-all duration-300 transform ${
            canSubmit
              ? 'bg-black text-white shadow-2xl shadow-black/30 hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          style={{
            boxShadow: canSubmit 
              ? '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)' 
              : '0 8px 16px rgba(0, 0, 0, 0.05)'
          }}
        >
          {isSubmitting ? "✓ ALL SET" : "GET STARTED"}
        </button>
      </div>

      {/* Spacer for bottom button + nav in testing environment */}
      <div className="h-32"></div>
    </div>
  );
};

export default QuickSetupTestPage;

