'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Bookmark, Plus, LayoutGrid, Play, Check, X, Clock, PauseCircle, Trash2,
  Search, ArrowUpDown, CheckSquare, Square, Loader2,
} from 'lucide-react';
import AnimeCard from '@/components/AnimeCard';
import ConfirmModal from '@/components/ConfirmModal';
import { toast } from '@/lib/toast';
import {
  updateWatchlistAction, clearWatchlistAction, bulkUpdateStatusAction, bulkDeleteAction,
} from '@/lib/actions/watchlist';

export type WatchlistItem = {
  id: number;
  status: string;
  rating: number | null;
  updated_at?: string;
  media: {
    id: number;
    title: string;
    cover_url: string;
    type: string;
  } | null;
};

const STATUS_TABS = [
  { value: 'all',           label: 'Alle',          icon: LayoutGrid  },
  { value: 'watching',      label: 'Watching',       icon: Play        },
  { value: 'completed',     label: 'Abgeschlossen',  icon: Check       },
  { value: 'plan_to_watch', label: 'Geplant',        icon: Clock       },
  { value: 'dropped',       label: 'Abgebrochen',    icon: X           },
  { value: 'on_hold',       label: 'Pausiert',       icon: PauseCircle },
];

const SORT_OPTIONS = [
  { value: 'updated_desc', label: 'Zuletzt aktualisiert' },
  { value: 'rating_desc',  label: 'Bewertung (hoch → niedrig)' },
  { value: 'title_asc',    label: 'Titel (A–Z)' },
] as const;
type SortValue = (typeof SORT_OPTIONS)[number]['value'];

function mediaTitle(item: WatchlistItem) {
  const m = Array.isArray(item.media) ? item.media[0] : item.media;
  return m?.title ?? '';
}

