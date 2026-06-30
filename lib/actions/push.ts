'use server';

import { getAuthedClient } from '@/lib/actions/auth';
import * as pushService from '@/lib/services/push';
import { pushSubscriptionSchema, endpointSchema } from '@/lib/validation/push';
import { type ActionResult, ok, fail } from '@/lib/actions/result';

export async function savePushSubscriptionAction(input: unknown): Promise<ActionResult> {
  const parsed = pushSubscriptionSchema.safeParse(input);
  if (!parsed.success) return fail('Ungültige Subscription.');

  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');

  const { error } = await pushService.saveSubscription(supabase, user.id, parsed.data);
  if (error) {
    console.error('savePushSubscription error:', error);
    return fail('Benachrichtigungen konnten nicht aktiviert werden.');
  }
  return ok(null);
}

export async function removePushSubscriptionAction(input: unknown): Promise<ActionResult> {
  const parsed = endpointSchema.safeParse(input);
  if (!parsed.success) return fail('Ungültige Eingabe.');

  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');

  const { error } = await pushService.deleteSubscription(supabase, user.id, parsed.data.endpoint);
  if (error) {
    console.error('removePushSubscription error:', error);
    return fail('Benachrichtigungen konnten nicht deaktiviert werden.');
  }
  return ok(null);
}
