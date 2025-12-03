import React, { useState, useRef } from 'react';
import { CheckCircle2, Circle, ScrollText } from 'lucide-react';
import { NeuButton } from '../../components/Neu';
import { HapticService } from '../../services/HapticService';

interface TermsScreenProps {
    onAccept: () => void;
}

// טקסט תקנון placeholder - להחלפה בתקנון אמיתי בעתיד
const TERMS_TEXT = `
# תנאי שימוש ומדיניות פרטיות

## כללי
ברוכים הבאים לאפליקציית נשימה. אפליקציה זו מספקת תרגילי נשימה להרגעה ומיקוד.

## איסוף מידע
האפליקציה שומרת מידע מקומי במכשיר שלך בלבד, כולל:
- העדפות אישיות
- היסטוריית תרגולים
- הגדרות התראות

## שימוש במידע
המידע נשמר באופן מקומי ואינו נשלח לשרת חיצוני. המידע משמש לצורך:
- מעקב אחר התקדמותך
- התאמה אישית של חוויית המשתמש
- שליחת תזכורות מקומיות

## אבטחת מידע
המידע שלך מאובטח במכשיר שלך. אנו ממליצים
לשמור על הגדרות אבטחה מעודכנות במכשיר.

## עדכוני מדיניות
אנו שומרים לעצמנו את הזכות לעדכן מדיניות זו.
שינויים יפורסמו באפליקציה.

## יצירת קשר
לשאלות או הבהרות ניתן ליצור קשר דרך
ההגדרות באפליקציה.

---

**גרסה זו היא להדגמה בלבד ואינה מהווה תקנון משפטי מלא.**
`.trim();

export const TermsScreen: React.FC<TermsScreenProps> = ({ onAccept }) => {
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [hasAccepted, setHasAccepted] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrolledToBottom =
            container.scrollHeight - container.scrollTop <= container.clientHeight + 50; // 50px tolerance

        if (scrolledToBottom && !hasScrolledToBottom) {
            setHasScrolledToBottom(true);
            HapticService.trigger(10);
        }
    };

    const handleCheckboxToggle = () => {
        if (hasScrolledToBottom) {
            setHasAccepted(!hasAccepted);
            HapticService.trigger(20);
        }
    };

    const handleContinue = () => {
        if (hasAccepted) {
            HapticService.trigger(30);
            onAccept();
        }
    };

    return (
        <div className="flex flex-col h-full p-6 pb-10">
            {/* Header */}
            <div className="text-center mb-6 mt-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <ScrollText className="icon-primary" />
                    <h1 className="text-h1">תנאי שימוש</h1>
                </div>
                <p className="text-meta">קרא בעיון ואשר להמשך</p>
            </div>

            {/* Terms Content */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 glass rounded-2xl p-6 mb-6 overflow-y-auto"
            >
                <div className="prose prose-sm max-w-none text-body leading-relaxed whitespace-pre-wrap">
                    {TERMS_TEXT}
                </div>
            </div>

            {/* Scroll Indicator */}
            {!hasScrolledToBottom && (
                <div className="text-center mb-4 animate-pulse">
                    <p className="text-meta">↓ גלול למטה לקריאה מלאה ↓</p>
                </div>
            )}

            {/* Checkbox */}
            <button
                onClick={handleCheckboxToggle}
                disabled={!hasScrolledToBottom}
                className={`flex items-center gap-3 p-4 rounded-xl mb-4 transition-all glass ${hasScrolledToBottom ? 'hover-soft cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
            >
                {hasAccepted ? (
                    <CheckCircle2 className="icon-primary" strokeWidth={2} />
                ) : (
                    <Circle className="icon-secondary" strokeWidth={2} />
                )}
                <span className="text-body flex-1 text-right">
                    קראתי ואני מסכים לתנאי השימוש ומדיניות הפרטיות
                </span>
            </button>

            {/* Continue Button */}
            <NeuButton
                onClick={handleContinue}
                disabled={!hasAccepted}
                className={`w-full h-14 ${!hasAccepted && 'opacity-50'}`}
            >
                <span className="text-h2">המשך</span>
            </NeuButton>
        </div>
    );
};
