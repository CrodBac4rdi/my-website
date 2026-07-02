'use server';

import { getAuthedClient } from '@/lib/actions/auth';
import * as reviewsService from '@/lib/services/reviews';
import { createReviewSchema, reviewIdSchema, reviewVoteSchema } from '@/lib/validation/reviews';
import { rateLimit, formatRetryAfter } from '@/lib/actions/rate-limit';
import { type ActionResult, ok, fail } from '@/lib/actions/result';

export async function createReviewAction(input: unknown): Promise<ActionResult> {
  const parsed = createReviewSchema.safeParse(input);
  if (!parsed.success) return fail('Ungültige Eingabe.');

  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');

  const rl = await rateLimit(supabase, 'create_review', 10, 60);
  if (!rl.allowed) return fail(`Zu viele Reviews in kurzer Zeit. Versuch es ${formatRetryAfter(rl.retryAfterSeconds)} erneut.`);

  const { error } = await reviewsService.createReview(supabase, user.id, parsed.data);
  if (error) {
    if (error.code === '23505') return fail('Du hast diesen Titel bereits bewertet.');
    console.error('createReview error:', error);
    return fail('Fehler beim Abschicken.');
  }

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

export async function addReviewVoteAction(input: unknown): Promise<ActionResult> {
  const parsed = reviewVoteSchema.safeParse(input);
  if (!parsed.success) return fail('Ungültige Eingabe.');

  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');

  const { error } = await reviewsService.addReviewVote(supabase, user.id, parsed.data.reviewId);
  if (error && error.code !== '23505') {
    console.error('addReviewVote error:', error);
    return fail('Vote fehlgeschlagen.');
  }
  return ok(null);
}

export async function removeReviewVoteAction(input: unknown): Promise<ActionResult> {
  const parsed = reviewVoteSchema.safeParse(input);
  if (!parsed.success) return fail('Ungültige Eingabe.');

  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');

  const { error } = await reviewsService.removeReviewVote(supabase, user.id, parsed.data.reviewId);
  if (error) {
    console.error('removeReviewVote error:', error);
    return fail('Entfernen fehlgeschlagen.');
  }
  return ok(null);
}
