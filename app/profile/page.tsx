import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile, getRecentWatchlist } from '@/lib/services/profile';
import ProfileClient from '@/components/ProfileClient';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: watchlist }] = await Promise.all([
    getProfile(supabase, user.id),
    getRecentWatchlist(supabase, user.id),
  ]);

  return (
    <ProfileClient
      initialProfile={
        profile ?? { username: '', bio: '', avatar_url: '', banner_url: '' }
      }
      initialWatchlist={watchlist ?? []}
    />
  );
}
