import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Heart, Sliders, Play, Trash2 } from 'lucide-react';
import { CATEGORIES, BREATHING_PATTERNS } from '../constants';
import { NeuIconButton } from '../components/Neu';
import { StorageService } from '../services/StorageService';
import { BreathingPattern, Category } from '../types';

export const CategoryView: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Swipe State
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Logic to determine category and exercises
  let category: Partial<Category> | undefined;
  let exercises: BreathingPattern[] = [];

  // Initialize data based on route
  if (categoryId === 'favorites') {
    const favIds = StorageService.getFavorites();
    const customPatterns = StorageService.getCustomPatterns();
    
    // Create a map of all available patterns (builtin + custom)
    const allPatternsMap: Record<string, BreathingPattern> = { ...BREATHING_PATTERNS };
    customPatterns.forEach(p => { allPatternsMap[p.id] = p; });

    exercises = favIds.map(id => allPatternsMap[id]).filter(Boolean);

    category = {
      id: 'favorites',
      name: 'מועדפים',
      description: 'התרגילים שאהבת במיוחד',
      icon: Heart,
      color: 'text-red-500',
      defaultPatternId: '',
      patterns: favIds 
    };
  } else if (categoryId === 'custom') {
    exercises = StorageService.getCustomPatterns();
    
    category = {
      id: 'custom',
      name: 'תרגילים אישיים',
      description: 'תרגילים שיצרת בעצמך',
      icon: Sliders,
      color: 'text-neu-text',
      defaultPatternId: '',
      patterns: exercises.map(p => p.id)
    };
  } else {
    // Normal Category
    const found = CATEGORIES.find(c => c.id === categoryId);
    if (found) {
      category = found;
      exercises = found.patterns.map(pid => BREATHING_PATTERNS[pid]).filter(Boolean);
    }
  }

  useEffect(() => {
    setFavorites(StorageService.getFavorites());
  }, []);

  const handleBack = () => {
      if (categoryId === 'favorites' || categoryId === 'custom') {
          navigate('/');
      } else {
          navigate('/breathe');
      }
  };

  const handleToggleFavorite = (e: React.MouseEvent, patternId: string) => {
    e.stopPropagation();
    const newFavs = StorageService.toggleFavorite(patternId);
    setFavorites(newFavs);
  };

  const handleDeleteCustom = (e: React.MouseEvent, patternId: string) => {
      e.stopPropagation();
      StorageService.deleteCustomPattern(patternId);
      // Force refresh (a bit hacky, but effectively works for this simplified view)
      navigate(0);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const containerCenter = container.getBoundingClientRect().left + container.offsetWidth / 2;
    
    let closestIndex = 0;
    let minDistance = Number.MAX_VALUE;

    Array.from(container.children).forEach((child, index) => {
       const element = child as HTMLElement;
       const rect = element.getBoundingClientRect();
       const childCenter = rect.left + rect.width / 2;
       const distance = Math.abs(containerCenter - childCenter);
       if (distance < minDistance) {
         minDistance = distance;
         closestIndex = index;
       }
    });
    
    if (closestIndex !== activeIndex) {
        setActiveIndex(closestIndex);
    }
  };

  const scrollToCard = (index: number) => {
     if (scrollContainerRef.current) {
        const child = scrollContainerRef.current.children[index] as HTMLElement;
        if (child) {
            child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
        setActiveIndex(index);
     }
  };

  // Touch Handlers for Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    
    if (distance < -minSwipeDistance) {
        // Swipe Right -> Next Card
        if (activeIndex < exercises.length - 1) {
             scrollToCard(activeIndex + 1);
        }
    }
    
    if (distance > minSwipeDistance) {
        // Swipe Left -> Prev Card
        if (activeIndex > 0) {
             scrollToCard(activeIndex - 1);
        }
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const getReps = (pattern: BreathingPattern) => {
      const duration = pattern.recommendedDuration || 120;
      const cycle = pattern.phases.inhale + pattern.phases.holdIn + pattern.phases.exhale + pattern.phases.holdOut;
      return Math.max(1, Math.floor(duration / cycle));
  };

  if (!category) {
    return <div className="p-6">קטגוריה לא נמצאה</div>;
  }

  const CategoryIcon = category.icon || Heart; // Fallback
  
  return (
    <div className="flex flex-col h-full overflow-hidden bg-neu-base">
      
      {/* Header */}
      <div className="flex items-center gap-4 p-6 z-20 shrink-0">
        <NeuIconButton onClick={handleBack} className="w-10 h-10">
          <ChevronRight size={24} />
        </NeuIconButton>
        <div>
            <h1 className="text-2xl font-bold text-neu-text flex items-center gap-2">
                <CategoryIcon size={24} className={category.color || 'text-neu-text'} strokeWidth={1.5} />
                {category.name}
            </h1>
        </div>
      </div>

      {/* Main Content Area (Centered Vertically) */}
      <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0 pb-12">
        
        {exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center opacity-50 px-8 text-center">
             <div className="mb-4 text-gray-400">
                <CategoryIcon size={64} strokeWidth={1} />
             </div>
             <p className="text-gray-500 font-medium text-lg">
                {categoryId === 'favorites' ? 'עדיין לא הוספת תרגילים למועדפים.' : 'לא יצרת עדיין תרגילים אישיים.'}
             </p>
             {categoryId === 'favorites' && (
                <p className="text-xs text-gray-400 mt-2">סמן תרגילים בלב כדי לראות אותם כאן.</p>
             )}
             {categoryId === 'custom' && (
                <button onClick={() => navigate('/breathe')} className="mt-6 text-neu-accent font-bold text-sm">
                   צור תרגיל חדש
                </button>
             )}
          </div>
        ) : (
          <>
            {/* Carousel */}
            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="
                    flex items-center gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth
                    w-full px-[calc(50%-130px)] py-8
                    touch-pan-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
                "
            >
                {exercises.map((exercise, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <div
                      key={exercise.id}
                      onClick={() => navigate(`/session/${exercise.id}`)}
                      className={`
                        relative bg-neu-base rounded-[24px] shadow-neu-flat
                        min-w-[260px] w-[260px] h-[260px] 
                        flex flex-col justify-center items-center p-6 gap-2
                        border border-white/40 cursor-pointer select-none
                        snap-center shrink-0 transition-all duration-300 ease-out
                        ${isActive ? 'scale-100 opacity-100 blur-0' : 'scale-90 opacity-60 blur-[1px]'}
                      `}
                    >
                      {/* 1. Image (Icon) */}
                      <div className="w-16 h-16 rounded-full bg-neu-convex flex items-center justify-center text-neu-accent relative overflow-hidden shrink-0">
                        <div className={`absolute inset-0 opacity-10 ${category?.color?.replace('text-', 'bg-') || 'bg-gray-500'}`}></div>
                        <CategoryIcon size={28} strokeWidth={1.5} className={category?.color || 'text-neu-text'} />
                      </div>

                      {/* 2. Title */}
                      <h2 className="text-lg font-bold text-neu-text leading-tight px-1 text-center">
                          {exercise.name}
                      </h2>

                      {/* 3. Info Badge: Duration | Reps */}
                      <div className="flex justify-center w-full">
                            <span className="inline-block px-3 py-1 rounded-full bg-neu-pressed text-[11px] font-medium text-neu-text/70">
                                {Math.ceil((exercise.recommendedDuration || 120) / 60)} דקות | {getReps(exercise)} חזרות
                            </span>
                      </div>

                      {/* 4. Description */}
                      <div className="w-full overflow-hidden flex items-center justify-center">
                        <p className="text-[13px] text-gray-500 leading-snug px-2 text-center line-clamp-3">
                            {exercise.description}
                        </p>
                      </div>

                      {/* Heart Icon (Bottom Left) - Outline Only */}
                      <div className="absolute bottom-4 left-4 z-20">
                        <button 
                          onClick={(e) => handleToggleFavorite(e, exercise.id)}
                          className="p-2 rounded-full active:scale-90 transition-transform flex items-center justify-center hover:bg-black/5"
                        >
                          <Heart 
                            size={22} 
                            className={`transition-colors duration-200 ${favorites.includes(exercise.id) ? "text-gray-900 dark:text-gray-200" : "text-gray-400"}`}
                            fill="none"
                            strokeWidth={2}
                          />
                        </button>
                      </div>

                      {/* Delete Icon for Custom Exercises (Bottom Right) */}
                      {categoryId === 'custom' && (
                         <div className="absolute bottom-4 right-4 z-20">
                            <button 
                              onClick={(e) => handleDeleteCustom(e, exercise.id)}
                              className="p-2 rounded-full active:scale-90 transition-transform flex items-center justify-center hover:bg-black/5"
                            >
                              <Trash2 
                                size={22} 
                                className="text-red-400"
                                strokeWidth={2}
                              />
                            </button>
                         </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Pagination Dots (approx 15px below cards) */}
            <div className="mt-4 flex justify-center items-center gap-2 z-20 shrink-0">
                {exercises.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => scrollToCard(idx)}
                    className={`
                      h-2 rounded-full transition-all duration-300 cursor-pointer
                      ${idx === activeIndex ? 'w-6 bg-neu-accent shadow-neu-pressed' : 'w-2 bg-gray-300 hover:bg-gray-400'}
                    `}
                    aria-label={`Go to exercise ${idx + 1}`}
                  />
                ))}
            </div>
          </>
        )}
      
      </div>
    </div>
  );
};