import { z } from 'zod';

import { testEmailSchema } from '@/validations/_core/testEmail.validations';

export type TestEmailInput = z.infer<typeof testEmailSchema>;
