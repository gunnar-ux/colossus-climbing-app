import { useState, useEffect, useRef } from 'react';
import { ResetIcon, ChevronDownIcon } from '../ui/Icons.jsx';

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
  const [selectedPreset, setSelectedPreset] = useState(null); // Track selected preset for UI
  
  // Timer settings
  const [workTime, setWorkTime] = useState(''); // seconds
  const [restTime, setRestTime] = useState(''); // seconds
  const [totalRounds, setTotalRounds] = useState('');
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
      setWorkTime(savedState.workTime || '');
      setRestTime(savedState.restTime || '');
      setTotalRounds(savedState.totalRounds || '');
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
    if (isRunning || timeRemaining > 0 || workTime !== '' || restTime !== '' || totalRounds !== '') {
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
    },
    {
      name: 'Rest Between Climbs',
      work: 0,
      rest: 2,
      rounds: 1,
      workUnit: 'seconds',
      restUnit: 'minutes'
    }
  ];

  // Convert time to seconds based on unit
  const convertToSeconds = (time, unit) => {
    const numTime = parseInt(time) || 0;
    return unit === 'minutes' ? numTime * 60 : numTime;
  };

  // Check if this is rest-only mode (work time is 0)
  const isRestOnlyMode = workTime === 0 || workTime === '0';

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
    return `Work: ${workSeconds}s Rest: ${restSeconds}s • ${totalRounds || 0} Rounds`;
  };

  // Apply preset configuration
  const applyPreset = (preset) => {
    setWorkTime(preset.work);
    setRestTime(preset.rest);
    setTotalRounds(preset.rounds);
    setWorkTimeUnit(preset.workUnit);
    setRestTimeUnit(preset.restUnit);
    setSelectedPreset(preset.name); // Track selected preset
    
    // Auto-fill timer with first work period (or rest for rest-only mode)
    const isRestOnly = preset.work === 0;
    if (isRestOnly) {
      const restSeconds = convertToSeconds(preset.rest, preset.restUnit);
      setTimeRemaining(restSeconds);
      setCurrentPhase('rest');
    } else {
      const workSeconds = convertToSeconds(preset.work, preset.workUnit);
      setTimeRemaining(workSeconds);
      setCurrentPhase('work');
    }
    
    setCurrentRound(1);
    setIsRunning(false);
    setIsCompleted(false);
  };

  // Start timer
  const startTimer = () => {
    // Don't start if no preset is selected and no custom settings are configured
    const hasCustomSettings = workTime !== '' && restTime !== '' && totalRounds !== '';
    if (!selectedPreset && timeRemaining === 0 && !hasCustomSettings) {
      return; // Do nothing - no workout configured
    }
    
    if (!isRunning) {
      setIsRunning(true);
      setStartTime(Date.now());
      setIsCompleted(false);
      
      if (timeRemaining === 0 || isCompleted) {
        if (isRestOnlyMode) {
          // Rest-only mode: start with rest phase
          const restSeconds = convertToSeconds(restTime, restTimeUnit);
          setTimeRemaining(restSeconds);
          setCurrentPhase('rest');
          setCurrentRound(1);
        } else {
          // Normal mode: start with work phase
          const workSeconds = convertToSeconds(workTime, workTimeUnit);
          setTimeRemaining(workSeconds);
          setCurrentPhase('work');
          setCurrentRound(1);
        }
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
    setStartTime(null);
    setIsCompleted(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // If a preset is selected, restore to its initial state
    if (selectedPreset) {
      const preset = presets.find(p => p.name === selectedPreset);
      if (preset) {
        const isRestOnly = preset.work === 0;
        if (isRestOnly) {
          const restSeconds = convertToSeconds(preset.rest, preset.restUnit);
          setTimeRemaining(restSeconds);
          setCurrentPhase('rest');
        } else {
          const workSeconds = convertToSeconds(preset.work, preset.workUnit);
          setTimeRemaining(workSeconds);
          setCurrentPhase('work');
        }
        setCurrentRound(1);
      }
    } else {
      // No preset selected, clear everything
      setCurrentPhase('work');
      setCurrentRound(1);
      setTimeRemaining(0);
      setSelectedPreset(null); // Ensure no preset is selected
      clearTimerState();
    }
  };

  // Timer logic effect
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Phase complete
            if (isRestOnlyMode) {
              // Rest-only mode: auto-reset for next rest
              setIsRunning(false);
              setCurrentPhase('rest');
              setCurrentRound(1);
              setIsCompleted(false);
              const restSeconds = convertToSeconds(restTime, restTimeUnit);
              setTimeRemaining(restSeconds);
              return restSeconds;
            } else if (currentPhase === 'work') {
              // Switch to rest
              setCurrentPhase('rest');
              const restSeconds = convertToSeconds(restTime, restTimeUnit);
              return restSeconds;
            } else {
              // Rest complete, check if more rounds
              if (currentRound < (parseInt(totalRounds) || 1)) {
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
    // Only show green/blue when timer is actively running
    if (!isRunning) return 'text-white';
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
            {!isRestOnlyMode && Array.from({ length: parseInt(totalRounds) || 0 }, (_, index) => {
              const roundNumber = index + 1;
              // Only show green dots when timer is actively running and for completed/current rounds
              const isActiveOrCompleted = isRunning && timeRemaining > 0 && roundNumber <= currentRound;
              
              return (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    isActiveOrCompleted ? 'bg-green' : 'bg-border'
                  }`}
                />
              );
            })}
            {isRestOnlyMode && (
              <span className="text-sm text-graytxt">Rest Timer</span>
            )}
          </div>
        </div>

        {/* Timer Display */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className={`text-4xl font-extrabold leading-none ${getPhaseColor()}`}>
            {timeRemaining > 0 || selectedPreset ? formatTime(timeRemaining) : '--:--'}
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
                <ResetIcon className="w-[18px] h-[18px]" />
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





        {/* Bottom status with dropdown toggle */}
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm">
            {isCompleted ? (
              <span className="text-green">{isRestOnlyMode ? 'Rest complete!' : 'Workout completed! Great job!'}</span>
            ) : isRestOnlyMode ? (
              <span className={`${isRunning ? 'text-blue font-semibold' : 'text-graytxt'}`}>
                Rest: {convertToSeconds(restTime, restTimeUnit)}s
              </span>
            ) : selectedPreset || (workTime !== '' && restTime !== '' && totalRounds !== '') ? (
              <span>
                <span className={`${isRunning && currentPhase === 'work' ? 'text-green font-semibold' : 'text-graytxt'}`}>
                  Work: {convertToSeconds(workTime, workTimeUnit)}s
                </span>
                <span className="text-graytxt"> • </span>
                <span className={`${isRunning && currentPhase === 'rest' ? 'text-blue font-semibold' : 'text-graytxt'}`}>
                  Rest: {convertToSeconds(restTime, restTimeUnit)}s
                </span>
                <span className="text-graytxt"> • {totalRounds || 0} Rounds</span>
              </span>
            ) : (
              <span className="text-graytxt">
                Work: --s • Rest: --s • -- Rounds
              </span>
            )}
          </div>
          <ChevronDownIcon 
            className={`w-4 h-4 transition-transform duration-200 text-graytxt ${isExpanded ? 'rotate-180' : ''}`}
          />
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
                    className={`p-3 bg-border/50 hover:bg-border rounded-lg text-left transition ${
                      selectedPreset === preset.name 
                        ? 'border-2 border-white' 
                        : 'border border-border/50'
                    }`}
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
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty string or valid positive numbers
                      if (value === '' || (parseInt(value) > 0 && !isNaN(parseInt(value)))) {
                        setWorkTime(value);
                        setSelectedPreset(null); // Clear preset selection on manual change
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-border text-white rounded-lg border border-border/50 focus:border-white/30 outline-none"
                    min="1"
                    placeholder="0"
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
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty string or valid positive numbers
                      if (value === '' || (parseInt(value) > 0 && !isNaN(parseInt(value)))) {
                        setRestTime(value);
                        setSelectedPreset(null); // Clear preset selection on manual change
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-border text-white rounded-lg border border-border/50 focus:border-white/30 outline-none"
                    min="1"
                    placeholder="0"
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
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string or valid positive numbers
                    if (value === '' || (parseInt(value) > 0 && !isNaN(parseInt(value)))) {
                      setTotalRounds(value);
                      setSelectedPreset(null); // Clear preset selection on manual change
                    }
                  }}
                  className="w-full px-3 py-2 bg-border text-white rounded-lg border border-border/50 focus:border-white/30 outline-none"
                  min="1"
                  placeholder="0"
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
                onClick={() => {
                  // Clear everything to original --:-- state
                  setIsRunning(false);
                  setCurrentPhase('work');
                  setCurrentRound(1);
                  setTimeRemaining(0);
                  setStartTime(null);
                  setIsCompleted(false);
                  setSelectedPreset(null);
                  // Reset custom settings to empty/default values
                  setWorkTime('');
                  setRestTime('');
                  setTotalRounds('');
                  setWorkTimeUnit('seconds');
                  setRestTimeUnit('seconds');
                  if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                  }
                  clearTimerState();
                }}
                className="flex-1 px-4 py-2 bg-border hover:bg-border/70 text-white rounded-lg font-semibold hover:opacity-90 active:scale-95 transition min-h-[44px]"
              >
                Clear
              </button>
            </div>
          </div>
        )}


      </div>
    </section>
  );
};

export default TimerCard;
