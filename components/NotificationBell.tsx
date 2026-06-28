'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from '@/lib/actions/notifications';

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unread = items.filter((n) => !n.is_read).length;

  async function load() {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setItems(data as Notification[]);
    setLoading(false);
  }

  // Initial + alle 60s aktualisieren (leichtgewichtiges Polling).
  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  // Klick außerhalb schließt das Dropdown.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  async function handleItemClick(n: Notification) {
    if (!n.is_read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      markNotificationReadAction(n.id);
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  async function handleMarkAll() {
    setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
    await markAllNotificationsReadAction();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 hover:text-white transition-all"
        title="Benachrichtigungen"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-blue-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-[28rem] overflow-y-auto bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 sticky top-0 bg-slate-900/95">
            <span className="font-bold text-white text-sm">Benachrichtigungen</span>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Check size={14} /> Alle gelesen
              </button>
            )}
          </div>

          {loading && items.length === 0 ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-500" size={24} />
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-10">Keine Benachrichtigungen.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => handleItemClick(n)}
                    className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors ${
                      n.is_read ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.is_read && (
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                      <div className={n.is_read ? 'pl-4' : ''}>
                        <p className="text-sm font-bold text-slate-200 leading-tight">{n.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-wider">
                          {new Date(n.created_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
