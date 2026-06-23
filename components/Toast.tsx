'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { registerToastHandler, unregisterToastHandler, type ToastItem } from '@/lib/toast';

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    registerToastHandler((item) => {
      setToasts(prev => [...prev, item]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== item.id));
      }, 3500);
    });
    return () => unregisterToastHandler();
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      {toasts.map(item => (
        <div
          key={item.id}
          className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl text-sm font-bold pointer-events-auto ${
            item.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/30 text-emerald-300'
              : item.type === 'error'
              ? 'bg-red-950/95 border-red-500/30 text-red-300'
              : 'bg-slate-900/95 border-slate-700 text-slate-200'
          }`}
        >
          {item.type === 'success' && <CheckCircle2 size={18} className="shrink-0" />}
          {item.type === 'error'   && <XCircle      size={18} className="shrink-0" />}
          {item.type === 'info'    && <Info         size={18} className="shrink-0" />}
          {item.message}
        </div>
      ))}
    </div>
  );
}
