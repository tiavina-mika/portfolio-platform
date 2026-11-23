/** the columns the payments of a quote are read with: the back-office lists them all in one dialog */
export const PAYMENT_LIST_FIELDS = [
  'quote', 'client', 'kind', 'percent', 'amount', 'status', 'dueDate', 'paidAt', 'method', 'reference',
  'createdAt', 'updatedAt',
];

/*
 * the columns written once, when the payment is created, from the schedule and the quote: a later save
 * that changes one of them is put back, whatever wrote it
 */
export const PAYMENT_FIXED_FIELDS = ['quote', 'client', 'kind', 'percent', 'amount', 'createdBy'] as const;

/*
 * the columns of what was paid: a paid payment is history, none of them changes again. Its status may
 * only become `cancelled`
 */
export const PAYMENT_PAID_FIELDS = ['dueDate', 'paidAt', 'method', 'reference'] as const;

/*
 * the most payments one quote is read with: three from the schedule plus the replacements of the
 * corrections, far below this
 */
export const QUOTE_PAYMENTS_LIMIT = 100;

/*
 * the context flag the payment trigger saves a quote with when it brings its `paidAmount` up to date:
 * any other save of the quote puts `paidAmount` back
 */
export const PAID_AMOUNT_UPKEEP_CONTEXT_KEY = 'isPaidAmountUpkeep';
