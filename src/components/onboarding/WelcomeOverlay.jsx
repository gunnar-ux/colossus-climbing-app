import { useState } from 'react';
import ThisWeekContent from '../dashboard/ThisWeekContent.jsx';
import SessionCard from '../sessions/SessionCard.jsx';

// WelcomeOverlay component extracted from onboarding HTML  
// Preserves exact dark theme styling and button-only navigation

const WelcomeOverlay = ({ onDismiss }) => {
  const [currentStep, setCurrentStep] = useState(0);


  const steps = [
    {
      title: "Welcome to Colossus",
      subtitle: "Your complete climbing analytics platform",
      content: (
        <div className="text-center">
          <p className="text-white/80 mb-6 leading-relaxed">Track your sessions to unlock powerful insights and training recommendations</p>
          <div className="bg-card border border-border rounded-col p-4">
            <div className="text-white font-semibold mb-3 text-center">What you'll unlock:</div>
            <div className="space-y-3 text-sm text-white/70 text-left">
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-green flex-shrink-0">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div><span className="text-white">Climb Readiness Score</span> - Know when to push hard</div>
              </div>
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-green flex-shrink-0">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div><span className="text-white">Smart Training Plans</span> - Personalized recommendations</div>
              </div>
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-green flex-shrink-0">
                  <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 9l1.5-1.5L14 11l5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div><span className="text-white">Progress Tracking</span> - See your improvement over time</div>
              </div>
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-green flex-shrink-0">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 22h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 14.66V17a2 2 0 0 0 4 0v-2.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div><span className="text-white">Achievement System</span> - Gamified motivation</div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-white font-semibold mb-3 text-center">Feature Unlock Timeline:</div>
                <div className="space-y-2 text-xs text-white/60">
                  <div className="flex justify-between">
                    <span>Load Tracking</span>
                    <span className="text-blue">1 session</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Progress & Session History</span>
                    <span className="text-blue">1 session</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Climb Readiness Score</span>
                    <span className="text-blue">3 sessions</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Load Management</span>
                    <span className="text-blue">3 sessions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Climb Readiness Score",
      subtitle: "Readiness metrics to reduce overtraining",
      content: (
        <div className="text-center">
          <div className="text-sm text-white/80 mb-2">
            <span className="text-blue font-semibold">3 sessions</span> to unlock • <span className="text-blue font-semibold">5 sessions</span> to calibrate
          </div>
          
          <div className="bg-card border border-white/10 rounded-col p-4 mb-3 mx-auto max-w-sm shadow-lg shadow-black/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Climb Readiness Score</h3>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-white/15 text-xs text-white/90">
                <span className="text-white/70">Load</span>
                <span className="font-semibold text-green">1.2x</span>
                <span className="text-white/70">baseline</span>
              </span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-5xl font-extrabold text-green">82</div>
              <div className="flex-1 h-3 bg-border rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-green/80 to-green h-full" style={{width: '82%'}}></div>
              </div>
            </div>
            <div className="text-sm text-white/70 text-center">Optimal. Peak performance ready.</div>
          </div>

          <div className="space-y-3">
            <div className="text-center p-3">
              <div className="font-semibold text-white mb-3">Climb Readiness Score</div>
              
              <div className="relative">
                <div className="h-3 bg-gradient-to-r from-red via-blue to-green rounded-full"></div>
                <div className="flex justify-between text-xs text-white/70 mt-2">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>Rest</span>
                  <span>Moderate</span>
                  <span>Primed</span>
                </div>
                <div className="absolute top-0 w-0.5 h-3 bg-white rounded-full" style={{left: '82%', transform: 'translateX(-50%)'}}></div>
              </div>
            </div>
            
            <div className="text-center p-4">
              <div className="font-semibold text-white mb-3">Load Baseline</div>
              
              <div className="relative">
                <div className="h-3 bg-gradient-to-r from-red via-green via-green to-red rounded-full"></div>
                <div className="flex justify-between text-xs text-white/70 mt-2">
                  <span>0.5x</span>
                  <span>1.0x</span>
                  <span>2.0x</span>
                </div>
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>Undertrain</span>
                  <span>Optimal</span>
                  <span>Overtrain</span>
                </div>
                <div className="absolute top-0 w-0.5 h-3 bg-white rounded-full" style={{left: '35%', transform: 'translateX(-50%)'}}></div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Recommended Training",
      subtitle: "AI-powered load management",
      content: (
        <div className="text-center">
          <div className="text-sm text-white/80 mb-3">
            <span className="text-blue font-semibold">1 session</span> to unlock • <span className="text-blue font-semibold">5 sessions</span> to calibrate
          </div>
          
          <div className="bg-card border border-border rounded-col p-4 mb-4 mx-auto max-w-sm hover:border-white/10 transition text-left">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Recommended Training</div>
                <div className="text-sm text-graytxt">Power • Volume: 15-20 • RPE: 8</div>
              </div>
              <button className="ml-3 px-4 py-2 bg-white text-black rounded-lg font-semibold hover:opacity-90 active:scale-95 transition min-h-[44px]">Start</button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="text-left text-sm text-white/80 space-y-3 max-w-sm">
              <p className="text-center text-white/90 font-medium mb-4">Smart training adapted to your readiness</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/60 flex-shrink-0">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span><span className="text-white font-semibold">Training Type:</span> Power, Endurance, or Technical focus</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/60 flex-shrink-0">
                    <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span><span className="text-white font-semibold">Volume:</span> Suggested number of climbs</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/60 flex-shrink-0">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 1v6m0 6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12h-6m-6 0H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span><span className="text-white font-semibold">Intensity:</span> Target RPE range</span>
                </div>
              </div>
              <div className="text-center text-xs text-white/60 mt-4 pt-3 border-t border-border/50">
                Recommendations get smarter as you track more sessions
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "This Week Analytics",
      subtitle: "Track your weekly patterns",
      content: (
        <div className="text-center">
          <div className="text-sm text-white/80 mb-3">
            <span className="text-blue font-semibold">3 sessions</span> to unlock • <span className="text-blue font-semibold">2+ weeks</span> for trends
          </div>
          
          <div className="mx-auto max-w-sm shadow-lg shadow-black/30 rounded-col overflow-hidden">
            <div className="bg-card border border-border rounded-col p-4 hover:border-white/10 transition">
              <ThisWeekContent />
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <div className="text-left text-sm text-white/80 space-y-3 px-8">
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue/10 border border-blue/20 rounded-lg text-blue text-xs font-medium">
                  <span>⤴</span>
                  click card to expand
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/60 flex-shrink-0">
                    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M8 10h8M8 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span><span className="text-white font-semibold">Volume Chart:</span> Daily climb counts & patterns</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/60 flex-shrink-0">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.12 0 4.07.74 5.61 1.98" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span><span className="text-white font-semibold">Grade & Style Distribution:</span> Expand to see detailed breakdowns</span>
                </div>
              </div>
              <div className="text-center text-xs text-white/60 mt-4 pt-3 border-t border-border/50">
                Spot training patterns and optimize your weekly routine
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Progress",
      subtitle: "Celebrate your climbing journey",
      content: (
        <div className="text-center">
          <div className="text-sm text-white/80 mb-3">
            <span className="text-blue font-semibold">1 session</span> to unlock • <span className="text-blue font-semibold">30+ climbs</span> for rich data
          </div>
          
          <div className="bg-card border border-white/10 rounded-col p-5 mb-4 mx-auto max-w-sm shadow-lg shadow-black/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Progress & Achievement</h3>
              <span className="text-xs text-white/70">see all →</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-5xl font-extrabold text-white">12</div>
              <div className="flex-1">
                <div className="text-xs text-white/70 mb-1">Level</div>
                <div className="h-3 bg-border rounded-full">
                  <div className="h-full bg-white w-4/5"></div>
                </div>
                <div className="mt-1 text-xs text-white/70">153 points to Level 13</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-white/70">Total Sends</div>
                <div className="text-sm font-semibold text-white">1,091</div>
              </div>
              <div>
                <div className="text-white/70">Peak Grade</div>
                <div className="text-sm font-semibold text-white">V7</div>
              </div>
              <div>
                <div className="text-white/70">Sessions</div>
                <div className="text-sm font-semibold text-white">147</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="text-left text-sm text-white/80 space-y-3 max-w-sm">
              <p className="text-center text-white/90 font-medium mb-4">Level up and unlock achievements</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/60 flex-shrink-0">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span><span className="text-white font-semibold">Leveling System:</span> Earn XP for every climb</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/60 flex-shrink-0">
                    <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 9l1.5-1.5L14 11l5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span><span className="text-white font-semibold">Grade Progression:</span> Track your improvement</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/60 flex-shrink-0">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 22h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 14.66V17a2 2 0 0 0 4 0v-2.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span><span className="text-white font-semibold">Milestone Badges:</span> Unlock achievements</span>
                </div>
              </div>
              <div className="text-center text-xs text-white/60 mt-4 pt-3 border-t border-border/50">
                Stay motivated with gamified progression tracking
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Session History",
      subtitle: "Detailed climb-by-climb analysis",
      content: (
        <div className="text-center">
          <div className="text-sm text-white/80 mb-3">
            <span className="text-blue font-semibold">1 session</span> to unlock • <span className="text-blue font-semibold">5+ sessions</span> for insights
          </div>
          
          <div className="mx-auto max-w-sm shadow-lg shadow-black/30 rounded-col overflow-hidden">
            <SessionCard session={{
              date: 'Today', duration: '1h 45m', climbs: 18, medianGrade: 'V4', style: 'Power', avgRPE: 6.8,
              styles: [ {label:'Power', val:40}, {label:'Technical', val:35}, {label:'Simple', val:25} ],
              angles: [ {label:'Overhang', val:60}, {label:'Vertical', val:30}, {label:'Slab', val:10} ],
              grades: [ {label:'V3', val:20}, {label:'V4', val:45}, {label:'V5', val:30}, {label:'V6', val:5} ],
              climbList: [
                {grade:'V4', angle:'Overhang', style:'Power', rpe:7, attempts:1},
                {grade:'V5', angle:'Overhang', style:'Power', rpe:8, attempts:2},
                {grade:'V3', angle:'Vertical', style:'Technical', rpe:6, attempts:1},
                {grade:'V4', angle:'Vertical', style:'Power', rpe:7, attempts:1},
                {grade:'V5', angle:'Overhang', style:'Power', rpe:8, attempts:3},
              ]
            }} />
          </div>

          <div className="flex justify-center mt-4">
            <div className="text-left text-sm text-white/80 space-y-3 px-8">
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue/10 border border-blue/20 rounded-lg text-blue text-xs font-medium">
                  <span>⤴</span>
                  click card to expand
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/60 flex-shrink-0">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.04 3.4l.06.06c.47.47 1.14.68 1.82.33.7-.36 1.08-1.09 1.08-1.85V2a2 2 0 0 1 4 0v.09c0 .76.38 1.49 1.08 1.85.68.35 1.35.14 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06-.06c-.47.47-.68 1.14-.33 1.82.36.7 1.09 1.08 1.85 1.08H21a2 2 0 0 1 0 4h-.09c-.76 0-1.49.38-1.85 1.08Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span><span className="text-white font-semibold">Auto-Analysis:</span> Grade & style breakdowns</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/60 flex-shrink-0">
                    <path d="M12 1v6m0 6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 12h4M3 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span><span className="text-white font-semibold">Individual Climbs:</span> Expand to see every attempt</span>
                </div>
              </div>
              <div className="text-center text-xs text-white/60 mt-4 pt-3 border-t border-border/50">
                Every climb becomes data to improve your training
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];



  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(s => s + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="min-h-screen flex flex-col max-w-[430px] mx-auto">
        {/* Header */}
        <div className="text-center px-6 pt-12 pb-8 flex-shrink-0">
          <h1 className="text-3xl font-bold mb-2">{steps[currentStep].title}</h1>
          <p className="text-graytxt text-lg">{steps[currentStep].subtitle}</p>
        </div>

        {/* Content Area - scrollable, takes available space */}
        <div className="flex-1 px-6 space-y-8 pb-28">
          {steps[currentStep].content}
        </div>

        {/* Fixed Navigation at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-6 bg-black max-w-[430px] mx-auto">
          {/* Step indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition ${
                  i === currentStep ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            {currentStep === 0 ? (
              <>
                <button 
                  onClick={() => setCurrentStep(1)}
                  className="w-full min-h-[52px] py-4 bg-white text-black rounded-col font-semibold hover:bg-gray-100 active:scale-[0.98] transition"
                >
                  Start Tour
                </button>
                <button 
                  onClick={onDismiss}
                  className="w-full min-h-[52px] py-4 bg-border text-white rounded-col font-semibold hover:bg-border/80 active:scale-[0.98] transition"
                >
                  Skip Tour
                </button>
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                <button 
                  onClick={onDismiss}
                  className="w-full min-h-[52px] py-4 bg-white text-black rounded-col font-semibold hover:bg-gray-100 active:scale-[0.98] transition"
                >
                  Get Started
                </button>
                <button 
                  onClick={prevStep}
                  className="w-full min-h-[52px] py-4 bg-border text-white rounded-col font-semibold hover:bg-border/80 active:scale-[0.98] transition"
                >
                  Previous
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={nextStep}
                  className="w-full min-h-[52px] py-4 bg-white text-black rounded-col font-semibold hover:bg-gray-100 active:scale-[0.98] transition"
                >
                  Next
                </button>
                <button 
                  onClick={prevStep}
                  className="w-full min-h-[52px] py-4 bg-border text-white rounded-col font-semibold hover:bg-border/80 active:scale-[0.98] transition"
                >
                  Previous
                </button>
              </>
            )}
          </div>
        </div>


      </div>
    </div>
  );
};

export default WelcomeOverlay;
