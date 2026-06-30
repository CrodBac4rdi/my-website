import { z } from 'zod';

export const followSchema = z.object({
  targetId: z.string().uuid('Ungültige Nutzer-ID.'),
});

export type FollowInput = z.infer<typeof followSchema>;