export default function WatchlistClient({ initialItems }: { initialItems: WatchlistItem[] }) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortValue>('updated_desc');
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const updatingRef = useRef<Set<number>>(new Set()); // verhindert parallele Updates pro Item

  const handleClearAll = async () => {
    setClearing(true);
    const res = await clearWatchlistAction();
    if (res.ok) {
      setWatchlist([]);
      toast.success('Watchlist geleert.');
      setConfirmClear(false);
    } else {
      toast.error(res.error);
    }
    setClearing(false);
  };

  const handleStatusChange = async (itemId: number, newStatus: string) => {
    if (updatingRef.current.has(itemId)) return;
    updatingRef.current.add(itemId);

    const res = await updateWatchlistAction({ watchlistId: itemId, status: newStatus });
    if (res.ok) {
      setWatchlist(prev => prev.map(item => (item.id === itemId ? { ...item, status: newStatus } : item)));
    } else {
      toast.error(res.error);
    }
    updatingRef.current.delete(itemId);
  };

  const handleRatingChange = async (itemId: number, newRating: number) => {
    if (updatingRef.current.has(itemId)) return;
    updatingRef.current.add(itemId);

    const res = await updateWatchlistAction({ watchlistId: itemId, rating: newRating });
    if (res.ok) {
      setWatchlist(prev => prev.map(item => (item.id === itemId ? { ...item, rating: newRating } : item)));
    } else {
      toast.error(res.error);
    }
    updatingRef.current.delete(itemId);
  };

  const toggleSelectMode = () => {
    setSelectMode(m => !m);
    setSelected(new Set());
  };

  const toggleSelected = (itemId: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const handleBulkStatus = async (newStatus: string) => {
    if (selected.size === 0 || bulkBusy) return;
    setBulkBusy(true);
    const ids = [...selected];
    const res = await bulkUpdateStatusAction({ watchlistIds: ids, status: newStatus });
    if (res.ok) {
      setWatchlist(prev => prev.map(item => (ids.includes(item.id) ? { ...item, status: newStatus } : item)));
      toast.success(`${ids.length} Titel aktualisiert.`);
      setSelected(new Set());
      setSelectMode(false);
    } else {
      toast.error(res.error);
    }
    setBulkBusy(false);
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0 || bulkBusy) return;
    setBulkBusy(true);
    const ids = [...selected];
    const res = await bulkDeleteAction({ watchlistIds: ids });
    if (res.ok) {
      setWatchlist(prev => prev.filter(item => !ids.includes(item.id)));
      toast.success(`${ids.length} Titel entfernt.`);
      setSelected(new Set());
      setSelectMode(false);
      setConfirmBulkDelete(false);
    } else {
      toast.error(res.error);
    }
    setBulkBusy(false);
  };

  if (watchlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-10 container mx-auto px-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full" />
          <div className="relative bg-elev border border-line p-12 rounded-[3rem] shadow-2xl">
            <Bookmark size={80} className="text-primary-500" />
          </div>
        </div>
        <div className="text-center space-y-4 max-w-lg">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white tracking-tight">
            Deine Liste ist leer
          </h2>
          <p className="text-muted font-medium text-lg">
            Entdecke neue Inhalte und füge sie deiner persönlichen Watchlist hinzu.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/discover"
            className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-primary-500/20 flex items-center gap-3"
          >
            <Plus size={20} /> Entdecken starten
          </Link>
          <Link
            href="/community"
            className="bg-surface-3 border border-line-strong hover:border-primary-500/50 text-fg font-bold py-4 px-10 rounded-2xl transition-all flex items-center gap-3"
          >
            Community ansehen
          </Link>
        </div>
      </div>
    );
  }

  const byTab = activeTab === 'all' ? watchlist : watchlist.filter(item => item.status === activeTab);

  const q = query.trim().toLowerCase();
  const bySearch = q ? byTab.filter(item => mediaTitle(item).toLowerCase().includes(q)) : byTab;

  const filtered = [...bySearch].sort((a, b) => {
    switch (sort) {
      case 'rating_desc':
        return (b.rating ?? 0) - (a.rating ?? 0);
      case 'title_asc':
        return mediaTitle(a).localeCompare(mediaTitle(b), 'de');
      case 'updated_desc':
      default:
        return new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime();
    }
  });

  const counts = STATUS_TABS.reduce(
    (acc, tab) => ({
      ...acc,
      [tab.value]:
        tab.value === 'all' ? watchlist.length : watchlist.filter(i => i.status === tab.value).length,
    }),
    {} as Record<string, number>
  );

  return (
    <div className="space-y-10 pb-20 pt-10 container mx-auto px-4 min-h-screen">

      {/* HEADER */}
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20 inline-block">
          <Bookmark className="text-primary-400" size={28} />
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white tracking-tight">Deine Watchlist</h1>
        <p className="text-muted font-medium max-w-xl mx-auto">
          {watchlist.length} Titel gespeichert.
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setConfirmClear(true)}
            className="inline-flex items-center gap-2 text-sm font-medium text-faint hover:text-danger transition"
          >
            <Trash2 size={15} /> Watchlist leeren
          </button>
          <button
            onClick={toggleSelectMode}
            className="inline-flex items-center gap-2 text-sm font-medium text-faint hover:text-fg transition"
          >
            {selectMode ? <CheckSquare size={15} /> : <Square size={15} />}
            {selectMode ? 'Auswahl beenden' : 'Mehrere auswählen'}
          </button>
        </div>
      </div>

      {/* SUCHE + SORTIERUNG */}
      <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto w-full">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Titel durchsuchen…"
            className="w-full bg-surface-2 border border-line-strong rounded-xl pl-11 pr-4 py-2.5 text-sm text-fg placeholder:text-faint focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 transition"
          />
        </div>
        <div className="relative shrink-0">
          <ArrowUpDown size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint pointer-events-none" />
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortValue)}
            className="appearance-none bg-surface-2 border border-line-strong rounded-xl pl-9 pr-8 py-2.5 text-sm font-semibold text-fg focus:outline-none focus:border-primary-500 cursor-pointer"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* BULK-ACTION-LEISTE */}
      {selectMode && (
        <div className="sticky top-24 z-30 max-w-2xl mx-auto w-full bg-elev/95 backdrop-blur-xl border border-line-strong rounded-2xl shadow-pop px-5 py-3 flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-fg">{selected.size} ausgewählt</span>
          <div className="flex-1" />
          <select
            disabled={selected.size === 0 || bulkBusy}
            onChange={e => { if (e.target.value) handleBulkStatus(e.target.value); e.target.value = ''; }}
            defaultValue=""
            className="bg-surface-3 border border-line-strong rounded-lg px-3 py-2 text-xs font-bold text-fg focus:outline-none focus:border-primary-500 disabled:opacity-50 cursor-pointer"
          >
            <option value="" disabled>Status ändern…</option>
            {STATUS_TABS.filter(t => t.value !== 'all').map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <button
            onClick={() => setConfirmBulkDelete(true)}
            disabled={selected.size === 0 || bulkBusy}
            className="inline-flex items-center gap-1.5 bg-danger/15 text-danger border border-danger/40 hover:bg-danger/25 rounded-lg px-3 py-2 text-xs font-bold transition disabled:opacity-50"
          >
            {bulkBusy ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            Entfernen
          </button>
        </div>
      )}

      {/* STATUS FILTER TABS */}
      <div className="flex flex-wrap gap-2 justify-center">
        {STATUS_TABS.map(tab => {
          const Icon = tab.icon;
          const count = counts[tab.value];
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                activeTab === tab.value
                  ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/20'
                  : 'bg-elev border-line text-muted hover:border-line-strong hover:text-fg'
              }`}
            >
              <Icon size={15} />
              {tab.label}
              {count > 0 && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.value ? 'bg-white/20' : 'bg-surface-3'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* GRID */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-faint italic font-medium">
          {query ? `Keine Treffer für „${query}".` : 'Keine Titel in dieser Kategorie.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 pt-4">
          {filtered.map((item, index) => {
            const mediaObj = Array.isArray(item.media) ? item.media[0] : item.media;
            if (!mediaObj) return null;
            const isSelected = selected.has(item.id);

            return (
              <div key={item.id} className="relative">
                <AnimeCard
                  index={index}
                  media={{
                    id: mediaObj.id,
                    title: mediaObj.title,
                    poster_path: mediaObj.cover_url,
                    media_type: mediaObj.type,
                    vote_average: 0,
                  }}
                  watchlistStatus={item.status}
                  watchlistRating={item.rating ?? undefined}
                  onStatusChange={status => handleStatusChange(item.id, status)}
                  onRatingChange={rating => handleRatingChange(item.id, rating)}
                />
                {selectMode && (
                  <button
                    type="button"
                    onClick={() => toggleSelected(item.id)}
                    aria-label={isSelected ? 'Auswahl entfernen' : 'Titel auswählen'}
                    className={`absolute inset-0 z-30 rounded-lg transition-colors flex items-start justify-start p-2.5 ${
                      isSelected ? 'bg-primary-500/25 ring-2 ring-primary-500' : 'bg-black/0 hover:bg-black/20'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 shadow-md ${
                        isSelected ? 'bg-primary-600 border-primary-500' : 'bg-black/60 border-white/70'
                      }`}
                    >
                      {isSelected && <Check size={14} className="text-white" />}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={confirmClear}
        danger
        title="Gesamte Watchlist leeren?"
        message="Das entfernt alle Titel von deiner Watchlist. Diese Aktion kann nicht rückgängig gemacht werden."
        confirmLabel="Ja, alles leeren"
        loading={clearing}
        onConfirm={handleClearAll}
        onCancel={() => setConfirmClear(false)}
      />

      <ConfirmModal
        open={confirmBulkDelete}
        danger
        title={`${selected.size} Titel entfernen?`}
        message="Die ausgewählten Titel werden von deiner Watchlist entfernt. Das kann nicht rückgängig gemacht werden."
        confirmLabel="Entfernen"
        loading={bulkBusy}
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />
    </div>
  );
}
