import { DEFAULT_LANGUAGE } from '@/config/i18n';
import { collections, ERRORS } from '@/constants/_core/constants';
import { generateMyReceiptSchema, resendReceiptSchema } from '@/validations/_core/receipt.validations';

import { getReceiptPdfForPayment, resendReceiptEmail } from '../../services/_core/receipt.service.cloud';
import { assertInAgentCountries } from '../../utils/_core/agent-scope.utils.cloud';
import { fromBO, parseFunction } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

/**
 * End-user facing: builds the receipt PDF for the caller's own payment — the caller must be the
 * resolved recipient (payer or receiver) of that payment, so a regular authenticated user can't
 * fetch someone else's receipt. Returned as base64 (never stored) for the client to share/save.
 */
Parse.Cloud.define(
  'generateMyReceipt',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<{ pdfBase64: string }> => {
    const { id, locale = DEFAULT_LANGUAGE } = request.params;
    const currentUser = request.user;

    if (!currentUser) {
      throw new Error(ERRORS.PAYMENT_NOT_FOUND);
    }

    const { base64, recipientUser } = await getReceiptPdfForPayment(id, locale);

    if (recipientUser.id !== currentUser.id) {
      throw new Error(ERRORS.PAYMENT_NOT_FOUND);
    }

    return { pdfBase64: base64 };
  }),
  parseFunctionValidation(generateMyReceiptSchema)
);

/**
 * BO-only: resends the receipt for any SUCCESS payment by email — operator-triggered, no
 * ownership check (mirrors `retryPayment`'s BO precedent).
 */
Parse.Cloud.define(
  'resendReceipt',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<{ success: true }> => {
    const { id, locale = DEFAULT_LANGUAGE } = request.params;

    await assertInAgentCountries(collections.Payment, id);
    await resendReceiptEmail(id, locale);

    return { success: true };
  }, ['update'], collections.Payment),
  parseFunctionValidation(resendReceiptSchema)
);
