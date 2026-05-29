'use client';

import { LogIn, LogOut, Bookmark, User, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!supabase) return;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-6 pointer-events-none">
      <nav className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-3 rounded-[2rem] shadow-2xl shadow-black/50">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group px-4">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/20">
             <span className="font-black text-white text-xl">H</span>
          </div>
          <span className="text-xl font-black tracking-tighter text-white hidden sm:block">HORIZON</span>
        </Link>

        {/* NAV LINKS */}
        <div className="flex items-center gap-2 bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800/50">
          <Link href="/" className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all">
            Home
          </Link>
          <Link href="/watchlist" className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all flex items-center gap-2">
            <Bookmark size={16} />
            <span className="hidden md:block">Watchlist</span>
          </Link>
          <Link href="/search" className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all flex items-center gap-2">
            <Search size={16} />
            <span className="hidden md:block">Suche</span>
          </Link>
        </div>

        {/* AUTH */}
        <div className="px-2">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-xl">
                 <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center">
                    <User size={14} className="text-slate-400" />
                 </div>
                 <span className="text-xs font-bold text-slate-300 truncate max-w-[100px]">{user.email}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-all group"
                title="Logout"
              >
                <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 group"
            >
              <LogIn size={20} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:block">Login</span>
            </Link>
          )}
        </div>

      </nav>
    </header>
  );
}