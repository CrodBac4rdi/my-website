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
