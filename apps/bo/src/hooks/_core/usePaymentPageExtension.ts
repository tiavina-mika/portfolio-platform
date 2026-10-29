import { IPayment } from '@/types/_core/payment.type';
import { getPaymentPageExtensionHook, PaymentPageExtension } from '@/utils/_core/payment.utils';

/**
 * What the business domain registered for the payment page adds to it. The registered hook is set
 * once, at module load, before the page first renders — so calling it here keeps the same hooks in
 * the same order on every render.
 */
export const usePaymentPageExtension = (payment: IPayment | undefined): PaymentPageExtension => (
  getPaymentPageExtensionHook()(payment)
);
