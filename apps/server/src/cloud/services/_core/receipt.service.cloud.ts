import { PaymentStatusEnum } from '@shared/types';

import type { Locale } from '@/types/app.type';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import {
  collections, ERRORS, USE_MASTER_KEY,
} from '@/constants/_core/constants';
import { generateEmailTemplate } from '@/emails';
import { sendEmailWithResult } from '@/services/email.service';
import { formatFullName } from '@/utils/_core/user.utils';

import { isEmailSentResponse } from '../../utils/_core/email.utils.cloud';
import { buildReceiptPdfBuffer } from '../../utils/_core/receipt-pdf.utils.cloud';

/**
 * Exactly one of `payer`/`receiver` is a real user pointer on a given Payment — the other side is
 * the platform itself and has no pointer set (see the conditional `pointerFields` in
 * payment.service.cloud.ts). This resolves whichever side is the actual human counterparty,
 * reused both for the self-service ownership check and the BO resend email target.
 */
export const getReceiptRecipientUser = (payment: Parse.Object): Parse.User | undefined => {
  return payment.get('payer') ?? payment.get('receiver');
};

const getPaymentForReceipt = async (paymentId: string): Promise<Parse.Object> => {
  const payment = await new Parse.Query(collections.Payment)
    .equalTo('objectId', paymentId)
    .select(['status', 'amount', 'currency', 'service', 'snapshot', 'payer', 'receiver'])
    .include(['payer', 'receiver'])
    .first(USE_MASTER_KEY);

  if (!payment) {
    throw new Error(ERRORS.PAYMENT_NOT_FOUND);
  }

  if (payment.get('status') !== PaymentStatusEnum.SUCCESS) {
    throw new Error(ERRORS.RECEIPT_NOT_AVAILABLE);
  }

  return payment;
};

type ReceiptPdf = {
  base64: string;
  recipientUser: Parse.User;
};

/**
 * No persistence — a receipt is fully derived from the (already stored) Payment, so it is
 * rebuilt fresh on every call rather than cached as a new Mongo document/uploaded file. Keeps
 * this feature free of any storage growth or retention-policy concern.
 */
export const getReceiptPdfForPayment = async (
  paymentId: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<ReceiptPdf> => {
  const payment = await getPaymentForReceipt(paymentId);
  const recipientUser = getReceiptRecipientUser(payment);

  if (!recipientUser) {
    throw new Error(ERRORS.PAYMENT_NOT_FOUND);
  }

  const recipientName = formatFullName(recipientUser.get('firstName'), recipientUser.get('lastName'));
  const pdfBuffer = await buildReceiptPdfBuffer(payment, recipientName, locale);

  return { base64: pdfBuffer.toString('base64'), recipientUser };
};

/**
 * Sends the receipt of a payment to its payer (or receiver) again. Throws a translated error when
 * nothing went out — a member with no e-mail address, or a provider refusal — so the back-office
 * never announces a success for a receipt that is not on its way.
 */
export const resendReceiptEmail = async (
  paymentId: string,
  locale: Locale = DEFAULT_LANGUAGE
): Promise<void> => {
  const { base64, recipientUser } = await getReceiptPdfForPayment(paymentId, locale);

  // a member signed up by phone has no address: calling Brevo with an empty one can only fail
  if (!recipientUser.get('email')) {
    throw new Error(translate('error.receiptRecipientHasNoEmail', locale));
  }

  const params = {
    subject: translate('email.receiptResentSubject', locale),
    to: [{
      email: recipientUser.get('email'),
      firstName: recipientUser.get('firstName'),
      lastName: recipientUser.get('lastName'),
    }],
    htmlContent: generateEmailTemplate({
      locale,
      content: translate('email.receiptResentMessage', locale),
    }),
    attachment: [{ content: base64, name: 'receipt.pdf' }],
  };

  const { data } = await sendEmailWithResult(params);

  if (!isEmailSentResponse(data)) {
    throw new Error(translate('error.receiptEmailNotSent', locale));
  }
};
