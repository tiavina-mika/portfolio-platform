import { z } from 'zod';

import { impersonateUserFormSchema } from '@/validations/_core/impersonation.validations';

export type ImpersonateUserInput = z.infer<typeof impersonateUserFormSchema>;

export type ImpersonationSession = {
  sessionToken: string;
  sessionId: string;
  expiresAt: string;
};

export interface IImpersonationState {
  session: ImpersonationSession | null;
}
