/**
 * Notification status strings the server writes and the clients render, shared so the two never
 * drift on a literal.
 *
 * Only the ones a client actually branches on belong here — a status the server merely stores
 * stays server-side.
 */

/**
 * "Rate the people you travelled with", sent to the driver and to every passenger once a ride is
 * completed. Its payload names the ride, not a review: there is none yet, which is the point.
 * Distinct from the notification sent *after* a review is written, which tells the person they
 * were rated.
 */
export const RATING_INVITATION_STATUS = 'RATING_INVITATION';

/**
 * Sent halfway through the review window to whoever of the people who travelled together has not
 * reviewed everyone yet. Like the invitation, its payload names the ride.
 */
export const RATING_REMINDER_STATUS = 'RATING_REMINDER';

/**
 * Sent to the author of a review when the person reviewed answers it publicly. Its payload names
 * the review and carries the reply's author as the sender.
 */
export const RATING_REPLY_STATUS = 'RATING_REPLY';

/**
 * Sent to a passenger whose booking payment the operator confirmed after the booking had already
 * been closed — the money is given straight back. Its own status rather than the booking's
 * PAYMENT_FAILED: the passenger was already told the payment had failed, so they have to read that
 * it went through after all and has been refunded, otherwise the refund looks unexplained.
 */
export const LATE_PAYMENT_REFUNDED_STATUS = 'LATE_PAYMENT_REFUNDED';

/**
 * Sent to a passenger once a refund of their booking has actually left the merchant account, with
 * the amount.
 *
 * Its own status rather than the booking's: the notice saying the booking was refused, expired or
 * cancelled is sent the moment the booking closes, which with a mobile money operator is before
 * the money moves — and none of those notices can state the amount, since a cancellation tier only
 * gives part of it back. The passenger was left to work out from their operator's statement how
 * much they had been given back, and whether they had been at all.
 */
export const REQUEST_REFUND_PAID_STATUS = 'REQUEST_REFUND_PAID';

/**
 * Sent to the driver once the payout of a closed ride is released, at the end of the passenger
 * contestation window. Its own status rather than the ride's COMPLETED: the passengers get
 * COMPLETED ("rate your ride"), the driver must read that the money has left.
 */
export const RIDE_PAYOUT_RELEASED_STATUS = 'RIDE_PAYOUT_RELEASED';

/**
 * Driver no-show report lifecycle, each sent as a request notification. Their own statuses rather
 * than the booking's: the booking stays accepted while support examines the report, and each side
 * must read what actually happened (reported, answered, confirmed, rejected), not a status change.
 */
/** to the driver: a passenger reported them absent, and the ride closure is frozen */
export const DRIVER_NO_SHOW_REPORTED_STATUS = 'DRIVER_NO_SHOW_REPORTED';
/** to the passenger: the driver answered their report */
export const DRIVER_NO_SHOW_REPLIED_STATUS = 'DRIVER_NO_SHOW_REPLIED';
/** to the passenger and the driver: support confirmed the absence, the ride is cancelled and refunded */
export const DRIVER_NO_SHOW_CONFIRMED_STATUS = 'DRIVER_NO_SHOW_CONFIRMED';
/** to the passenger and the driver: support rejected the report, the ride can be closed */
export const DRIVER_NO_SHOW_REJECTED_STATUS = 'DRIVER_NO_SHOW_REJECTED';

/**
 * Support's decision on a contested passenger no-show, sent as a request notification to both
 * sides. Their own statuses rather than the booking's: a rejection can leave the booking accepted
 * or completed, which already carry a meaning of their own in the notification list. The
 * declaration and the contest themselves are sent under the `NO_SHOW` and `CONTESTED_NO_SHOW`
 * booking statuses.
 */
/** to the passenger and the driver: support confirmed the absence, the declaration is final */
export const PASSENGER_NO_SHOW_CONFIRMED_STATUS = 'PASSENGER_NO_SHOW_CONFIRMED';
/** to the passenger and the driver: support rejected the declaration, the trip counts as made */
export const PASSENGER_NO_SHOW_REJECTED_STATUS = 'PASSENGER_NO_SHOW_REJECTED';

/**
 * A driver fined and/or suspended for cancelling a booked ride. Its own status rather than the
 * ride's CANCELED: the passengers get CANCELED ("your ride was cancelled"), the driver must read the
 * amount of the penalty and until when they are suspended, carried by the payload's `penalty`.
 */
export const DRIVER_CANCELLATION_PENALTY_STATUS = 'DRIVER_CANCELLATION_PENALTY';

/**
 * A passenger suspended from booking after too many cancellations. The payload's `suspension.until`
 * is when they can book again.
 */
export const PASSENGER_CANCELLATION_SUSPENSION_STATUS = 'PASSENGER_CANCELLATION_SUSPENSION';

