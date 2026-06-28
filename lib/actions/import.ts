'use server';

import { revalidatePath } from 'next/cache';
import { getAuthedClient } from '@/lib/actions/auth';
import { importChunk, type ImportResult } from '@/lib/services/import';
import { importChunkSchema } from '@/lib/validation/import';
import { type ActionResult, ok, fail } from '@/lib/actions/result';

/**
 * Importiert einen Chunk (max. 10) MAL-/AniList-Einträge in die Watchlist.
 * Der Client ruft die Action für jeden Chunk auf und zeigt Fortschritt.
 */
export async function importChunkAction(input: unknown): Promise<ActionResult<ImportResult[]>> {
  const parsed = importChunkSchema.safeParse(input);
  if (!parsed.success) return fail('Ungültige Import-Daten.');

  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');

  const results = await importChunk(supabase, user.id, parsed.data);
  revalidatePath('/watchlist');
  return ok(results);
}
