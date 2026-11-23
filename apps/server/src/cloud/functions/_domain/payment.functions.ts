import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';
import { PaymentStatusEnum, QuoteStatusEnum } from '@shared/domain-types';
import { isPaymentOpen } from '@shared/domain-utils';
import { TargetEnum } from '@shared/types';

import type { Locale } from '@/types/app.type';

import { translate } from '@/config/i18n';
import {
  cancelPaymentSchema, createQuotePaymentsSchema, getQuotePaymentsSchema, markPaymentAsPaidSchema,
  paymentDueDateInputSchema, paymentPaidInputSchema, setPaymentDueDateSchema,
} from '@/validations/_domain/payment.validations';

import {
  cancelPaymentService, createQuotePaymentsService, getPaymentByIdService, getQuotePaymentsService,
  hasQuotePaymentsService, markPaymentAsPaidService, type PaymentCorrection, setPaymentDueDateService,
} from '../../services/_domain/payment.service.cloud';
import { getQuoteByIdService } from '../../services/_domain/quote.service.cloud';
import { resolveWorkspace } from '../../utils/_core/role.utils.cloud';
import { fromBO } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

/*
 * The payments exist in the Aldaron workspace only: every function first checks that the account's roles
 * open it, then `fromBO` checks the right on the collection. Both apply. The payments are written by the
 * acceptance of their quote, never one by one, and no function deletes a payment: a mistake is cancelled
 * and replaced, so the history stays.
 */
const assertAgencyWorkspace = (request: Parse.Cloud.FunctionRequest): Promise<TargetEnum> => (
  resolveWorkspace(request.user, TargetEnum.AGENCY, request.params.locale)
);

// the payment named by the request, or the translated "not found" error
const getPaymentOrThrow = async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
  const payment = await getPaymentByIdService(request.params.id);

  if (!payment) throw new Error(translate('payment.notFound', request.params.locale));

  return payment;
};

/*
 * dating or paying is for a payment still waiting for the money: the trigger refuses the rest anyway,
 * this gives the reason before anything is written
 */
const assertOpenPayment = (payment: Parse.Object, locale: Locale | undefined): void => {
  const status: PaymentStatusEnum = payment.get('status');

  if (isPaymentOpen(status)) return;

  throw new Error(translate(
    status === PaymentStatusEnum.PAID ? 'payment.paidNotEditable' : 'payment.cancelledNotEditable',
    locale
  ));
};

// the payments of one quote, in the order they were written; only an accepted quote has any
Parse.Cloud.define(
  'getQuotePayments',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object[]> => {
      await assertAgencyWorkspace(request);

      const { quote: quoteId, locale } = request.params;
      const quote = await getQuoteByIdService(quoteId);

      if (!quote) throw new Error(translate('quote.notFound', locale));
      if (quote.get('status') !== QuoteStatusEnum.ACCEPTED) return [];

      return getQuotePaymentsService(quoteId);
    },
    ['find'],
    DOMAIN_COLLECTIONS.payment
  ),
  parseFunctionValidation(getQuotePaymentsSchema)
);

/*
 * the schedule of an accepted quote that has none: one accepted before the payments existed, or whose
 * acceptance could not write them. Never a second schedule: a quote that has payments is refused
 */
Parse.Cloud.define(
  'createQuotePayments',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object[]> => {
      await assertAgencyWorkspace(request);

      const { quote: quoteId, locale } = request.params;
      const quote = await getQuoteByIdService(quoteId);

      if (!quote) throw new Error(translate('quote.notFound', locale));
      if (quote.get('status') !== QuoteStatusEnum.ACCEPTED) {
        throw new Error(translate('payment.quoteNotAccepted', locale));
      }
      if (await hasQuotePaymentsService(quoteId)) {
        throw new Error(translate('payment.alreadyScheduled', locale, { number: quote.get('number') }));
      }

      await createQuotePaymentsService(quote, request.user!.id, locale);

      return getQuotePaymentsService(quoteId);
    },
    ['create'],
    DOMAIN_COLLECTIONS.payment
  ),
  parseFunctionValidation(createQuotePaymentsSchema)
);

// the client paid: how, when, and the transfer reference if there is one
Parse.Cloud.define(
  'markPaymentAsPaid',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
      await assertAgencyWorkspace(request);

      const payment = await getPaymentOrThrow(request);
      const { locale } = request.params;

      assertOpenPayment(payment, locale);

      // as the validation leaves them: the reference trimmed, an empty one and an empty date as `null`
      const paid = paymentPaidInputSchema.parse(request.params);

      return markPaymentAsPaidService(payment, paid, request.user!, locale);
    },
    ['update'],
    DOMAIN_COLLECTIONS.payment
  ),
  parseFunctionValidation(markPaymentAsPaidSchema)
);

// the day the milestone or the balance falls due, typed once it is known
Parse.Cloud.define(
  'setPaymentDueDate',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
      await assertAgencyWorkspace(request);

      const payment = await getPaymentOrThrow(request);
      const { locale } = request.params;
      // a date sent as an ISO string is read as a date, an empty one as `null`
      const { dueDate } = paymentDueDateInputSchema.parse(request.params);

      assertOpenPayment(payment, locale);

      return setPaymentDueDateService(payment, dueDate, request.user!, locale);
    },
    ['update'],
    DOMAIN_COLLECTIONS.payment
  ),
  parseFunctionValidation(setPaymentDueDateSchema)
);

/*
 * a mistake corrected: the payment is cancelled and kept, a new unpaid one of the same part takes its
 * place. A cancelled payment stays as it is
 */
Parse.Cloud.define(
  'cancelPayment',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest): Promise<PaymentCorrection> => {
      await assertAgencyWorkspace(request);

      const payment = await getPaymentOrThrow(request);
      const { locale } = request.params;

      if (payment.get('status') === PaymentStatusEnum.CANCELLED) {
        throw new Error(translate('payment.cancelledNotEditable', locale));
      }

      return cancelPaymentService(payment, request.user!, locale);
    },
    // a correction cancels a payment and writes the one that replaces it
    ['create', 'update'],
    DOMAIN_COLLECTIONS.payment
  ),
  parseFunctionValidation(cancelPaymentSchema)
);
