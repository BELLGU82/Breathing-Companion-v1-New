import { StorageService } from './StorageService';

// Audio Context singleton for iOS fallback
let audioCtx: AudioContext | null = null;

const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

const playHapticFallback = () => {
  try {
    // Initialize AudioContext if needed
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }

    if (audioCtx) {
      // Resume if suspended (browser autoplay policy)
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => { });
      }

      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      // Improved haptic simulation for iOS devices
      // Using 100Hz for a more noticeable "thump" that's still subtle
      oscillator.frequency.setValueAtTime(100, audioCtx.currentTime);
      oscillator.type = 'sine';

      // Slightly longer and stronger for better tactile feedback
      // Volume: 0.3 (instead of 0.2) for more presence
      // Duration: 0.08s (instead of 0.05s) for better feel
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.08);
    }
  } catch (error) {
    // Fail silently
    console.debug('Haptic fallback error:', error);
  }
};

export const HapticService = {
  isEnabled: (): boolean => {
    return StorageService.getHapticsEnabled();
  },

  toggle: (): boolean => {
    const current = StorageService.getHapticsEnabled();
    const newState = !current;
    StorageService.setHapticsEnabled(newState);

    if (newState) {
      HapticService.trigger();
    }
    return newState;
  },

  trigger: (pattern: number | number[] = 10) => {
    if (!StorageService.getHapticsEnabled()) return;

    if (isIOS()) {
      playHapticFallback();
    } else {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(pattern);
        } catch (e) {
          // Ignore errors or lack of support
        }
      }
    }
  }
};