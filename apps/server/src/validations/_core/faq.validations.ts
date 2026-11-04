import { object } from 'zod';

import { countryCodeFieldSchema, localeFieldSchema } from './util.validations';

export const getFaqSchema = object({
  locale: localeFieldSchema.optional(),
  country: countryCodeFieldSchema.optional(),
});
