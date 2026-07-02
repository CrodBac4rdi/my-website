import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

type Client = SupabaseClient<Database>;

/**
 * Stellt einen DSGVO-artigen Export aller Nutzerdaten zusammen. Reine Lese-
 * Operationen, RLS scoped bereits auf own-only — jede Query filtert zusätzlich
 * explizit auf user_id (Defense-in-Depth). Technische Bookkeeping-Tabellen
 * (rate_limit_events, push_subscriptions) sind bewusst ausgeschlossen — das
 * sind interne Sicherheits-/Gerätedaten, keine "eigenen Inhalte".
 */
export async function getUserDataExport(supabase: Client, userId: string) {
  const [
    profileRes,
    watchlistRes,
    listsRes,
    reviewsRes,
    reviewVotesRes,
    followingRes,
    followersRes,
    notificationsRes,
    activitiesRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase
      .from('user_watchlist')
      .select('status, rating, notes, created_at, updated_at, media (id, title, type, cover_url)')
      .eq('user_id', userId),
    supabase
      .from('custom_lists')
      .select('id, name, description, is_public, created_at, updated_at, custom_list_items (sort_order, added_at, media (id, title, type, cover_url))')
      .eq('user_id', userId),
    supabase
      .from('reviews')
      .select('rating, content, is_spoiler, created_at, updated_at, media (id, title, type)')
      .eq('user_id', userId),
    supabase.from('review_votes').select('review_id, created_at').eq('user_id', userId),
    supabase.from('follows').select('following_id, created_at').eq('follower_id', userId),
    supabase.from('follows').select('follower_id, created_at').eq('following_id', userId),
    supabase.from('notifications').select('type, title, message, is_read, created_at').eq('user_id', userId),
    supabase.from('user_activities').select('activity_type, media_id, metadata, created_at').eq('user_id', userId),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    profile: profileRes.data ?? null,
    watchlist: watchlistRes.data ?? [],
    lists: listsRes.data ?? [],
    reviews: reviewsRes.data ?? [],
    reviewVotesGiven: reviewVotesRes.data ?? [],
    following: followingRes.data ?? [],
    followers: followersRes.data ?? [],
    notifications: notificationsRes.data ?? [],
    activities: activitiesRes.data ?? [],
  };
}
