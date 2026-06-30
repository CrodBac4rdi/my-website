import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import type { PushSubscriptionInput } from '@/lib/validation/push';

type Client = SupabaseClient<Database>;

/** Push-Subscription speichern (idempotent per endpoint). */
export async function saveSubscription(supabase: Client, userId: string, sub: PushSubscriptionInput) {
  return await supabase
    .from('push_subscriptions')
    .upsert(
      { user_id: userId, endpoint: sub.endpoint, subscription: sub as unknown as Database['public']['Tables']['push_subscriptions']['Insert']['subscription'] },
      { onConflict: 'endpoint' },
    );
}

/** Subscription des Nutzers löschen. */
export async function deleteSubscription(supabase: Client, userId: string, endpoint: string) {
  return await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId)
    .eq('endpoint', endpoint);
}
