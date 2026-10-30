import { TICKET_HIGH_PRIORITY_REASONS, TICKET_SUBJECT_OBJECTS } from '@shared/domain-constants';
import { TicketObjectEnum } from '@shared/types';

import type { TicketSubjectEnum } from '@shared/types';

import { TICKET_LAST_MESSAGE_PREVIEW_LENGTH } from '@/constants/_core/ticket.constants';
import { TicketPriorityEnum, type ContactObjectIds } from '@/types/ticket.type';

/** The `createContact` parameter that carries each kind of attached record. */
const CONTACT_OBJECT_ID_KEYS: Record<TicketObjectEnum, keyof ContactObjectIds> = {
  [TicketObjectEnum.RIDE]: 'rideId',
  [TicketObjectEnum.BOOKING]: 'requestId',
  [TicketObjectEnum.PAYMENT]: 'paymentId',
  [TicketObjectEnum.USER]: 'reportedUserId',
};

/**
 * The priority an app request is filed with, from what it is about: the author never picks it,
 * or every request would be marked urgent.
 */
export const getContactPriority = (subject: TicketSubjectEnum, reason?: string): TicketPriorityEnum => {
  const highPriorityReasons = TICKET_HIGH_PRIORITY_REASONS[subject] ?? [];

  return reason && highPriorityReasons.includes(reason) ? TicketPriorityEnum.HIGH : TicketPriorityEnum.MEDIUM;
};

/**
 * Whether the records sent with a request are the ones its subject attaches: every required one
 * present, and none the subject does not take — a ride on an account question would only mislead
 * the agent reading it. A passenger's booking travels with the ride it was made on, so it is
 * accepted beside a ride as well as on its own subject.
 * @param subject what the request is about
 * @param ids the record ids the caller sent
 * @returns whether the set of records fits the subject
 */
export const areContactObjectsValid = (subject: TicketSubjectEnum, ids: ContactObjectIds): boolean => {
  const objects = TICKET_SUBJECT_OBJECTS[subject] ?? [];
  const allowedKeys = new Set(objects.map(({ object }) => CONTACT_OBJECT_ID_KEYS[object]));

  if (ids.rideId && allowedKeys.has('rideId')) allowedKeys.add('requestId');

  const hasStrayObject = Object.values(CONTACT_OBJECT_ID_KEYS)
    .some((key) => !!ids[key] && !allowedKeys.has(key));
  const hasEveryRequiredObject = objects
    .every(({ object, required }) => !required || !!ids[CONTACT_OBJECT_ID_KEYS[object]]);

  return !hasStrayObject && hasEveryRequiredObject;
};

/**
 * The part of a message a ticket keeps to show it in its author's list: whitespace collapsed,
 * since the row is two lines at most and a blank line would spend one of them on nothing.
 * @param message the message as written — empty when it only carries attachments
 * @returns the preview, empty when the message has no text
 */
export const getTicketMessagePreview = (message?: string): string =>
  (message ?? '').replace(/\s+/g, ' ').trim().slice(0, TICKET_LAST_MESSAGE_PREVIEW_LENGTH);
