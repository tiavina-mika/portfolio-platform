import { z } from 'zod';

import { testSmsSchema } from '@/validations/_core/testSms.validations';

export type TestSmsInput = z.infer<typeof testSmsSchema>;
