import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BREATHING_PATTERNS, MOTIVATIONAL_QUOTES } from '../constants';
import { NeuCard } from '../components/Neu';
import { Ghost, Play, Heart, Sliders, X } from 'lucide-react';
import { StorageService } from '../services/StorageService';
import { Session, ChartStats, ChartRange } from '../types';
import { ActivityChartCard } from '../components/ui/activity-chart-card';

export const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const [interruptedSession, setInterruptedSession] = useState<Session | null>(null);
  const [quote, setQuote] = useState<string>("");

  useEffect(() => {
    // 1. Get Interrupted Session
    const lastInterrupted = StorageService.getLastInterruptedSession();
    setInterruptedSession(lastInterrupted);

    // 2. Set Daily Quote
    // Simple random quote for now (refresh changes it)
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setQuote(randomQuote);

    // 3. Load Stats if registered
    if (StorageService.isRegistered()) {
      loadStats('weekly');
    }
  }, []);

  // Stats State
  const [chartStats, setChartStats] = useState<ChartStats>({ totalMinutes: 0, totalSessions: 0, data: [] });
  const [selectedRange, setSelectedRange] = useState<ChartRange>('weekly');

  const loadStats = (range: ChartRange) => {
    const stats = StorageService.getChartStats(range);
    setChartStats(stats);
  };

  useEffect(() => {
    if (StorageService.isRegistered()) {
      loadStats(selectedRange);
    }
  }, [selectedRange]);

  const getResumeTitle = () => "המשך מאיפה שהפסקת";

  const handleClearInterruptedSession = (e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.clearLastInterruptedSession();
    setInterruptedSession(null);
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-8 overflow-y-auto pb-24">
      {/* Header */}
      <header className="flex justify-between items-center mt-2">
        <div>
          <h1 className="text-h1">שלום, אורח</h1>
          <p className="text-meta">ברוך הבא למרחב הנשימה שלך.</p>
        </div>
        <div
          onClick={() => navigate('/profile')}
          className="w-12 h-12 rounded-full shadow-neu-flat flex items-center justify-center cursor-pointer active:shadow-neu-pressed transition-all duration-200"
        >
          <Ghost strokeWidth={1} className="icon-primary" />
        </div>
      </header>

      {/* Daily Quote Card - Inset Neumorphic Style */}
      <div className="bg-neu-base rounded-2xl p-6 shadow-[inset_3px_3px_6px_var(--neu-shadow-inset-dark),inset_-3px_-3px_6px_var(--neu-shadow-inset-light)] flex items-center justify-center text-center">
        <p className="text-body leading-relaxed">
          "{quote}"
        </p>
      </div>

      {/* Shortcuts Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div
          onClick={() => navigate('/category/favorites')}
          className="bg-neu-base rounded-2xl shadow-neu-flat p-6 flex flex-col items-center justify-center gap-3 cursor-pointer active:shadow-neu-pressed transition-all duration-200 aspect-square hover-soft"
        >
          <Heart strokeWidth={1} className="icon-primary" />
          <span className="text-h2">מועדפים</span>
        </div>

        <div
          onClick={() => navigate('/category/custom')}
          className="bg-neu-base rounded-2xl shadow-neu-flat p-6 flex flex-col items-center justify-center gap-3 cursor-pointer active:shadow-neu-pressed transition-all duration-200 aspect-square hover-soft"
        >
          <Sliders strokeWidth={1} className="icon-primary" />
          <span className="text-h2 text-center leading-tight">תרגילים אישיים</span>
        </div>
      </div>

      {/* Resume Section - ONLY if interrupted session exists */}
      {interruptedSession && BREATHING_PATTERNS[interruptedSession.patternId] && (
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-h2 mb-4">{getResumeTitle()}</h2>
          <NeuCard className="relative flex items-center space-x-4 space-x-reverse cursor-pointer active:scale-[0.99] transition-transform" onClick={() => navigate(`/session/${interruptedSession.patternId}`)}>
            {/* Close Button INSIDE card */}
            <button
              onClick={handleClearInterruptedSession}
              className="absolute top-2 left-2 p-1.5 rounded-full transition-colors z-10 hover-soft"
            >
              <X className="icon-secondary" />
            </button>

            <div className="w-12 h-12 rounded-full bg-neu-base shadow-neu-pressed flex items-center justify-center shrink-0">
              <Play fill="currentColor" strokeWidth={1} className="icon-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-h2 truncate">{BREATHING_PATTERNS[interruptedSession.patternId].name}</h3>
              <p className="text-meta truncate">
                {interruptedSession.durationSeconds > 60
                  ? `${Math.floor(interruptedSession.durationSeconds / 60)} דקות`
                  : `${interruptedSession.durationSeconds} שניות`
                } • לא הושלם
              </p>
            </div>
            <span className="text-body shrink-0">המשך</span>
          </NeuCard>
        </div>
      )}

      {/* Activity Chart - Only for Registered Users */}
      {StorageService.isRegistered() && (
        <div className="mt-4 animate-in fade-in duration-500">
          <ActivityChartCard
            title="הפעילות שלי"
            totalValue={`${chartStats.totalMinutes} דק'`}
            data={chartStats.data}
            totalSessions={chartStats.totalSessions}
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
            className="w-full bg-neu-base shadow-neu-flat border-none"
          />
        </div>
      )}

      {/* Empty State if no resume */}
      {!interruptedSession && (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
          <div className="w-24 h-24 rounded-full bg-neu-base shadow-neu-flat flex items-center justify-center mb-4">
            <Ghost strokeWidth={1} className="icon-primary" />
          </div>
          <p className="text-meta">אין סשנים פעילים כרגע.</p>
          <button onClick={() => navigate('/breathe')} className="mt-4 text-body hover-soft">התחל תרגול חדש</button>
        </div>
      )}
    </div>
  );
};
