import React, { useState } from 'react';
import { Bell, Sunrise, Sun, Sunset } from 'lucide-react';
import { NeuButton } from '../../components/Neu';
import { NotificationPreference } from '../../types';
import { HapticService } from '../../services/HapticService';

interface NotificationsSetupProps {
    onComplete: (prefs: NotificationPreference) => void;
    onSkip: () => void;
}

export const NotificationsSetup: React.FC<NotificationsSetupProps> = ({ onComplete, onSkip }) => {
    const [preferences, setPreferences] = useState<NotificationPreference>({
        morning: false,
        morningTime: '08:00',
        afternoon: false,
        afternoonTime: '14:00',
        evening: false,
        eveningTime: '20:00'
    });

    const handleToggle = (period: 'morning' | 'afternoon' | 'evening') => {
        HapticService.trigger(15);
        setPreferences(prev => ({
            ...prev,
            [period]: !prev[period]
        }));
    };

    const handleTimeChange = (period: 'morning' | 'afternoon' | 'evening', time: string) => {
        setPreferences(prev => ({
            ...prev,
            [`${period}Time`]: time
        }));
    };

    const handleContinue = () => {
        HapticService.trigger(30);
        onComplete(preferences);
    };

    const hasAnyEnabled = preferences.morning || preferences.afternoon || preferences.evening;

    return (
        <div className="flex flex-col h-full p-6 pb-10">
            {/* Header */}
            <div className="text-center mb-6 mt-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Bell className="icon-primary" />
                    <h1 className="text-h1">תזכורות יומיות</h1>
                </div>
                <p className="text-body">קבל תזכורת לתרגל בזמנים שמתאימים לך</p>
            </div>

            {/* Notification Preview */}
            <div className="glass rounded-2xl p-4 mb-6 border border-white/30">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg glass flex items-center justify-center shrink-0">
                        <Bell className="icon-primary" />
                    </div>
                    <div className="flex-1">
                        <p className="text-body mb-1">נשימה - זמן לתרגל 🌿</p>
                        <p className="text-meta">היי! זמן נהדר לנשום עמוק ולהירגע</p>
                    </div>
                </div>
                <p className="text-meta mt-2 text-center">כך תיראה התזכורת שלך</p>
            </div>

            {/* Time Options */}
            <div className="flex-1 space-y-4 overflow-y-auto">
                {/* Morning */}
                <NotificationOption
                    icon={Sunrise}
                    label="בוקר"
                    enabled={preferences.morning}
                    time={preferences.morningTime}
                    onToggle={() => handleToggle('morning')}
                    onTimeChange={(t) => handleTimeChange('morning', t)}
                />

                {/* Afternoon */}
                <NotificationOption
                    icon={Sun}
                    label="צהריים"
                    enabled={preferences.afternoon}
                    time={preferences.afternoonTime}
                    onToggle={() => handleToggle('afternoon')}
                    onTimeChange={(t) => handleTimeChange('afternoon', t)}
                />

                {/* Evening */}
                <NotificationOption
                    icon={Sunset}
                    label="ערב"
                    enabled={preferences.evening}
                    time={preferences.eveningTime}
                    onToggle={() => handleToggle('evening')}
                    onTimeChange={(t) => handleTimeChange('evening', t)}
                />
            </div>

            {/* Buttons */}
            <div className="space-y-3 mt-6">
                <NeuButton onClick={handleContinue} className="w-full h-14">
                    <span className="text-h2">{hasAnyEnabled ? 'שמור והמשך' : 'המשך ללא תזכורות'}</span>
                </NeuButton>

                <button onClick={onSkip} className="w-full text-meta py-3 hover-soft">
                    דלג לעכשיו
                </button>
            </div>
        </div>
    );
};

// Helper Component
const NotificationOption: React.FC<{
    icon: any;
    label: string;
    enabled: boolean;
    time: string;
    onToggle: () => void;
    onTimeChange: (time: string) => void;
}> = ({ icon: Icon, label, enabled, time, onToggle, onTimeChange }) => {
    return (
        <div className="glass rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <Icon className="icon-primary" strokeWidth={1.5} />
                    <span className="text-body">{label}</span>
                </div>
                <button
                    onClick={onToggle}
                    className="w-12 h-7 rounded-full transition-all relative glass"
                >
                    <div
                        className={`absolute top-1 w-5 h-5 rounded-full glass transition-all ${enabled ? 'left-6' : 'left-1'
                            }`}
                    />
                </button>
            </div>

            {enabled && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => onTimeChange(e.target.value)}
                        className="w-full bg-neu-base shadow-neu-inner rounded-xl p-3 text-center text-h2 outline-none"
                        dir="ltr"
                    />
                </div>
            )}
        </div>
    );
};
