import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { ensureMedia } from '@/lib/services/media';
import { searchMedia } from '@/lib/tmdb';
import type { ImportChunk } from '@/lib/validation/import';

type Client = SupabaseClient<Database>;

export type ImportResult = {
  title: string;
  ok: boolean;
  matched?: string;
  reason?: string;
};

/** Sucht den besten TMDB-Treffer für einen Titel (TV/Film mit Poster, Anime bevorzugt). */
async function findBestMatch(title: string) {
  const data = await searchMedia(title);
  const candidates = (data?.results ?? []).filter(
    (r: any) => (r.media_type === 'tv' || r.media_type === 'movie') && r.poster_path
  );
  if (candidates.length === 0) return null;
  // Anime (japanische Originalsprache) bevorzugen, sonst der populärste Treffer.
  return candidates.find((r: any) => r.original_language === 'ja') ?? candidates[0];
}

/**
 * Importiert einen Chunk: pro Eintrag TMDB-Match → media-Cache → Watchlist-Upsert
 * (überschreibt vorhandene Einträge nicht mit Konflikt-Fehler).
 * Sequentiell, um TMDB-Rate-Limits zu respektieren.
 */
export async function importChunk(
  supabase: Client,
  userId: string,
  entries: ImportChunk
): Promise<ImportResult[]> {
  const results: ImportResult[] = [];

  for (const entry of entries) {
    try {
      const match = await findBestMatch(entry.title);
      if (!match) {
        results.push({ title: entry.title, ok: false, reason: 'Kein TMDB-Treffer' });
        continue;
      }

      const type: 'tv' | 'movie' = match.media_type === 'movie' ? 'movie' : 'tv';
      const matchedTitle = match.name || match.title || match.original_name || entry.title;

      const { error: mediaError } = await ensureMedia(supabase, {
        mediaId: match.id,
        title: matchedTitle,
        type,
        posterPath: match.poster_path ?? null,
      });
      if (mediaError) {
        results.push({ title: entry.title, ok: false, reason: 'media-Fehler' });
        continue;
      }

      const { error } = await supabase
        .from('user_watchlist')
        .upsert(
          { user_id: userId, media_id: match.id, status: entry.status },
          { onConflict: 'user_id,media_id' }
        );
      if (error) {
        results.push({ title: entry.title, ok: false, reason: 'Watchlist-Fehler' });
        continue;
      }

      results.push({ title: entry.title, ok: true, matched: matchedTitle });
    } catch {
      results.push({ title: entry.title, ok: false, reason: 'Unerwarteter Fehler' });
    }
  }

  return results;
}
