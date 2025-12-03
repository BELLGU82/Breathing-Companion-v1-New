import React, { useState } from 'react';
import { Target, TrendingUp } from 'lucide-react';
import { NeuButton } from '../../components/Neu';
import { UserGoal } from '../../types';
import { HapticService } from '../../services/HapticService';
import { motion } from 'framer-motion';

interface GoalSettingProps {
    onComplete: (goal: UserGoal) => void;
    onSkip: () => void;
}

const SUGGESTED_GOALS = [3, 7, 14, 21, 30];

export const GoalSetting: React.FC<GoalSettingProps> = ({ onComplete, onSkip }) => {
    const [targetDays, setTargetDays] = useState(7);

    const handleGoalSelect = (days: number) => {
        HapticService.trigger(15);
        setTargetDays(days);
    };

    const handleComplete = () => {
        HapticService.trigger(30);
        const goal: UserGoal = {
            targetDays,
            createdAt: Date.now()
        };
        onComplete(goal);
    };

    return (
        <div className="flex flex-col h-full p-6 pb-10">
            {/* Header */}
            <div className="text-center mb-8 mt-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="icon-primary" />
                    <h1 className="text-h1">הצב יעד אישי</h1>
                </div>
                <p className="text-body">כמה ימים ברצף תרצה לתרגל?</p>
            </div>

            {/* Goal Visualization */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                {/* Big Number Display */}
                <motion.div
                    key={targetDays}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="relative"
                >
                    <div className="w-48 h-48 rounded-full glass flex items-center justify-center relative overflow-hidden">
                        {/* Inner Circle */}
                        <div className="w-40 h-40 rounded-full glass flex flex-col items-center justify-center">
                            <span className="text-h1 leading-none">{targetDays}</span>
                            <span className="text-body mt-1">ימים</span>
                        </div>

                        {/* Icon */}
                        <div className="absolute top-4 right-4">
                            <TrendingUp className="icon-primary" />
                        </div>
                    </div>
                </motion.div>

                {/* Goal Buttons */}
                <div className="w-full max-w-xs space-y-3">
                    <p className="text-meta text-center mb-2">בחר יעד:</p>
                    <div className="grid grid-cols-5 gap-2">
                        {SUGGESTED_GOALS.map((days) => (
                            <button
                                key={days}
                                onClick={() => handleGoalSelect(days)}
                                className={`aspect-square rounded-xl transition-all glass ${targetDays === days ? 'scale-110' : 'hover-soft'}`}
                            >
                                <span className="text-body">
                                    {days}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Custom Input */}
                    <div className="pt-2">
                        <p className="text-meta text-center mb-2">או בחר מספר אחר:</p>
                        <input
                            type="number"
                            min="1"
                            max="365"
                            value={targetDays}
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                handleGoalSelect(Math.min(365, Math.max(1, val)));
                            }}
                            className="w-full glass rounded-xl p-3 text-center text-h2 outline-none"
                        />
                    </div>
                </div>

                {/* Motivational Text */}
                <motion.div
                    key={`motivation-${targetDays}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center px-6"
                >
                    <p className="text-body">
                        {targetDays <= 7 && '🌱 התחלה מעולה! כל תרגול קרוב אותך ליעד'}
                        {targetDays > 7 && targetDays <= 14 && '💪 אתגר נהדר! עקביות היא המפתח'}
                        {targetDays > 14 && targetDays <= 30 && '🔥 יעד שאפתני! אתה יכול להצליח'}
                        {targetDays > 30 && '⭐ מדהים! מחויבות אמיתית לשינוי'}
                    </p>
                </motion.div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
                <NeuButton onClick={handleComplete} className="w-full h-14">
                    <span className="text-h2">בואו נתחיל! 🚀</span>
                </NeuButton>

                <button onClick={onSkip} className="w-full text-meta py-3 hover-soft">
                    אגדיר מאוחר יותר
                </button>
            </div>
        </div>
    );
};
