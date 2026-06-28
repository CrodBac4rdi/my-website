import { z } from 'zod';

/** Notification-ID (uuid) zum Als-gelesen-markieren. */
export const notificationIdSchema = z.string().uuid();
