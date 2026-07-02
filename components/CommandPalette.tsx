'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  Search, Home, Compass, Bookmark, Image as ImageIcon, Shield,
  Calendar, List as ListIcon, User, Download, CornerDownLeft, Loader2, Users, HelpCircle, Sparkles,
} from 'lucide-react';
import { getImageUrl } from '@/lib/tmdb';
import { getRecentMedia, type RecentItem } from '@/lib/recentHistory';

type NavCommand = {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  keywords: string;
  authed?: boolean;
};

type MediaResult = {
  id: number;
  title: string;
  media_type: 'tv' | 'movie';
  poster_path: string | null;
  year: string;
};

const NAV_COMMANDS: NavCommand[] = [
  { id: 'home', label: 'Startseite', href: '/', icon: <Home size={18} />, keywords: 'home start trending' },
  { id: 'discover', label: 'Entdecken', href: '/discover', icon: <Compass size={18} />, keywords: 'discover filter genre entdecken' },
  { id: 'community', label: 'Community', href: '/community', icon: <Users size={18} />, keywords: 'community profile entdecken leute öffentlich listen' },
  { id: 'search', label: 'Suche', href: '/search', icon: <Search size={18} />, keywords: 'search suche finden' },
  { id: 'watchlist', label: 'Watchlist', href: '/watchlist', icon: <Bookmark size={18} />, keywords: 'watchlist merkliste liste', authed: true },
  { id: 'feed', label: 'Feed', href: '/feed', icon: <Users size={18} />, keywords: 'feed social follower aktivität freunde', authed: true },
  { id: 'recommendations', label: 'Empfehlungen', href: '/recommendations', icon: <Sparkles size={18} />, keywords: 'empfehlungen recommendations für dich watchlist vorschläge', authed: true },
  { id: 'lists', label: 'Meine Listen', href: '/lists', icon: <ListIcon size={18} />, keywords: 'listen lists sammlungen', authed: true },
  { id: 'profile', label: 'Profil', href: '/profile', icon: <User size={18} />, keywords: 'profil profile account konto einstellungen', authed: true },
  { id: 'calendar', label: 'Kalender', href: '/calendar', icon: <Calendar size={18} />, keywords: 'kalender calendar airing simulcast' },
  { id: 'import', label: 'Import', href: '/import', icon: <Download size={18} />, keywords: 'import mal anilist csv', authed: true },
  { id: 'backgrounds', label: 'Hintergründe', href: '/backgrounds', icon: <ImageIcon size={18} />, keywords: 'hintergründe backgrounds wallpaper themes' },
  { id: 'faq', label: 'FAQ', href: '/faq', icon: <HelpCircle size={18} />, keywords: 'faq hilfe fragen help installieren app' },
  { id: 'legal', label: 'Legal & Privacy', href: '/legal', icon: <Shield size={18} />, keywords: 'legal privacy datenschutz impressum' },
];

// Subsequenz-Match: jedes Zeichen der Query muss in Reihenfolge vorkommen.
function fuzzyMatch(query: string, text: string): boolean {
  if (!query) return true;
  let qi = 0;
  for (let ti = 0; ti < text.length && qi < query.length; ti++) {
    if (text[ti] === query[qi]) qi++;
  }
  return qi === query.length;
}

