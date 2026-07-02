'use server';

import { getAuthedClient } from '@/lib/actions/auth';
import { getUserDataExport } from '@/lib/services/export';
import { type ActionResult, ok, fail } from '@/lib/actions/result';

/** Liefert alle eigenen Daten als JSON-fähiges Objekt (DSGVO-artiger Export). */
export async function exportUserDataAction(): Promise<ActionResult<Awaited<ReturnType<typeof getUserDataExport>>>> {
  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');

  try {
    const data = await getUserDataExport(supabase, user.id);
    return ok(data);
  } catch (err) {
    console.error('exportUserData error:', err);
    return fail('Export fehlgeschlagen.');
  }
}
