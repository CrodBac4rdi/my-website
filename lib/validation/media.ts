import { z } from 'zod';

/**
 * Gemeinsames Schema für Medien-Metadaten, die der Client mitliefert, damit der
 * Server den `media`-Cache befüllen kann (FK-Ziel für watchlist/reviews/list_items).
 * Wird von Watchlist-, Review- und Listen-Schemas wiederverwendet.
 */
export const mediaMetaSchema = z.object({
  mediaId: z.number().int().positive(),
  title: z.string().min(1).max(500),
  type: z.enum(['tv', 'movie']),
  posterPath: z.string().nullable(),
});

export type MediaMeta = z.infer<typeof mediaMetaSchema>;
