import { z } from 'zod';

import {
  changePasswordSchema, emailSchema, loginSchema, resetPasswordSchema, signUpSchema,
} from '@/validations/auth.validation';

export type ISignUpInput = z.infer<typeof signUpSchema>;
export type ILoginInput = z.infer<typeof loginSchema>;


export type IChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type EmailInput = z.infer<typeof emailSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