export default function CommandPalette({ authed }: { authed: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaResult[]>([]);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Globaler Hotkey: ⌘K / Ctrl+K öffnet, ESC schließt.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        // Robust schließen, unabhängig vom Fokus (Input-Fokus reicht nicht immer).
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-command-palette', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('open-command-palette', onOpen);
    };
  }, []);

  // Beim Öffnen: zurücksetzen, fokussieren, Body-Scroll sperren (Handy/PWA).
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setRecent(getRecentMedia());
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const navMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NAV_COMMANDS.filter((c) => {
      if (c.authed && !authed) return false;
      return fuzzyMatch(q, c.label.toLowerCase()) || fuzzyMatch(q, c.keywords);
    });
  }, [query, authed]);

  // Live-Suche (debounced) gegen die bestehende TMDB-Route.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const data = await res.json();
        const mapped: MediaResult[] = (data?.results ?? [])
          .filter((r: any) => (r.media_type === 'tv' || r.media_type === 'movie') && r.poster_path)
          .filter((r: any, i: number, self: any[]) => self.findIndex((x) => x.id === r.id) === i)
          .slice(0, 6)
          .map((r: any) => ({
            id: r.id,
            title: r.name || r.title || r.original_name || 'Unbekannt',
            media_type: r.media_type === 'movie' ? 'movie' : 'tv',
            poster_path: r.poster_path,
            year: (r.first_air_date || r.release_date || '').split('-')[0] || '',
          }));
        setResults(mapped);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [query]);

  const isEmptyQuery = query.trim().length === 0;
  const showRecent = isEmptyQuery && recent.length > 0;

  // Flache Liste aller auswählbaren Einträge für Tastatur-Navigation.
  // Bei leerer Suche: zuletzt angesehene Titel zuerst (nützlicher als die
  // immer gleiche Nav-Liste), sonst Navigation + Live-Suchtreffer.
  const flatItems = useMemo(
    () =>
      showRecent
        ? [
            ...recent.map((m) => ({ kind: 'recent' as const, media: m })),
            ...navMatches.map((c) => ({ kind: 'nav' as const, nav: c })),
          ]
        : [
            ...navMatches.map((c) => ({ kind: 'nav' as const, nav: c })),
            ...results.map((m) => ({ kind: 'media' as const, media: m })),
          ],
    [showRecent, recent, navMatches, results],
  );

  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, flatItems.length - 1)));
  }, [flatItems.length]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  const activate = useCallback(
    (index: number) => {
      const item = flatItems[index];
      if (!item) return;
      if (item.kind === 'nav') go(item.nav.href);
      else go(`/media/${item.media.id}?type=${item.media.media_type}`); // 'recent' | 'media' teilen sich die Form
    },
    [flatItems, go],
  );

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (flatItems.length ? (a + 1) % flatItems.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (flatItems.length ? (a - 1 + flatItems.length) % flatItems.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      activate(active);
    }
  };

  // Aktiven Eintrag in den sichtbaren Bereich scrollen.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  if (!open) return null;

  const recentCount = showRecent ? recent.length : 0;
  const navCount = navMatches.length;

  // Per Portal an document.body — sonst erbt die Palette pointer-events-none
  // vom Header und Klicks gehen einfach durch (man kann nichts auswählen/schließen).
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh] pointer-events-auto"
      onMouseDown={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Befehlspalette"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-xl bg-elev/95 border border-line-strong rounded-2xl shadow-pop overflow-hidden backdrop-blur-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* INPUT */}
        <div className="flex items-center gap-3 px-4 border-b border-line">
          <Search size={20} className="text-faint shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Suche Anime, Filme oder springe zu einer Seite…"
            className="flex-1 bg-transparent py-4 text-fg placeholder:text-faint focus:outline-none text-base"
          />
          {loading && <Loader2 size={16} className="animate-spin text-faint shrink-0" />}
        </div>

        {/* RESULTS */}
        <div ref={listRef} className="max-h-[55vh] overflow-y-auto py-2">
          {flatItems.length === 0 && (
            <p className="px-4 py-8 text-center text-faint text-sm">
              {query.trim().length >= 2 ? 'Keine Treffer.' : 'Tippe zum Suchen…'}
            </p>
          )}

          {recentCount > 0 && (
            <div className="px-2">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-faint">Zuletzt angesehen</p>
              {recent.map((m, i) => {
                const idx = i;
                return (
                  <button
                    key={`recent-${m.id}`}
                    data-idx={idx}
                    onMouseMove={() => setActive(idx)}
                    onClick={() => activate(idx)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      active === idx ? 'bg-primary-600/20 text-fg' : 'text-muted hover:bg-white/[.04]'
                    }`}
                  >
                    <img
                      src={getImageUrl(m.poster_path)}
                      alt=""
                      className="w-8 h-12 object-cover rounded shrink-0 border border-line"
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium truncate">{m.title}</span>
                      <span className="block text-xs text-faint">
                        {m.year || 'TBA'} · {m.media_type === 'movie' ? 'Film' : 'TV'}
                      </span>
                    </span>
                    {active === idx && <CornerDownLeft size={14} className="text-faint shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {navCount > 0 && (
            <div className="px-2 mt-1">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-faint">Navigation</p>
              {navMatches.map((c, i) => {
                const idx = recentCount + i;
                return (
                  <button
                    key={c.id}
                    data-idx={idx}
                    onMouseMove={() => setActive(idx)}
                    onClick={() => activate(idx)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      active === idx ? 'bg-primary-600/20 text-fg' : 'text-muted hover:bg-white/[.04]'
                    }`}
                  >
                    <span className={active === idx ? 'text-primary-400' : 'text-faint'}>{c.icon}</span>
                    <span className="flex-1 text-sm font-medium">{c.label}</span>
                    {active === idx && <CornerDownLeft size={14} className="text-faint" />}
                  </button>
                );
              })}
            </div>
          )}

          {results.length > 0 && (
            <div className="px-2 mt-1">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-faint">Treffer</p>
              {results.map((m, i) => {
                const idx = navCount + i;
                return (
                  <button
                    key={`${m.media_type}-${m.id}`}
                    data-idx={idx}
                    onMouseMove={() => setActive(idx)}
                    onClick={() => activate(idx)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      active === idx ? 'bg-primary-600/20 text-fg' : 'text-muted hover:bg-white/[.04]'
                    }`}
                  >
                    <img
                      src={getImageUrl(m.poster_path)}
                      alt=""
                      className="w-8 h-12 object-cover rounded shrink-0 border border-line"
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium truncate">{m.title}</span>
                      <span className="block text-xs text-faint">
                        {m.year || 'TBA'} · {m.media_type === 'movie' ? 'Film' : 'TV'}
                      </span>
                    </span>
                    {active === idx && <CornerDownLeft size={14} className="text-faint shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-line text-[11px] text-faint">
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-surface-3 border border-line">↑↓</kbd> navigieren</span>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-surface-3 border border-line">↵</kbd> öffnen</span>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-surface-3 border border-line">esc</kbd> schließen</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
