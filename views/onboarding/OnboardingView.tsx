import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WelcomeSlides } from './WelcomeSlides';
import { SignUpScreen } from './SignUpScreen';
import { TermsScreen } from './TermsScreen';
import { NotificationsSetup } from './NotificationsSetup';
import { GoalSetting } from './GoalSetting';
import { StorageService } from '../../services/StorageService';
import { OnboardingStep, NotificationPreference, UserGoal } from '../../types';

export const OnboardingView: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.Welcome);
    const [userData, setUserData] = useState<{
        email?: string;
        acceptedTerms?: boolean;
        notifications?: NotificationPreference;
        goal?: UserGoal;
    }>({});

    // Redirect if already completed
    useEffect(() => {
        if (StorageService.isOnboardingCompleted()) {
            navigate('/', { replace: true });
        }
    }, [navigate]);

    const handleNext = () => {
        const steps = [
            OnboardingStep.Welcome,
            OnboardingStep.SignUp,
            OnboardingStep.Terms,
            OnboardingStep.Notifications,
            OnboardingStep.Goal
        ];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
        }
    };

    const handleSignUp = (email: string) => {
        setUserData(prev => ({ ...prev, email }));
        StorageService.saveOnboardingEmail(email);
        StorageService.setRegistered(true); // מסמן כמשתמש רשום
        handleNext();
    };

    const handleTermsAccept = () => {
        setUserData(prev => ({ ...prev, acceptedTerms: true }));
        handleNext();
    };

    const handleNotificationsSetup = (prefs: NotificationPreference) => {
        setUserData(prev => ({ ...prev, notifications: prefs }));
        StorageService.saveNotificationPreferences(prefs);

        // אם בחר להפעיל התראות, שמור גם בהגדרות הכלליות
        const hasAnyEnabled = prefs.morning || prefs.afternoon || prefs.evening;
        if (hasAnyEnabled) {
            StorageService.setNotificationsEnabled(true);
        }

        handleNext();
    };

    const handleGoalSet = (goal: UserGoal) => {
        setUserData(prev => ({ ...prev, goal }));
        StorageService.saveUserGoal(goal);

        // סיום onboarding
        StorageService.setOnboardingCompleted(true);
        navigate('/', { replace: true });
    };

    const handleSkip = () => {
        // דילוג - עדיין מסמן כמשתמש שראה onboarding
        StorageService.setOnboardingCompleted(true);
        navigate('/', { replace: true });
    };

    // Progress calculation
    const steps = [
        OnboardingStep.Welcome,
        OnboardingStep.SignUp,
        OnboardingStep.Terms,
        OnboardingStep.Notifications,
        OnboardingStep.Goal
    ];
    const progress = ((steps.indexOf(currentStep) + 1) / steps.length) * 100;

    return (
        <div className="flex flex-col h-full glass overflow-hidden">
            {/* Progress Bar */}
            <div className="w-full h-1 glass">
                <motion.div
                    className="h-full glass"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Content */}
            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {currentStep === OnboardingStep.Welcome && (
                        <motion.div
                            key="welcome"
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute inset-0"
                        >
                            <WelcomeSlides onNext={handleNext} onSkip={handleSkip} />
                        </motion.div>
                    )}

                    {currentStep === OnboardingStep.SignUp && (
                        <motion.div
                            key="signup"
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute inset-0"
                        >
                            <SignUpScreen onSignUp={handleSignUp} onSkip={handleSkip} />
                        </motion.div>
                    )}

                    {currentStep === OnboardingStep.Terms && (
                        <motion.div
                            key="terms"
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute inset-0"
                        >
                            <TermsScreen onAccept={handleTermsAccept} />
                        </motion.div>
                    )}

                    {currentStep === OnboardingStep.Notifications && (
                        <motion.div
                            key="notifications"
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute inset-0"
                        >
                            <NotificationsSetup onComplete={handleNotificationsSetup} onSkip={handleNext} />
                        </motion.div>
                    )}

                    {currentStep === OnboardingStep.Goal && (
                        <motion.div
                            key="goal"
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute inset-0"
                        >
                            <GoalSetting onComplete={handleGoalSet} onSkip={handleSkip} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
