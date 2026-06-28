import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile, getRecentWatchlist, getWatchlistStats } from '@/lib/services/profile';
import ProfileClient, { type WatchlistStats } from '@/components/ProfileClient';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: watchlist }, { data: stats }] = await Promise.all([
    getProfile(supabase, user.id),
    getRecentWatchlist(supabase, user.id),
    getWatchlistStats(supabase, user.id),
  ]);

  return (
    <ProfileClient
      initialProfile={profile ?? { username: '', bio: '', avatar_url: '', banner_url: '' }}
      initialWatchlist={watchlist ?? []}
      stats={(stats as WatchlistStats) ?? null}
      email={user.email ?? ''}
    />
  );
}
