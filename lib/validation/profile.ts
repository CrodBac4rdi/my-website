import { z } from 'zod';

/** URL muss mit http(s):// beginnen — Spiegel der DB-CHECK-Constraints. */
const httpUrl = z
  .string()
  .regex(/^https?:\/\//, 'URL muss mit http(s):// beginnen');

/**
 * Profil aktualisieren. Alle Felder nullable (null = leeren).
 * username 3–30 Zeichen, nur [a-zA-Z0-9_] — Spiegel der DB-Constraints.
 */
export const updateProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Benutzername muss 3–30 Zeichen lang sein.')
    .max(30, 'Benutzername muss 3–30 Zeichen lang sein.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Nur Buchstaben, Zahlen und _ erlaubt.')
    .nullable(),
  bio: z.string().max(500, 'Bio darf maximal 500 Zeichen lang sein.').nullable(),
  avatarUrl: httpUrl.nullable(),
  bannerUrl: httpUrl.nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
