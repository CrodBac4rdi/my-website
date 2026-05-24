'use client';

import Link from "next/link";
import { Film, Search, User, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase-Verbindung aufbauen
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Beim Laden der Seite prüfen: Ist jemand eingeloggt?
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // 2. Live zuhören: Ändert sich der Status (z.B. durch Klick auf Logout)?
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        <Link href="/" className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition">
          <Film size={24} />
          <span className="font-bold text-xl tracking-wider text-white">HORIZON</span>
        </Link>

        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-300">
          <Link href="/" className="hover:text-white transition">Discover</Link>
          {/* Watchlist nur anzeigen, wenn man eingeloggt ist */}
          {user && <Link href="/" className="hover:text-white transition text-blue-400">My Watchlist</Link>}
        </nav>

        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-white transition">
            <Search size={20} />
          </button>
          
          {/* MAGIE: Entweder Logout oder Login anzeigen */}
          {user ? (
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="flex items-center gap-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          ) : (
            <Link href="/login" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              <User size={16} />
              <span>Login</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}