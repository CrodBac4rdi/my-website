'use client';

import { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';

const DISMISS_KEY = 'horizon-pwa-install-dismissed';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

declare global {
  interface Window {
    __horizonInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

export default function PWAManager() {
  const [showIOS, setShowIOS] = useState(false);
  const [visible, setVisible] = useState(false);

  // Service Worker nur in Produktion registrieren (verhindert Stale-Cache im Dev).
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const dismissed = () => localStorage.getItem(DISMISS_KEY) === '1';

    // beforeinstallprompt IMMER für globale Install-Buttons (FAQ/Profil) merken,
    // aber das Banner nur zeigen, wenn nicht zuvor weggeklickt.
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      window.__horizonInstallPrompt = e as BeforeInstallPromptEvent;
      window.dispatchEvent(new Event('horizon-install-available'));
      if (!dismissed()) setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // iOS: kein beforeinstallprompt -> manuellen Hinweis zeigen (sofern nicht weggeklickt).
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    if (isIOS && !dismissed()) {
      setShowIOS(true);
      setVisible(true);
    }

    const onInstalled = () => {
      window.__horizonInstallPrompt = null;
      setVisible(false);
    };
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, '1');
  };

  const install = async () => {
    const deferred = window.__horizonInstallPrompt;
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    window.__horizonInstallPrompt = null;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 z-[90] mx-auto max-w-md">
      <div className="bg-elev/95 backdrop-blur-xl border border-line-strong rounded-2xl shadow-pop p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shrink-0 shadow-glow">
          <Download size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-fg text-sm">HORIZON installieren</p>
          {showIOS ? (
            <p className="text-muted text-xs mt-1 leading-relaxed flex items-center gap-1 flex-wrap">
              Tippe auf <Share size={12} className="inline" /> „Teilen" und dann „Zum Home-Bildschirm".
            </p>
          ) : (
            <p className="text-muted text-xs mt-1 leading-relaxed">
              Als App auf dem Startbildschirm – schneller Zugriff, eigenes Fenster.
            </p>
          )}
          {!showIOS && (
            <button
              onClick={install}
              className="mt-3 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
            >
              Installieren
            </button>
          )}
        </div>
        <button onClick={dismiss} className="text-faint hover:text-fg p-1 shrink-0" aria-label="Schließen">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
