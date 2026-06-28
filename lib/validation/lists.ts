import { z } from 'zod';
import { mediaMetaSchema } from '@/lib/validation/media';

/** Neue Liste erstellen. */
export const createListSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
});

export type CreateListInput = z.infer<typeof createListSchema>;

/** Listen-ID (uuid) zum Löschen. */
export const listIdSchema = z.string().uuid();

/** Item zu einer Liste hinzufügen: Listen-ID + Medien-Metadaten. */
export const addListItemSchema = mediaMetaSchema.extend({
  listId: z.string().uuid(),
});

export type AddListItemInput = z.infer<typeof addListItemSchema>;

/** Item-ID (bigint) zum Entfernen. */
export const listItemIdSchema = z.number().int().positive();
