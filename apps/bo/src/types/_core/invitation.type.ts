import { z } from 'zod';

import { sendInvitationSchema } from '@/validations/_core/invitation.validations';

export type ISendInvitationInput = z.infer<typeof sendInvitationSchema>;
