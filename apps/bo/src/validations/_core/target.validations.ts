import { OfferIncludeEnum, TargetEnum } from '@shared/types';
import { z } from 'zod';

import i18n from '@/config/i18n';
import {
  OFFER_DURATION_DAYS_MAX, OFFER_DURATION_DAYS_MIN, OFFER_PRICE_MAX, OFFER_PRICE_MIN,
} from '@/constants/_core/cms.constants';

/*
 * the number input hands back an empty string when the editor clears it, which must read as "not
 * filled" rather than as the number 0
 */
const emptyToUndefined = (value: unknown) => (value === '' || value === null ? undefined : value);

/**
 * The fields choosing where a content is published and, for the Aldaron offer, what it includes,
 * costs and how long it takes. Spread into the schema of an article, a page and a category. The
 * offer ones are all optional: an offer can be published before its price and duration are known.
 */
export const targetFieldsShape = {
  targets: z.array(z.enum(TargetEnum))
    .min(1, i18n.t('form.error.required', { field: i18n.t('cms:target.targets') }))
    .optional(),
  offerIncludes: z.array(z.enum(OfferIncludeEnum)).optional(),
  offerPrice: z.preprocess(
    emptyToUndefined,
    z.coerce.number().min(OFFER_PRICE_MIN).max(OFFER_PRICE_MAX).optional()
  ).optional(),
  offerDurationDays: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(OFFER_DURATION_DAYS_MIN).max(OFFER_DURATION_DAYS_MAX).optional()
  ).optional(),
};
