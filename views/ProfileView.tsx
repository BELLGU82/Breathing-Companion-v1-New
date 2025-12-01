import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ghost, Bell, Moon, Volume2, Shield, Check, VolumeX, Vibrate, Trash2, Plus, Pencil, Lock } from 'lucide-react';
import { NeuCard } from '../components/Neu';
// import { ActivityChartCard, ChartRange } from '../components/ui/activity-chart-card'; // Moved to Home
import { StorageService } from '../services/StorageService';
import { AudioService } from '../services/AudioService';
import { HapticService } from '../services/HapticService';
import { NotificationService } from '../services/NotificationService';
import { ChartStats, Reminder, ChartRange } from '../types';

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
          ${value ? 'bg-neu-accent left-[calc(100%-1.5rem)]' : 'bg-neu-base left-1'}
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
  const [chartStats, setChartStats] = useState<ChartStats>({ totalMinutes: 0, trendPercentage: 0, data: [] });

  useEffect(() => {
    const registered = StorageService.isRegistered();
    setIsRegistered(registered);
    if (registered) {
      loadStats(selectedRange);
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
    <div className="flex flex-col py-4 border-b border-gray-200/50 last:border-0">
      <div className="flex items-center justify-between cursor-pointer" onClick={(e) => toggle && toggle(e)}>
        <div className="flex items-center gap-4">
          <div className="text-gray-500"><Icon size={20} strokeWidth={1} className="text-neu-text" /></div>
          <span className="text-neu-text font-medium">{label}</span>
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
        <h1 className="text-2xl font-bold text-neu-text">פרופיל אישי</h1>
      </div>

      {/* User Login Card */}
      <NeuCard
        className={`flex items-center gap-4 cursor-pointer active:scale-95 transition-transform ${!isRegistered ? 'border-2 border-neu-accent/20' : ''}`}
        onClick={handleToggleRegistration}
      >
        <div className={`w-16 h-16 rounded-full shadow-neu-pressed flex items-center justify-center ${isRegistered ? 'bg-blue-100 text-blue-500' : 'bg-neu-base text-neu-dark'}`}>
          <Ghost size={22} strokeWidth={1} />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-lg text-neu-text flex items-center gap-2">
            {isRegistered ? 'משתמש רשום' : 'משתמש אורח'}
            {!isRegistered && <span className="text-xs bg-neu-accent text-white px-2 py-0.5 rounded-full">מוגבל</span>}
          </h2>
          <p className="text-sm text-gray-500">
            {isRegistered ? 'הנתונים שלך נשמרים' : 'לחץ כדי לפתוח את כל הפיצ\'רים'}
          </p>
        </div>
        {isRegistered ? (
          <Check size={20} className="text-blue-500" strokeWidth={1} />
        ) : (
          <div className="w-8 h-8 rounded-full bg-neu-accent flex items-center justify-center shadow-lg animate-pulse">
            <Lock size={14} className="text-white" />
          </div>
        )}
      </NeuCard>

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
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 mr-2">הגדרות</h3>
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
                        <span className="text-xl font-bold text-neu-text font-mono">{reminder.time}</span>
                        <div className="flex gap-1 mt-1">
                          {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((day, idx) => (
                            <span key={idx} className={`text-[10px] w-4 h-4 flex items-center justify-center rounded-full ${reminder.days.includes(idx) ? 'bg-neu-accent text-white' : 'text-gray-400'}`}>
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
                          className="p-2 text-gray-400 hover:text-neu-accent transition-colors"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add/Edit Reminder Form */}
                  {isAddingReminder ? (
                    <div className="bg-neu-base p-4 rounded-xl shadow-neu-pressed animate-in fade-in slide-in-from-top-2">
                      <h4 className="text-sm font-bold text-gray-500 mb-3">
                        {editingReminderId ? 'עריכת תזכורת' : 'תזכורת חדשה'}
                      </h4>

                      <div className="flex gap-4 mb-4">
                        <input
                          type="time"
                          value={newReminderTime}
                          onChange={(e) => setNewReminderTime(e.target.value)}
                          className="flex-1 bg-neu-base shadow-neu-inner p-3 rounded-xl text-center font-mono text-lg outline-none focus:ring-2 focus:ring-neu-accent/50"
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
                            className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${newReminderDays.includes(idx) ? 'bg-neu-accent text-white shadow-md scale-110' : 'bg-neu-base text-gray-400 shadow-neu-flat'}`}
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
                          className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          ביטול
                        </button>
                        <button
                          onClick={handleSaveReminder}
                          className="flex-1 py-2 bg-neu-accent text-white rounded-lg shadow-md hover:brightness-110 transition-all"
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
                      className="w-full py-3 flex items-center justify-center gap-2 text-neu-accent font-medium bg-neu-base rounded-xl shadow-neu-flat active:shadow-neu-pressed transition-all"
                    >
                      <Plus size={20} />
                      <span>הוסף תזכורת חדשה</span>
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
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-500 mb-2">הירשם כדי להפעיל תזכורות אישיות</p>
                <button
                  onClick={handleToggleRegistration}
                  className="text-xs text-neu-accent font-bold hover:underline"
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
                  <span className="text-xs text-gray-400">מוזיקה</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400 w-6">0</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={musicVolume}
                      onChange={handleMusicVolumeChange}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-neu-accent"
                    />
                    <span className="text-xs text-gray-400 w-6 text-left">{musicVolume}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 animate-in slide-in-from-top-2 duration-200 delay-75">
                  <span className="text-xs text-gray-400">הדרכה קולית</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400 w-6">0</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={voiceVolume}
                      onChange={handleVoiceVolumeChange}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-neu-accent"
                    />
                    <span className="text-xs text-gray-400 w-6 text-left">{voiceVolume}</span>
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
          <div className="py-4 text-center text-xs text-gray-400">
            Neshima App v1.3
          </div>
        </NeuCard>
      </div>
    </div>
  );
};
