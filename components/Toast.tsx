'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { registerToastHandler, unregisterToastHandler, type ToastItem } from '@/lib/toast';

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    registerToastHandler((item) => {
      setToasts((prev) => [...prev, item]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== item.id));
      }, 3500);
    });
    return () => unregisterToastHandler();
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto flex items-start gap-3 rounded-md border border-line-strong bg-elev/90 p-3.5 pr-5 shadow-pop backdrop-blur-xl text-sm max-w-sm"
          >
            {item.type === 'success' && <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-success" />}
            {item.type === 'error' && <XCircle size={18} className="shrink-0 mt-0.5 text-danger" />}
            {item.type === 'info' && <Info size={18} className="shrink-0 mt-0.5 text-primary-500" />}
            <span className="font-medium text-fg leading-snug">{item.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
