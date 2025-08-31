import { useState, useEffect, useRef } from 'react';

// TimerCard component for climbing training intervals
// Follows existing dashboard card pattern with expandable design

const TimerCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('work'); // 'work' or 'rest'
  const [currentRound, setCurrentRound] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState(null); // Track when timer started for persistence
  const [isCompleted, setIsCompleted] = useState(false); // Track if workout is completed
  
  // Timer settings
  const [workTime, setWorkTime] = useState(10); // seconds
  const [restTime, setRestTime] = useState(50); // seconds
  const [totalRounds, setTotalRounds] = useState(3);
  const [workTimeUnit, setWorkTimeUnit] = useState('seconds');
  const [restTimeUnit, setRestTimeUnit] = useState('seconds');
  
  const intervalRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  
  // Storage key for persistence
  const TIMER_STORAGE_KEY = 'pogotimerstate';
  
  // Save timer state to localStorage
  const saveTimerState = (state) => {
    try {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({
        ...state,
        lastUpdate: Date.now()
      }));
    } catch (e) {
      console.warn('Failed to save timer state:', e);
    }
  };

  // Load timer state from localStorage
  const loadTimerState = () => {
    try {
      const saved = localStorage.getItem(TIMER_STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        // If timer was running, calculate elapsed time since last update
        if (state.isRunning && state.lastUpdate) {
          const elapsed = Math.floor((Date.now() - state.lastUpdate) / 1000);
          const adjustedTime = Math.max(0, state.timeRemaining - elapsed);
          return { ...state, timeRemaining: adjustedTime };
        }
        return state;
      }
    } catch (e) {
      console.warn('Failed to load timer state:', e);
    }
    return null;
  };

  // Clear timer state from localStorage
  const clearTimerState = () => {
    try {
      localStorage.removeItem(TIMER_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear timer state:', e);
    }
  };

  // Load state on component mount
  useEffect(() => {
    const savedState = loadTimerState();
    if (savedState) {
      setIsRunning(savedState.isRunning || false);
      setCurrentPhase(savedState.currentPhase || 'work');
      setCurrentRound(savedState.currentRound || 1);
      setTimeRemaining(savedState.timeRemaining || 0);
      setWorkTime(savedState.workTime || 10);
      setRestTime(savedState.restTime || 50);
      setTotalRounds(savedState.totalRounds || 3);
      setWorkTimeUnit(savedState.workTimeUnit || 'seconds');
      setRestTimeUnit(savedState.restTimeUnit || 'seconds');
      setStartTime(savedState.startTime || null);
      setIsCompleted(savedState.isCompleted || false);
    }
  }, []);

  // Save state when timer state changes
  useEffect(() => {
    const state = {
      isRunning,
      currentPhase,
      currentRound,
      timeRemaining,
      workTime,
      restTime,
      totalRounds,
      workTimeUnit,
      restTimeUnit,
      startTime,
      isCompleted
    };
    
    // Only save if timer is running or has been configured
    if (isRunning || timeRemaining > 0 || workTime !== 10 || restTime !== 50 || totalRounds !== 3) {
      saveTimerState(state);
    } else {
      clearTimerState();
    }
  }, [isRunning, currentPhase, currentRound, timeRemaining, workTime, restTime, totalRounds, workTimeUnit, restTimeUnit, startTime, isCompleted]);

  // Handle visibility changes (app backgrounding)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App going to background - save current time
        lastUpdateRef.current = Date.now();
      } else {
        // App coming to foreground - adjust timer if running
        if (isRunning && timeRemaining > 0) {
          const elapsed = Math.floor((Date.now() - lastUpdateRef.current) / 1000);
          setTimeRemaining(prev => Math.max(0, prev - elapsed));
        }
        lastUpdateRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, timeRemaining]);
  
  // Preset configurations
  const presets = [
    {
      name: 'Max Hangs',
      work: 10,
      rest: 50,
      rounds: 3,
      workUnit: 'seconds',
      restUnit: 'seconds'
    },
    {
      name: 'Power Endurance',
      work: 7,
      rest: 3,
      rounds: 6,
      workUnit: 'seconds',
      restUnit: 'seconds'
    },
    {
      name: 'Density Hangs',
      work: 20,
      rest: 40,
      rounds: 4,
      workUnit: 'seconds',
      restUnit: 'seconds'
    }
  ];

  // Convert time to seconds based on unit
  const convertToSeconds = (time, unit) => {
    return unit === 'minutes' ? time * 60 : time;
  };

  // Convert seconds back to display format
  const convertFromSeconds = (seconds, unit) => {
    return unit === 'minutes' ? Math.round(seconds / 60) : seconds;
  };

  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current protocol summary
  const getProtocolSummary = () => {
    const workSeconds = convertToSeconds(workTime, workTimeUnit);
    const restSeconds = convertToSeconds(restTime, restTimeUnit);
    return `Work: ${workSeconds}s Rest: ${restSeconds}s • ${totalRounds} Rounds`;
  };

  // Apply preset configuration
  const applyPreset = (preset) => {
    setWorkTime(preset.work);
    setRestTime(preset.rest);
    setTotalRounds(preset.rounds);
    setWorkTimeUnit(preset.workUnit);
    setRestTimeUnit(preset.restUnit);
    resetTimer();
  };

  // Start timer
  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      setStartTime(Date.now());
      setIsCompleted(false);
      const workSeconds = convertToSeconds(workTime, workTimeUnit);
      if (timeRemaining === 0 || isCompleted) {
        setTimeRemaining(workSeconds);
        setCurrentPhase('work');
        setCurrentRound(1);
      }
    }
  };

  // Stop timer
  const stopTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setCurrentPhase('work');
    setCurrentRound(1);
    setTimeRemaining(0);
    setStartTime(null);
    setIsCompleted(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    clearTimerState();
  };

  // Timer logic effect
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Phase complete
            if (currentPhase === 'work') {
              // Switch to rest
              setCurrentPhase('rest');
              const restSeconds = convertToSeconds(restTime, restTimeUnit);
              return restSeconds;
            } else {
              // Rest complete, check if more rounds
              if (currentRound < totalRounds) {
                setCurrentRound(prev => prev + 1);
                setCurrentPhase('work');
                const workSeconds = convertToSeconds(workTime, workTimeUnit);
                return workSeconds;
              } else {
                // All rounds complete
                setIsRunning(false);
                setCurrentPhase('work');
                setCurrentRound(1);
                setIsCompleted(true);
                return 0;
              }
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining, currentPhase, currentRound, workTime, restTime, totalRounds, workTimeUnit, restTimeUnit]);

  // Get phase color
  const getPhaseColor = () => {
    if (!isRunning && timeRemaining === 0) return 'text-graytxt';
    return currentPhase === 'work' ? 'text-green' : 'text-blue';
  };

  // Get phase background
  const getPhaseBackground = () => {
    if (!isRunning && timeRemaining === 0) return 'bg-border';
    return currentPhase === 'work' ? 'bg-green' : 'bg-blue';
  };

  return (
    <section className="px-5 pt-4">
      <div className="bg-card border border-border rounded-col p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-base">Training Timer</h3>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalRounds }, (_, index) => {
              const roundNumber = index + 1;
              // Mark round as completed when work phase ends (not when rest ends)
              const isRoundCompleted = isCompleted || 
                roundNumber < currentRound || 
                (roundNumber === currentRound && currentPhase === 'rest');
              
              return (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    isRoundCompleted ? 'bg-green' : 'bg-border'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Timer Display */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className={`text-4xl font-extrabold leading-none ${getPhaseColor()}`}>
            {timeRemaining > 0 ? formatTime(timeRemaining) : '--:--'}
          </div>
          <div className="flex items-center gap-2">
            {/* Reset button - only show when timer is stopped and has been used */}
            {!isRunning && (timeRemaining > 0 || isCompleted) && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  resetTimer();
                }}
                className="w-11 h-11 rounded-lg bg-border hover:bg-border/70 text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition"
                aria-label="Reset timer"
              >
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M3 21v-5h5"/>
                </svg>
              </button>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                isRunning ? stopTimer() : startTimer();
              }}
              className={`px-6 py-2 rounded-lg font-semibold hover:opacity-90 active:scale-95 transition min-h-[44px] ${
                isRunning 
                  ? 'bg-red text-white' 
                  : 'bg-white text-black'
              }`}
            >
              {isRunning ? 'Stop' : 'Start'}
            </button>
          </div>
        </div>





        {/* Expandable section */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-4" onClick={(e) => e.stopPropagation()}>
            
            {/* Preset Buttons */}
            <div className="space-y-3">
              <div className="text-sm font-semibold text-white">Presets</div>
              <div className="grid grid-cols-1 gap-2">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => applyPreset(preset)}
                    className="p-3 bg-border/50 hover:bg-border border border-border/50 rounded-lg text-left transition"
                  >
                    <div className="font-medium text-white text-sm">{preset.name}</div>
                    <div className="text-sm text-graytxt">
                      Work: {preset.work}s Rest: {preset.rest}s • {preset.rounds} Rounds
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Settings */}
            <div className="space-y-3">
              <div className="text-sm font-semibold text-white">Custom Settings</div>
              
              {/* Work Time */}
              <div className="space-y-2">
                <label className="text-sm text-white">Work Time</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={workTime}
                    onChange={(e) => setWorkTime(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 px-3 py-2 bg-border text-white rounded-lg border border-border/50 focus:border-white/30 outline-none"
                    min="1"
                  />
                  <select
                    value={workTimeUnit}
                    onChange={(e) => setWorkTimeUnit(e.target.value)}
                    className="px-3 py-2 bg-border text-white rounded-lg border border-border/50 focus:border-white/30 outline-none"
                  >
                    <option value="seconds">Seconds</option>
                    <option value="minutes">Minutes</option>
                  </select>
                </div>
              </div>

              {/* Rest Time */}
              <div className="space-y-2">
                <label className="text-sm text-white">Rest Time</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={restTime}
                    onChange={(e) => setRestTime(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 px-3 py-2 bg-border text-white rounded-lg border border-border/50 focus:border-white/30 outline-none"
                    min="1"
                  />
                  <select
                    value={restTimeUnit}
                    onChange={(e) => setRestTimeUnit(e.target.value)}
                    className="px-3 py-2 bg-border text-white rounded-lg border border-border/50 focus:border-white/30 outline-none"
                  >
                    <option value="seconds">Seconds</option>
                    <option value="minutes">Minutes</option>
                  </select>
                </div>
              </div>

              {/* Rounds */}
              <div className="space-y-2">
                <label className="text-sm text-white">Number of Rounds</label>
                <input
                  type="number"
                  value={totalRounds}
                  onChange={(e) => setTotalRounds(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-border text-white rounded-lg border border-border/50 focus:border-white/30 outline-none"
                  min="1"
                />
              </div>
            </div>

            {/* Control Buttons - Expanded State */}
            <div className="flex gap-2">
              <button 
                onClick={isRunning ? stopTimer : startTimer}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold hover:opacity-90 active:scale-95 transition min-h-[44px] ${
                  isRunning 
                    ? 'bg-red text-white' 
                    : 'bg-white text-black'
                }`}
              >
                {isRunning ? 'Stop' : 'Start'}
              </button>
              <button 
                onClick={resetTimer}
                className="flex-1 px-4 py-2 bg-border hover:bg-border/70 text-white rounded-lg font-semibold hover:opacity-90 active:scale-95 transition min-h-[44px]"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Bottom status with dropdown toggle */}
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm">
            {isCompleted ? (
              <span className="text-green">Workout completed! Great job!</span>
            ) : (
              <span>
                <span className={`${isRunning && currentPhase === 'work' ? 'text-green font-semibold' : 'text-graytxt'}`}>
                  Work: {convertToSeconds(workTime, workTimeUnit)}s
                </span>
                <span className="text-graytxt"> • </span>
                <span className={`${isRunning && currentPhase === 'rest' ? 'text-blue font-semibold' : 'text-graytxt'}`}>
                  Rest: {convertToSeconds(restTime, restTimeUnit)}s
                </span>
                <span className="text-graytxt"> • {totalRounds} Rounds</span>
              </span>
            )}
          </div>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={`transition-transform duration-200 text-graytxt ${isExpanded ? 'rotate-180' : ''}`}
          >
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default TimerCard;
