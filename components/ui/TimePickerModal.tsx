import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

type Props = {
    open: boolean;
    value: string; // "HH:MM"
    onChange: (next: string) => void;
    onClose: () => void;
    title?: string;
    backgroundColor?: string; // default '#9cafc6'
};

const pad2 = (n: number) => String(n).padStart(2, '0');

export const TimePickerModal: React.FC<Props> = ({
    open,
    value,
    onChange,
    onClose,
    title = 'בחירת שעה',
    backgroundColor = '#9cafc6',
}) => {
    const safe = value && value.includes(':') ? value : '00:00';
    const hh = safe.slice(0, 2);
    const mm = safe.slice(3, 5);

    const hours = React.useMemo(() => Array.from({ length: 24 }, (_, i) => pad2(i)), []);
    const minutes = React.useMemo(() => Array.from({ length: 60 }, (_, i) => pad2(i)), []);

    const setHH = (newHH: string) => onChange(`${newHH}:${mm}`);
    const setMM = (newMM: string) => onChange(`${hh}:${newMM}`);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    {/* Backdrop sits behind the modal */}
                    <div className="absolute inset-0" />

                    <motion.div
                        initial={{ y: 10, scale: 0.98, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        exit={{ y: 10, scale: 0.98, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                        className="relative w-full max-w-[280px] rounded-2xl border border-white/25 shadow-neu-up"
                        style={{ backgroundColor }}
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        onClick={(e) => e.stopPropagation()} // important: prevents closing when interacting inside
                    >
                        <div className="p-3">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-white text-sm">{title}</div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="p-2 rounded-xl border border-white/30"
                                    style={{ backgroundColor, color: '#fff' }}
                                    aria-label="סגור"
                                >
                                    <X size={16} className="text-white" />
                                </button>
                            </div>

                            {/* Hour left, minutes right (force LTR layout) */}
                            <div className="flex gap-2" dir="ltr">
                                <select
                                    value={hh}
                                    onChange={(e) => setHH(e.target.value)}
                                    className="w-1/2 rounded-xl px-3 py-2 text-white bg-white/10 border border-white/20 outline-none text-sm"
                                >
                                    {hours.map((h) => (
                                        <option key={h} value={h} className="text-black">
                                            {h}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={mm}
                                    onChange={(e) => setMM(e.target.value)}
                                    className="w-1/2 rounded-xl px-3 py-2 text-white bg-white/10 border border-white/20 outline-none text-sm"
                                >
                                    {minutes.map((m) => (
                                        <option key={m} value={m} className="text-black">
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-3 w-full rounded-xl py-2 border border-white/30 text-white bg-white/10 text-sm"
                            >
                                אישור
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
