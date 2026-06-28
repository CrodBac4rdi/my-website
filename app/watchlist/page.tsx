import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getWatchlist } from '@/lib/services/watchlist';
import WatchlistClient, { type WatchlistItem } from '@/components/WatchlistClient';

// Server Component: lädt die Watchlist server-seitig (RLS greift über die
// Cookie-Session), Auth-Redirect server-seitig. Interaktivität in WatchlistClient.
export default async function WatchlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data } = await getWatchlist(supabase, user.id);

  return <WatchlistClient initialItems={(data ?? []) as unknown as WatchlistItem[]} />;
}
