import { z } from 'zod';
import { containsProfanity, isAllowedImageUrl } from '@/lib/validation/moderation';

/** Bild-URL aus erlaubter Quelle (DiceBear/TMDB/Supabase/Gravatar/GitHub). */
const imageUrl = z
  .string()
  .refine(isAllowedImageUrl, 'Bild-URL nur von erlaubten Quellen (z.B. DiceBear, TMDB).');

/**
 * Profil aktualisieren. Alle Felder nullable (null = leeren).
 * username 3–30 Zeichen, nur [a-zA-Z0-9_]; Wortfilter auf username + bio;
 * Bild-URLs nur aus Allowlist.
 */
export const updateProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Benutzername muss 3–30 Zeichen lang sein.')
    .max(30, 'Benutzername muss 3–30 Zeichen lang sein.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Nur Buchstaben, Zahlen und _ erlaubt.')
    .refine((v) => !containsProfanity(v), 'Benutzername enthält unangemessene Wörter.')
    .nullable(),
  bio: z
    .string()
    .max(500, 'Bio darf maximal 500 Zeichen lang sein.')
    .refine((v) => !containsProfanity(v), 'Bitte halte deine Bio respektvoll.')
    .nullable(),
  avatarUrl: imageUrl.nullable(),
  bannerUrl: imageUrl.nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
