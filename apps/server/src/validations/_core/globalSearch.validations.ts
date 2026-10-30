import { object, string } from 'zod';

import { localesFieldSchema } from './util.validations';

export const globalSearchSchema = object({
  text: string().min(1),
  locales: localesFieldSchema,
});
