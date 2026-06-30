'use client';

import { LogIn, LogOut, Bookmark, User, Search, Image as ImageIcon, Shield, Menu, X, Compass, Command } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { useI18n } from "@/lib/i18n";
import HeaderGenreFilter from "./HeaderGenreFilter";
import NotificationBell from "./NotificationBell";
import CommandPalette from "./CommandPalette";

function openCommandPalette() {
  window.dispatchEvent(new Event('open-command-palette'));
}

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
      <nav className="w-full flex items-center justify-between pointer-events-auto bg-elev/60 backdrop-blur-xl border border-line px-4 py-3 rounded-2xl shadow-card">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 group px-2">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-glow">
             <span className="font-black text-white text-xl">H</span>
          </div>
          <span className="text-xl font-black tracking-tighter text-white hidden sm:block drop-shadow-md">HORIZON</span>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
          <Link href="/" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-muted hover:text-fg hover:bg-white/[.06] transition-all">
            {t('nav.home')}
          </Link>
          <Link href="/discover" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-muted hover:text-fg hover:bg-white/[.06] transition-all flex items-center gap-2">
            <Compass size={16} />
            <span className="hidden md:block">Entdecken</span>
          </Link>
          {user && (
            <Link href="/watchlist" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-muted hover:text-fg hover:bg-white/[.06] transition-all flex items-center gap-2">
              <Bookmark size={16} />
              <span className="hidden md:block">{t('nav.watchlist')}</span>
            </Link>
          )}
          <Link href="/search" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-muted hover:text-fg hover:bg-white/[.06] transition-all flex items-center gap-2">
            <Search size={16} />
            <span className="hidden md:block">{t('nav.search')}</span>
          </Link>
          <Link href="/backgrounds" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-muted hover:text-fg hover:bg-white/[.06] transition-all flex items-center gap-2">
            <ImageIcon size={16} />
            <span className="hidden md:block">Hintergründe</span>
          </Link>
          <Link href="/legal" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-muted hover:text-fg hover:bg-white/[.06] transition-all flex items-center gap-2">
            <Shield size={16} />
            <span className="hidden md:block">Legal & Privacy</span>
          </Link>
        </div>

        {/* DESKTOP ACTIONS & AUTH */}
        <div className="hidden lg:flex px-2 items-center gap-4">
          <button
            onClick={openCommandPalette}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[.04] border border-line text-faint hover:text-fg hover:border-line-strong transition-colors"
            title="Schnellsuche (⌘K)"
          >
            <Search size={15} />
            <kbd className="text-[10px] font-bold flex items-center gap-0.5"><Command size={10} />K</kbd>
          </button>
          <HeaderGenreFilter />
          <div className="flex items-center gap-2 border-l border-white/10 pl-4">
            <LanguageToggle />
            <ThemeToggle />
          </div>

          {user ? (
            <div className="flex items-center gap-3 pl-2">
              <NotificationBell />
              <Link href="/profile" className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white/[.06] border border-line rounded-xl hover:bg-white/[.1] transition-colors group">
                 <div className="w-6 h-6 bg-surface-3 group-hover:bg-primary-500 rounded-full flex items-center justify-center transition-colors">
                    <User size={14} className="text-muted group-hover:text-white" />
                 </div>
                 <span className="text-xs font-semibold text-muted truncate max-w-[100px]">{user.email}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-3 bg-danger/12 border border-line text-danger rounded-xl hover:bg-danger/20 transition-all group"
                title="Logout"
              >
                <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-glow ml-2 group"
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
          <div className="bg-elev/95 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl shadow-2xl flex flex-col gap-3">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-lg font-bold text-white hover:bg-white/10 transition-colors">{t('nav.home')}</Link>
            <button onClick={() => { setIsMobileMenuOpen(false); openCommandPalette(); }} className="px-4 py-3 rounded-xl text-lg font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors text-left"><Search size={20} />Schnellsuche</button>
            <Link href="/discover" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-lg font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors"><Compass size={20} />Entdecken</Link>
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
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-muted truncate max-w-[180px]">{user.email}</span>
                </div>
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 bg-primary-600 text-white hover:bg-primary-500 py-3 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-glow">
                <LogIn size={18} /> {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      )}

      <CommandPalette authed={!!user} />
    </header>
  );
}