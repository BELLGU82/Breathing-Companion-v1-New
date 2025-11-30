import { StorageService } from './StorageService';
import { BreathingPhase } from '../types';

// Audio instances
let backgroundMusic: HTMLAudioElement | null = null;
let voiceCue: HTMLAudioElement | null = null;

// Available music tracks from public folder
const MUSIC_TRACKS = [
  '/calm_music.mp3'
];

export const AudioService = {
  isMuted: (): boolean => {
    return !StorageService.getSoundsEnabled();
  },

  setMuted: (muted: boolean) => {
    StorageService.setSoundsEnabled(!muted);
    // Apply to current playing audio
    if (backgroundMusic) {
      backgroundMusic.muted = muted;
    }
  },

  toggleMute: (): boolean => {
    const currentMuted = AudioService.isMuted();
    AudioService.setMuted(!currentMuted);
    return !currentMuted;
  },

  getEffectiveVolume: (): number => {
    return AudioService.isMuted() ? 0 : StorageService.getUserVolumePreference();
  },

  // New Separate Volume Getters
  getMusicVolume: (): number => {
    return AudioService.isMuted() ? 0 : StorageService.getMusicVolume();
  },

  getVoiceVolume: (): number => {
    return AudioService.isMuted() ? 0 : StorageService.getVoiceVolume();
  },

  // Background Music
  playBackgroundMusic: (trackIndex: number = 0) => {
    if (AudioService.isMuted()) return;

    try {
      // Stop existing music if playing
      AudioService.stopBackgroundMusic();

      // Create new audio element
      backgroundMusic = new Audio(MUSIC_TRACKS[trackIndex] || MUSIC_TRACKS[0]);
      backgroundMusic.loop = true;
      backgroundMusic.volume = AudioService.getMusicVolume() / 100;
      backgroundMusic.muted = AudioService.isMuted();

      // Play
      backgroundMusic.play().catch(err => {
        console.debug('Background music autoplay prevented:', err);
      });
    } catch (error) {
      console.debug('Error playing background music:', error);
    }
  },

  stopBackgroundMusic: () => {
    if (backgroundMusic) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
      backgroundMusic = null;
    }
  },

  setBackgroundVolume: (volume: number) => {
    // If volume is > 0 and we are muted, UNMUTE automatically
    if (volume > 0 && AudioService.isMuted()) {
      AudioService.setMuted(false);
    }

    StorageService.setMusicVolume(volume);

    if (backgroundMusic) {
      // If we are still muted (e.g. volume was 0), effective volume is 0
      // But if we just unmuted above, isMuted() is false
      if (!AudioService.isMuted()) {
        backgroundMusic.volume = volume / 100;
        backgroundMusic.muted = false;
      }
    }
  },

  setVoiceVolume: (volume: number) => {
    // If volume is > 0 and we are muted, UNMUTE automatically
    if (volume > 0 && AudioService.isMuted()) {
      AudioService.setMuted(false);
    }
    StorageService.setVoiceVolume(volume);
  },

  // Voice Guidance (using Web Speech API as fallback)
  playVoiceCue: (phase: BreathingPhase) => {
    if (AudioService.isMuted()) return;
    if (phase === BreathingPhase.Idle || phase === BreathingPhase.Finished) return;

    try {
      // Use Web Speech API for TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance();

        // Hebrew voice cues
        const cues: Record<BreathingPhase, string> = {
          [BreathingPhase.Inhale]: 'שאיפה',
          [BreathingPhase.HoldIn]: 'החזק',
          [BreathingPhase.Exhale]: 'נשיפה',
          [BreathingPhase.HoldOut]: 'החזק',
          [BreathingPhase.Rest]: 'הפסקה',
          [BreathingPhase.Idle]: '',
          [BreathingPhase.Finished]: 'סיימנו'
        };

        utterance.text = cues[phase];
        utterance.lang = 'he-IL';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = AudioService.getVoiceVolume() / 100;

        window.speechSynthesis.cancel(); // Cancel previous
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.debug('Error playing voice cue:', error);
    }
  },

  // Cleanup
  cleanup: () => {
    AudioService.stopBackgroundMusic();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
};