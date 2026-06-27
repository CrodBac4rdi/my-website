import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { getImageUrl } from '@/lib/tmdb';
import type { AddToWatchlistInput, WatchlistStatus } from '@/lib/validation/watchlist';

/**
 * Watchlist-Service: gekapselte DB-Zugriffe, keine Auth-/HTTP-Logik.
 *
 * Alle Funktionen werden mit einem authentifizierten Server-Client und der
 * `userId` aufgerufen und scopen zusätzlich auf `user_id` (Defense-in-Depth
 * zur RLS). Rückgabe folgt dem Supabase-`{ error }`-Stil, damit die Action
 * Fehlercodes (z.B. 23505) auswerten kann.
 */
type Client = SupabaseClient<Database>;

/** Wandelt einen TMDB-Pfad/URL in eine DB-taugliche cover_url (http(s) oder null). */
function toCoverUrl(posterPath: string | null): string | null {
  if (!posterPath) return null;
  const url = getImageUrl(posterPath);
  return url.startsWith('http') ? url : null;
}

export async function addToWatchlist(
  supabase: Client,
  userId: string,
  input: AddToWatchlistInput
) {
  // 1. Media in den Cache schreiben (FK-Ziel für user_watchlist).
  const { error: mediaError } = await supabase.from('media').upsert({
    id: input.mediaId,
    title: input.title,
    type: input.type,
    cover_url: toCoverUrl(input.posterPath),
  });
  if (mediaError) return { error: mediaError };

  // 2. Watchlist-Eintrag anlegen.
  const { error } = await supabase.from('user_watchlist').insert({
    user_id: userId,
    media_id: input.mediaId,
    status: 'plan_to_watch',
  });
  return { error };
}

export async function removeFromWatchlist(supabase: Client, userId: string, mediaId: number) {
  const { error } = await supabase
    .from('user_watchlist')
    .delete()
    .eq('user_id', userId)
    .eq('media_id', mediaId);
  return { error };
}

export async function updateWatchlistEntry(
  supabase: Client,
  userId: string,
  watchlistId: number,
  patch: { status?: WatchlistStatus; rating?: number }
) {
  const { error } = await supabase
    .from('user_watchlist')
    .update(patch)
    .eq('id', watchlistId)
    .eq('user_id', userId);
  return { error };
}
