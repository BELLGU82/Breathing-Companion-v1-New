import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ghost, Bell, Moon, Volume2, Shield, Check, VolumeX, Vibrate, Trash2, Plus, Pencil, Lock } from 'lucide-react';
import { NeuCard } from '../components/Neu';
// import { ActivityChartCard, ChartRange } from '../components/ui/activity-chart-card'; // Moved to Home
import { StorageService } from '../services/StorageService';
import { AudioService } from '../services/AudioService';
import { HapticService } from '../services/HapticService';
import { NotificationService } from '../services/NotificationService';
import { ChartStats, Reminder, ChartRange, UserGoal } from '../types';
import { TrendingUp } from 'lucide-react';

// Neumorphic Toggle Component
const NeuToggle = ({ value, onToggle }: { value: boolean, onToggle: (e: React.MouseEvent) => void }) => {
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Haptic feedback
    HapticService.trigger();
    onToggle(e);
  };

  return (
    <div
      onClick={handleToggle}
      className={`
        w-12 h-7 rounded-full cursor-pointer relative transition-all duration-300 ease-in-out
        bg-neu-base shadow-[inset_3px_3px_6px_#a3b1c6,inset_-3px_-3px_6px_#ffffff]
      `}
    >
      <div
        className={`
          absolute top-1 bottom-1 w-5 h-5 rounded-full shadow-[2px_2px_5px_#a3b1c6,-2px_-2px_5px_#ffffff] transition-all duration-300 ease-out flex items-center justify-center
          ${value ? 'bg-neu-dark left-[calc(100%-1.5rem)]' : 'bg-neu-base left-1'}
        `}
      >
        {value && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
      </div>
    </div>
  );
};

