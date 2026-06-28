'use server';

import { revalidatePath } from 'next/cache';
import { getAuthedClient } from '@/lib/actions/auth';
import * as watchlistService from '@/lib/services/watchlist';
import {
  addToWatchlistSchema,
  updateWatchlistSchema,
  mediaIdSchema,
} from '@/lib/validation/watchlist';
import { type ActionResult, ok, fail } from '@/lib/actions/result';

/**
 * Server Actions für die Watchlist.
 *
 * Jede Action ist über POST direkt erreichbar → prüft Auth selbst
 * (nicht auf den Proxy verlassen, siehe docs/ARCHITECTURE.md). Ablauf:
 * validieren (zod) → Auth (getUser) → Service → revalidate → ActionResult.
 */

function refreshWatchlistViews() {
  revalidatePath('/watchlist');
  revalidatePath('/profile');
}

export async function addToWatchlistAction(input: unknown): Promise<ActionResult> {
  const parsed = addToWatchlistSchema.safeParse(input);
  if (!parsed.success) return fail('Ungültige Eingabe.');

  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');

  const { error } = await watchlistService.addToWatchlist(supabase, user.id, parsed.data);
  if (error) {
    if (error.code === '23505') return fail('Bereits auf der Watchlist.');
    console.error('addToWatchlist error:', error);
    return fail('Fehler beim Hinzufügen.');
  }

  refreshWatchlistViews();
  return ok(null);
}

export async function removeFromWatchlistAction(mediaId: unknown): Promise<ActionResult> {
  const parsed = mediaIdSchema.safeParse(mediaId);
  if (!parsed.success) return fail('Ungültige Eingabe.');

  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');

  const { error } = await watchlistService.removeFromWatchlist(supabase, user.id, parsed.data);
  if (error) {
    console.error('removeFromWatchlist error:', error);
    return fail('Fehler beim Entfernen.');
  }

  refreshWatchlistViews();
  return ok(null);
}

export async function updateWatchlistAction(input: unknown): Promise<ActionResult> {
  const parsed = updateWatchlistSchema.safeParse(input);
  if (!parsed.success) return fail('Ungültige Eingabe.');

  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');

  const { watchlistId, ...patch } = parsed.data;
  const { error } = await watchlistService.updateWatchlistEntry(
    supabase,
    user.id,
    watchlistId,
    patch
  );
  if (error) {
    console.error('updateWatchlist error:', error);
    return fail('Aktualisierung fehlgeschlagen.');
  }

  refreshWatchlistViews();
  return ok(null);
}
