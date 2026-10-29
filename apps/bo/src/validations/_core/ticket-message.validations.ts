import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE, TICKET_ATTACHMENT_MAX_COUNT } from '@shared/constants';
import { z } from 'zod';

import { generateFileSchema } from './zodSchema.validations';

type OptionalFileArraySchemaType = z.ZodType<File[] | undefined, File[] | undefined>;

export const sendTicketMessageSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  attachments: generateFileSchema(false, {
    multiple: true,
    max: TICKET_ATTACHMENT_MAX_COUNT,
    extensions: ACCEPTED_IMAGE_TYPES,
    maxSize: MAX_IMAGE_SIZE,
  }) as OptionalFileArraySchemaType,
});
