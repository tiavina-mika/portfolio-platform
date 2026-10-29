import { DEFAULT_COUNTRY } from '@shared/constants';
import { formatAmountInCurrency, getCountryByCurrency, resolveTimeZone } from '@shared/utils';
import PDFDocument from 'pdfkit';

import type { Locale } from '@/types/app.type';

import { translate } from '@/config/i18n';
import { APP_NAME } from '@/constants/_core/constants';
import { formatDateInAppTimezone } from '@/utils/_core/date.utils';

const DATE_FORMAT = 'DD/MM/YYYY';

/**
 * Builds the receipt PDF entirely from the Payment's own fields and its immutable `snapshot`
 * (no reload of Ride/Request/User) — a receipt must stay correct even if the underlying ride or
 * user data changes later. Regenerated fresh on every call (never persisted) — deterministic from
 * the Payment, cheap to build, so there is nothing worth caching.
 */
export const buildReceiptPdfBuffer = (
  payment: Parse.Object,
  recipientName: string,
  locale: Locale
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const snapshot = (payment.get('snapshot') || {}) as Record<string, any>;
    const amount = payment.get('amount');
    const currency = payment.get('currency');
    // the country of the payment's currency: its clock dates the receipt, its law adds the legal lines
    const country = getCountryByCurrency(currency) ?? DEFAULT_COUNTRY;
    const service = payment.get('service');

    doc
      .fontSize(20)
      .text(APP_NAME, { align: 'left' })
      .fontSize(14)
      .text(translate('receipt.title', locale), { align: 'left' })
      .moveDown(1.5);

    const row = (label: string, value: string): void => {
      doc.fontSize(11).text(`${label}: ${value}`);
    };

    row(translate('receipt.recipient', locale), recipientName);
    row(translate('receipt.issuedAt', locale), formatDateInAppTimezone(new Date(), DATE_FORMAT, country.timeZone));
    row(translate('receipt.amount', locale), formatAmountInCurrency(amount, currency));

    if (service) {
      row(translate('receipt.service', locale), service);
    }

    row(translate('receipt.transactionId', locale), payment.id);

    if (snapshot.ride?.date) {
      row(
        translate('receipt.rideDate', locale),
        formatDateInAppTimezone(snapshot.ride.date, DATE_FORMAT, resolveTimeZone(snapshot.ride.timeZone))
      );
    }

    if (snapshot.request?.totalPrice) {
      row(translate('receipt.totalPrice', locale), formatAmountInCurrency(snapshot.request.totalPrice, currency));
    }

    doc
      .moveDown(2)
      .fontSize(9)
      .fillColor('gray')
      .text(translate('receipt.disclaimer', locale), { align: 'left' });

    country.receipt.legalMentions.forEach((mention) => doc.text(mention, { align: 'left' }));

    doc.end();
  });
};
