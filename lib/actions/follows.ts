'use server';

import { getAuthedClient } from '@/lib/actions/auth';
import * as followsService from '@/lib/services/follows';
import { followSchema } from '@/lib/validation/follows';
import { type ActionResult, ok, fail } from '@/lib/actions/result';

export async function followUserAction(input: unknown): Promise<ActionResult> {
  const parsed = followSchema.safeParse(input);
  if (!parsed.success) return fail('Ungültige Eingabe.');

  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');
  if (user.id === parsed.data.targetId) return fail('Du kannst dir nicht selbst folgen.');

  const { error } = await followsService.followUser(supabase, user.id, parsed.data.targetId);
  if (error) {
    if (error.code === '23505') return ok(null); // bereits gefolgt -> idempotent
    if (error.code === '42501') return fail('Diesem Profil kann nicht gefolgt werden.'); // RLS: nicht öffentlich
    console.error('followUser error:', error);
    return fail('Folgen fehlgeschlagen.');
  }
  return ok(null);
}

export async function unfollowUserAction(input: unknown): Promise<ActionResult> {
  const parsed = followSchema.safeParse(input);
  if (!parsed.success) return fail('Ungültige Eingabe.');

  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');

  const { error } = await followsService.unfollowUser(supabase, user.id, parsed.data.targetId);
  if (error) {
    console.error('unfollowUser error:', error);
    return fail('Entfolgen fehlgeschlagen.');
  }
  return ok(null);
}
