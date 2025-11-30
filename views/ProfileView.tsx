import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ghost, Bell, Moon, Volume2, Shield, Check, VolumeX, Vibrate } from 'lucide-react';
import { NeuCard } from '../components/Neu';
import { ActivityChartCard, ChartRange } from '../components/ui/activity-chart-card';
import { StorageService } from '../services/StorageService';
import { AudioService } from '../services/AudioService';
import { HapticService } from '../services/HapticService';
import { NotificationService } from '../services/NotificationService';
import { ChartStats } from '../types';

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
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(StorageService.getDarkMode());
  const [isRegistered, setIsRegistered] = useState(false);

  // Real Service State
  const [hapticsEnabled, setHapticsEnabled] = useState(HapticService.isEnabled());
  const [soundsEnabled, setSoundsEnabled] = useState(!AudioService.isMuted());
  const [musicVolume, setMusicVolume] = useState(StorageService.getMusicVolume());
  const [voiceVolume, setVoiceVolume] = useState(StorageService.getVoiceVolume());
  const [notificationsEnabled, setNotificationsEnabled] = useState(StorageService.getNotificationsEnabled());

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
    if (newState) {
      loadStats(selectedRange);
    }
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
        className="flex items-center gap-4 cursor-pointer active:scale-95 transition-transform"
        onClick={handleToggleRegistration}
      >
        <div className={`w-16 h-16 rounded-full shadow-neu-pressed flex items-center justify-center ${isRegistered ? 'bg-blue-100 text-blue-500' : 'bg-neu-base text-neu-dark'}`}>
          <Ghost size={32} strokeWidth={1} />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-lg text-neu-text">
            {isRegistered ? 'משתמש רשום' : 'משתמש אורח'}
          </h2>
          <p className="text-sm text-gray-500">
            {isRegistered ? 'הנתונים שלך נשמרים' : 'לחץ כדי להתחבר'}
          </p>
        </div>
        {isRegistered && <Check size={20} className="text-blue-500" strokeWidth={1} />}
      </NeuCard>

      {/* Stats Section with New Component */}
      {isRegistered && (
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
      )}

      {/* Settings List */}
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 mr-2">הגדרות</h3>
        <NeuCard>
          <SettingItem
            icon={Bell}
            label="תזכורות יומיות"
            toggle={handleNotificationsToggle}
            value={notificationsEnabled}
          >
            {notificationsEnabled && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => NotificationService.sendTestNotification()}
                  className="text-xs text-neu-accent hover:underline"
                >
                  שלח תזכורת בדיקה
                </button>
              </div>
            )}
          </SettingItem>
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
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 mr-2">אודות</h3>
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
