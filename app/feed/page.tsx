import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Activity, Bookmark, CheckCircle2, Star, ListPlus, Users, Compass } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getSocialFeed } from '@/lib/services/follows';
import { getImageUrl } from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'Feed',
  description: 'Aktivitäten der Menschen, denen du folgst.',
};

const VERBS: Record<string, string> = {
  added_to_watchlist: 'hat zur Watchlist hinzugefügt',
  completed: 'hat abgeschlossen',
  reviewed: 'hat bewertet',
  created_list: 'hat eine Liste erstellt',
};

function iconFor(type: string) {
  switch (type) {
    case 'added_to_watchlist': return <Bookmark size={16} className="text-primary-400" />;
    case 'completed': return <CheckCircle2 size={16} className="text-purple-400" />;
    case 'reviewed': return <Star size={16} className="text-yellow-400" />;
    case 'created_list': return <ListPlus size={16} className="text-green-400" />;
    default: return <Activity size={16} className="text-muted" />;
  }
}

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { items, followingCount } = await getSocialFeed(supabase, user.id, 40);

  return (
    <div className="max-w-2xl mx-auto pb-20 space-y-8 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-bold flex items-center gap-4">
          <Users className="text-primary-500" size={36} /> Feed
        </h1>
        <Link href="/discover" className="text-sm text-primary-400 hover:underline font-semibold flex items-center gap-1">
          <Compass size={15} /> Entdecken
        </Link>
      </div>

      {followingCount === 0 ? (
        <div className="flex flex-col items-center justify-center text-center gap-4 py-20 bg-surface-1 border border-line border-dashed rounded-3xl">
          <Users size={40} className="text-faint" />
          <h2 className="font-display text-2xl font-bold text-fg">Du folgst noch niemandem</h2>
          <p className="text-muted max-w-sm">
            Folge öffentlichen Profilen, um ihre Aktivitäten hier zu sehen.
          </p>
          <Link href="/community" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold px-5 h-11 rounded-lg transition-colors shadow-glow">
            <Users size={16} /> Profile entdecken
          </Link>
        </div>
      ) : items.length === 0 ? (
        <p className="text-faint text-center py-16">
          Noch keine Aktivität von den Profilen, denen du folgst. Schau später wieder vorbei.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((a) => {
            const verb = VERBS[a.activity_type ?? ''] ?? a.activity_type;
            const meta = (a.metadata ?? {}) as { name?: string; list_id?: string };
            const title = a.activity_type === 'created_list' ? meta.name ?? 'Liste' : a.media_title ?? 'Titel';

            // Primärziel der Aktivität (Medien-Detail oder Liste); sonst kein Link.
            const targetHref = a.media_id
              ? `/media/${a.media_id}?type=${a.media_type ?? 'tv'}`
              : a.activity_type === 'created_list' && meta.list_id
              ? `/lists/${meta.list_id}`
              : null;

            const body = (
              <>
                {a.media_cover && (
                  <img src={getImageUrl(a.media_cover)} alt="" className="w-8 h-12 object-cover rounded-md shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted leading-snug">
                    <span className="font-bold text-fg">@{a.actor_username ?? 'user'}</span> {verb}{' '}
                    <span className="font-semibold text-fg">{title}</span>
                  </p>
                  <p className="text-[10px] text-faint uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                    {iconFor(a.activity_type ?? '')}
                    {a.created_at ? new Date(a.created_at).toLocaleDateString('de-DE') : ''}
                  </p>
                </div>
              </>
            );

            return (
              <li key={a.id} className="flex items-center gap-3 bg-elev/40 border border-line rounded-2xl p-3 hover:border-line-strong transition-colors">
                {/* Akteur-Profil (eigener Link, daher nicht verschachtelt) */}
                <Link href={`/u/${a.actor_username ?? ''}`} className="shrink-0">
                  <div className="w-9 h-9 rounded-full bg-surface-3 overflow-hidden flex items-center justify-center">
                    {a.actor_avatar ? (
                      <img src={a.actor_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-black text-faint uppercase">
                        {(a.actor_username ?? '?').charAt(0)}
                      </span>
                    )}
                  </div>
                </Link>
                {targetHref ? (
                  <Link href={targetHref} className="flex items-center gap-3 flex-1 min-w-0">
                    {body}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 flex-1 min-w-0">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
