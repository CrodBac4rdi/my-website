'use client';

import { useState, useRef } from 'react';
import { Mail, Lock, Film, AlertCircle, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Mode = 'login' | 'reset';

const inputClass =
  'w-full bg-white/[.04] border border-line rounded-md py-3.5 pl-12 pr-4 text-sm text-fg placeholder:text-faint transition hover:border-line-strong focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30';
const iconClass =
  'absolute left-4 top-1/2 -translate-y-1/2 text-faint group-focus-within:text-primary-500 transition-colors';
const labelClass = 'block mb-2 text-[11px] font-bold text-faint uppercase tracking-wider ml-1';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const submittingRef = useRef(false);

  if (!supabase) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-danger/10 border border-danger/30 p-8 rounded-xl text-center max-w-md">
          <AlertCircle className="mx-auto text-danger mb-4" size={48} />
          <h2 className="text-xl font-display font-semibold text-fg mb-2">Auth nicht konfiguriert</h2>
          <p className="text-muted">Bitte Supabase-Umgebungsvariablen in .env.local eintragen.</p>
        </div>
      </div>
    );
  }

  const guard = () => {
    if (submittingRef.current) return false;
    submittingRef.current = true;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    return true;
  };

  const release = () => {
    submittingRef.current = false;
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guard()) return;
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error) { setErrorMsg(error.message); release(); }
    else router.push('/');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guard()) return;
    const { error } = await supabase!.auth.signUp({ email, password });
    if (error) setErrorMsg(error.message);
    else setSuccessMsg('Checke deine E-Mails für den Bestätigungslink!');
    release();
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guard()) return;
    const { error } = await supabase!.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/profile`,
    });
    if (error) setErrorMsg(error.message);
    else setSuccessMsg('E-Mail zum Zurücksetzen wurde gesendet – bitte prüfe deinen Posteingang.');
    release();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass p-10 rounded-2xl relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary-500/20 blur-[100px] pointer-events-none" />

        <div className="flex justify-center mb-10">
          <div className="bg-primary-600/10 p-4 rounded-xl border border-primary-500/20 text-primary-500">
            <Film size={40} />
          </div>
        </div>

        <div className="text-center space-y-2 mb-10">
          <h2 className="text-3xl font-display font-bold text-fg tracking-tight">
            {mode === 'reset' ? 'Passwort zurücksetzen' : 'Willkommen zurück'}
          </h2>
          <p className="text-muted font-medium">
            {mode === 'reset'
              ? 'Wir schicken dir einen Reset-Link per E-Mail.'
              : 'Logge dich ein, um deine Watchlist zu verwalten.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/30 rounded-md flex items-center gap-3 text-danger text-sm font-medium">
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-success/10 border border-success/30 rounded-md text-success text-sm font-medium text-center">
            {successMsg}
          </div>
        )}

        {mode === 'reset' ? (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className={labelClass}>E-Mail Adresse</label>
              <div className="relative group">
                <Mail className={iconClass} size={20} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white py-3.5 rounded-md font-semibold transition disabled:opacity-50 shadow-glow flex items-center justify-center gap-2 active:scale-[.98]"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Reset-Link senden'}
              </button>
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className="w-full text-muted hover:text-fg py-3 flex items-center justify-center gap-2 font-medium transition-colors"
              >
                <ArrowLeft size={16} /> Zurück zum Login
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-4">
            <div>
              <label className={labelClass}>E-Mail Adresse</label>
              <div className="relative group">
                <Mail className={iconClass} size={20} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Passwort</label>
              <div className="relative group">
                <Lock className={iconClass} size={20} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => { setMode('reset'); setErrorMsg(''); setSuccessMsg(''); }}
                className="text-xs text-faint hover:text-primary-400 font-medium transition-colors"
              >
                Passwort vergessen?
              </button>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white py-3.5 rounded-md font-semibold transition disabled:opacity-50 shadow-glow flex items-center justify-center gap-2 group active:scale-[.98]"
              >
                {loading
                  ? <Loader2 className="animate-spin" size={20} />
                  : <>Einloggen <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
              </button>
              <button
                onClick={handleSignUp}
                disabled={loading}
                className="w-full bg-white/[.06] hover:bg-white/[.1] text-fg py-3.5 rounded-md font-semibold transition border border-line backdrop-blur"
              >
                Neu hier? Registrieren
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
