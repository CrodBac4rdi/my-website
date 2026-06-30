'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { savePushSubscriptionAction, removePushSubscriptionAction } from '@/lib/actions/push';

const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export default function PushToggle() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ok =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    setSupported(ok);
    if (!ok) return;
    navigator.serviceWorker.getRegistration().then(async (reg) => {
      const sub = await reg?.pushManager.getSubscription();
      setEnabled(!!sub);
    });
  }, []);

  if (!supported) {
    return <p className="text-faint text-sm">Dein Browser unterstützt keine Push-Benachrichtigungen.</p>;
  }
  if (!VAPID_KEY) {
    return (
      <p className="text-faint text-sm">
        Push ist serverseitig noch nicht konfiguriert (VAPID-Schlüssel fehlt).
      </p>
    );
  }

  const enable = async () => {
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        toast.error('Benachrichtigungen wurden nicht erlaubt.');
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
      });
      const res = await savePushSubscriptionAction(JSON.parse(JSON.stringify(sub)));
      if (res.ok) {
        setEnabled(true);
        toast.success('Benachrichtigungen aktiviert.');
      } else {
        toast.error(res.error);
      }
    } catch (e) {
      console.error(e);
      toast.error('Aktivierung fehlgeschlagen (Service Worker aktiv?).');
    } finally {
      setLoading(false);
    }
  };

  const disable = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await removePushSubscriptionAction({ endpoint: sub.endpoint });
        await sub.unsubscribe();
      }
      setEnabled(false);
      toast.success('Benachrichtigungen deaktiviert.');
    } catch (e) {
      console.error(e);
      toast.error('Deaktivierung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={enabled ? disable : enable}
      disabled={loading}
      className={`inline-flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold transition disabled:opacity-60 ${
        enabled
          ? 'bg-surface-3 border border-line-strong text-fg hover:border-danger/40 hover:text-danger'
          : 'bg-primary-600 hover:bg-primary-500 text-white shadow-glow'
      }`}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : enabled ? <BellOff size={16} /> : <Bell size={16} />}
      {enabled ? 'Benachrichtigungen aus' : 'Benachrichtigungen an'}
    </button>
  );
}
