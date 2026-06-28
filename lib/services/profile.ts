import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import type { UpdateProfileInput } from '@/lib/validation/profile';

type Client = SupabaseClient<Database>;

/** Profil eines Nutzers (für Server Components). */
export async function getProfile(supabase: Client, userId: string) {
  return await supabase.from('profiles').select('*').eq('id', userId).single();
}

/** Aggregierte Watchlist-Statistiken (View user_watchlist_stats, own-only via RLS). */
export async function getWatchlistStats(supabase: Client, userId: string) {
  return await supabase
    .from('user_watchlist_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
}

/** Letzte N Watchlist-Einträge für die Profil-Vorschau. */
export async function getRecentWatchlist(supabase: Client, userId: string, limit = 6) {
  return await supabase
    .from('user_watchlist')
    .select('id, status, rating, media (id, title, cover_url, type)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit);
}

/** Profil upserten. id = userId erzwingt, dass nur das eigene Profil geschrieben wird. */
export async function updateProfile(supabase: Client, userId: string, input: UpdateProfileInput) {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    username: input.username,
    bio: input.bio,
    avatar_url: input.avatarUrl,
    banner_url: input.bannerUrl,
    updated_at: new Date().toISOString(),
  });
  return { error };
}
