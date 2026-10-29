import { z } from 'zod';

export const articleForClientSchema = z.object({
  slug: z.string(),
  locale: z.string(),
  defaultLocale: z.string(),
});
