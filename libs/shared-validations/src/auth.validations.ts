import { z } from 'zod';

export const passwordFieldSchema = z
  .string()
  .min(8)
  .max(64);