/** A cancellation or preventive suspension that has ended — served in full or lifted by support. */
export const SUSPENSION_LIFTED_STATUS = 'SUSPENSION_LIFTED';

/** The account has been banned; sent by e-mail too, since the ban revokes every session. */
export const ACCOUNT_BANNED_STATUS = 'ACCOUNT_BANNED';

/** A ban has ended — expired or lifted by support. */
export const ACCOUNT_UNBANNED_STATUS = 'ACCOUNT_UNBANNED';

/** Sent to an account signed in from a device it had never used. */
export const NEW_DEVICE_LOGIN_STATUS = 'NEW_DEVICE_LOGIN';

/**
 * A password reset by SMS was requested on an account unused for a long time, and is held back
 * until the date in the payload's `reset.availableAt`. Sent to the account's devices so the
 * original owner, if the phone number was recycled, can sign in and cancel it.
 */
export const PASSWORD_RESET_DELAYED_STATUS = 'PASSWORD_RESET_DELAYED';

/** Sent to an account once a back-office support session on it has ended. */
export const SUPPORT_SESSION_ENDED_STATUS = 'SUPPORT_SESSION_ENDED';

/**
 * Sent to the member who filed a report as soon as it is on file: their report is taken into
 * account. The only trace of it a member without an e-mail address ever gets.
 */
export const REPORT_RECEIVED_STATUS = 'REPORT_RECEIVED';

/**
 * Sent to the member who filed a report once the team has closed it, whether it led to an action or
 * was dismissed — the notice never says which, since the decision concerns another member.
 */
export const REPORT_RESOLVED_STATUS = 'REPORT_RESOLVED';

/** Vehicle document review, each carrying the vehicle's brand and model in the payload. */
export const VEHICLE_VERIFIED_STATUS = 'VEHICLE_VERIFIED';
export const VEHICLE_DOCUMENT_REJECTED_STATUS = 'VEHICLE_DOCUMENT_REJECTED';
export const VEHICLE_DOCUMENT_EXPIRING_SOON_STATUS = 'VEHICLE_DOCUMENT_EXPIRING_SOON';
export const VEHICLE_DOCUMENT_EXPIRED_STATUS = 'VEHICLE_DOCUMENT_EXPIRED';

/** An agent answered the user's support ticket. */
export const TICKET_NEW_REPLY_FROM_AGENT_STATUS = 'newReplyFromAgent';

/** Support marked the user's ticket resolved or closed. */
export const TICKET_RESOLVED_STATUS = 'TICKET_RESOLVED';

/**
 * Departure reminders (J-1 and H-1) sent to the driver and every passenger of a booked ride, and the
 * reminder sent to a driver whose ride is still open well past its estimated arrival.
 */
export const RIDE_DEPARTURE_REMINDER_STATUS = 'RIDE_DEPARTURE_REMINDER';
export const RIDE_COMPLETION_REMINDER_STATUS = 'RIDE_COMPLETION_REMINDER';

/**
 * A ride still open a day past its estimated arrival, and what follows when its driver never closes
 * it. Their own statuses rather than the ride's AWAITING_CONFIRMATION: that one reads "the driver
 * has finished the ride", which is exactly what did not happen here.
 */
/** to the passengers: did the trip take place? Report the driver absent before the automatic closure */
export const RIDE_COMPLETION_CHECK_STATUS = 'RIDE_COMPLETION_CHECK';
/** to the passengers: the ride was closed on its driver's behalf, the contestation window is open */
export const RIDE_AUTO_COMPLETED_STATUS = 'RIDE_AUTO_COMPLETED';
/** to the driver: their ride was closed for them, and the payout follows the contestation window */
export const RIDE_AUTO_COMPLETED_DRIVER_STATUS = 'RIDE_AUTO_COMPLETED_DRIVER';

/** Sent to a passenger once their booking payment went through and the driver has been asked. */
export const REQUEST_PAYMENT_SUCCEEDED_STATUS = 'REQUEST_PAYMENT_SUCCEEDED';

/**
 * A preventive suspension decided after reports (automatic threshold or a moderator's decision).
 * The payload's `suspension.until` is when it ends.
 */
export const ACCOUNT_SUSPENDED_STATUS = 'ACCOUNT_SUSPENDED';

/**
 * Sent to every passenger of a booked ride whose driver changed what they had booked — the
 * departure time or one of the places. The payload's `rideChange` names what moved and until when
 * the passenger may cancel with a full refund: a change they did not choose must not cost them the
 * usual cancellation tier.
 */
export const RIDE_UPDATED_STATUS = 'RIDE_UPDATED';

/**
 * An announcement written by the back-office and sent to a segment of the members (an operator
 * incident, a new feature). Its text is not composed from a template like every other notification:
 * the payload carries the words the operator typed, per language.
 */
export const ANNOUNCEMENT_STATUS = 'ANNOUNCEMENT';
