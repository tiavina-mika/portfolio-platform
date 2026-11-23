import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';
import { PaymentMethodEnum, PaymentStatusEnum } from '@shared/domain-types';

import type { StatusTone } from '@/utils/_core/theme/styles.utils';

import i18n from '@/config/i18n';
import { ISelectOption } from '@/types/_core/app.type';

export const PAYMENT_COLLECTION = DOMAIN_COLLECTIONS.payment;

export const PAYMENT_METHOD_OPTIONS: ISelectOption<PaymentMethodEnum>[] = Object
  .values(PaymentMethodEnum)
  .map((method) => ({ label: i18n.t(`project:payment.methods.${method}`), value: method }));

// the tint of each status, in the dot language every list uses for a state
export const PAYMENT_STATUS_TONES: Record<PaymentStatusEnum, StatusTone> = {
  [PaymentStatusEnum.PLANNED]: 'info',
  [PaymentStatusEnum.DUE]: 'warning',
  [PaymentStatusEnum.PAID]: 'success',
  [PaymentStatusEnum.CANCELLED]: 'default',
};

// the row action of the quote list that opens the payments of an accepted quote
export const QUOTE_PAYMENTS_ACTION_LABEL_KEY = 'project:payment.payments';

export const PAYMENT_PAY_FORM_ID = 'payment-pay-form';
export const PAYMENT_DUE_DATE_FORM_ID = 'payment-due-date-form';
