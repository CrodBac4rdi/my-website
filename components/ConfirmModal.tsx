'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  /** Wenn gesetzt: Nutzer muss diesen Text exakt eintippen, um zu bestätigen. */
  requireText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Bestätigen',
  cancelLabel = 'Abbrechen',
  danger = false,
  requireText,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [typed, setTyped] = useState('');

  if (!open) return null;

  const confirmDisabled = loading || (requireText ? typed !== requireText : false);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md glass rounded-2xl p-8 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border ${
              danger
                ? 'bg-danger/10 border-danger/30 text-danger'
                : 'bg-primary-500/10 border-primary-500/20 text-primary-400'
            }`}
          >
            <AlertTriangle size={22} />
          </div>
          <h2 className="font-display text-xl font-bold text-fg">{title}</h2>
        </div>

        <p className="text-muted leading-relaxed text-sm">{message}</p>

        {requireText && (
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-faint uppercase tracking-wider">
              Tippe <span className="text-fg">{requireText}</span> zum Bestätigen
            </label>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="w-full bg-white/[.04] border border-line rounded-md px-3.5 py-2.5 text-sm text-fg focus:outline-none focus:border-danger focus:ring-2 focus:ring-danger/30"
              placeholder={requireText}
              autoFocus
            />
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-5 h-11 rounded-md text-sm font-medium text-muted hover:bg-white/[.05] transition disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={`inline-flex items-center gap-2 px-5 h-11 rounded-md text-sm font-semibold transition active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none ${
              danger
                ? 'bg-danger/15 text-danger border border-danger/40 hover:bg-danger/25'
                : 'bg-primary-600 hover:bg-primary-500 text-white shadow-glow'
            }`}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
