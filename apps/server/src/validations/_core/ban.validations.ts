import { banFormSchema } from '@shared/validations';
import { z } from 'zod';


export const banUserSchema = banFormSchema.extend({
  userId: z.string().nonempty(),
  until: z.coerce.date().optional(),
});

export const liftUserBanSchema = z.object({
  userId: z.string().nonempty(),
});
