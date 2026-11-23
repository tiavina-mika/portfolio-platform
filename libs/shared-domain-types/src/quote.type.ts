/**
 * Where an Aldaron quote stands. It is born `draft`, the only state in which it can be edited, then
 * `sent`; the client's answer makes it `accepted` or `refused`, and a quote left unanswered becomes
 * `expired`. A quote is never deleted: it stays as history in one of these states.
 */
export enum QuoteStatusEnum {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  REFUSED = 'refused',
  EXPIRED = 'expired'
}

// how the client said yes: the proof of the acceptance, recorded with its date
export enum QuoteAcceptanceMethodEnum {
  EMAIL = 'email',
  SIGNATURE = 'signature',
  ORAL = 'oral',
  OTHER = 'other'
}

/**
 * One priced line of a quote. A fixed set of keys, so the lines stay queryable. `unitAmount` is an
 * integer in the smallest unit of the quote's currency (cents for the euro), never a float.
 */
export interface IQuoteLine {
  label: string;
  // may hold decimals: half a day of work is a quantity of 0.5
  quantity: number;
  unitAmount: number;
}
