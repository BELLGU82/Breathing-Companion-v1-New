import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Check, ArrowRight } from 'lucide-react';
import { NeuButton } from '../../components/Neu';
import { HapticService } from '../../services/HapticService';

interface SignUpScreenProps {
    onSignUp: (email: string, name: string) => void;
    onSkip: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignUp, onSkip }) => {
    const [step, setStep] = useState<'method' | 'form'>('method');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirm?: string; legal?: string }>({});

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        // Name validation
        if (!name.trim()) {
            newErrors.name = 'נדרש שם';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            newErrors.email = 'נדרש אימייל';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'כתובת אימייל לא תקינה';
        }

        // Password validation
        if (!password) {
            newErrors.password = 'נדרשת סיסמה';
        } else if (password.length < 6) {
            newErrors.password = 'הסיסמה חייבת להכיל לפחות 6 תווים';
        }

        // Confirm password
        if (password !== confirmPassword) {
            newErrors.confirm = 'הסיסמאות אינן תואמות';
        }

        // Legal validation
        if (!acceptedTerms || !acceptedPrivacy) {
            newErrors.legal = 'יש לאשר את תנאי השימוש ומדיניות הפרטיות';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            HapticService.trigger(20);
            onSignUp(email, name);
        } else {
            HapticService.trigger([10, 50, 10]);
        }
    };

    const handleGoogleSignUp = () => {
        // Mock Google Sign-In
        HapticService.trigger(20);
        // For mock purposes, we'll use a generic name or ask for it later. 
        // But for MVP simplicity, let's assume we get it from Google.
        onSignUp('google-user@example.com', 'Google User');
    };

    if (step === 'method') {
        return (
            <div className="flex flex-col h-full p-6 pb-10 animate-in fade-in slide-in-from-right duration-300">
                <div className="text-center mb-10 mt-10">
                    <h1 className="text-h1 mb-3">יצירת חשבון</h1>
                    <p className="text-body">הצטרף לקהילת הנושמים שלנו</p>
                </div>

                <div className="flex-1 flex flex-col justify-center space-y-6">
                    <NeuButton
                        onClick={handleGoogleSignUp}
                        className="w-full h-14 flex items-center justify-center gap-3"
                    >
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-black font-bold text-xs">G</span>
                        </div>
                        <span className="text-body font-medium">המשך עם Google</span>
                    </NeuButton>

                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-gray-400/20 to-transparent" />
                        <span className="text-meta text-sm">או</span>
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-gray-400/20 to-transparent" />
                    </div>

                    <NeuButton onClick={() => setStep('form')} className="w-full h-14 flex items-center justify-center gap-3">
                        <Mail className="icon-secondary" />
                        <span className="text-h2">הירשם עם אימייל</span>
                    </NeuButton>
                </div>

                <button onClick={onSkip} className="w-full text-meta py-4 hover-soft mt-auto">
                    דלג לעכשיו
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full p-6 pb-10 animate-in fade-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center mb-6 mt-2">
                <button onClick={() => setStep('method')} className="p-2 hover-soft -mr-2">
                    <ArrowRight className="icon-secondary" />
                </button>
                <h1 className="text-h2 mr-2">הרשמה במייל</h1>
            </div>

            {/* Form */}
            <div className="flex-1 space-y-4 overflow-y-auto px-1">
                {/* Name Field */}
                <div className="space-y-2">
                    <label className="text-body mr-1">שם מלא</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="ישראל ישראלי"
                            className="w-full bg-neu-base shadow-neu-inner rounded-xl p-4 pr-12 outline-none text-body"
                        />
                        <User className="icon-secondary absolute right-4 top-1/2 -translate-y-1/2" />
                    </div>
                    {errors.name && <p className="text-meta text-red-400 mr-2">{errors.name}</p>}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                    <label className="text-body mr-1">אימייל</label>
                    <div className="relative">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full bg-neu-base shadow-neu-inner rounded-xl p-4 pr-12 outline-none text-body"
                            dir="ltr"
                        />
                        <Mail className="icon-secondary absolute right-4 top-1/2 -translate-y-1/2" />
                    </div>
                    {errors.email && <p className="text-meta text-red-400 mr-2">{errors.email}</p>}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <label className="text-body mr-1">סיסמה</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-neu-base shadow-neu-inner rounded-xl p-4 pr-12 pl-12 outline-none text-body"
                            dir="ltr"
                        />
                        <Lock className="icon-secondary absolute right-4 top-1/2 -translate-y-1/2" />
                        <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-4 top-1/2 -translate-y-1/2"
                        >
                            {showPassword ? (
                                <EyeOff className="icon-secondary" />
                            ) : (
                                <Eye className="icon-secondary" />
                            )}
                        </button>
                    </div>
                    {errors.password && <p className="text-meta text-red-400 mr-2">{errors.password}</p>}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                    <label className="text-body mr-1">אימות סיסמה</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-neu-base shadow-neu-inner rounded-xl p-4 pr-12 outline-none text-body"
                            dir="ltr"
                        />
                        <Lock className="icon-secondary absolute right-4 top-1/2 -translate-y-1/2" />
                    </div>
                    {errors.confirm && <p className="text-meta text-red-400 mr-2">{errors.confirm}</p>}
                </div>

                {/* Legal Checkboxes */}
                <div className="space-y-3 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${acceptedTerms ? 'bg-neu-dark border-neu-dark' : 'border-neu-dark/30 bg-neu-base'}`}>
                            {acceptedTerms && <Check size={14} className="text-white" strokeWidth={3} />}
                        </div>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                        />
                        <span className="text-meta text-sm">
                            אני מסכים ל<span className="underline text-body">תנאי השימוש</span>
                        </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${acceptedPrivacy ? 'bg-neu-dark border-neu-dark' : 'border-neu-dark/30 bg-neu-base'}`}>
                            {acceptedPrivacy && <Check size={14} className="text-white" strokeWidth={3} />}
                        </div>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={acceptedPrivacy}
                            onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                        />
                        <span className="text-meta text-sm">
                            אני מסכים ל<span className="underline text-body">מדיניות הפרטיות</span>
                        </span>
                    </label>

                    {errors.legal && <p className="text-meta text-red-400 mr-2 text-sm">{errors.legal}</p>}
                </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
                <NeuButton onClick={handleSubmit} className="w-full h-14">
                    <span className="text-h2">צור חשבון</span>
                </NeuButton>
            </div>
        </div>
    );
};
