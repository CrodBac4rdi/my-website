import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { ensureMedia } from '@/lib/services/media';
import type { CreateReviewInput } from '@/lib/validation/reviews';

type Client = SupabaseClient<Database>;

/**
 * Review-Service. createReview sichert zuerst den media-Cache (FK-Ziel), damit
 * ein Review auch für noch nicht gecachte Titel funktioniert.
 */
export async function createReview(supabase: Client, userId: string, input: CreateReviewInput) {
  const { error: mediaError } = await ensureMedia(supabase, input);
  if (mediaError) return { error: mediaError };

  const { error } = await supabase.from('reviews').insert({
    user_id: userId,
    media_id: input.mediaId,
    rating: input.rating,
    content: input.content,
    is_spoiler: input.isSpoiler,
  });
  return { error };
}

export async function deleteReview(supabase: Client, userId: string, reviewId: string) {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', userId);
  return { error };
}

/** Hilfreich-Stimme abgeben. Idempotent: 23505 (bereits gevotet) wird vom Aufrufer toleriert. */
export async function addReviewVote(supabase: Client, userId: string, reviewId: string) {
  const { error } = await supabase.from('review_votes').insert({ user_id: userId, review_id: reviewId });
  return { error };
}

/** Hilfreich-Stimme zurückziehen. */
export async function removeReviewVote(supabase: Client, userId: string, reviewId: string) {
  const { error } = await supabase
    .from('review_votes')
    .delete()
    .eq('user_id', userId)
    .eq('review_id', reviewId);
  return { error };
}

/** Zähler + eigener Vote-Status für eine Menge von Reviews (für die Anzeige). */
export async function getVoteMeta(supabase: Client, userId: string | null, reviewIds: string[]) {
  if (reviewIds.length === 0) return { counts: {} as Record<string, number>, voted: new Set<string>() };

  const [{ data: countsData }, ownRes] = await Promise.all([
    supabase.from('review_vote_counts').select('*').in('review_id', reviewIds),
    userId
      ? supabase.from('review_votes').select('review_id').eq('user_id', userId).in('review_id', reviewIds)
      : Promise.resolve({ data: [] as { review_id: string }[] }),
  ]);

  const counts: Record<string, number> = {};
  for (const row of countsData ?? []) {
    if (row.review_id) counts[row.review_id] = row.helpful_count ?? 0;
  }
  const voted = new Set((ownRes.data ?? []).map((r) => r.review_id));
  return { counts, voted };
}
