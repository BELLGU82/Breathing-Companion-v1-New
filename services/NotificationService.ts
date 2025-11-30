import { StorageService } from './StorageService';

export const NotificationService = {
    requestPermission: async (): Promise<boolean> => {
        if (!('Notification' in window)) {
            console.log('This browser does not support desktop notification');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    },

    isEnabled: (): boolean => {
        return Notification.permission === 'granted' && StorageService.getNotificationsEnabled();
    },

    sendTestNotification: async () => {
        // alert(`Debug Info:\nPermission: ${Notification.permission}\nSW Support: ${'serviceWorker' in navigator}`);

        if (Notification.permission === 'granted') {
            try {
                let swRegistration: ServiceWorkerRegistration | undefined = undefined;

                // Try using Service Worker first (better for PWAs)
                if ('serviceWorker' in navigator) {
                    // Race condition: Wait max 1s for SW
                    const swPromise = navigator.serviceWorker.ready;
                    const timeoutPromise = new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 1000));

                    swRegistration = await Promise.race([swPromise, timeoutPromise]);

                    if (swRegistration) {
                        await swRegistration.showNotification('נשימה - תזכורת בדיקה', {
                            body: 'היי! זוהי תזכורת לנשום עמוק ולהירגע. 🌿 (SW)',
                            icon: '/icon-192.png',
                            badge: '/icon-192.png',
                            dir: 'rtl',
                            lang: 'he'
                        });
                        return;
                    }
                }

                // Fallback to standard Notification API (if SW timed out or not supported)
                const notification = new Notification('נשימה - תזכורת בדיקה', {
                    body: 'היי! זוהי תזכורת לנשום עמוק ולהירגע. 🌿 (API)',
                    icon: '/icon-192.png',
                    badge: '/icon-192.png',
                    dir: 'rtl',
                    lang: 'he'
                });

                notification.onclick = () => {
                    window.focus();
                    notification.close();
                };
            } catch (e) {
                console.error('Notification failed:', e);
                alert('שגיאה בשליחת התראה: ' + (e as Error).message);
            }
        } else {
            console.log('Notification permission not granted');
            alert(`אין הרשאה להתראות. סטטוס נוכחי: ${Notification.permission}`);
        }
    },

    // Simple daily scheduler (MVP)
    // In a real PWA, this would use the Push API with a service worker backend.
    // For now, we'll check on app load if it's been > 24h since last practice.
    checkAndSchedule: () => {
        if (!NotificationService.isEnabled()) return;

        // Logic for local checking could go here, but for now we rely on the user
        // manually triggering or simple timeouts if the app is open.
        // A more robust local notification system requires Service Worker 'periodic-sync' or similar,
        // which has limited support.

        console.log('Notification Service: Ready to remind.');
    }
};
