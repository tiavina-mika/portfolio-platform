import { PAYMENT_REFERENCE_MAX_LENGTH } from '@shared/domain-constants';
import { PaymentMethodEnum } from '@shared/domain-types';
import dayjs from 'dayjs';
import { z } from 'zod';

import i18n from '@/config/i18n';

// "Mark as paid": how the client paid, the transfer reference if any, and the day (today when left empty)
export const paymentPaidSchema = z.object({
  method: z.enum(PaymentMethodEnum),
  reference: z.string().trim().max(PAYMENT_REFERENCE_MAX_LENGTH).optional(),
  // the server refuses it too: said here before anything is sent
  paidAt: z.date().nullish().refine(
    (date) => !date || !dayjs(date).isAfter(dayjs(), 'day'),
    { message: i18n.t('project:payment.paidInTheFuture') }
  ),
});

export type PaymentPaidFormValues = z.infer<typeof paymentPaidSchema>;

// the day the milestone or the balance falls due; an empty one takes the date away
export const paymentDueDateSchema = z.object({
  dueDate: z.date().nullish(),
});

export type PaymentDueDateFormValues = z.infer<typeof paymentDueDateSchema>;
