'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Loader2, Trash2, Search, Plus,
  Globe, Lock, List, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getImageUrl } from '@/lib/tmdb';
import { toast } from '@/lib/toast';
import { addListItemAction, removeListItemAction } from '@/lib/actions/lists';
import AnimeCard from '@/components/AnimeCard';

type ListItem = {
  id: number;
  sort_order: number;
  added_at: string;
  media: {
    id: number;
    title: string;
    cover_url: string;
    type: string;
  } | null;
};

type ListData = {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  user_id: string;
  created_at: string;
};

type SearchResult = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  media_type: string;
};

export default function ListDetailPage() {
  const { id: listId } = useParams<{ id: string }>();
  const router = useRouter();

  const [list, setList] = useState<ListData | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const deletingRef = useRef<Set<number>>(new Set());
  const addingRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    async function load() {
      if (!supabase) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);

      const { data: listData, error: listErr } = await supabase
        .from('custom_lists')
        .select('*')
        .eq('id', listId)
        .single();

      if (listErr || !listData) {
        toast.error('Liste nicht gefunden.');
        router.push('/lists');
        return;
      }

      // Zugriff prüfen (eigene oder öffentliche Liste)
      if (!listData.is_public && listData.user_id !== user.id) {
        toast.error('Kein Zugriff auf diese Liste.');
        router.push('/lists');
        return;
      }

      setList(listData);

      const { data: itemData } = await supabase
        .from('custom_list_items')
        .select(`id, sort_order, added_at, media (id, title, cover_url, type)`)
        .eq('list_id', listId)
        .order('sort_order', { ascending: true });

      if (itemData) setItems(itemData as unknown as ListItem[]);
      setLoading(false);
    }
    load();
  }, [listId, router]);

  // Debounced TMDB-Suche
  const handleSearchChange = useCallback((q: string) => {
    setSearchQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!q.trim()) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        const filtered = (data.results || []).filter(
          (r: any) => r.media_type !== 'person' && r.poster_path
        );
        setSearchResults(filtered.slice(0, 8));
      } catch {
        toast.error('Suche fehlgeschlagen.');
      } finally {
        setSearching(false);
      }
    }, 400);
  }, []);

  const handleAddItem = async (result: SearchResult) => {
    if (addingRef.current.has(result.id)) return;
    addingRef.current.add(result.id);

    try {
      const res = await addListItemAction({
        listId,
        mediaId: result.id,
        title: result.name || result.title || 'Unbekannt',
        type: result.media_type === 'movie' ? 'movie' : 'tv',
        posterPath: result.poster_path ?? null,
      });

      if (res.ok) {
        setItems(prev => [...prev, res.data as unknown as ListItem]);
        toast.success(`„${result.name || result.title}" hinzugefügt!`);
      } else {
        toast.error(res.error);
      }
    } finally {
      addingRef.current.delete(result.id);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (deletingRef.current.has(itemId)) return;
    deletingRef.current.add(itemId);

    const res = await removeListItemAction(itemId);
    if (res.ok) {
      setItems(prev => prev.filter(i => i.id !== itemId));
      toast.success('Entfernt.');
    } else {
      toast.error(res.error);
    }
    deletingRef.current.delete(itemId);
  };

  const isOwner = list?.user_id === userId;

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <Loader2 className="animate-spin text-blue-500" size={64} />
      </div>
    );
  }

  if (!list) return null;

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-10 pt-6">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link
          href="/lists"
          className="p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-black tracking-tight truncate">{list.name}</h1>
            <span className={`flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1 rounded-full border ${
              list.is_public
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              {list.is_public ? <><Globe size={12} /> Öffentlich</> : <><Lock size={12} /> Privat</>}
            </span>
          </div>
          {list.description && (
            <p className="text-slate-400 mt-1 font-medium">{list.description}</p>
          )}
          <p className="text-slate-600 text-sm mt-1">
            {items.length} {items.length === 1 ? 'Titel' : 'Titel'}
          </p>
        </div>

        {/* ADD BUTTON (nur für Besitzer) */}
        {isOwner && (
          <button
            onClick={() => setShowSearch(s => !s)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all border ${
              showSearch
                ? 'bg-slate-800 border-slate-700 text-slate-300'
                : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
            }`}
          >
            {showSearch ? <><X size={16} /> Schließen</> : <><Plus size={16} /> Hinzufügen</>}
          </button>
        )}
      </div>

      {/* SEARCH PANEL */}
      {showSearch && isOwner && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 backdrop-blur-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Anime oder Film suchen..."
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-600"
              autoFocus
            />
            {searching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-blue-500" size={20} />
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {searchResults.map(result => {
                const alreadyAdded = items.some(i => i.media?.id === result.id);
                return (
                  <button
                    key={result.id}
                    onClick={() => !alreadyAdded && handleAddItem(result)}
                    disabled={alreadyAdded}
                    className={`relative group rounded-xl overflow-hidden border transition-all text-left ${
                      alreadyAdded
                        ? 'border-green-500/30 opacity-60 cursor-not-allowed'
                        : 'border-slate-700 hover:border-blue-500/50 cursor-pointer'
                    }`}
                  >
                    <div className="aspect-[2/3] relative">
                      <img
                        src={getImageUrl(result.poster_path ?? null)}
                        alt={result.name || result.title}
                        className="w-full h-full object-cover"
                      />
                      {!alreadyAdded && (
                        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Plus size={32} className="text-white drop-shadow-lg" />
                        </div>
                      )}
                      {alreadyAdded && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <span className="text-green-400 font-bold text-xs">Bereits drin</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-slate-900/80">
                      <p className="text-[10px] font-bold text-slate-300 line-clamp-2 leading-tight">
                        {result.name || result.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {searchQuery && !searching && searchResults.length === 0 && (
            <p className="text-center text-slate-500 text-sm py-4">
              Keine Ergebnisse für &ldquo;{searchQuery}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* ITEMS GRID */}
      {items.length === 0 ? (
        <div className="text-center py-24 space-y-4">
          <List size={48} className="mx-auto text-slate-700" />
          <p className="text-slate-500 font-medium text-lg">Diese Liste ist noch leer.</p>
          {isOwner && (
            <button
              onClick={() => setShowSearch(true)}
              className="text-blue-400 font-bold hover:underline"
            >
              Titel hinzufügen
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {items.map((item, index) => {
            const mediaObj = Array.isArray(item.media) ? item.media[0] : item.media;
            if (!mediaObj) return null;

            return (
              <div key={item.id} className="relative group/item">
                <AnimeCard
                  index={index}
                  media={{
                    id: mediaObj.id,
                    title: mediaObj.title,
                    poster_path: mediaObj.cover_url,
                    media_type: mediaObj.type,
                    vote_average: 0,
                  }}
                />
                {isOwner && (
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="absolute top-2 left-2 z-30 p-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-red-400 hover:bg-red-500/20 border border-red-500/30 opacity-0 group-hover/item:opacity-100 transition-all"
                    title="Aus Liste entfernen"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
