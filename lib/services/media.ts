import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { getImageUrl } from '@/lib/tmdb';
import type { MediaMeta } from '@/lib/validation/media';

type Client = SupabaseClient<Database>;

/** Wandelt einen TMDB-Pfad/URL in eine DB-taugliche cover_url (http(s) oder null). */
export function toCoverUrl(posterPath: string | null): string | null {
  if (!posterPath) return null;
  const url = getImageUrl(posterPath);
  return url.startsWith('http') ? url : null;
}

/**
 * Stellt sicher, dass ein Medien-Eintrag im `media`-Cache existiert (upsert).
 * Notwendig vor jedem Insert, der per FK auf media(id) verweist
 * (user_watchlist, reviews, custom_list_items).
 */
export async function ensureMedia(supabase: Client, input: MediaMeta) {
  const { error } = await supabase.from('media').upsert({
    id: input.mediaId,
    title: input.title,
    type: input.type,
    cover_url: toCoverUrl(input.posterPath),
  });
  return { error };
}
