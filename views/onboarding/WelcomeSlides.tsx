import React, { useState } from 'react';
import { ChevronLeft, Wind, Heart, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeuButton } from '../../components/Neu';

interface WelcomeSlidesProps {
    onNext: () => void;
    onSkip: () => void;
}

const slides = [
    {
        icon: Wind,
        title: 'נשימה. רוגע. מיקוד.',
        subtitle: 'תרגילי נשימה מבוססי מדע שמשפרים רוגע, מיקוד ואיכות שינה בכל רגע ביום.'
    },
    {
        icon: Heart,
        title: 'הרגשת השינוי תוך דקות.',
        subtitle: 'בוקר · מיקוד · הרגעה · שינה',
        description: 'בוחרים מצב והתרגיל עושה את שלו.'
    },
    {
        icon: TrendingUp,
        title: 'עוקבים, מתקדמים, מתחזקים',
        subtitle: 'יצירת הרגל יומי, מעקב אחר רצף ופתיחת תובנות שיעזרו לראות שינוי אמיתי לאורך זמן.'
    }
];

export const WelcomeSlides: React.FC<WelcomeSlidesProps> = ({ onNext, onSkip }) => {
    const [activeSlide, setActiveSlide] = useState(0);

    const handleNext = () => {
        if (activeSlide < slides.length - 1) {
            setActiveSlide(activeSlide + 1);
        } else {
            onNext();
        }
    };

    const handleDotClick = (index: number) => {
        setActiveSlide(index);
    };

    const currentSlide = slides[activeSlide];
    const Icon = currentSlide.icon;

    return (
        <div className="flex flex-col h-full p-6 pb-10">
            {/* Skip Button */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={onSkip}
                    className="text-meta px-4 py-2 hover-soft"
                >
                    דלג
                </button>
            </div>

            {/* Slides Content */}
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSlide}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center space-y-6"
                    >
                        {/* Icon */}
                        <div className="w-32 h-32 rounded-full bg-neu-base shadow-neu-flat flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full bg-neu-base shadow-neu-pressed flex items-center justify-center">
                                <Icon className="icon-primary" size={48} strokeWidth={1.5} />
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="space-y-3 max-w-sm">
                            <h1 className="text-h1">{currentSlide.title}</h1>
                            <p className="text-body">{currentSlide.subtitle}</p>
                            <p className="text-meta leading-relaxed">{currentSlide.description}</p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center items-center gap-2 mb-6">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => handleDotClick(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${index === activeSlide ? 'w-8 bg-neu-dark shadow-neu-pressed' : 'w-2 bg-neu-base shadow-neu-flat'
                            }`}
                        aria-label={`Slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Next Button */}
            <NeuButton
                onClick={handleNext}
                className="w-full h-14 flex items-center justify-center gap-2"
            >
                <span className="text-h2">{activeSlide < slides.length - 1 ? 'המשך' : 'בואו נתחיל'}</span>
                <ChevronLeft className="icon-secondary" strokeWidth={2} />
            </NeuButton>
        </div>
    );
};
