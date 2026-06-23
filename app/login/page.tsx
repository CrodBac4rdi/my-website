'use client';

import { useState, useRef } from 'react';
import { Mail, Lock, Film, AlertCircle, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Mode = 'login' | 'reset';

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
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center max-w-md">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Auth nicht konfiguriert</h2>
          <p className="text-slate-400">Bitte Supabase-Umgebungsvariablen in .env.local eintragen.</p>
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
      <div className="w-full max-w-md bg-slate-900/50 border border-slate-800 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden">

        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 blur-[100px] pointer-events-none" />

        <div className="flex justify-center mb-10">
          <div className="bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20 text-blue-500">
            <Film size={40} />
          </div>
        </div>

        <div className="text-center space-y-2 mb-10">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {mode === 'reset' ? 'Passwort zurücksetzen' : 'Willkommen zurück'}
          </h2>
          <p className="text-slate-400 font-medium">
            {mode === 'reset'
              ? 'Wir schicken dir einen Reset-Link per E-Mail.'
              : 'Logge dich ein, um deine Watchlist zu verwalten.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-medium">
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm font-medium text-center">
            {successMsg}
          </div>
        )}

        {/* PASSWORD RESET MODE */}
        {mode === 'reset' ? (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                E-Mail Adresse
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-200 placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {loading
                  ? <Loader2 className="animate-spin" size={20} />
                  : 'Reset-Link senden'}
              </button>
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className="w-full text-slate-400 hover:text-slate-200 py-3 flex items-center justify-center gap-2 font-medium transition-colors"
              >
                <ArrowLeft size={16} /> Zurück zum Login
              </button>
            </div>
          </form>
        ) : (
          /* LOGIN / SIGNUP MODE */
          <form className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                E-Mail Adresse
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-200 placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                Passwort
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-200 placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => { setMode('reset'); setErrorMsg(''); setSuccessMsg(''); }}
                className="text-xs text-slate-500 hover:text-blue-400 font-medium transition-colors"
              >
                Passwort vergessen?
              </button>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group"
              >
                {loading
                  ? <Loader2 className="animate-spin" size={20} />
                  : <>Einloggen <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
              </button>
              <button
                onClick={handleSignUp}
                disabled={loading}
                className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 py-4 rounded-2xl font-bold transition-all border border-slate-700/50"
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
