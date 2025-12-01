
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sliders, X, Plus, Trash2, Play, Heart, Check, List, Lock } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { NeuCard, NeuButton, NeuIconButton } from '../components/Neu';
import { StorageService } from '../services/StorageService';
import { BreathingPattern } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

// Helper component for sunken icons
const InsetIconWrapper = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => (
  <div className={`w-8 h-8 rounded-full bg-neu-base shadow-[inset_2px_2px_4px_var(--neu-shadow-inset-dark),inset_-2px_-2px_4px_var(--neu-shadow-inset-light)] flex items-center justify-center shrink-0 ${className}`}>
    {children}
  </div>
);

export const BreatheView: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoginGate, setShowLoginGate] = useState(false);
  const location = useLocation();
  const [lastSavedPatternId, setLastSavedPatternId] = useState<string | null>(null);
  const [editingPatternId, setEditingPatternId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    reps: 10
  });

  useEffect(() => {
    // Auto-close gate if registered (fixes issue when returning from profile)
    if (StorageService.isRegistered()) {
      setShowLoginGate(false);
    }
  }, [isModalOpen]); // Refresh when modal opens/closes

  useEffect(() => {
    // Check for edit mode
    if (location.state && location.state.editPatternId) {
      const patternId = location.state.editPatternId;
      const pattern = StorageService.getCustomPattern(patternId);
      if (pattern) {
        setEditingPatternId(patternId);
        setFormData({
          name: pattern.name,
          inhale: pattern.phases.inhale,
          holdIn: pattern.phases.holdIn,
          exhale: pattern.phases.exhale,
          holdOut: pattern.phases.holdOut,
          reps: pattern.reps || 10
        });
        setIsModalOpen(true);
      }
      // Clear state so we don't re-open on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const getIconClass = (id: string) => {
    switch (id) {
      case 'morning': return 'icon-morning';
      case 'focus': return 'icon-focus';
      case 'regulate': return 'icon-regulate';
      case 'sleep': return 'icon-sleep';
      default: return '';
    }
  };

  const getHoverClass = (id: string) => {
    switch (id) {
      case 'morning': return 'hover:bg-amber-50 dark:hover:bg-amber-900/20';
      case 'focus': return 'hover:bg-blue-50 dark:hover:bg-blue-900/20';
      case 'regulate': return 'hover:bg-teal-50 dark:hover:bg-teal-900/20';
      case 'sleep': return 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20';
      default: return 'hover:bg-gray-50 dark:hover:bg-gray-800/50';
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'name' ? value : Number(value)
    }));
  };

  const handleCustomClick = () => {
    // Check directly from service to ensure fresh state
    const isRegistered = StorageService.isRegistered();

    if (isRegistered) {
      setShowLoginGate(false);
      setIsModalOpen(true);
    } else {
      setShowLoginGate(true);
    }
  };

  const handleSavePattern = () => {
    if (!formData.name.trim()) return;

    const cycleDuration = Number(formData.inhale) + Number(formData.holdIn) + Number(formData.exhale) + Number(formData.holdOut);
    const totalDuration = cycleDuration * Number(formData.reps);

    const newPatternId = `custom_${Date.now()}`;
    const newPattern: BreathingPattern = {
      id: newPatternId,
      name: formData.name,
      description: 'תרגול מותאם אישית',
      instruction: 'שאיפה ונשיפה בהתאם לקצב שקבעת.',
      benefits: 'תרגול מותאם אישית.',
      recommendedDuration: totalDuration,
      reps: Number(formData.reps), // Explicitly save reps
      phases: {
        inhale: Number(formData.inhale),
        holdIn: Number(formData.holdIn),
        exhale: Number(formData.exhale),
        holdOut: Number(formData.holdOut)
      }
    };

    if (editingPatternId) {
      // Update existing
      const updatedPattern: BreathingPattern = {
        ...newPattern,
        id: editingPatternId
      };
      StorageService.updateCustomPattern(updatedPattern);
      setLastSavedPatternId(editingPatternId);
    } else {
      // Create new
      StorageService.saveCustomPattern(newPattern);
      setLastSavedPatternId(newPatternId);
    }

    // Show success screen
    // setLastSavedPatternId is handled above

    // Reset form
    setFormData({
      name: '',
      inhale: 4,
      holdIn: 4,
      exhale: 4,
      holdOut: 4,
      reps: 10
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setLastSavedPatternId(null);
    setEditingPatternId(null);
    setFormData({
      name: '',
      inhale: 4,
      holdIn: 4,
      exhale: 4,
      holdOut: 4,
      reps: 10
    });
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto pb-24 relative">
      <header className="mt-2">
        <h1 className="text-2xl font-bold text-neu-text">לנשום</h1>
        <p className="text-sm text-gray-500">בחר את סוג התרגול המתאים לך כרגע</p>
      </header>

      {/* Categories List */}
      <div className="flex flex-col space-y-4 w-full">
        {CATEGORIES.map((category) => (
          <div
            key={category.id}
            className={`
              w-full h-24 relative overflow-hidden
              flex items-center px-6
              rounded-2xl bg-neu-base shadow-neu-flat cursor-pointer
              transition-all duration-300 ease-out
              active:scale-98 active:shadow-neu-pressed
              hover-animate group
              ${getHoverClass(category.id)}
            `}
            onClick={() => navigate(`/category/${category.id}`)}
          >
            {/* Icon on the Right (First in RTL flow) */}
            <div className={`ml-6 transition-transform duration-300 flex-shrink-0 ${getIconClass(category.id)}`}>
              <category.icon size={32} strokeWidth={1} className="text-neu-text" />
            </div>

            {/* Text Content */}
            <div className="flex flex-col items-start justify-center">
              <span className="text-neu-text font-bold text-xl leading-none mb-1">
                {category.name}
              </span>
              <span className="text-xs text-gray-500 font-medium leading-tight">
                {category.description}
              </span>
            </div>
          </div>
        ))}

        {/* Custom Card (Create New) */}
        <div
          className={`
            w-full h-24 relative overflow-hidden
            flex items-center px-6
            rounded-2xl bg-neu-base shadow-neu-flat cursor-pointer
            transition-all duration-300 ease-out
            active:scale-98 active:shadow-neu-pressed
            hover:bg-gray-50 dark:hover:bg-gray-800/50 group
          `}
          onClick={handleCustomClick}
        >
          <div className="ml-6 transition-transform duration-300 flex-shrink-0 relative">
            <Sliders size={32} strokeWidth={1} className="text-neu-text" />
            {!StorageService.isRegistered() && (
              <div className="absolute -top-1 -right-1 bg-neu-base rounded-full p-1 shadow-neu-flat">
                <Lock size={12} className="text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex flex-col items-start justify-center">
            <span className="text-neu-text font-bold text-xl leading-none mb-1 flex items-center gap-2">
              להתאים לבד
              {!StorageService.isRegistered() && <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">נעול</span>}
            </span>
            <span className="text-xs text-gray-500 font-medium leading-tight">
              צור תרגיל אישי חדש
            </span>
          </div>
        </div>
      </div>

      {/* Login Gate Modal */}
      <AnimatePresence>
        {showLoginGate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowLoginGate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-neu-base rounded-2xl p-8 shadow-neu-flat w-full max-w-sm border border-white/50 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-neu-base shadow-neu-flat flex items-center justify-center text-neu-text relative">
                  <div className="absolute inset-0 bg-neu-convex rounded-full opacity-50"></div>
                  <Lock size={32} strokeWidth={1} color="#4a5568" className="relative z-10" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-neu-text">צריך להתחבר</h2>
                  <p className="text-gray-500 text-sm leading-relaxed px-2">
                    כדי ליצור תרגילים אישיים, נדרשת התחברות לחשבון.
                  </p>
                </div>

                <div className="flex flex-col w-full gap-3 pt-2">
                  <NeuButton
                    onClick={() => navigate('/profile')}
                    className="w-full !bg-neu-accent !text-white shadow-lg h-12"
                  >
                    להתחברות
                  </NeuButton>
                  <NeuButton
                    onClick={() => setShowLoginGate(false)}
                    className="w-full text-gray-500 h-12"
                  >
                    אולי אחר כך
                  </NeuButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-neu-base flex flex-col h-full w-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 shrink-0 z-10 bg-neu-base">
              <h2 className="text-xl font-bold text-neu-text flex items-center gap-3">
                <InsetIconWrapper>
                  <Sliders size={18} strokeWidth={1} color="#4a5568" />
                </InsetIconWrapper>
                תרגול מותאם אישית
              </h2>
              <NeuIconButton onClick={handleCloseModal} className="w-10 h-10">
                <InsetIconWrapper>
                  <X size={18} strokeWidth={1} color="#4a5568" />
                </InsetIconWrapper>
              </NeuIconButton>
            </div>

            <div className="flex-1 flex flex-col justify-center px-6 pb-20">
              {!lastSavedPatternId ? (
                // FORM VIEW
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-500 mr-1 block">שם התרגיל</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="לדוגמה: נשימת לילה"
                      className="w-full bg-neu-base shadow-[inset_3px_3px_6px_var(--neu-shadow-inset-dark),inset_-3px_-3px_6px_var(--neu-shadow-inset-light)] rounded-xl p-4 outline-none text-neu-text text-lg focus:ring-2 focus:ring-neu-accent/20 transition-all text-center placeholder-gray-400"
                      autoFocus
                    />
                  </div>

                  {/* Horizontal Timing Row */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-500 mr-1 block text-center">זמני מחזור (שניות)</label>
                    <div className="flex items-center justify-between gap-3 bg-neu-base shadow-neu-flat rounded-2xl p-4">
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">שאיפה</span>
                        <input
                          type="number" min="1" max="60"
                          value={formData.inhale}
                          onChange={(e) => handleInputChange('inhale', e.target.value)}
                          className="w-full aspect-square bg-neu-base shadow-[inset_2px_2px_4px_var(--neu-shadow-inset-dark),inset_-2px_-2px_4px_var(--neu-shadow-inset-light)] rounded-xl outline-none text-neu-text text-center font-mono font-bold text-lg p-0 flex items-center justify-center"
                        />
                      </div>
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">החזקה</span>
                        <input
                          type="number" min="0" max="60"
                          value={formData.holdIn}
                          onChange={(e) => handleInputChange('holdIn', e.target.value)}
                          className="w-full aspect-square bg-neu-base shadow-[inset_2px_2px_4px_var(--neu-shadow-inset-dark),inset_-2px_-2px_4px_var(--neu-shadow-inset-light)] rounded-xl outline-none text-neu-text text-center font-mono font-bold text-lg p-0 flex items-center justify-center"
                        />
                      </div>
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">נשיפה</span>
                        <input
                          type="number" min="1" max="60"
                          value={formData.exhale}
                          onChange={(e) => handleInputChange('exhale', e.target.value)}
                          className="w-full aspect-square bg-neu-base shadow-[inset_2px_2px_4px_var(--neu-shadow-inset-dark),inset_-2px_-2px_4px_var(--neu-shadow-inset-light)] rounded-xl outline-none text-neu-text text-center font-mono font-bold text-lg p-0 flex items-center justify-center"
                        />
                      </div>
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">החזקה</span>
                        <input
                          type="number" min="0" max="60"
                          value={formData.holdOut}
                          onChange={(e) => handleInputChange('holdOut', e.target.value)}
                          className="w-full aspect-square bg-neu-base shadow-[inset_2px_2px_4px_var(--neu-shadow-inset-dark),inset_-2px_-2px_4px_var(--neu-shadow-inset-light)] rounded-xl outline-none text-neu-text text-center font-mono font-bold text-lg p-0 flex items-center justify-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="text-sm font-bold text-gray-500 mr-1 block text-center">מספר חזרות</label>
                    <div className="flex justify-center">
                      <input
                        type="number"
                        min="1" max="100"
                        value={formData.reps}
                        onChange={(e) => handleInputChange('reps', e.target.value)}
                        className="w-24 bg-neu-base shadow-[inset_3px_3px_6px_var(--neu-shadow-inset-dark),inset_-3px_-3px_6px_var(--neu-shadow-inset-light)] rounded-xl p-3 outline-none text-neu-text text-center font-mono text-xl font-bold"
                      />
                    </div>
                  </div>

                  <div className="pt-8">
                    <NeuButton
                      onClick={handleSavePattern}
                      className="w-full flex items-center justify-center gap-2 h-14"
                      disabled={!formData.name}
                    >
                      <InsetIconWrapper>
                        <Plus size={18} strokeWidth={1} color="#4a5568" />
                      </InsetIconWrapper>
                      <span className="text-neu-text font-bold text-lg">שמור תרגיל</span>
                    </NeuButton>
                  </div>
                </div>
              ) : (
                // SUCCESS VIEW
                <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-24 h-24 rounded-full bg-neu-base shadow-neu-flat flex items-center justify-center text-emerald-500">
                    <Check size={48} strokeWidth={2} />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-neu-text">התרגיל נשמר!</h2>
                    <p className="text-gray-500">התרגיל האישי שלך מוכן לשימוש.</p>
                  </div>

                  <div className="flex flex-row gap-4 w-full pt-4">
                    <NeuButton
                      onClick={() => navigate('/category/custom')}
                      className="flex-1 flex flex-col items-center justify-center gap-2 py-4 h-auto"
                    >
                      <List size={24} strokeWidth={1} />
                      <span className="text-sm font-bold">לרשימת תרגילים</span>
                    </NeuButton>

                    <NeuButton
                      onClick={() => navigate(`/session/${lastSavedPatternId}`)}
                      className="flex-1 flex flex-col items-center justify-center gap-2 py-4 h-auto !bg-neu-base !text-neu-accent shadow-neu-pressed"
                    >
                      <Play size={24} strokeWidth={1} fill="currentColor" />
                      <span className="text-sm font-bold">לנסות עכשיו</span>
                    </NeuButton>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
