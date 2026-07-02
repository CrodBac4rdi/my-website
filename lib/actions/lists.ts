'use server';

import { getAuthedClient } from '@/lib/actions/auth';
import * as listsService from '@/lib/services/lists';
import {
  createListSchema,
  listIdSchema,
  addListItemSchema,
  listItemIdSchema,
} from '@/lib/validation/lists';
import { rateLimit, formatRetryAfter } from '@/lib/actions/rate-limit';
import { type ActionResult, ok, fail } from '@/lib/actions/result';

export async function setListVisibilityAction(
  listId: unknown,
  isPublic: unknown
): Promise<ActionResult> {
  const parsedId = listIdSchema.safeParse(listId);
  if (!parsedId.success || typeof isPublic !== 'boolean') return fail('Ungültige Eingabe.');

  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');

  const { error } = await listsService.setListVisibility(supabase, user.id, parsedId.data, isPublic);
  if (error) {
    console.error('setListVisibility error:', error);
    return fail('Sichtbarkeit konnte nicht geändert werden.');
  }
  return ok(null);
}

export async function createListAction(input: unknown): Promise<ActionResult<unknown>> {
  const parsed = createListSchema.safeParse(input);
  if (!parsed.success) return fail('Bitte einen gültigen Namen angeben.');

  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');

  const rl = await rateLimit(supabase, 'create_list', 15, 60);
  if (!rl.allowed) return fail(`Zu viele Listen in kurzer Zeit. Versuch es ${formatRetryAfter(rl.retryAfterSeconds)} erneut.`);

  const { data, error } = await listsService.createList(supabase, user.id, parsed.data);
  if (error) {
    console.error('createList error:', error);
    return fail('Liste konnte nicht erstellt werden.');
  }

  return ok(data);
}

export async function deleteListAction(listId: unknown): Promise<ActionResult> {
  const parsed = listIdSchema.safeParse(listId);
  if (!parsed.success) return fail('Ungültige Eingabe.');

  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');

  const { error } = await listsService.deleteList(supabase, user.id, parsed.data);
  if (error) {
    console.error('deleteList error:', error);
    return fail('Liste konnte nicht gelöscht werden.');
  }

  return ok(null);
}

export async function addListItemAction(input: unknown): Promise<ActionResult<unknown>> {
  const parsed = addListItemSchema.safeParse(input);
  if (!parsed.success) return fail('Ungültige Eingabe.');

  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');

  const { data, error } = await listsService.addListItem(supabase, parsed.data);
  if (error) {
    if (error.code === '23505') return fail('Dieser Titel ist bereits in der Liste.');
    console.error('addListItem error:', error);
    return fail('Fehler beim Hinzufügen.');
  }

  return ok(data);
}

export async function removeListItemAction(itemId: unknown): Promise<ActionResult> {
  const parsed = listItemIdSchema.safeParse(itemId);
  if (!parsed.success) return fail('Ungültige Eingabe.');

  const { supabase, user } = await getAuthedClient();
  if (!user) return fail('Bitte zuerst einloggen.');

  const { error } = await listsService.removeListItem(supabase, parsed.data);
  if (error) {
    console.error('removeListItem error:', error);
    return fail('Fehler beim Entfernen.');
  }

  return ok(null);
}
