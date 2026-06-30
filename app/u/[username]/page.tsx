import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Bookmark, Star, CheckCircle2, Play, Clock, ListChecks, Lock, List as ListIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getProfileByUsername, getWatchlistStats } from '@/lib/services/profile';
import { getWatchlist } from '@/lib/services/watchlist';
import { getPublicListsByUser } from '@/lib/services/lists';
import { getFollowCounts, isFollowing } from '@/lib/services/follows';
import AnimeCard from '@/components/AnimeCard';
import FollowSection from '@/components/FollowSection';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: username,
    description: `Öffentliches Profil von ${username} auf HORIZON.`,
  };
}

function StatTile({ icon, value, label, accent }: { icon: React.ReactNode; value: string | number; label: string; accent: string }) {
  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-1">
      <div className={accent}>{icon}</div>
      <div className="text-2xl font-display font-bold text-fg leading-none">{value}</div>
      <div className="text-[11px] font-bold text-faint uppercase tracking-wider">{label}</div>
    </div>
  );
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile } = await getProfileByUsername(supabase, username);

  if (!profile) notFound();

  if (!profile.is_public) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="p-4 rounded-2xl bg-surface-2 border border-line">
          <Lock size={40} className="text-faint" />
        </div>
        <h1 className="font-display text-3xl font-bold text-fg">@{username} ist privat</h1>
        <p className="text-muted max-w-sm">Dieses Profil wurde nicht öffentlich gestellt.</p>
        <Link href="/" className="text-primary-400 hover:underline font-semibold">Zur Startseite</Link>
      </div>
    );
  }

  const pf = (profile.public_fields ?? {}) as Record<string, boolean>;

  const {
    data: { user: viewer },
  } = await supabase.auth.getUser();
  const isOwn = viewer?.id === profile.id;

  const [{ data: watchlistData }, statsRes, listsRes, counts, viewerFollows] = await Promise.all([
    getWatchlist(supabase, profile.id),
    pf.stats ? getWatchlistStats(supabase, profile.id) : Promise.resolve({ data: null } as { data: null }),
    getPublicListsByUser(supabase, profile.id),
    getFollowCounts(supabase, profile.id),
    viewer && !isOwn ? isFollowing(supabase, viewer.id, profile.id) : Promise.resolve(false),
  ]);

  const watchlist = (watchlistData ?? []) as any[];
  const stats = (statsRes?.data ?? null) as any;
  const lists = (listsRes?.data ?? []) as any[];

  return (
    <div className="space-y-14 pb-24 max-w-5xl mx-auto">
      {/* HEADER */}
      <div>
        <div className="relative aspect-[16/5] max-h-[320px] w-full rounded-3xl overflow-hidden border border-line-strong bg-elev shadow-card">
          {profile.banner_url ? (
            <img src={profile.banner_url} alt="" className="w-full h-full object-cover object-center" />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-primary-700/50 via-primary-600/20 to-primary-500/10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        </div>
        <div className="px-4 md:px-10 -mt-20 relative z-10 flex flex-col md:flex-row md:items-end gap-6">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-bg bg-surface-3 overflow-hidden shrink-0 shadow-pop">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-faint text-5xl font-black uppercase">
                {username.charAt(0)}
              </div>
            )}
          </div>
          <div className="md:pb-3 flex-1">
            <h1 className="font-display text-4xl font-bold text-fg leading-none">{username}</h1>
            {pf.bio && profile.bio && <p className="text-muted mt-3 max-w-xl leading-relaxed">{profile.bio}</p>}
          </div>
          <div className="md:pb-3">
            <FollowSection
              targetId={profile.id}
              isOwn={isOwn}
              isAuthed={!!viewer}
              initialIsFollowing={viewerFollows}
              followers={counts.followers}
              following={counts.following}
            />
          </div>
        </div>
      </div>

      {/* STATS (optional) */}
      {pf.stats && stats && (stats.total_count ?? 0) > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatTile icon={<ListChecks size={16} />} accent="text-primary-400" value={stats.total_count ?? 0} label="Titel gesamt" />
          <StatTile icon={<CheckCircle2 size={16} />} accent="text-success" value={stats.completed_count ?? 0} label="Abgeschlossen" />
          <StatTile icon={<Play size={16} />} accent="text-primary-400" value={stats.watching_count ?? 0} label="Schaut" />
          <StatTile icon={<Clock size={16} />} accent="text-muted" value={stats.planned_count ?? 0} label="Geplant" />
          <StatTile icon={<Star size={16} className="fill-gold" />} accent="text-gold" value={stats.avg_rating != null ? Number(stats.avg_rating).toFixed(1) : '–'} label="Ø Rating" />
        </div>
      )}

      {/* WATCHLIST (Pflicht) */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold flex items-center gap-3">
          <Bookmark className="text-primary-500" size={24} /> Watchlist
        </h2>
        {watchlist.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {watchlist.slice(0, 24).map((item, i) => {
              const m = Array.isArray(item.media) ? item.media[0] : item.media;
              if (!m) return null;
              return (
                <AnimeCard
                  key={item.id}
                  index={i}
                  media={{ id: m.id, title: m.title, poster_path: m.cover_url, media_type: m.type, vote_average: item.rating || 0 }}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-faint">Noch keine Titel auf der Watchlist.</p>
        )}
      </div>

      {/* ÖFFENTLICHE LISTEN */}
      {lists.length > 0 && (
        <div className="space-y-6">
          <h2 className="font-display text-2xl font-bold flex items-center gap-3">
            <ListIcon className="text-primary-500" size={24} /> Öffentliche Listen
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((l) => (
              <Link
                key={l.id}
                href={`/lists/${l.id}`}
                className="bg-elev border border-line rounded-3xl p-6 hover:border-primary-500/50 transition-colors flex flex-col justify-between h-40"
              >
                <div>
                  <h3 className="text-xl font-bold mb-2">{l.name}</h3>
                  <p className="text-faint text-sm line-clamp-2">{l.description || 'Keine Beschreibung'}</p>
                </div>
                <p className="text-faint text-xs mt-2">{l.item_count} Titel</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
