import { z } from 'zod';
import { watchlistStatusSchema } from '@/lib/validation/watchlist';

/**
 * Ein Chunk an Import-Einträgen. Max. 10 pro Aufruf, um TMDB-Rate-Limits
 * (40 Requests / 10s) und Server-Action-Timeouts einzuhalten — der Client
 * schickt mehrere Chunks nacheinander.
 */
export const importChunkSchema = z
  .array(
    z.object({
      title: z.string().trim().min(1).max(300),
      status: watchlistStatusSchema,
    })
  )
  .min(1)
  .max(10);

export type ImportChunk = z.infer<typeof importChunkSchema>;
