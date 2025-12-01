import { Session, SessionStats, ChartStats, ChartDataPoint, BreathingPattern, Reminder, ChartRange } from '../types';

const STORAGE_KEY_SESSIONS = 'neshima_sessions';
const STORAGE_KEY_USER_TYPE = 'neshima_is_registered';
const STORAGE_KEY_DURATION_PREF = 'neshima_duration_pref';
const STORAGE_KEY_FAVORITES = 'neshima_favorites';
const STORAGE_KEY_VOLUME_PREF = 'neshima_volume_pref'; // Legacy/General
const STORAGE_KEY_MUSIC_VOLUME = 'neshima_music_volume';
const STORAGE_KEY_VOICE_VOLUME = 'neshima_voice_volume';
const STORAGE_KEY_HAPTICS = 'neshima_haptics_enabled';
const STORAGE_KEY_SOUNDS = 'neshima_sounds_enabled';
const STORAGE_KEY_CUSTOM_PATTERNS = 'neshima_custom_patterns';
const STORAGE_KEY_DARK_MODE = 'neshima_dark_mode';

// In-memory counter for guest users (ephemeral)
let ephemeralSessionCount = 0;

const DAY_LABELS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
const MONTH_LABELS = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];

export const StorageService = {
  // User Type Logic
  isRegistered: (): boolean => {
    return localStorage.getItem(STORAGE_KEY_USER_TYPE) === 'true';
  },

  setRegistered: (status: boolean) => {
    localStorage.setItem(STORAGE_KEY_USER_TYPE, String(status));
  },

  // Preferences
  getUserDurationPreference: (): number | null => {
    const pref = localStorage.getItem(STORAGE_KEY_DURATION_PREF);
    return pref ? parseInt(pref, 10) : null;
  },

  // Legacy / General Volume (kept for backward compatibility or master control if needed)
  getUserVolumePreference: (): number => {
    const pref = localStorage.getItem(STORAGE_KEY_VOLUME_PREF);
    return pref ? parseInt(pref, 10) : 70;
  },

  setUserVolumePreference: (volume: number) => {
    localStorage.setItem(STORAGE_KEY_VOLUME_PREF, String(volume));
  },

  // New Separate Volumes
  getMusicVolume: (): number => {
    const pref = localStorage.getItem(STORAGE_KEY_MUSIC_VOLUME);
    // Fallback to general volume if not set
    return pref ? parseInt(pref, 10) : StorageService.getUserVolumePreference();
  },

  setMusicVolume: (volume: number) => {
    localStorage.setItem(STORAGE_KEY_MUSIC_VOLUME, String(volume));
  },

  getVoiceVolume: (): number => {
    const pref = localStorage.getItem(STORAGE_KEY_VOICE_VOLUME);
    // Fallback to general volume if not set
    return pref ? parseInt(pref, 10) : StorageService.getUserVolumePreference();
  },

  setVoiceVolume: (volume: number) => {
    localStorage.setItem(STORAGE_KEY_VOICE_VOLUME, String(volume));
  },

  getHapticsEnabled: (): boolean => {
    return localStorage.getItem(STORAGE_KEY_HAPTICS) !== 'false'; // Default true
  },

  setHapticsEnabled: (enabled: boolean) => {
    localStorage.setItem(STORAGE_KEY_HAPTICS, String(enabled));
  },

  getNotificationsEnabled: (): boolean => {
    return localStorage.getItem('neshima_notifications_enabled') === 'true';
  },

  setNotificationsEnabled: (enabled: boolean) => {
    localStorage.setItem('neshima_notifications_enabled', String(enabled));
  },

  getLastReminderTime: (): number | null => {
    const time = localStorage.getItem('neshima_last_reminder_time');
    return time ? parseInt(time, 10) : null;
  },

  setLastReminderTime: (timestamp: number) => {
    localStorage.setItem('neshima_last_reminder_time', String(timestamp));
  },

  // Reminders CRUD
  getReminders: (): Reminder[] => {
    const stored = localStorage.getItem('neshima_reminders');
    return stored ? JSON.parse(stored) : [];
  },

  saveReminders: (reminders: Reminder[]) => {
    localStorage.setItem('neshima_reminders', JSON.stringify(reminders));
  },

  addReminder: (reminder: Reminder) => {
    const reminders = StorageService.getReminders();
    reminders.push(reminder);
    StorageService.saveReminders(reminders);
  },

  updateReminder: (updatedReminder: Reminder) => {
    const reminders = StorageService.getReminders();
    const index = reminders.findIndex(r => r.id === updatedReminder.id);
    if (index !== -1) {
      reminders[index] = updatedReminder;
      StorageService.saveReminders(reminders);
    }
  },

  deleteReminder: (id: string) => {
    const reminders = StorageService.getReminders();
    const filtered = reminders.filter(r => r.id !== id);
    StorageService.saveReminders(filtered);
  },

  getSoundsEnabled: (): boolean => {
    return localStorage.getItem(STORAGE_KEY_SOUNDS) !== 'false'; // Default true
  },

  setSoundsEnabled: (enabled: boolean) => {
    localStorage.setItem(STORAGE_KEY_SOUNDS, String(enabled));
  },

  getDarkMode: (): boolean => {
    return localStorage.getItem(STORAGE_KEY_DARK_MODE) === 'true';
  },

  setDarkMode: (enabled: boolean) => {
    localStorage.setItem(STORAGE_KEY_DARK_MODE, String(enabled));
  },

  // Custom Patterns
  getCustomPatterns: (): BreathingPattern[] => {
    const data = localStorage.getItem(STORAGE_KEY_CUSTOM_PATTERNS);
    return data ? JSON.parse(data) : [];
  },

  getCustomPattern: (id: string): BreathingPattern | undefined => {
    const patterns = StorageService.getCustomPatterns();
    return patterns.find(p => p.id === id);
  },

  saveCustomPattern: (pattern: BreathingPattern) => {
    const patterns = StorageService.getCustomPatterns();
    patterns.push(pattern);
    localStorage.setItem(STORAGE_KEY_CUSTOM_PATTERNS, JSON.stringify(patterns));
  },

  updateCustomPattern: (updatedPattern: BreathingPattern) => {
    const patterns = StorageService.getCustomPatterns();
    const index = patterns.findIndex(p => p.id === updatedPattern.id);
    if (index !== -1) {
      patterns[index] = updatedPattern;
      localStorage.setItem(STORAGE_KEY_CUSTOM_PATTERNS, JSON.stringify(patterns));
    }
  },

  deleteCustomPattern: (id: string) => {
    const patterns = StorageService.getCustomPatterns();
    const newPatterns = patterns.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY_CUSTOM_PATTERNS, JSON.stringify(newPatterns));
  },

  // Favorites
  getFavorites: (): string[] => {
    const favs = localStorage.getItem(STORAGE_KEY_FAVORITES);
    return favs ? JSON.parse(favs) : [];
  },

  toggleFavorite: (patternId: string): string[] => {
    const favs = StorageService.getFavorites();
    const index = favs.indexOf(patternId);
    let newFavs;
    if (index > -1) {
      newFavs = favs.filter(id => id !== patternId);
    } else {
      newFavs = [...favs, patternId];
    }
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(newFavs));
    return newFavs;
  },

  isFavorite: (patternId: string): boolean => {
    const favs = StorageService.getFavorites();
    return favs.includes(patternId);
  },

  // Session Logic
  getEphemeralSessionCount: (): number => {
    return ephemeralSessionCount;
  },

  saveSession: (session: Session) => {
    // Only increment global counter if completed
    if (session.isCompleted) {
      ephemeralSessionCount++;
    }

    if (!StorageService.isRegistered()) {
      if (!StorageService.isRegistered() && !session.isCompleted) return;
      if (!StorageService.isRegistered()) return;
    }

    const sessions = StorageService.getSessions();

    // If we are saving an incomplete session, check if we should update an existing recent one 
    // or just push. For simplicity, we push.
    const cleanSessions = sessions.filter(s => s.id !== session.id); // Overwrite if same ID
    cleanSessions.push(session);

    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(cleanSessions));
  },

  getSessions: (): Session[] => {
    if (!StorageService.isRegistered()) return [];

    const data = localStorage.getItem(STORAGE_KEY_SESSIONS);
    return data ? JSON.parse(data) : [];
  },

  getLastInterruptedSession: (): Session | null => {
    const sessions = StorageService.getSessions();
    if (sessions.length === 0) return null;

    // Find the last session that is NOT completed
    // We search from the end
    for (let i = sessions.length - 1; i >= 0; i--) {
      if (!sessions[i].isCompleted) {
        return sessions[i];
      }
    }
    return null;
  },

  clearLastInterruptedSession: () => {
    const sessions = StorageService.getSessions();
    if (sessions.length === 0) return;

    // Filter out the last interrupted session
    // We need to find it first to make sure we only remove the specific one we are showing
    let found = false;
    const newSessions: Session[] = [];

    // Iterate backwards to find the *last* interrupted one
    for (let i = sessions.length - 1; i >= 0; i--) {
      if (!found && !sessions[i].isCompleted) {
        found = true; // Skip this one (delete it)
      } else {
        newSessions.unshift(sessions[i]); // Keep others
      }
    }

    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(newSessions));
  },

  // Stats Logic
  getStats: (): SessionStats => {
    const sessions = StorageService.getSessions();
    // Filter only completed sessions for stats
    const completedSessions = sessions.filter(s => s.isCompleted);

    // Total Minutes
    const totalMinutes = Math.floor(completedSessions.reduce((acc, curr) => acc + curr.durationSeconds, 0) / 60);

    // Weekly Minutes (Rolling 7 days)
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const weeklySessions = completedSessions.filter(s => s.timestamp >= oneWeekAgo);

    const weeklyMinutes = Math.floor(
      weeklySessions.reduce((acc, curr) => acc + curr.durationSeconds, 0) / 60
    );

    // Calculate Last 7 Days Activity (Sun=0 to Sat=6)
    const lastSevenDaysActivity = [0, 0, 0, 0, 0, 0, 0];
    weeklySessions.forEach(session => {
      const date = new Date(session.timestamp);
      const dayIndex = date.getDay();
      lastSevenDaysActivity[dayIndex] += Math.floor(session.durationSeconds / 60);
    });

    // Streak Logic
    const uniqueDates = Array.from(new Set(completedSessions.map(s => {
      return new Date(s.timestamp).toISOString().split('T')[0];
    }))).sort((a, b) => b.localeCompare(a));

    let streak = 0;
    if (uniqueDates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        streak = 1;
        let currentDate = new Date(uniqueDates[0]);

        for (let i = 1; i < uniqueDates.length; i++) {
          const prevDate = new Date(uniqueDates[i]);
          const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            streak++;
            currentDate = prevDate;
          } else {
            break;
          }
        }
      }
    }

    return {
      totalSessions: completedSessions.length,
      totalMinutes: weeklyMinutes,
      streak,
      lastSevenDaysActivity
    };
  },

  getChartStats: (range: ChartRange): ChartStats => {
    const sessions = StorageService.getSessions().filter(s => s.isCompleted);
    const now = new Date();

    let data: ChartDataPoint[] = [];
    let currentTotal = 0;
    let currentSessionsCount = 0;

    if (range === 'daily') {
      // Daily view: 4-hour blocks (0-4, 4-8, 8-12, 12-16, 16-20, 20-24)
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const blocks = new Array(6).fill(0);
      const blockLabels = ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'];

      sessions.forEach(s => {
        const sDate = new Date(s.timestamp);
        if (sDate >= startOfDay) {
          const hour = sDate.getHours();
          const blockIndex = Math.floor(hour / 4);
          if (blockIndex >= 0 && blockIndex < 6) {
            blocks[blockIndex] += s.durationSeconds;
            currentTotal += s.durationSeconds;
            currentSessionsCount++;
          }
        }
      });

      data = blocks.map((val, idx) => ({
        label: blockLabels[idx],
        value: Math.floor(val / 60)
      }));
    }
    else if (range === 'weekly') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Go to Sunday
      startOfWeek.setHours(0, 0, 0, 0);

      const days = new Array(7).fill(0);

      sessions.forEach(s => {
        const sDate = new Date(s.timestamp);
        if (sDate >= startOfWeek) {
          days[sDate.getDay()] += s.durationSeconds;
          currentTotal += s.durationSeconds;
          currentSessionsCount++;
        }
      });

      data = days.map((val, idx) => ({
        label: DAY_LABELS[idx],
        value: Math.floor(val / 60)
      }));
    }
    else if (range === 'monthly') {
      const startOfPeriod = new Date(now);
      startOfPeriod.setDate(now.getDate() - 27); // 28 days total
      startOfPeriod.setHours(0, 0, 0, 0);

      const weeks = [0, 0, 0, 0]; // Week 1 to Week 4

      sessions.forEach(s => {
        const sDate = new Date(s.timestamp);
        const ts = sDate.getTime();

        if (ts >= startOfPeriod.getTime()) {
          currentTotal += s.durationSeconds;
          currentSessionsCount++;
          const diffDays = Math.floor((ts - startOfPeriod.getTime()) / (1000 * 60 * 60 * 24));
          const weekIdx = Math.floor(diffDays / 7);
          if (weekIdx >= 0 && weekIdx < 4) weeks[weekIdx] += s.durationSeconds;
        }
      });

      data = weeks.map((val, idx) => ({
        label: `${idx + 1}`, // Just numbers as requested
        value: Math.floor(val / 60)
      }));
    }

    return {
      totalMinutes: Math.floor(currentTotal / 60),
      totalSessions: currentSessionsCount,
      data
    };
  }
};