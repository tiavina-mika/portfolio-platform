/**
 * A payment left PENDING past this many minutes is overdue: the reconciliation job fails it, and
 * the back-office reports it as stalled. It matches the mock mobile money gateway's own timeout,
 * after which it would have reached FAILED on its own.
 *
 * Shared because the back-office writes it into the copy explaining what "overdue" means — that
 * sentence read "more than 10 minutes" as a literal, which would have kept saying 10 after the
 * server moved on.
 */
export const PENDING_PAYMENT_TIMEOUT_MINUTES = 10;
