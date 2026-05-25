'use client';

import Link from "next/link";
import { Film, Search, User, LogOut, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      authListener.subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsLoading(true);
        setShowResults(true);
        try {
          const res = await fetch(`https://api.jikan.moe/v4/anime?q=${searchQuery}&limit=5`);
          const data = await res.json();
          setResults(data.data || []);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setShowResults(false);
    }
  };

  const NavLink = ({ href, children, color }: { href: string, children: React.ReactNode, color: string }) => {
    const active = pathname === href;
    return (
      <Link href={href} className={`h-full px-6 flex items-center font-black uppercase italic tracking-tighter border-r-4 border-white transition-all ${active ? color : 'hover:bg-white hover:text-black'}`}>
        {children}
      </Link>
    );
  };

  return (
    <header className="h-20 bg-black/40 backdrop-blur-xl border-b-4 border-white sticky top-0 z-50 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        
        {/* BRAND BLOCK */}
        <Link href="/" className="h-full px-8 flex items-center gap-3 border-r-4 border-white bg-accent-yellow text-black hover:bg-white transition-colors group">
          <Film size={28} className="group-hover:rotate-12 transition-transform" />
          <span className="text-3xl font-black italic tracking-tighter">HORIZON</span>
        </Link>

        {/* NAV BLOCKS */}
        <nav className="hidden lg:flex h-full flex-1">
          <NavLink href="/" color="bg-accent-blue text-white">Discover</NavLink>
          {user && <NavLink href="/watchlist" color="bg-accent-green text-black">Watchlist</NavLink>}
          <NavLink href="/calendar" color="bg-accent-pink text-white">Kalender</NavLink>
        </nav>

        {/* SEARCH BLOCK */}
        <div className="flex-1 max-w-xl h-full relative" ref={searchRef}>
          <form onSubmit={handleSearch} className="h-full flex items-center px-6 gap-4">
            <div className="flex-1 relative group">
              <input 
                type="text" 
                placeholder="ANIME SUCHEN..." 
                value={searchQuery}
                onFocus={() => searchQuery.length > 2 && setShowResults(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white font-black uppercase italic tracking-widest placeholder:text-white/30 focus:outline-none py-2"
              />
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-accent-blue group-focus-within:w-full transition-all duration-300"></div>
            </div>
            {isLoading ? <Loader2 size={24} className="text-accent-blue animate-spin" /> : <Search size={24} className="text-white" />}
          </form>

          <AnimatePresence>
            {showResults && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 bg-white border-x-4 border-b-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] z-50 overflow-hidden"
              >
                {results.length > 0 ? (
                  <div className="p-2 space-y-2">
                    {results.map((anime) => (
                      <Link 
                        key={anime.mal_id}
                        href={`/media/${anime.mal_id}`}
                        onClick={() => setShowResults(false)}
                        className="flex items-center gap-4 p-3 hover:bg-accent-blue hover:text-white transition-all group border-2 border-transparent hover:border-black"
                      >
                        <img src={anime.images.jpg.small_image_url} alt="" className="w-12 h-16 object-cover border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
                        <div className="flex-1 min-w-0 font-black">
                          <h4 className="text-lg uppercase truncate italic leading-none mb-1">
                            {anime.title_english || anime.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase bg-black text-white px-1.5 py-0.5">{anime.type}</span>
                            <span className="text-[10px] uppercase text-slate-500 group-hover:text-white/70 tracking-widest">Score: {anime.score || 'N/A'}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : !isLoading && (
                  <div className="p-8 text-center font-black uppercase italic text-black bg-accent-yellow">Keine Treffer gefunden!</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* AUTH BLOCK */}
        <div className="h-full flex items-center border-l-4 border-white px-6 gap-4 bg-black/20">
          {user ? (
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="w-12 h-12 flex items-center justify-center bg-accent-pink text-white border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:scale-95"
              title="Logout"
            >
              <LogOut size={24} />
            </button>
          ) : (
            <Link href="/login" className="px-8 py-3 bg-accent-blue text-white font-black uppercase italic tracking-tighter border-2 border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              Login
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}