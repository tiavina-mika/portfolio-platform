import { TicketStatusEnum } from '@/types/ticket.type';

/** Name of the sequence the ticket reference is drawn from — see `counter.service.cloud.ts`. */
export const TICKET_REFERENCE_SEQUENCE = 'ticketReference';

/**
 * Value the ticket sequence starts from, so the very first reference is already four digits.
 * A one- or two-digit reference reads like a test row to whoever is quoted it over the phone,
 * and widening the number later would make two tickets look like they belong to different eras.
 */
export const TICKET_REFERENCE_START = 1000;

/**
 * How much of the latest message a ticket keeps for its row in the author's list. The row shows
 * two lines at most, so storing the whole message would only make every list read heavier.
 */
export const TICKET_LAST_MESSAGE_PREVIEW_LENGTH = 200;

/** The statuses in which support considers a ticket handled — the author sees it as finished. */
export const FINISHED_TICKET_STATUSES: string[] = [TicketStatusEnum.RESOLVED, TicketStatusEnum.CLOSED];

/**
 * How many acknowledgement texts one phone number may be sent in a day. A visitor who writes from
 * the website with a number only is answered by SMS, and the number is whatever they typed: past
 * this, the ticket is still filed but no more texts go to it — the reCAPTCHA and the rate limit
 * stop a bot, this stops a person pointing the form at someone else's phone.
 */
export const TICKET_ACKNOWLEDGEMENT_SMS_MAX_PER_PHONE_PER_DAY = 3;

/**
 * How many support replies one phone number may be sent by SMS in a day. An agent writes each of
 * them, so the risk is a runaway script or a mistake, not abuse — the cap is wide enough for a real
 * back-and-forth and low enough that a loop costs a handful of 50 Ar texts instead of thousands. Past
 * it the reply stays in the ticket and no more texts go out until the day's window closes.
 */
export const TICKET_REPLY_SMS_MAX_PER_PHONE_PER_DAY = 10;

/** Back-office path of a ticket (`<server>/<path>/<ticketId>`), linked from the staff alerts. */
export const TICKET_BO_PATH = 'contacts';
