
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
        <h1 className="text-h1">לנשום</h1>
        <p className="text-meta">בחר את סוג התרגול המתאים לך כרגע</p>
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
              hover-animate group hover-soft
            `}
            onClick={() => navigate(`/category/${category.id}`)}
          >
            {/* Icon on the Right (First in RTL flow) */}
            <div className={`ml-6 transition-transform duration-300 flex-shrink-0 ${getIconClass(category.id)}`}>
              <category.icon strokeWidth={1} className="icon-primary" />
            </div>

            {/* Text Content */}
            <div className="flex flex-col items-start justify-center">
              <span className="text-h1 leading-none mb-1">
                {category.name}
              </span>
              <span className="text-body leading-tight">
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
            group hover-soft
          `}
          onClick={handleCustomClick}
        >
          <div className="ml-6 transition-transform duration-300 flex-shrink-0 relative">
            <Sliders strokeWidth={1} className="icon-primary" />
            {!StorageService.isRegistered() && (
              <div className="absolute -top-1 -right-1 bg-neu-base rounded-full p-1 shadow-neu-flat">
                <Lock className="icon-secondary" />
              </div>
            )}
          </div>
          <div className="flex flex-col items-start justify-center">
            <span className="text-h1 leading-none mb-1 flex items-center gap-2">
              להתאים לבד
              {!StorageService.isRegistered() && <span className="text-meta px-2 py-0.5 rounded-full">נעול</span>}
            </span>
            <span className="text-body leading-tight">
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
                <div className="w-20 h-20 rounded-full bg-neu-base shadow-neu-flat flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-neu-convex rounded-full opacity-50"></div>
                  <Lock strokeWidth={1} className="icon-primary relative z-10" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-h1">צריך להתחבר</h2>
                  <p className="text-body leading-relaxed px-2">
                    כדי ליצור תרגילים אישיים, נדרשת התחברות לחשבון.
                  </p>
                </div>

                <div className="flex flex-col w-full gap-3 pt-2">
                  <NeuButton
                    onClick={() => navigate('/profile')}
                    className="w-full shadow-lg h-12"
                  >
                    להתחברות
                  </NeuButton>
                  <NeuButton
                    onClick={() => setShowLoginGate(false)}
                    className="w-full text-meta h-12"
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
              <h2 className="text-h1 flex items-center gap-3">
                <InsetIconWrapper>
                  <Sliders strokeWidth={1} className="icon-primary" />
                </InsetIconWrapper>
                תרגול מותאם אישית
              </h2>
              <NeuIconButton onClick={handleCloseModal} className="w-10 h-10">
                <InsetIconWrapper>
                  <X strokeWidth={1} className="icon-secondary" />
                </InsetIconWrapper>
              </NeuIconButton>
            </div>

            <div className="flex-1 flex flex-col justify-center px-6 pb-20">
              {!lastSavedPatternId ? (
                // FORM VIEW
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                  <div className="space-y-3">
                    <label className="text-body mr-1 block">שם התרגיל</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="לדוגמה: נשימת לילה"
                      className="w-full bg-neu-base shadow-[inset_3px_3px_6px_var(--neu-shadow-inset-dark),inset_-3px_-3px_6px_var(--neu-shadow-inset-light)] rounded-xl p-4 outline-none text-h2 transition-all text-center"
                      autoFocus
                    />
                  </div>

                  {/* Horizontal Timing Row */}
                  <div className="space-y-3">
                    <label className="text-body mr-1 block text-center">זמני מחזור (שניות)</label>
                    <div className="flex items-center justify-between gap-3 bg-neu-base shadow-neu-flat rounded-2xl p-4">
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <span className="text-[10px] text-meta uppercase">שאיפה</span>
                        <input
                          type="number" min="1" max="60"
                          value={formData.inhale}
                          onChange={(e) => handleInputChange('inhale', e.target.value)}
                          className="w-full aspect-square bg-neu-base shadow-[inset_2px_2px_4px_var(--neu-shadow-inset-dark),inset_-2px_-2px_4px_var(--neu-shadow-inset-light)] rounded-xl outline-none text-h2 text-center font-mono p-0 flex items-center justify-center"
                        />
                      </div>
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <span className="text-[10px] text-meta uppercase">החזקה</span>
                        <input
                          type="number" min="0" max="60"
                          value={formData.holdIn}
                          onChange={(e) => handleInputChange('holdIn', e.target.value)}
                          className="w-full aspect-square bg-neu-base shadow-[inset_2px_2px_4px_var(--neu-shadow-inset-dark),inset_-2px_-2px_4px_var(--neu-shadow-inset-light)] rounded-xl outline-none text-h2 text-center font-mono p-0 flex items-center justify-center"
                        />
                      </div>
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <span className="text-[10px] text-meta uppercase">נשיפה</span>
                        <input
                          type="number" min="1" max="60"
                          value={formData.exhale}
                          onChange={(e) => handleInputChange('exhale', e.target.value)}
                          className="w-full aspect-square bg-neu-base shadow-[inset_2px_2px_4px_var(--neu-shadow-inset-dark),inset_-2px_-2px_4px_var(--neu-shadow-inset-light)] rounded-xl outline-none text-h2 text-center font-mono p-0 flex items-center justify-center"
                        />
                      </div>
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <span className="text-[10px] text-meta uppercase">החזקה</span>
                        <input
                          type="number" min="0" max="60"
                          value={formData.holdOut}
                          onChange={(e) => handleInputChange('holdOut', e.target.value)}
                          className="w-full aspect-square bg-neu-base shadow-[inset_2px_2px_4px_var(--neu-shadow-inset-dark),inset_-2px_-2px_4px_var(--neu-shadow-inset-light)] rounded-xl outline-none text-h2 text-center font-mono p-0 flex items-center justify-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="text-body mr-1 block text-center">מספר חזרות</label>
                    <div className="flex justify-center">
                      <input
                        type="number"
                        min="1" max="100"
                        value={formData.reps}
                        onChange={(e) => handleInputChange('reps', e.target.value)}
                        className="w-24 bg-neu-base shadow-[inset_3px_3px_6px_var(--neu-shadow-inset-dark),inset_-3px_-3px_6px_var(--neu-shadow-inset-light)] rounded-xl p-3 outline-none text-h2 text-center font-mono"
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
                        <Plus strokeWidth={1} className="icon-secondary" />
                      </InsetIconWrapper>
                      <span className="text-h2">שמור תרגיל</span>
                    </NeuButton>
                  </div>
                </div>
              ) : (
                // SUCCESS VIEW
                <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-24 h-24 rounded-full bg-neu-base shadow-neu-flat flex items-center justify-center">
                    <Check strokeWidth={2} className="icon-primary" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-h1">התרגיל נשמר!</h2>
                    <p className="text-body">התרגיל האישי שלך מוכן לשימוש.</p>
                  </div>

                  <div className="flex flex-row gap-4 w-full pt-4">
                    <NeuButton
                      onClick={() => navigate('/category/custom')}
                      className="flex-1 flex flex-col items-center justify-center gap-2 py-4 h-auto"
                    >
                      <List strokeWidth={1} className="icon-secondary" />
                      <span className="text-body">לרשימת תרגילים</span>
                    </NeuButton>

                    <NeuButton
                      onClick={() => navigate(`/session/${lastSavedPatternId}`)}
                      className="flex-1 flex flex-col items-center justify-center gap-2 py-4 h-auto shadow-neu-pressed"
                    >
                      <Play strokeWidth={1} fill="currentColor" className="icon-secondary" />
                      <span className="text-body">לנסות עכשיו</span>
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