export const ProfileView: React.FC = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(StorageService.getDarkMode());
  const [isRegistered, setIsRegistered] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userGoal, setUserGoal] = useState<UserGoal | null>(null);

  // Real Service State
  const [hapticsEnabled, setHapticsEnabled] = useState(HapticService.isEnabled());
  const [soundsEnabled, setSoundsEnabled] = useState(!AudioService.isMuted());
  const [musicVolume, setMusicVolume] = useState(StorageService.getMusicVolume());
  const [voiceVolume, setVoiceVolume] = useState(StorageService.getVoiceVolume());
  const [notificationsEnabled, setNotificationsEnabled] = useState(StorageService.getNotificationsEnabled());

  // Reminders State
  const [reminders, setReminders] = useState<Reminder[]>(StorageService.getReminders());
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [newReminderTime, setNewReminderTime] = useState('08:00');
  const [newReminderDays, setNewReminderDays] = useState<number[]>([0, 1, 2, 3, 4]); // Sun-Thu default

  const handleSaveReminder = async () => {
    // Request permission if first time
    const granted = await NotificationService.requestPermission();
    if (!granted) {
      alert('יש לאשר התראות כדי להוסיף תזכורת');
      return;
    }

    if (editingReminderId) {
      // Update existing
      const reminder = reminders.find(r => r.id === editingReminderId);
      if (reminder) {
        reminder.time = newReminderTime;
        reminder.days = newReminderDays;
        StorageService.updateReminder(reminder);
      }
    } else {
      // Create new
      const reminder: Reminder = {
        id: Date.now().toString(),
        time: newReminderTime,
        days: newReminderDays,
        enabled: true
      };
      StorageService.addReminder(reminder);
    }

    setReminders(StorageService.getReminders());
    setIsAddingReminder(false);
    setEditingReminderId(null);
    HapticService.trigger();

    // Schedule immediately (mock for now, real implementation needs SW)
    NotificationService.sendTestNotification();
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminderId(reminder.id);
    setNewReminderTime(reminder.time);
    setNewReminderDays(reminder.days);
    setIsAddingReminder(true);
  };

  const handleDeleteReminder = (id: string) => {
    if (confirm('למחוק את התזכורת?')) {
      StorageService.deleteReminder(id);
      setReminders(StorageService.getReminders());
      HapticService.trigger();
    }
  };

  const handleToggleReminder = (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      reminder.enabled = !reminder.enabled;
      StorageService.updateReminder(reminder);
      setReminders([...StorageService.getReminders()]);
      HapticService.trigger();
    }
  };

  // Stats State
  const [selectedRange, setSelectedRange] = useState<ChartRange>('weekly');
  const [chartStats, setChartStats] = useState<ChartStats>({ totalMinutes: 0, totalSessions: 0, data: [] });

  useEffect(() => {
    const registered = StorageService.isRegistered();
    setIsRegistered(registered);
    if (registered) {
      loadStats(selectedRange);
      setUserName(StorageService.getUserName());
      setUserGoal(StorageService.getUserGoal());
    }
  }, [selectedRange]);

  const loadStats = (range: ChartRange) => {
    const stats = StorageService.getChartStats(range);
    setChartStats(stats);
  };

  const handleToggleRegistration = () => {
    const newState = !isRegistered;
    StorageService.setRegistered(newState);
    setIsRegistered(newState);
    // if (newState) {
    //   loadStats(selectedRange);
    // }
  };

  const handleHapticsToggle = (e: React.MouseEvent) => {
    const newState = HapticService.toggle();
    setHapticsEnabled(newState);
    if (newState) HapticService.trigger();
  };

  const handleSoundsToggle = (e: React.MouseEvent) => {
    const isMuted = AudioService.toggleMute();
    setSoundsEnabled(!isMuted);
    if (!isMuted) HapticService.trigger();
  };

  const handleNotificationsToggle = async (e: React.MouseEvent) => {
    if (!notificationsEnabled) {
      const granted = await NotificationService.requestPermission();
      if (granted) {
        setNotificationsEnabled(true);
        StorageService.setNotificationsEnabled(true);
        HapticService.trigger();
        NotificationService.sendTestNotification(); // Send immediate test
      } else {
        // Permission denied or closed
        setNotificationsEnabled(false);
        StorageService.setNotificationsEnabled(false);
      }
    } else {
      setNotificationsEnabled(false);
      StorageService.setNotificationsEnabled(false);
      HapticService.trigger();
    }
  };

  const handleDarkModeToggle = (e: React.MouseEvent) => {
    const newState = !darkMode;
    setDarkMode(newState);
    StorageService.setDarkMode(newState);
    if (newState) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    HapticService.trigger();
  };

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setMusicVolume(newVol);
    AudioService.setBackgroundVolume(newVol);
    if (!soundsEnabled && newVol > 0) setSoundsEnabled(true);
  };

  const handleVoiceVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setVoiceVolume(newVol);
    AudioService.setVoiceVolume(newVol);
    if (!soundsEnabled && newVol > 0) setSoundsEnabled(true);
  };

  const SettingItem = ({ icon: Icon, label, toggle, value, children }: any) => (
    <div className="flex flex-col py-4 border-b border-white/20 last:border-0">
      <div className="flex items-center justify-between cursor-pointer" onClick={(e) => toggle && toggle(e)}>
        <div className="flex items-center gap-4">
          <div><Icon strokeWidth={1} className="icon-secondary" /></div>
          <span className="text-body">{label}</span>
        </div>
        {toggle && (
          <div onClick={(e) => e.stopPropagation()}>
            <NeuToggle value={value} onToggle={toggle} />
          </div>
        )}
      </div>
      {children && (
        <div className="mt-4 px-2 space-y-4">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto pb-32">
      <div className="mt-2">
        <h1 className="text-h1">פרופיל אישי</h1>
      </div>

      {/* User Login Card */}
      <NeuCard
        className="flex items-center gap-4 cursor-pointer active:scale-95 transition-transform hover-soft"
        onClick={handleToggleRegistration}
      >
        <div className="w-16 h-16 rounded-full shadow-neu-pressed flex items-center justify-center bg-neu-base">
          <Ghost strokeWidth={1} className="icon-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-h2 flex items-center gap-2">
            {isRegistered ? (userName || 'משתמש רשום') : 'משתמש אורח'}
            {!isRegistered && <span className="text-meta px-2 py-0.5 rounded-full">מוגבל</span>}
          </h2>
          <p className="text-meta">
            {isRegistered ? 'הנתונים שלך נשמרים' : 'לחץ כדי לפתוח את כל הפיצ\'רים'}
          </p>
        </div>
        {isRegistered ? (
          <Check className="icon-secondary" strokeWidth={1} />
        ) : (
          <div className="w-8 h-8 rounded-full bg-neu-base flex items-center justify-center shadow-lg animate-pulse">
            <Lock className="icon-secondary" strokeWidth={1} />
          </div>
        )}
      </NeuCard>

      {/* Goal Section */}
      {isRegistered && userGoal && (
        <div className="animate-in fade-in duration-500">
          <h3 className="text-meta uppercase tracking-wider mb-3 mr-2">היעד שלי</h3>
          <NeuCard className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-neu-base shadow-neu-flat flex items-center justify-center text-primary">
              <TrendingUp size={24} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h2 className="text-h2">{userGoal.targetDays} ימים ברצף</h2>
              <p className="text-meta">המטרה האישית שלך</p>
            </div>
            {/* Future: Add Edit Button */}
          </NeuCard>
        </div>
      )}

      {/* Stats Section - MOVED TO HOME */}
      {/* {isRegistered && (
        <div className="animate-in fade-in duration-500">
          <ActivityChartCard
            title="פעילות"
            totalValue={`${chartStats.totalMinutes} דק'`}
            data={chartStats.data}
            trendPercentage={chartStats.trendPercentage}
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
            className="w-full bg-neu-base shadow-neu-flat border-none"
          />
        </div>
      )} */}

      {/* Settings List */}
      <div>
        <h3 className="text-meta uppercase tracking-wider mb-3 mr-2">הגדרות</h3>
        <NeuCard>
          {/* Reminders Section - Only for Registered Users */}
          {isRegistered ? (
            <SettingItem
              icon={Bell}
              label="תזכורות"
              toggle={handleNotificationsToggle}
              value={notificationsEnabled}
            >
              {notificationsEnabled && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                  {/* Reminders List */}
                  {!isAddingReminder && reminders.map(reminder => (
                    <div key={reminder.id} className="flex items-center justify-between bg-white/50 p-3 rounded-xl border border-white/40">
                      <div className="flex flex-col">
                        <span className="text-h1 font-mono">{reminder.time}</span>
                        <div className="flex gap-1 mt-1">
                          {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((day, idx) => (
                            <span key={idx} className={`text-[10px] w-4 h-4 flex items-center justify-center rounded-full ${reminder.days.includes(idx) ? 'shadow-neu-pressed' : 'text-meta'}`}>
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <NeuToggle
                          value={reminder.enabled}
                          onToggle={() => handleToggleReminder(reminder.id)}
                        />
                        <button
                          onClick={() => handleEditReminder(reminder)}
                          className="p-2 text-body hover-soft"
                        >
                          <Pencil strokeWidth={1} className="icon-secondary" />
                        </button>
                        <button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="p-2 text-body hover-soft"
                        >
                          <Trash2 strokeWidth={1} className="icon-secondary" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add/Edit Reminder Form */}
                  {isAddingReminder ? (
                    <div className="bg-neu-base p-4 rounded-xl shadow-neu-pressed animate-in fade-in slide-in-from-top-2">
                      <h4 className="text-body mb-3">
                        {editingReminderId ? 'עריכת תזכורת' : 'תזכורת חדשה'}
                      </h4>

                      <div className="flex gap-4 mb-4">
                        <input
                          type="time"
                          value={newReminderTime}
                          onChange={(e) => setNewReminderTime(e.target.value)}
                          className="flex-1 bg-neu-base shadow-neu-inner p-3 rounded-xl text-center font-mono text-h2 outline-none"
                        />
                      </div>

                      <div className="flex justify-between mb-6 px-1">
                        {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((day, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              if (newReminderDays.includes(idx)) {
                                setNewReminderDays(newReminderDays.filter(d => d !== idx));
                              } else {
                                setNewReminderDays([...newReminderDays, idx]);
                              }
                            }}
                            className={`w-8 h-8 rounded-full text-body transition-all ${newReminderDays.includes(idx) ? 'shadow-neu-pressed scale-110' : 'bg-neu-base text-meta shadow-neu-flat'}`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setIsAddingReminder(false);
                            setEditingReminderId(null);
                            setNewReminderTime('08:00');
                            setNewReminderDays([0, 1, 2, 3, 4]);
                          }}
                          className="flex-1 py-2 text-body hover-soft rounded-lg transition-colors"
                        >
                          ביטול
                        </button>
                        <button
                          onClick={handleSaveReminder}
                          className="flex-1 py-2 bg-neu-base text-body rounded-lg shadow-md hover-soft transition-all"
                        >
                          שמור
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsAddingReminder(true);
                        setEditingReminderId(null);
                        setNewReminderTime('08:00');
                        setNewReminderDays([0, 1, 2, 3, 4]);
                      }}
                      className="w-full py-3 flex items-center justify-center gap-2 text-body bg-neu-base rounded-xl shadow-neu-flat active:shadow-neu-pressed transition-all hover-soft"
                    >
                      <Plus strokeWidth={1} className="icon-secondary" />
                      <span className="text-body">הוסף תזכורת חדשה</span>
                    </button>
                  )}
                </div>
              )}
            </SettingItem>
          ) : (
            <SettingItem
              icon={Bell}
              label="תזכורות יומיות"
              toggle={null}
              value={false}
            >
              <div className="bg-neu-base p-3 rounded-lg text-center">
                <p className="text-body mb-2">הירשם כדי להפעיל תזכורות אישיות</p>
                <button
                  onClick={handleToggleRegistration}
                  className="text-body hover-soft"
                >
                  התחבר עכשיו
                </button>
              </div>
            </SettingItem>
          )}
          <SettingItem
            icon={Moon}
            label="מצב כהה"
            toggle={handleDarkModeToggle}
            value={darkMode}
          />
          <SettingItem
            icon={Vibrate}
            label="רטט"
            toggle={handleHapticsToggle}
            value={hapticsEnabled}
          />
          <SettingItem
            icon={soundsEnabled ? Volume2 : VolumeX}
            label="צלילים"
            toggle={handleSoundsToggle}
            value={soundsEnabled}
          >
            {/* Volume Sliders - Only show if sounds enabled */}
            {soundsEnabled && (
              <>
                <div className="flex flex-col gap-1 animate-in slide-in-from-top-2 duration-200">
                  <span className="text-meta">מוזיקה</span>
                  <div className="flex items-center gap-4">
                    <span className="text-meta w-6">0</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={musicVolume}
                      onChange={handleMusicVolumeChange}
                      className="flex-1 h-2 bg-neu-base rounded-lg appearance-none cursor-pointer accent-[var(--text-primary)]"
                    />
                    <span className="text-meta w-6 text-left">{musicVolume}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 animate-in slide-in-from-top-2 duration-200 delay-75">
                  <span className="text-meta">הדרכה קולית</span>
                  <div className="flex items-center gap-4">
                    <span className="text-meta w-6">0</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={voiceVolume}
                      onChange={handleVoiceVolumeChange}
                      className="flex-1 h-2 bg-neu-base rounded-lg appearance-none cursor-pointer accent-[var(--text-primary)]"
                    />
                    <span className="text-meta w-6 text-left">{voiceVolume}</span>
                  </div>
                </div>
              </>
            )}
          </SettingItem>
        </NeuCard>
      </div>

      {/* Support */}
      <div>
        <NeuCard>
          <SettingItem icon={Shield} label="מדיניות פרטיות" />
          <div className="py-4 text-center text-meta">
            Neshima App v1.3
          </div>
        </NeuCard>
      </div>
    </div>
  );
};
