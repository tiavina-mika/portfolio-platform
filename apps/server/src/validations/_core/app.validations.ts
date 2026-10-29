import { z } from 'zod';

import { SHARE_SOCIAL_NETWORKS } from '@/constants/_core/cms.constants';
import { collections } from '@/constants/_core/constants';
import { TicketSourceEnum } from '@/types/ticket.type';

import { collectionNameFieldSchema } from './utils.validations';

export const getObjectsCountSchema = z.object({
  className: collectionNameFieldSchema,
  // status-filtered count instead of the default `seen: false` (ex: Payment `failed` badge)
  status: z.string().optional(),
});

export const contactSchema = z.object({
  // email there is encrypted, so its a string
  email: z.string().email().optional(),
  name: z.string()
    .max(120),
  message: z.string()
    .max(1000),
  phone: z.string()
    .max(30)
    .optional(),
  acceptNewsLetter: z.boolean().optional(),
  /*
   * read by the e-mail rule below only, never validated: tickets older than the field carry none,
   * and one being cleared arrives as a delete operation rather than a value
   */
  source: z.unknown().optional(),
}).refine(
  /*
   * an SOS or a request written in the app belongs to a member, who may have signed up by phone
   * only: it is answered through their account, not by e-mail. Only the public website's visitor,
   * who has no account, must leave an address or a phone number to be answered at.
   */
  ({ email, phone, source }) => (
    !!email || !!phone || source === TicketSourceEnum.SOS || source === TicketSourceEnum.APP
  ),
  { path: ['email'] }
);

export const incrementShareCountSchema = z.object({
  id: z.string().min(1),
  className: z.enum([collections.Article, collections.Page]),
  social: z.enum(SHARE_SOCIAL_NETWORKS),
});
