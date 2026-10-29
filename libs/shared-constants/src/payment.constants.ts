import { PaymentServiceEnum } from '@shared/types';

/**
 * The mobile money service each operator prefix of a country belongs to, a number being read as
 * stored (no dial code, no leading 0). Routes a payment, and picks the platform's own receiving
 * number for that service. Keyed by the ISO code of the country.
 */
export const PAYMENT_SERVICE_PREFIXES_BY_COUNTRY = {
  MG: [
    { service: PaymentServiceEnum.YAS, prefixes: ['34', '38'] },
    { service: PaymentServiceEnum.ORANGE, prefixes: ['32', '37'] },
    { service: PaymentServiceEnum.AIRTEL, prefixes: ['33'] },
  ],
} as const;
