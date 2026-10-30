import { z } from 'zod';

import { objectIdFieldSchema } from './util.validations';

export const generateMyReceiptSchema = z.object({
  id: objectIdFieldSchema,
});

export const resendReceiptSchema = z.object({
  id: objectIdFieldSchema,
});
