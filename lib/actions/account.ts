'use server';

import { getAuthedClient } from '@/lib/actions/auth';
import { type ActionResult, ok, fail } from '@/lib/actions/result';

/**
 * Löscht den eigenen Account des eingeloggten Nutzers via DB-Funktion
 * `delete_user()` (SECURITY DEFINER, löscht auth.users → cascadet alle Daten).
 * Der Client meldet sich danach ab und leitet weiter.
 */
export async function deleteAccountAction(): Promise<ActionResult> {
  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');

  const { error } = await supabase.rpc('delete_user');
  if (error) {
    console.error('deleteAccount error:', error);
    return fail('Account konnte nicht gelöscht werden.');
  }
  return ok(null);
}
