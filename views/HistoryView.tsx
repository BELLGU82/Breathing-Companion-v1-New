import React, { useEffect, useState } from 'react';
import { BarChart2, Activity, Calendar, MailCheck } from 'lucide-react';
import { NeuCard, NeuButton } from '../components/Neu';
import { StorageService } from '../services/StorageService';
import { SessionStats, Session } from '../types';
import { useNavigate } from 'react-router-dom';

export const HistoryView: React.FC = () => {
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);
  const [stats, setStats] = useState<SessionStats>({ totalSessions: 0, totalMinutes: 0, streak: 0, lastSevenDaysActivity: [0,0,0,0,0,0,0] });
  const [history, setHistory] = useState<Session[]>([]);

  useEffect(() => {
    const registered = StorageService.isRegistered();
    setIsRegistered(registered);

    if (registered) {
      const currentStats = StorageService.getStats();
      setStats(currentStats);
      // Get last 5 sessions
      const allSessions = StorageService.getSessions();
      setHistory(allSessions.slice(-5).reverse());
    }
  }, []);

  const weekDays = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
  
  // Calculate max value for chart scaling (min 5 minutes to show small counts visibly)
  const maxChartValue = Math.max(...stats.lastSevenDaysActivity, 5);

  if (!isRegistered) {
    return (
      <div className="flex flex-col h-full p-6 space-y-8 overflow-y-auto pb-24 items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-neu-base shadow-neu-flat flex items-center justify-center mb-4">
          <MailCheck strokeWidth={1} className="icon-primary" />
        </div>
        <h2 className="text-h1">התקדמות אישית</h2>
        <p className="text-body max-w-xs">
          התחבר כדי לעקוב אחר רצף התרגולים שלך, דקות תרגול שבועיות והיסטוריית סשנים.
        </p>
        <NeuButton onClick={() => navigate('/settings')} className="w-full max-w-xs">
          הרשם / התחבר
        </NeuButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto pb-24">
      <header className="mt-2">
        <h1 className="text-h1">ההתקדמות שלך</h1>
        <p className="text-body">
          {stats.streak > 0 ? `רצף של ${stats.streak} ימים! כל הכבוד.` : 'בוא נתחיל רצף חדש היום.'}
        </p>
      </header>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <NeuCard className="flex flex-col items-center justify-center p-4">
          <div className="mb-2"><Activity strokeWidth={1} className="icon-primary" /></div>
          <span className="text-h1">{stats.totalMinutes}</span>
          <span className="text-meta">דקות (7 ימים)</span>
        </NeuCard>
        <NeuCard className="flex flex-col items-center justify-center p-4">
          <div className="mb-2"><Calendar strokeWidth={1} className="icon-primary" /></div>
          <span className="text-h1">{stats.streak}</span>
          <span className="text-meta">ימי רצף</span>
        </NeuCard>
      </div>

      {/* Chart */}
      <NeuCard>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-h2 flex items-center gap-2">
            <BarChart2 strokeWidth={1} className="icon-secondary" />
            פעילות שבועית
          </h3>
          <span className="text-meta">7 ימים אחרונים (דקות)</span>
        </div>
        
        <div className="flex items-end justify-between h-32 px-2">
          {weekDays.map((day, idx) => {
            const value = stats.lastSevenDaysActivity[idx];
            // If value is 0, show 0 height (invisible), else scale it
            const heightPercentage = value === 0 ? 0 : Math.max(5, Math.min(100, (value / maxChartValue) * 100));

            return (
              <div key={idx} className="flex flex-col items-center gap-2 group w-full">
                <div className="relative w-2 bg-neu-base shadow-neu-pressed rounded-full h-24 flex items-end overflow-hidden">
                  <div 
                    style={{ height: `${heightPercentage}%` }} 
                    className={`w-full rounded-full transition-all duration-500 ${value > 0 ? 'bg-neu-dark' : 'bg-transparent'}`}
                    title={`${value} דקות`}
                  />
                </div>
                <span className="text-meta">{day}</span>
              </div>
            );
          })}
        </div>
      </NeuCard>

      {/* Recent List */}
      <div>
        <h2 className="text-h2 mb-4">היסטוריה אחרונה</h2>
        <div className="space-y-4">
          {history.length === 0 ? (
             <div className="text-center text-body py-4">עדיין לא תורגלו סשנים</div>
          ) : (
            history.map((session) => (
               <NeuCard key={session.id} className="!p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-h2">{session.patternName}</h4>
                    <span className="text-meta">
                      {new Date(session.timestamp).toLocaleDateString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="text-body">
                    {Math.floor(session.durationSeconds / 60)}:{String(session.durationSeconds % 60).padStart(2, '0')} דק׳
                  </span>
               </NeuCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
