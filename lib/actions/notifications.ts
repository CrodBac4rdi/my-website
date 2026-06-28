'use server';

import { getAuthedClient } from '@/lib/actions/auth';
import * as notificationsService from '@/lib/services/notifications';
import { notificationIdSchema } from '@/lib/validation/notifications';
import { type ActionResult, ok, fail } from '@/lib/actions/result';

export async function markNotificationReadAction(notificationId: unknown): Promise<ActionResult> {
  const parsed = notificationIdSchema.safeParse(notificationId);
  if (!parsed.success) return fail('Ungültige Eingabe.');

  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');

  const { error } = await notificationsService.markRead(supabase, user.id, parsed.data);
  if (error) {
    console.error('markNotificationRead error:', error);
    return fail('Fehler.');
  }
  return ok(null);
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');

  const { error } = await notificationsService.markAllRead(supabase, user.id);
  if (error) {
    console.error('markAllNotificationsRead error:', error);
    return fail('Fehler.');
  }
  return ok(null);
}
