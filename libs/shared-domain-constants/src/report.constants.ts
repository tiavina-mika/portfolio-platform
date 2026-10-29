/**
 * Hours an unresolved dispute may age before it is flagged as overdue. Set so a passenger who
 * paid gets an answer within two working days, which is what the refund tiers implicitly promise.
 *
 * Shared because the server filters the "overdue" queue on it while the back-office colours the
 * age chip with it — two definitions would drift apart.
 */
export const DISPUTE_SLA_HOURS = 48;
