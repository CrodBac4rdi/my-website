'use client';

import { useEffect, useState } from 'react';
import { Download, Check, Share } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

// Wiederverwendbarer „App installieren"-Button. Nutzt den von PWAManager
// global gemerkten beforeinstallprompt; auf iOS zeigt er die manuelle Anleitung.
export default function InstallButton({ className = '' }: { className?: string }) {
  const [available, setAvailable] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) setInstalled(true);

    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream);

    if ((window as unknown as { __horizonInstallPrompt?: unknown }).__horizonInstallPrompt) setAvailable(true);

    const onAvailable = () => setAvailable(true);
    const onInstalled = () => { setInstalled(true); setAvailable(false); };
    window.addEventListener('horizon-install-available', onAvailable);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('horizon-install-available', onAvailable);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    const deferred = (window as unknown as { __horizonInstallPrompt?: BeforeInstallPromptEvent | null }).__horizonInstallPrompt;
    if (!deferred) return;
    await deferred.prompt();
    const res = await deferred.userChoice;
    if (res.outcome === 'accepted') setInstalled(true);
    (window as unknown as { __horizonInstallPrompt?: unknown }).__horizonInstallPrompt = null;
    setAvailable(false);
  };

  const base =
    className ||
    'inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold px-5 h-11 rounded-lg transition-colors shadow-glow';

  if (installed) {
    return (
      <span className="inline-flex items-center gap-2 text-success font-semibold text-sm">
        <Check size={16} /> App ist installiert
      </span>
    );
  }

  if (isIOS) {
    return (
      <span className="inline-flex items-center gap-2 text-muted text-sm">
        <Share size={15} /> Auf iOS: „Teilen" → „Zum Home-Bildschirm"
      </span>
    );
  }

  if (!available) {
    // Kein Prompt verfügbar (z.B. schon installierbar erkannt oder Browser ohne Support)
    return (
      <span className="inline-flex items-center gap-2 text-muted text-sm">
        <Download size={15} /> Über das Browser-Menü „App installieren" möglich
      </span>
    );
  }

  return (
    <button onClick={install} className={base}>
      <Download size={18} /> App installieren
    </button>
  );
}
