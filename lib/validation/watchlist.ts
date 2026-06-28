import { z } from 'zod';
import { mediaMetaSchema } from '@/lib/validation/media';

/** Erlaubte Watchlist-Status — Spiegel des DB-CHECK-Constraints `valid_status`. */
export const watchlistStatusSchema = z.enum([
  'plan_to_watch',
  'watching',
  'completed',
  'dropped',
  'on_hold',
]);

export type WatchlistStatus = z.infer<typeof watchlistStatusSchema>;

/** Eingabe zum Hinzufügen eines Titels zur Watchlist (= Medien-Metadaten). */
export const addToWatchlistSchema = mediaMetaSchema;

export type AddToWatchlistInput = z.infer<typeof addToWatchlistSchema>;

/** Eingabe zum Aktualisieren eines Eintrags (Status und/oder Rating). */
export const updateWatchlistSchema = z
  .object({
    watchlistId: z.number().int().positive(),
    status: watchlistStatusSchema.optional(),
    rating: z.number().int().min(1).max(10).optional(),
  })
  .refine((d) => d.status !== undefined || d.rating !== undefined, 'Nichts zu aktualisieren.');

export type UpdateWatchlistInput = z.infer<typeof updateWatchlistSchema>;

/** Reine media_id (zum Entfernen). */
export const mediaIdSchema = z.number().int().positive();
