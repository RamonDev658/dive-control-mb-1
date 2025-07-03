import { useState, useEffect } from 'react';

export const useServiceWorker = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('[SW] Service worker registered successfully');
          setRegistration(reg);

          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setIsUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[SW] Service worker registration failed:', error);
        });

      // Listen for controller change (new service worker activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  const updateApp = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setIsUpdateAvailable(false);
    }
  };

  return {
    isUpdateAvailable,
    updateApp
  };
};