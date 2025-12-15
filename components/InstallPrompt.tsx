import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeuButton } from '../components/Neu';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Update UI notify the user they can install the PWA
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowPrompt(false);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            console.warn('InstallPrompt: No deferred prompt available');
            return;
        }

        try {
            console.log('InstallPrompt: Triggering prompt...');
            // Show the install prompt
            await deferredPrompt.prompt();

            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;
            console.log('InstallPrompt: User choice outcome:', outcome);

            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
        } catch (error) {
            console.error('InstallPrompt: Error during installation:', error);
        }

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleClose = () => {
        setShowPrompt(false);
    };

    if (!showPrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 50, opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center p-6"
            >
                <div
                    className="p-5 rounded-3xl shadow-neu-up border border-white/30 pointer-events-auto flex flex-col gap-4 w-full max-w-sm"
                    style={{ backgroundColor: '#9cafc6' }}
                    role="dialog"
                    aria-modal="true"
                    aria-label="התקנת האפליקציה"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
                                <Download size={24} className="text-white" />
                            </div>

                            <div>
                                <h3 className="text-white text-lg font-normal">התקנת האפליקציה</h3>
                                <p className="text-sm text-white/90 font-normal">
                                    לחוויה מלאה ועבודה ללא אינטרנט
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleClose}
                            type="button"
                            aria-label="סגור"
                            className="p-2 -mr-2 rounded-xl border border-white/30 shadow-sm transition-colors hover:border-white/50"
                            style={{ backgroundColor: '#9cafc6', color: '#ffffff' }}
                        >
                            <X size={20} className="text-white" />
                        </button>
                    </div>

                    <NeuButton
                        onClick={handleInstallClick}
                        className="w-full py-3 text-base font-normal border border-white/30"
                        style={{ backgroundColor: '#9cafc6', color: '#ffffff' }}
                    >
                        התקן עכשיו
                    </NeuButton>
                </div>
            </motion.div>
        </AnimatePresence>
    );

};
