'use client';

import { LogIn, LogOut, Bookmark, User, Search, Image as ImageIcon, Shield, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { useI18n } from "@/lib/i18n";
import HeaderGenreFilter from "./HeaderGenreFilter";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { t } = useI18n();

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
    <header className="sticky top-0 z-50 w-full px-4 md:px-8 pt-6 pb-2 pointer-events-none">
      <nav className="w-full flex items-center justify-between pointer-events-auto bg-black/20 backdrop-blur-2xl border border-white/10 px-4 py-3 rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 group px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-[0_0_20px_rgba(37,99,235,0.5)]">
             <span className="font-black text-white text-xl">H</span>
          </div>
          <span className="text-xl font-black tracking-tighter text-white hidden sm:block drop-shadow-md">HORIZON</span>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
          <Link href="/" className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all">
            {t('nav.home')}
          </Link>
          {user && (
            <Link href="/watchlist" className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
              <Bookmark size={16} />
              <span className="hidden md:block">{t('nav.watchlist')}</span>
            </Link>
          )}
          <Link href="/search" className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
            <Search size={16} />
            <span className="hidden md:block">{t('nav.search')}</span>
          </Link>
          <Link href="/backgrounds" className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
            <ImageIcon size={16} />
            <span className="hidden md:block">Hintergründe</span>
          </Link>
          <Link href="/legal" className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
            <Shield size={16} />
            <span className="hidden md:block">Legal & Privacy</span>
          </Link>
        </div>

        {/* DESKTOP ACTIONS & AUTH */}
        <div className="hidden lg:flex px-2 items-center gap-4">
          <HeaderGenreFilter />
          <div className="flex items-center gap-2 border-l border-white/10 pl-4">
            <LanguageToggle />
            <ThemeToggle />
          </div>

          {user ? (
            <div className="flex items-center gap-3 pl-2">
              <NotificationBell />
              <Link href="/profile" className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group">
                 <div className="w-6 h-6 bg-slate-800 group-hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors">
                    <User size={14} className="text-slate-400 group-hover:text-white" />
                 </div>
                 <span className="text-xs font-bold text-slate-300 truncate max-w-[100px]">{user.email}</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 hover:text-red-300 transition-all group"
                title="Logout"
              >
                <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="flex items-center gap-2 bg-white text-black hover:bg-slate-200 px-6 py-2.5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] ml-2 group"
            >
              <LogIn size={18} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:block">{t('nav.login')}</span>
            </Link>
          )}
        </div>

        {/* MOBILE BURGER */}
        <div className="lg:hidden flex items-center gap-2 px-2">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </nav>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-[80px] left-0 w-full px-4 pointer-events-auto">
          <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl shadow-2xl flex flex-col gap-3">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-lg font-bold text-white hover:bg-white/10 transition-colors">{t('nav.home')}</Link>
            {user && <Link href="/watchlist" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-lg font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors"><Bookmark size={20} />{t('nav.watchlist')}</Link>}
            <Link href="/search" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-lg font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors"><Search size={20} />{t('nav.search')}</Link>
            <Link href="/backgrounds" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-lg font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors"><ImageIcon size={20} />Hintergründe</Link>
            <Link href="/legal" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-lg font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors"><Shield size={20} />Legal & Privacy</Link>
            
            <hr className="border-white/10 my-2" />
            
            <div className="flex items-center justify-between px-2">
              <HeaderGenreFilter />
              <div className="flex items-center gap-2">
                <LanguageToggle />
                <ThemeToggle />
              </div>
            </div>

            <hr className="border-white/10 my-2" />

            {user ? (
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-slate-300 truncate max-w-[180px]">{user.email}</span>
                </div>
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-500 py-3 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-500/20">
                <LogIn size={18} /> {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      )}

    </header>
  );
}