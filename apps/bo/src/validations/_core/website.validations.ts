import { BoxIncludeEnum, WebsiteEnum } from '@shared/types';
import { z } from 'zod';

import i18n from '@/config/i18n';
import {
  BOX_DURATION_DAYS_MAX, BOX_DURATION_DAYS_MIN, BOX_PRICE_MAX, BOX_PRICE_MIN,
} from '@/constants/_core/cms.constants';

/*
 * the number input hands back an empty string when the editor clears it, which must read as "not
 * filled" rather than as the number 0
 */
const emptyToUndefined = (value: unknown) => (value === '' || value === null ? undefined : value);

/**
 * The fields choosing the websites a content is written for and, for the box, what it includes,
 * costs and how long it takes. Spread into the schema of an article, a page and a category. The box
 * ones are all optional: a box can be published before its price and duration are known.
 */
export const websiteFieldsShape = {
  websites: z.array(z.enum(WebsiteEnum)).min(1, i18n.t('form.error.required', { field: i18n.t('cms:website.websites') }))
    .optional(),
  boxIncludes: z.array(z.enum(BoxIncludeEnum)).optional(),
  boxPrice: z.preprocess(emptyToUndefined, z.coerce.number().min(BOX_PRICE_MIN).max(BOX_PRICE_MAX).optional())
    .optional(),
  boxDurationDays: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(BOX_DURATION_DAYS_MIN).max(BOX_DURATION_DAYS_MAX).optional()
  ).optional(),
};
