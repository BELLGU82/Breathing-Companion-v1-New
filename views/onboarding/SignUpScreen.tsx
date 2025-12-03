import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { NeuButton } from '../../components/Neu';
import { HapticService } from '../../services/HapticService';

interface SignUpScreenProps {
    onSignUp: (email: string) => void;
    onSkip: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignUp, onSkip }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            HapticService.trigger(20);
            onSignUp(email);
        } else {
            HapticService.trigger([10, 50, 10]);
        }
    };

    const handleGoogleSignUp = () => {
        // Mock Google Sign-In
        HapticService.trigger(20);
        onSignUp('google-user@example.com');
    };

    return (
        <div className="flex flex-col h-full p-6 pb-10">
            {/* Header */}
            <div className="text-center mb-8 mt-4">
                <h1 className="text-h1 mb-2">הירשם עכשיו</h1>
                <p className="text-body">כדי לשמור את ההתקדמות ולקבל תזכורות</p>
            </div>

            {/* Form */}
            <div className="flex-1 space-y-5">
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
                        <Mail className="icon-secondary absolute right-4 top-1/2 -translate-y-1/2" size={18} />
                    </div>
                    {errors.email && <p className="text-[12px] text-red-500 mr-2">{errors.email}</p>}
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
                        <Lock className="icon-secondary absolute right-4 top-1/2 -translate-y-1/2" size={18} />
                        <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-4 top-1/2 -translate-y-1/2"
                        >
                            {showPassword ? (
                                <EyeOff className="icon-secondary" size={18} />
                            ) : (
                                <Eye className="icon-secondary" size={18} />
                            )}
                        </button>
                    </div>
                    {errors.password && <p className="text-[12px] text-red-500 mr-2">{errors.password}</p>}
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
                        <Lock className="icon-secondary absolute right-4 top-1/2 -translate-y-1/2" size={18} />
                    </div>
                    {errors.confirm && <p className="text-[12px] text-red-500 mr-2">{errors.confirm}</p>}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 py-4">
                    <div className="flex-1 h-[1px] bg-neu-base shadow-neu-inner" />
                    <span className="text-meta">או</span>
                    <div className="flex-1 h-[1px] bg-neu-base shadow-neu-inner" />
                </div>

                {/* Google Sign-In (Mock) */}
                <button
                    onClick={handleGoogleSignUp}
                    className="w-full bg-neu-base shadow-neu-flat rounded-xl p-4 flex items-center justify-center gap-3 hover-soft active:shadow-neu-pressed transition-all"
                >
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                        <span className="text-[14px]">G</span>
                    </div>
                    <span className="text-body">המשך עם Google</span>
                </button>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
                <NeuButton onClick={handleSubmit} className="w-full h-14">
                    <span className="text-h2">הירשם</span>
                </NeuButton>

                <button onClick={onSkip} className="w-full text-meta py-3 hover-soft">
                    דלג לעכשיו
                </button>
            </div>
        </div>
    );
};
