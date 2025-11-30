import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BREATHING_PATTERNS, MOTIVATIONAL_QUOTES } from '../constants';
import { NeuCard } from '../components/Neu';
import { Ghost, Play, Heart, Sliders } from 'lucide-react';
import { StorageService } from '../services/StorageService';
import { Session } from '../types';

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
  }, []);

  const getResumeTitle = () => "המשך מאיפה שהפסקת";

  return (
    <div className="flex flex-col h-full p-6 space-y-8 overflow-y-auto pb-24">
      {/* Header */}
      <header className="flex justify-between items-center mt-2">
        <div>
          <h1 className="text-2xl font-bold text-neu-text">שלום, אורח</h1>
          <p className="text-sm text-gray-500">ברוך הבא למרחב הנשימה שלך.</p>
        </div>
        <div 
          onClick={() => navigate('/profile')}
          className="w-12 h-12 rounded-full shadow-neu-flat flex items-center justify-center cursor-pointer active:shadow-neu-pressed text-neu-text transition-all duration-200"
        >
           <Ghost size={20} strokeWidth={1} className="text-neu-text" />
        </div>
      </header>

      {/* Daily Quote Card - Inset Neumorphic Style */}
      <div className="bg-neu-base rounded-2xl p-6 shadow-[inset_3px_3px_6px_var(--neu-shadow-inset-dark),inset_-3px_-3px_6px_var(--neu-shadow-inset-light)] flex items-center justify-center text-center">
         <p className="text-neu-text/80 text-sm font-medium italic leading-relaxed">
             "{quote}"
         </p>
      </div>

      {/* Shortcuts Grid */}
      <div className="grid grid-cols-2 gap-4">
          <div 
             onClick={() => navigate('/category/favorites')}
             className="bg-neu-base rounded-2xl shadow-neu-flat p-6 flex flex-col items-center justify-center gap-3 cursor-pointer active:shadow-neu-pressed transition-all duration-200 aspect-square"
          >
             <Heart size={32} strokeWidth={1} className="text-[#4a5568] dark:text-[#a3b1c6]" />
             <span className="text-neu-text font-bold text-lg">מועדפים</span>
          </div>
          
          <div 
             onClick={() => navigate('/category/custom')}
             className="bg-neu-base rounded-2xl shadow-neu-flat p-6 flex flex-col items-center justify-center gap-3 cursor-pointer active:shadow-neu-pressed transition-all duration-200 aspect-square"
          >
             <Sliders size={32} strokeWidth={1} className="text-[#4a5568] dark:text-[#a3b1c6]" />
             <span className="text-neu-text font-bold text-lg text-center leading-tight">תרגילים אישיים</span>
          </div>
      </div>

      {/* Resume Section - ONLY if interrupted session exists */}
      {interruptedSession && BREATHING_PATTERNS[interruptedSession.patternId] && (
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-lg font-bold text-neu-text mb-4">{getResumeTitle()}</h2>
          <NeuCard className="flex items-center space-x-4 space-x-reverse cursor-pointer active:scale-[0.99] transition-transform" onClick={() => navigate(`/session/${interruptedSession.patternId}`)}>
            <div className="w-12 h-12 rounded-full bg-neu-base shadow-neu-pressed flex items-center justify-center text-neu-accent">
              <Play size={20} fill="currentColor" strokeWidth={1} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-neu-text">{BREATHING_PATTERNS[interruptedSession.patternId].name}</h3>
              <p className="text-xs text-gray-500">
                {interruptedSession.durationSeconds > 60 
                  ? `${Math.floor(interruptedSession.durationSeconds / 60)} דקות` 
                  : `${interruptedSession.durationSeconds} שניות`
                } • לא הושלם
              </p>
            </div>
            <button className="text-neu-accent font-bold text-sm">המשך</button>
          </NeuCard>
        </div>
      )}

      {/* Empty State if no resume */}
      {!interruptedSession && (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
              <div className="w-24 h-24 rounded-full bg-neu-base shadow-neu-flat flex items-center justify-center mb-4">
                  <Ghost size={32} strokeWidth={1} className="text-neu-text/50" />
              </div>
              <p className="text-sm text-gray-500">אין סשנים פעילים כרגע.</p>
              <button onClick={() => navigate('/breathe')} className="mt-4 text-neu-accent text-sm font-bold">התחל תרגול חדש</button>
          </div>
      )}
    </div>
  );
};