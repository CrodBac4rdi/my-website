import { z } from 'zod';
import { mediaMetaSchema } from '@/lib/validation/media';
import { containsProfanity } from '@/lib/validation/moderation';

/**
 * Review erstellen: Medien-Metadaten (für media-Cache) + Bewertung.
 * content 10–5000 Zeichen, rating 1–10 — Spiegel der DB-CHECK-Constraints.
 * Wortfilter gegen offensichtlich unangemessene Inhalte.
 */
export const createReviewSchema = mediaMetaSchema.extend({
  rating: z.number().int().min(1).max(10),
  content: z
    .string()
    .trim()
    .min(10)
    .max(5000)
    .refine((v) => !containsProfanity(v), 'Bitte halte deine Review respektvoll – unangemessene Sprache wurde erkannt.'),
  isSpoiler: z.boolean(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

/** Review-ID (uuid) zum Löschen. */
export const reviewIdSchema = z.string().uuid();
