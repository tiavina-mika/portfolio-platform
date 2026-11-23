import { QUOTE_ACCEPTANCE_PROOF_EXTENSIONS, QUOTE_ACCEPTANCE_PROOF_FOLDER } from '@shared/domain-constants';
import { QuoteStatusEnum } from '@shared/domain-types';

import {
  CLOUDINARY_DELIVERY_HOST, QUOTE_COUNTER_NAME_PREFIX, QUOTE_NUMBER_PREFIX, QUOTE_NUMBER_SEQUENCE_DIGITS,
} from '@/constants/_domain/quote.constants';

/**
 * The counter row the quotes of one year are numbered from: one row per year, so the numbering starts
 * again at 1 every January without anything to reset.
 * @example buildQuoteCounterName(2026) => 'quote-2026'
 */
export const buildQuoteCounterName = (year: number): string => `${QUOTE_COUNTER_NAME_PREFIX}-${year}`;

/**
 * The year a quote is numbered in: the calendar year where the business works, not the server's (UTC)
 * year, so a quote written on the 1st of January at 1 a.m. in Antananarivo is already the new year's.
 * @param date the moment the quote is created
 * @param timeZone the IANA time zone of the business
 * @example getQuoteNumberYear(new Date('2026-12-31T22:30:00Z'), 'Indian/Antananarivo') => 2027
 */
export const getQuoteNumberYear = (date: Date, timeZone: string): number => (
  Number(new Intl.DateTimeFormat('en', { timeZone, year: 'numeric' }).format(date))
);

/**
 * The readable reference of a quote.
 * @param year the year the quote was created in
 * @param sequence its rank in that year, from 1
 * @example formatQuoteNumber(2026, 1) => 'AL-2026-001'
 */
export const formatQuoteNumber = (year: number, sequence: number): string => (
  `${QUOTE_NUMBER_PREFIX}-${year}-${String(sequence).padStart(QUOTE_NUMBER_SEQUENCE_DIGITS, '0')}`
);

/**
 * Whether a proof may be attached to a quote by this move: only by the move that accepts it, so a
 * proof is never added to, changed on or removed from a quote afterwards.
 * @param from the status the quote stands in
 * @param to the status it is saved in
 */
export const canAttachQuoteAcceptanceProof = (from: QuoteStatusEnum, to: QuoteStatusEnum): boolean => (
  from !== to && to === QuoteStatusEnum.ACCEPTED
);

/**
 * Whether a proof is a file the back-office stored itself: an `https` address of the platform's
 * Cloudinary account, under the proofs folder, with an accepted extension, whose address names the
 * same file as its public id. The call that attaches it can be forged: anything else (a link to another
 * host, a file of another feature) would be offered to a teammate as the client's proof.
 * @param file the proof as the call sends it
 * @param cloudName the Cloudinary account of the platform
 * @example isQuoteAcceptanceProofFile({
 *   publicId: 'quotes/acceptance-proofs/abc',
 *   url: 'https://res.cloudinary.com/demo/image/upload/v1/quotes/acceptance-proofs/abc.pdf',
 * }, 'demo') => true
 */
export const isQuoteAcceptanceProofFile = (
  file: { publicId?: unknown; url?: unknown } | null | undefined, cloudName: string | undefined
): boolean => {
  if (!cloudName || typeof file?.publicId !== 'string' || typeof file.url !== 'string') return false;
  if (!file.publicId.startsWith(`${QUOTE_ACCEPTANCE_PROOF_FOLDER}/`)) return false;
  if (!URL.canParse(file.url)) return false;

  const { protocol, hostname, pathname } = new URL(file.url);

  if (protocol !== 'https:' || hostname !== CLOUDINARY_DELIVERY_HOST) return false;
  if (!pathname.startsWith(`/${cloudName}/`)) return false;

  // as written in the address (`.PDF` names the same file), compared whatever its case
  const extension = pathname.split('.').pop() ?? '';

  const acceptedExtensions: readonly string[] = QUOTE_ACCEPTANCE_PROOF_EXTENSIONS;

  if (!acceptedExtensions.includes(extension.toLowerCase())) return false;

  return pathname.endsWith(`/${file.publicId}.${extension}`);
};
