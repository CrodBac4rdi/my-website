'use client'; // Wichtig für Formulare in Next.js!

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Mail, Lock, Film, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Wir greifen jetzt den Key ab, den Vercel automatisch generiert hat!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!; 
const supabase = createClient(supabaseUrl, supabaseKey);
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Funktion zum Registrieren
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    const { error } = await supabase.auth.signUp({ email, password });
    
    if (error) setErrorMsg(error.message);
    else setSuccessMsg('Checke deine E-Mails für den Bestätigungslink!');
    setLoading(false);
  };

  // Funktion zum Einloggen
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      router.push('/'); // Bei Erfolg zur Startseite leiten
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        
        <div className="flex justify-center mb-8">
          <div className="bg-blue-600/20 p-3 rounded-full text-blue-500">
            <Film size={32} />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2">Willkommen bei Horizon</h2>
        <p className="text-slate-400 text-center mb-8">Logge dich ein, um deine Watchlist zu verwalten.</p>

        {/* Error & Success Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 text-sm text-center">
            {successMsg}
          </div>
        )}

        {/* Login Formular */}
        <form className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
            <input 
              type="email" 
              placeholder="Deine E-Mail" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition text-slate-200"
              required
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
            <input 
              type="password" 
              placeholder="Dein Passwort" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition text-slate-200"
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={handleSignIn}
              disabled={loading}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-medium transition disabled:opacity-50"
            >
              Einloggen
            </button>
            <button 
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              Registrieren
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
}