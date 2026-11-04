import { z } from 'zod';

import {
  changePasswordSchema, emailSchema, loginSchema, mfaCodeSchema, mfaPasswordSchema, resetPasswordSchema,
  signUpSchema,
} from '@/validations/_core/auth.validations';

export enum RegisterStepEnum {
  WELCOME = 'WELCOME',
  AUTH = 'AUTH',
  INFOS = 'INFOS',
  PROFILE = 'PROFILE'
}

export type RegisterStep = `${RegisterStepEnum}`;

export type ISignUpInput = z.infer<typeof signUpSchema>;
// raw values entered in the form, before the schema's transforms (capitalize…) are applied
export type ISignUpFormInput = z.input<typeof signUpSchema>;
export type ILoginInput = z.infer<typeof loginSchema>;


export type IChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type EmailInput = z.infer<typeof emailSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export type IMfaCodeInput = z.infer<typeof mfaCodeSchema>;
export type IMfaPasswordInput = z.infer<typeof mfaPasswordSchema>;

export type IMfaEnrollResult = {
  otpauthUrl: string;
};

export type IMfaConfirmResult = {
  backupCodes: string[];
};
