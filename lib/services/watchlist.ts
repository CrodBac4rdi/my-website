import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { ensureMedia } from '@/lib/services/media';
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

/** Liest die komplette Watchlist eines Nutzers (für Server Components). */
export async function getWatchlist(supabase: Client, userId: string) {
  return await supabase
    .from('user_watchlist')
    .select('id, status, rating, updated_at, media (id, title, cover_url, type)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
}

export async function addToWatchlist(
  supabase: Client,
  userId: string,
  input: AddToWatchlistInput
) {
  // 1. Media in den Cache schreiben (FK-Ziel für user_watchlist).
  const { error: mediaError } = await ensureMedia(supabase, input);
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

/** Leert die komplette Watchlist eines Nutzers. */
export async function clearWatchlist(supabase: Client, userId: string) {
  const { error } = await supabase.from('user_watchlist').delete().eq('user_id', userId);
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

/** Setzt den Status für mehrere Watchlist-Einträge gleichzeitig (Bulk-Action). */
export async function bulkUpdateStatus(
  supabase: Client,
  userId: string,
  watchlistIds: number[],
  status: WatchlistStatus
) {
  const { error } = await supabase
    .from('user_watchlist')
    .update({ status })
    .eq('user_id', userId)
    .in('id', watchlistIds);
  return { error };
}

/** Entfernt mehrere Watchlist-Einträge gleichzeitig (Bulk-Action). */
export async function bulkDelete(supabase: Client, userId: string, watchlistIds: number[]) {
  const { error } = await supabase
    .from('user_watchlist')
    .delete()
    .eq('user_id', userId)
    .in('id', watchlistIds);
  return { error };
}
