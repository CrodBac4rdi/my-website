'use server';

import { revalidatePath } from 'next/cache';
import { getAuthedClient } from '@/lib/actions/auth';
import * as profileService from '@/lib/services/profile';
import { updateProfileSchema } from '@/lib/validation/profile';
import { type ActionResult, ok, fail } from '@/lib/actions/result';

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    // Erste aussagekräftige Fehlermeldung an den Client geben.
    const first = parsed.error.issues[0]?.message ?? 'Ungültige Eingabe.';
    return fail(first);
  }

  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');

  const { error } = await profileService.updateProfile(supabase, user.id, parsed.data);
  if (error) {
    if (error.code === '23505') return fail('Dieser Benutzername ist bereits vergeben.');
    console.error('updateProfile error:', error);
    return fail('Fehler beim Speichern.');
  }

  revalidatePath('/profile');
  return ok(null);
}
