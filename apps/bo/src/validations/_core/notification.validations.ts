import { z } from 'zod';

import {
  BROADCAST_BODY_MAX_LENGTH, BROADCAST_LOCALES, BROADCAST_TITLE_MAX_LENGTH,
} from '@/constants/_core/notification.constants';
import { BroadcastSegmentEnum } from '@/types/_core/notification.type';

/**
 * Every language has to be filled in before an announcement can leave: a member reading the app in
 * Malagasy would otherwise be sent an empty line, and there is no second chance to notice — the send
 * cannot be taken back. Mirrors the server's own schema, which refuses the same thing.
 */
const broadcastTextSchema = (maxLength: number) => z.object(
  Object.fromEntries(
    BROADCAST_LOCALES.map((locale) => [locale, z.string().trim().min(1).max(maxLength)])
  )
);

export const broadcastSchema = z.object({
  segment: z.enum(BroadcastSegmentEnum),
  city: z.string().trim().max(BROADCAST_TITLE_MAX_LENGTH).optional(),
  title: broadcastTextSchema(BROADCAST_TITLE_MAX_LENGTH),
  body: broadcastTextSchema(BROADCAST_BODY_MAX_LENGTH),
  /*
   * how many members the audience was counted to hold. Required, and cleared whenever the audience
   * is edited, so an announcement that nobody has counted the recipients of is simply an incomplete
   * form — the same mechanism that stops one with an empty translation
   */
  expectedRecipientCount: z.number().int().nonnegative(),
}).refine(
  ({ segment, city }) => segment !== BroadcastSegmentEnum.CITY || !!city?.trim(),
  { path: ['city'], message: 'required' }
);
