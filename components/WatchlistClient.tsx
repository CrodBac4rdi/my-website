'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Bookmark, Plus, LayoutGrid, Play, Check, X, Clock, PauseCircle, Trash2,
} from 'lucide-react';
import AnimeCard from '@/components/AnimeCard';
import ConfirmModal from '@/components/ConfirmModal';
import { toast } from '@/lib/toast';
import { updateWatchlistAction, clearWatchlistAction } from '@/lib/actions/watchlist';

export type WatchlistItem = {
  id: number;
  status: string;
  rating: number | null;
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

export default function WatchlistClient({ initialItems }: { initialItems: WatchlistItem[] }) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState('all');
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
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

  const filtered =
    activeTab === 'all' ? watchlist : watchlist.filter(item => item.status === activeTab);

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
        <button
          onClick={() => setConfirmClear(true)}
          className="inline-flex items-center gap-2 text-sm font-medium text-faint hover:text-danger transition"
        >
          <Trash2 size={15} /> Watchlist leeren
        </button>
      </div>

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
          Keine Titel in dieser Kategorie.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 pt-4">
          {filtered.map((item, index) => {
            const mediaObj = Array.isArray(item.media) ? item.media[0] : item.media;
            if (!mediaObj) return null;

            return (
              <AnimeCard
                key={item.id}
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
    </div>
  );
}
