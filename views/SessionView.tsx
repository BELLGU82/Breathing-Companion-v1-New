import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Volume, Volume1, Volume2, VolumeX, SkipForward, ArrowLeft, X, Heart, Mic, MicOff, Home } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { BREATHING_PATTERNS, PHASE_LABELS, CATEGORIES } from '../constants';
import { BreathingPhase } from '../types';
import { NeuIconButton, NeuButton, NeuCard } from '../components/Neu';
import { StorageService } from '../services/StorageService';
import { HapticService } from '../services/HapticService';
import { AudioService } from '../services/AudioService';

const DEFAULT_DURATION = 120;

export const SessionView: React.FC = () => {
  const { patternId } = useParams<{ patternId: string }>();
  const navigate = useNavigate();

  // Resolve Pattern (Built-in or Custom)
  const pattern = useMemo(() => {
    if (!patternId) return BREATHING_PATTERNS['regulate_box'];
    return BREATHING_PATTERNS[patternId] || StorageService.getCustomPattern(patternId) || BREATHING_PATTERNS['regulate_box'];
  }, [patternId]);

  // Initialize duration
  const initialDuration = useMemo(() => {
    // For custom patterns, respect the creator's duration/reps
    if (pattern.id.startsWith('custom_')) {
      return pattern.recommendedDuration ?? DEFAULT_DURATION;
    }
    // For built-in, allow user preference override
    const userPref = StorageService.getUserDurationPreference();
    return userPref ?? pattern.recommendedDuration ?? DEFAULT_DURATION;
  }, [pattern]);

  // Cycle Calculation
  const cycleDuration = useMemo(() => {
    const baseCycle = pattern.phases.inhale + pattern.phases.holdIn + pattern.phases.exhale + pattern.phases.holdOut;
    return baseCycle > 0 ? baseCycle : 10;
  }, [pattern]);

  const totalCycles = useMemo(() => {
    // Priority 1: Explicit Reps (Custom Patterns)
    if (pattern.reps) return pattern.reps;

    // Priority 2: Calculated from duration
    return Math.max(1, Math.floor(initialDuration / cycleDuration));
  }, [pattern, initialDuration, cycleDuration]);

  // State
  const [playbackState, setPlaybackState] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  // Removed remainingSessionTime state
  const [currentCycle, setCurrentCycle] = useState(1);
  const [isPressed, setIsPressed] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Phase State
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>(BreathingPhase.Inhale);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(pattern.phases.inhale);
  const [phaseProgress, setPhaseProgress] = useState(0);

  // Volume State
  const [musicVolume, setMusicVolume] = useState(() => StorageService.getMusicVolume());
  const [voiceVolume, setVoiceVolume] = useState(() => StorageService.getVoiceVolume());
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeSliderRef = useRef<HTMLDivElement>(null);
  const isDraggingVolumeRef = useRef(false);

  // Refs
  const lastFrameTime = useRef<number>(0);
  const phaseElapsedRef = useRef<number>(0);
  const sessionElapsedRef = useRef<number>(0);
  const sessionSavedRef = useRef(false);
  const startTimeRef = useRef(Date.now());
  const lastPhaseSecondRef = useRef<number>(pattern.phases.inhale);

  // Guard Refs for Loop
  const playbackStateRef = useRef(playbackState);
  const requestRef = useRef<number | null>(null);

  // Sync ref
  useEffect(() => {
    playbackStateRef.current = playbackState;
  }, [playbackState]);

  // Check Favorite Status
  useEffect(() => {
    const favs = StorageService.getFavorites();
    setIsFavorite(favs.includes(pattern.id));
  }, [pattern.id]);

  const handleToggleFavorite = () => {
    const newFavs = StorageService.toggleFavorite(pattern.id);
    setIsFavorite(newFavs.includes(pattern.id));
    HapticService.trigger(10);
  };

  // Countdown Logic
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => (prev !== null ? prev - 1 : null));
        HapticService.trigger(20);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdown(null);
      setPlaybackState('running');
      HapticService.trigger(50);
    }
  }, [countdown]);

  // Next Exercise Logic
  const nextExercise = useMemo(() => {
    const category = CATEGORIES.find(c => c.patterns.includes(pattern.id));
    if (!category) return null;
    const currentIndex = category.patterns.indexOf(pattern.id);
    const nextId = category.patterns[currentIndex + 1];
    return nextId ? BREATHING_PATTERNS[nextId] : null;
  }, [pattern.id]);

  const getPhaseDuration = useCallback((p: BreathingPhase) => {
    switch (p) {
      case BreathingPhase.Inhale: return pattern.phases.inhale;
      case BreathingPhase.HoldIn: return pattern.phases.holdIn;
      case BreathingPhase.Exhale: return pattern.phases.exhale;
      case BreathingPhase.HoldOut: return pattern.phases.holdOut;
      case BreathingPhase.Rest: return pattern.restDuration || 0;
      default: return 0;
    }
  }, [pattern]);

  const getRhythmString = useMemo(() => {
    const parts = [];
    if (pattern.phases.inhale) parts.push(`שאיפה ${pattern.phases.inhale}`);
    if (pattern.phases.holdIn) parts.push(`החזקה ${pattern.phases.holdIn}`);
    if (pattern.phases.exhale) parts.push(`נשיפה ${pattern.phases.exhale}`);
    if (pattern.phases.holdOut) parts.push(`החזקה ${pattern.phases.holdOut}`);
    return `קצב נשימה: ${parts.join(' · ')}`;
  }, [pattern]);

  const getNextPhase = useCallback((current: BreathingPhase) => {
    // Normal Flow
    if (current === BreathingPhase.Inhale) return pattern.phases.holdIn > 0 ? BreathingPhase.HoldIn : BreathingPhase.Exhale;
    if (current === BreathingPhase.HoldIn) return BreathingPhase.Exhale;

    // End of active cycle part 1
    if (current === BreathingPhase.Exhale) {
      if (pattern.phases.holdOut > 0) return BreathingPhase.HoldOut;
      // Check for Rest
      if (pattern.restDuration && pattern.restDuration > 0 && currentCycle < totalCycles) {
        return BreathingPhase.Rest;
      }
      return BreathingPhase.Inhale;
    }

    // End of active cycle part 2 (if holdOut exists)
    if (current === BreathingPhase.HoldOut) {
      // Check for Rest
      if (pattern.restDuration && pattern.restDuration > 0 && currentCycle < totalCycles) {
        return BreathingPhase.Rest;
      }
      return BreathingPhase.Inhale;
    }

    if (current === BreathingPhase.Rest) return BreathingPhase.Inhale;

    return BreathingPhase.Inhale;
  }, [pattern, currentCycle, totalCycles]);

  // Handle Session Completion
  const completeSession = useCallback(() => {
    setPlaybackState('completed');
    HapticService.trigger([50, 100, 50]);

    if (!sessionSavedRef.current) {
      sessionSavedRef.current = true;
      // Calculate actual duration based on cycles completed
      const actualDuration = totalCycles * cycleDuration;

      StorageService.saveSession({
        id: startTimeRef.current.toString(),
        patternId: pattern.id,
        patternName: pattern.name,
        durationSeconds: actualDuration,
        timestamp: Date.now(),
        isCompleted: true
      });
    }
  }, [totalCycles, cycleDuration, pattern]);

  // Main Animation Loop
  useEffect(() => {
    const loop = (timestamp: number) => {
      // Guard against zombie loops
      if (playbackStateRef.current !== 'running') return;

      if (lastFrameTime.current === 0) {
        lastFrameTime.current = timestamp;
      }

      const delta = (timestamp - lastFrameTime.current) / 1000;
      lastFrameTime.current = timestamp;

      // 1. Update Session Timer (Just for elapsed tracking if needed, but logic is now cycle based)
      sessionElapsedRef.current += delta;

      // 2. Update Phase
      const totalPhaseDuration = getPhaseDuration(currentPhase);

      // Safety check for 0 duration phases
      if (totalPhaseDuration > 0) {
        phaseElapsedRef.current += delta;

        if (phaseElapsedRef.current >= totalPhaseDuration) {
          // Phase Done -> Switch
          const next = getNextPhase(currentPhase);

          // Phase Transition Haptic
          if (next !== currentPhase) {
            if (next === BreathingPhase.Inhale || next === BreathingPhase.Exhale) {
              HapticService.trigger(50);
            } else {
              HapticService.trigger(20);
            }
          }

          // Check for Cycle Increment
          if (next === BreathingPhase.Inhale && currentPhase !== BreathingPhase.Inhale) {
            const nextCycle = currentCycle + 1;
            setCurrentCycle(nextCycle);

            // Check for Completion based on Reps
            if (nextCycle > totalCycles) {
              completeSession();
              return; // Stop loop
            }
          }

          setCurrentPhase(next);
          phaseElapsedRef.current = 0;

          const nextDuration = getPhaseDuration(next);
          setPhaseTimeLeft(nextDuration);
          lastPhaseSecondRef.current = Math.ceil(nextDuration);
          setPhaseProgress(0);
        } else {
          // Phase Progressing
          const timeLeft = Math.max(0, Math.ceil(totalPhaseDuration - phaseElapsedRef.current));

          // Countdown Haptics (3-2-1)
          if (timeLeft <= 3 && timeLeft > 0 && timeLeft < lastPhaseSecondRef.current) {
            HapticService.trigger(5);
          }
          lastPhaseSecondRef.current = timeLeft;

          setPhaseTimeLeft(timeLeft);
          setPhaseProgress(phaseElapsedRef.current / totalPhaseDuration);
        }
      } else {
        // Skip 0 duration phase immediately
        const next = getNextPhase(currentPhase);
        if (next !== currentPhase) {
          setCurrentPhase(next);
        }
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    if (playbackState === 'running') {
      requestRef.current = requestAnimationFrame(loop);
    } else {
      lastFrameTime.current = 0;
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [playbackState, currentPhase, getPhaseDuration, getNextPhase, completeSession, currentCycle, totalCycles]);

  // Volume Control Logic
  const getVolumeIcon = () => {
    if (musicVolume === 0) return <VolumeX size={24} strokeWidth={1} />;
    if (musicVolume < 30) return <Volume size={24} strokeWidth={1} />;
    if (musicVolume < 70) return <Volume1 size={24} strokeWidth={1} />;
    return <Volume2 size={24} strokeWidth={1} />;
  };

  // Controls - Stabilized with useCallback
  const togglePlay = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    HapticService.trigger(10);
    if (playbackState === 'completed') return;

    if (playbackState === 'idle') {
      setCountdown(3);
      // Pre-load/Resume Audio Context if needed (though we play on 'running')
      return;
    }

    const nextState = playbackState === 'running' ? 'paused' : 'running';
    setPlaybackState(nextState);

    // Direct Audio Interaction on Click (Fix for Autoplay Policy)
    if (nextState === 'running') {
      AudioService.playBackgroundMusic(0);
    } else {
      // Optional: We could pause here, but the useEffect handles volume ducking
    }
  }, [playbackState]);

  const handleSkip = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    HapticService.trigger(20);
    if (playbackState === 'completed') return;

    const next = getNextPhase(currentPhase);

    if (next === BreathingPhase.Inhale && currentPhase !== BreathingPhase.Inhale) {
      setCurrentCycle(c => c + 1);
    }

    setCurrentPhase(next);
    phaseElapsedRef.current = 0;

    const nextDuration = getPhaseDuration(next);
    setPhaseTimeLeft(nextDuration);
    lastPhaseSecondRef.current = Math.ceil(nextDuration);
    setPhaseProgress(0);

    if (playbackState === 'idle') setPlaybackState('running');
  }, [playbackState, currentPhase, getNextPhase, getPhaseDuration]);

  const handleExit = useCallback(() => {
    HapticService.trigger(10);
    // If exiting early, save partial progress
    const timeSpent = sessionElapsedRef.current;

    if (timeSpent > 5 && playbackState !== 'completed' && !sessionSavedRef.current) {
      StorageService.saveSession({
        id: startTimeRef.current.toString(),
        patternId: pattern.id,
        patternName: pattern.name,
        durationSeconds: timeSpent,
        timestamp: Date.now(),
        isCompleted: false
      });
    }

    setPlaybackState('idle');
    setCountdown(null);

    const category = CATEGORIES.find(c => c.patterns.includes(pattern.id));
    if (category) {
      navigate(`/category/${category.id}`);
    } else {
      navigate('/breathe');
    }
  }, [playbackState, pattern, navigate]);

  const handleNextExercise = useCallback(() => {
    if (nextExercise) {
      setPlaybackState('idle');
      setCountdown(null);
      phaseElapsedRef.current = 0;
      sessionElapsedRef.current = 0;
      lastFrameTime.current = 0;
      sessionSavedRef.current = false;
      startTimeRef.current = Date.now();
      lastPhaseSecondRef.current = nextExercise.phases.inhale;
      navigate(`/session/${nextExercise.id}`);
    }
  }, [nextExercise, navigate]);

  // Audio Management - Background Music
  useEffect(() => {
    if (playbackState === 'running') {
      // Start background music when session starts
      AudioService.playBackgroundMusic(0);
    } else if (playbackState === 'paused') {
      // Keep music playing but reduce volume slightly
      const currentVolume = AudioService.getEffectiveVolume();
      AudioService.setBackgroundVolume(currentVolume * 0.7);
    } else if (playbackState === 'idle' || playbackState === 'completed') {
      // Stop music when session ends
      AudioService.stopBackgroundMusic();
    }

    // Cleanup on unmount
    return () => {
      AudioService.cleanup();
    };
  }, [playbackState]);

  // Voice Cues - Play on phase change
  useEffect(() => {
    if (playbackState === 'running' && currentPhase !== BreathingPhase.Idle) {
      AudioService.playVoiceCue(currentPhase);
    }
  }, [currentPhase, playbackState]);

  // Re-init on pattern change
  useEffect(() => {
    setPlaybackState('idle');
    setCountdown(null);
    setCurrentCycle(1);
    setCurrentPhase(BreathingPhase.Inhale);
    setPhaseTimeLeft(pattern.phases.inhale);
    phaseElapsedRef.current = 0;
    sessionSavedRef.current = false;
    startTimeRef.current = Date.now();
    lastPhaseSecondRef.current = pattern.phases.inhale;
  }, [pattern, initialDuration]);

  // Visual Helpers
  const getCircleScale = () => {
    if (currentPhase === BreathingPhase.Rest) return 1.0;

    const minScale = 1.0;
    const maxScale = 1.6;
    const range = maxScale - minScale;
    const t = phaseProgress;
    const ease = (x: number) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    const easedT = ease(t);

    switch (currentPhase) {
      case BreathingPhase.Inhale: return minScale + (range * easedT);
      case BreathingPhase.HoldIn: return maxScale;
      case BreathingPhase.Exhale: return maxScale - (range * easedT);
      case BreathingPhase.HoldOut: return minScale;
      default: return minScale;
    }
  };

  // --- Render Completion Screen ---
  if (playbackState === 'completed') {
    return (
      <div className="flex flex-col h-full bg-neu-base p-6 items-center justify-center animate-in fade-in duration-500">
        <h1 className="text-3xl font-bold text-neu-text mb-2 text-center">כל הכבוד!</h1>
        <p className="text-gray-500 mb-8 text-center">
          סיימת את {pattern.name} בהצלחה.
        </p>

        {nextExercise && (
          <div className="w-full mb-8">
            <p className="text-sm font-bold text-neu-accent mb-3 text-center">התרגיל הבא:</p>
            <NeuCard className="bg-white/50 border border-white/60">
              <h3 className="font-bold text-neu-text text-lg">{nextExercise.name}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{nextExercise.description}</p>
              <div className="mt-3 flex gap-2">
                <span className="text-[10px] bg-neu-base px-2 py-1 rounded-full text-gray-500">
                  {Math.ceil((nextExercise.recommendedDuration || 120) / 60)} דקות
                </span>
              </div>
            </NeuCard>
          </div>
        )}

        <div className="flex flex-row gap-6 w-full max-w-xs justify-center items-center">
          {/* Home Button */}
          <NeuButton
            onClick={() => navigate('/')}
            className="!w-16 !h-16 !rounded-2xl !p-0 flex items-center justify-center bg-neu-base text-neu-text shadow-neu-flat active:shadow-neu-pressed transition-all"
            aria-label="חזרה הביתה"
          >
            <Home size={24} strokeWidth={1.5} />
          </NeuButton>

          {/* Next Exercise Button (if exists) */}
          {nextExercise && (
            <NeuButton
              onClick={handleNextExercise}
              className="!w-16 !h-16 !rounded-2xl !p-0 flex items-center justify-center bg-neu-base text-neu-text shadow-neu-flat active:shadow-neu-pressed transition-all"
              aria-label="התרגיל הבא"
            >
              <ArrowLeft size={28} strokeWidth={1.5} />
            </NeuButton>
          )}
        </div>
      </div>
    );
  }

  const currentScale = (playbackState === 'paused' || playbackState === 'idle') ? 1 : getCircleScale();
  const finalScale = currentScale * (isPressed ? 0.98 : 1);

  const transition = isPressed
    ? 'transform 0.1s ease-out'
    : (playbackState === 'running' ? 'none' : 'transform 0.5s ease-out');

  return (
    <div className="flex flex-col h-full bg-neu-base relative overflow-hidden">

      {/* Exit Button - Top Left */}
      <div className="absolute top-6 left-6 z-50">
        <NeuIconButton
          onClick={() => {
            AudioService.cleanup();
            handleExit();
          }}
          className="w-12 h-12"
          aria-label="יציאה מהסשן"
        >
          <X size={20} strokeWidth={1} className="text-neu-text" />
        </NeuIconButton>
      </div>

      {/* Favorites Button - Top Right (NEW) */}
      <div className="absolute top-6 right-6 z-50">
        <NeuIconButton
          onClick={handleToggleFavorite}
          className="w-12 h-12"
          aria-label="הוסף למועדפים"
        >
          <Heart
            size={20}
            strokeWidth={isFavorite ? 0 : 1}
            className={`${isFavorite ? 'fill-red-500 text-red-500' : 'text-neu-text'}`}
          />
        </NeuIconButton>
      </div>

      {/* Top Info */}
      <div className="pt-10 pb-4 flex flex-col justify-center items-center z-10 space-y-2 px-6 text-center mt-4">
        <h1 className="text-neu-text font-bold text-xl">{pattern.name}</h1>
        <p className="text-sm text-neu-text/70 font-medium">מטרת התרגיל: {pattern.benefits}</p>
        <p className="text-xs text-neu-text/50 font-mono" dir="ltr">{getRhythmString}</p>
      </div>

      {/* Breathing Circle Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full mb-4">
        {/* Background Rings */}
        <div className="absolute w-80 h-80 rounded-full shadow-neu-flat opacity-30 z-0 pointer-events-none" />

        {/* Main Interactive Circle */}
        <button
          type="button"
          onClick={togglePlay}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          onTouchStart={() => setIsPressed(true)}
          onTouchEnd={() => setIsPressed(false)}
          className="relative z-10 w-64 h-64 rounded-full bg-neu-base shadow-neu-flat flex items-center justify-center outline-none focus:outline-none cursor-pointer select-none will-change-transform active:shadow-neu-pressed transition-shadow duration-200 touch-manipulation"
          style={{
            transform: `scale(${finalScale})`,
            transition: transition
          }}
        >
          {/* Inner Depth */}
          <div className="w-56 h-56 rounded-full shadow-neu-pressed opacity-50 absolute pointer-events-none" />

          {/* Color Overlay */}
          <div className={`w-full h-full rounded-full opacity-10 transition-colors duration-500 absolute pointer-events-none ${currentPhase === BreathingPhase.Inhale ? 'bg-blue-400' :
            currentPhase === BreathingPhase.Exhale ? 'bg-teal-400' :
              currentPhase === BreathingPhase.Rest ? 'bg-green-400' :
                'bg-gray-400'
            }`} />

          {/* Content Container */}
          <div className="absolute z-20 flex flex-col items-center justify-center w-full h-full pointer-events-none py-6">

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center z-50 bg-neu-base/90 rounded-full backdrop-blur-sm animate-in fade-in duration-200">
                <span className="text-8xl font-bold text-neu-accent animate-pulse">
                  {countdown}
                </span>
              </div>
            )}

            {/* Paused Overlay */}
            {playbackState === 'paused' && countdown === null && (
              <div className="absolute inset-0 flex items-center justify-center z-30 bg-neu-base/60 rounded-full backdrop-blur-[2px]">
                <span className="font-medium text-neu-text/80 text-lg">הקש להמשך</span>
              </div>
            )}

            {/* 1. Top: Phase Name */}
            <div className="flex-1 flex items-end pb-2 flex-col justify-end">
              <span className="text-neu-text/60 text-sm font-medium uppercase tracking-widest">
                {playbackState === 'idle' && countdown === null ? 'מוכן?' : PHASE_LABELS[currentPhase]}
              </span>
              {currentPhase === BreathingPhase.Rest && (
                <span className="text-[10px] text-gray-400 mt-1">נשום רגיל</span>
              )}
            </div>

            {/* 2. Center: Big Countdown */}
            <div className="flex items-center justify-center h-20">
              <span className={`text-6xl font-bold text-neu-text font-mono tabular-nums leading-none transition-opacity duration-300 ${playbackState === 'paused' ? 'opacity-20' : 'opacity-100'}`}>
                {phaseTimeLeft}
              </span>
            </div>

            {/* 3. Bottom: Cycle Counter */}
            <div className="flex items-center justify-center pt-2">
              <span className="text-xs text-neu-text/50 font-medium">
                חזרה {currentCycle}/{totalCycles}
              </span>
            </div>

            {/* 4. Very Bottom: Spacer (Timer Removed) */}
            <div className="flex-1"></div>
          </div>
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="pb-12 px-8 flex flex-row items-center justify-center z-10 w-full max-w-md mx-auto gap-4">

        {/* Music Volume Slider */}
        <div className="flex-1 flex items-center gap-3 bg-neu-base/50 p-3 rounded-2xl backdrop-blur-sm border border-white/20 shadow-sm">
          <div
            onClick={() => {
              const newMuted = !AudioService.isMuted();
              AudioService.setMuted(newMuted);
              setMusicVolume(newMuted ? 0 : StorageService.getMusicVolume());
            }}
            className="cursor-pointer text-neu-text/70 hover:text-neu-text transition-colors shrink-0"
          >
            {getVolumeIcon()}
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={AudioService.isMuted() ? 0 : musicVolume}
            onChange={(e) => {
              const newVol = Number(e.target.value);
              setMusicVolume(newVol);
              AudioService.setBackgroundVolume(newVol);
            }}
            className="w-full h-1.5 bg-gray-300/50 rounded-lg appearance-none cursor-pointer accent-neu-text hover:accent-neu-accent transition-all"
          />
        </div>

        {/* Voice Volume Slider (NEW) */}
        <div className="flex-1 flex items-center gap-3 bg-neu-base/50 p-3 rounded-2xl backdrop-blur-sm border border-white/20 shadow-sm">
          <div
            onClick={() => {
              const newVol = voiceVolume > 0 ? 0 : 80; // Toggle between 0 and 80 (default-ish)
              setVoiceVolume(newVol);
              AudioService.setVoiceVolume(newVol);
            }}
            className="cursor-pointer text-neu-text/70 hover:text-neu-text transition-colors shrink-0"
          >
            {voiceVolume === 0 ? <MicOff size={20} strokeWidth={1} /> : <Mic size={20} strokeWidth={1} />}
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={voiceVolume}
            onChange={(e) => {
              const newVol = Number(e.target.value);
              setVoiceVolume(newVol);
              AudioService.setVoiceVolume(newVol);
            }}
            className="w-full h-1.5 bg-gray-300/50 rounded-lg appearance-none cursor-pointer accent-neu-text hover:accent-neu-accent transition-all"
          />
        </div>

      </div>
    </div>
  );
};