import { z } from 'zod';

import { SHARE_SOCIAL_NETWORKS } from '@/constants/_core/cms.constants';
import { collections } from '@/constants/_core/constants';

import { collectionNameFieldSchema } from './utils.validations';

export const getObjectsCountSchema = z.object({
  className: collectionNameFieldSchema,
  // status-filtered count instead of the default `seen: false`
  status: z.string().optional(),
});

export const contactSchema = z.object({
  // email there is encrypted, so its a string; optional for contacts saved before it was required
  email: z.string().email().optional(),
  name: z.string()
    .max(120),
  message: z.string()
    .max(1000),
  acceptNewsLetter: z.boolean().optional(),
});

export const incrementShareCountSchema = z.object({
  id: z.string().min(1),
  className: z.enum([collections.Article, collections.Page]),
  social: z.enum(SHARE_SOCIAL_NETWORKS),
});
