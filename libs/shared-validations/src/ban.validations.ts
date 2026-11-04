import { BanReasonEnum, BanTypeEnum } from '@shared/types';
import { z } from 'zod';

export const banFormSchema = z.object({
  type: z.enum(BanTypeEnum),
  reason: z.enum(BanReasonEnum),
  reasonDetails: z.string().max(500).optional(),
  until: z.date().optional(),
});
