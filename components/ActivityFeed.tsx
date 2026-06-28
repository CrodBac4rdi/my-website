'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, Bookmark, CheckCircle2, Star, ListPlus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getImageUrl } from '@/lib/tmdb';

type ActivityRow = {
  id: string;
  activity_type: string;
  media_id: number | null;
  metadata: { name?: string; list_id?: string } | null;
  created_at: string;
  media_title: string | null;
  media_cover: string | null;
  media_type: string | null;
};

const VERBS: Record<string, string> = {
  added_to_watchlist: 'zur Watchlist hinzugefügt',
  completed: 'abgeschlossen',
  reviewed: 'bewertet',
  created_list: 'eine Liste erstellt',
};

function iconFor(type: string) {
  switch (type) {
    case 'added_to_watchlist': return <Bookmark size={16} className="text-blue-400" />;
    case 'completed':          return <CheckCircle2 size={16} className="text-purple-400" />;
    case 'reviewed':           return <Star size={16} className="text-yellow-400" />;
    case 'created_list':       return <ListPlus size={16} className="text-green-400" />;
    default:                   return <Activity size={16} className="text-slate-400" />;
  }
}

export default function ActivityFeed() {
  const [items, setItems] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!supabase) { setLoading(false); return; }
      const { data } = await supabase
        .from('activity_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);
      if (data) setItems(data as unknown as ActivityRow[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-blue-500" size={28} />
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="text-slate-500 text-sm">Noch keine Aktivität.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((a) => {
        const label = VERBS[a.activity_type] ?? a.activity_type;
        const title =
          a.activity_type === 'created_list'
            ? a.metadata?.name ?? 'Liste'
            : a.media_title ?? 'Titel';

        const inner = (
          <div className="flex items-center gap-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-3 hover:border-slate-700 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-slate-800/80 flex items-center justify-center shrink-0">
              {iconFor(a.activity_type)}
            </div>
            {a.media_cover && (
              <img
                src={getImageUrl(a.media_cover)}
                alt=""
                className="w-8 h-12 object-cover rounded-md shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-300 leading-tight">
                <span className="font-bold text-white">{title}</span> {label}
              </p>
              <p className="text-[10px] text-slate-600 uppercase tracking-wider mt-0.5">
                {new Date(a.created_at).toLocaleDateString('de-DE')}
              </p>
            </div>
          </div>
        );

        if (a.media_id) {
          return (
            <li key={a.id}>
              <Link href={`/media/${a.media_id}?type=${a.media_type ?? 'tv'}`}>{inner}</Link>
            </li>
          );
        }
        if (a.activity_type === 'created_list' && a.metadata?.list_id) {
          return (
            <li key={a.id}>
              <Link href={`/lists/${a.metadata.list_id}`}>{inner}</Link>
            </li>
          );
        }
        return <li key={a.id}>{inner}</li>;
      })}
    </ul>
  );
}
