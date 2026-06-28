'use server';

import { revalidatePath } from 'next/cache';
import { getAuthedClient } from '@/lib/actions/auth';
import * as reviewsService from '@/lib/services/reviews';
import { createReviewSchema, reviewIdSchema } from '@/lib/validation/reviews';
import { type ActionResult, ok, fail } from '@/lib/actions/result';

export async function createReviewAction(input: unknown): Promise<ActionResult> {
  const parsed = createReviewSchema.safeParse(input);
  if (!parsed.success) return fail('Ungültige Eingabe.');

  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');

  const { error } = await reviewsService.createReview(supabase, user.id, parsed.data);
  if (error) {
    if (error.code === '23505') return fail('Du hast diesen Titel bereits bewertet.');
    console.error('createReview error:', error);
    return fail('Fehler beim Abschicken.');
  }

  revalidatePath(`/media/${parsed.data.mediaId}`);
  return ok(null);
}

export async function deleteReviewAction(reviewId: unknown): Promise<ActionResult> {
  const parsed = reviewIdSchema.safeParse(reviewId);
  if (!parsed.success) return fail('Ungültige Eingabe.');

  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');

  const { error } = await reviewsService.deleteReview(supabase, user.id, parsed.data);
  if (error) {
    console.error('deleteReview error:', error);
    return fail('Fehler beim Löschen.');
  }

  return ok(null);
}
