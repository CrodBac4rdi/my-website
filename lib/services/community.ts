import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

type Client = SupabaseClient<Database>;

/** Beliebte öffentliche Profile (nach Follower-Zahl) für die Community-Seite. */
export async function getPopularProfiles(supabase: Client, limit = 24) {
  const { data } = await supabase
    .from('popular_public_profiles')
    .select('*')
    .order('followers', { ascending: false })
    .order('username', { ascending: true })
    .limit(limit);
  return data ?? [];
}

/** Öffentliche Listen (community-weit) — neueste zuerst. */
export async function getPublicLists(supabase: Client, limit = 24) {
  const { data } = await supabase
    .from('public_lists_view')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}

/**
 * "Ähnliche Nutzer" — öffentliche Profile mit Watchlist-Overlap zum
 * eingeloggten Nutzer, sortiert nach Jaccard-Score (DB-Funktion, keine AI).
 * Leer für ausgeloggte Nutzer oder wenn niemand überlappt.
 */
export async function getSimilarProfiles(supabase: Client, limit = 8) {
  const { data, error } = await supabase.rpc('get_similar_profiles', { p_limit: limit });
  if (error) {
    console.error('getSimilarProfiles error:', error);
    return [];
  }
  return data ?? [];
}
