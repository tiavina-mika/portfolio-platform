import { MessageChannelEnum } from '@shared/types';
import { getDisplayIdentifier, getDisplayName } from '@shared/utils';

import type { TFunction } from 'i18next';

import {
  TICKET_PRIORITY_OPTIONS, TICKET_STATUS_OPTIONS,
} from '@/constants/_core/ticket.constants';
import { ISelectOption } from '@/types/_core/app.type';
import { IContact } from '@/types/_core/contact.type';
import {
  TicketPriority, TicketSource, TicketSourceEnum, TicketStatus,
} from '@/types/_core/ticket-message.type';
import { getUserFullName } from '@/utils/_core/user.utils';

/**
 * Where the ticket was written from. Tickets created before the field existed carry nothing, so
 * they fall back to what their own account says: only the app can open a ticket while signed in,
 * so one without an account can only have come from the public website form.
 */
export const getTicketSource = (contact: IContact): TicketSource =>
  contact.source ?? (contact.user ? TicketSourceEnum.APP : TicketSourceEnum.WEB);

/**
 * Whether answering this ticket is a one-way act. What decides it is the absence of an account,
 * not the channel it arrived by: with no account there is no thread to answer into, so the reply
 * leaves as an email nobody can reply to — which is what the agent has to know before writing.
 */
export const isOneWayTicket = (contact: IContact): boolean => !contact.user;

/**
 * How a reply to this ticket reaches its requester when it cannot be answered in the app: by email
 * when the ticket has an address, by SMS when the requester left a phone number alone — which is
 * what a visitor with no email does. Only meaningful for a one-way ticket (see `isOneWayTicket`).
 */
export const getTicketReplyChannel = (contact: IContact): MessageChannelEnum => (
  !contact.email && contact.phone ? MessageChannelEnum.SMS : MessageChannelEnum.EMAIL
);

/**
 * Who opened the ticket. A ticket carries both an account and the name typed into the form it was
 * sent from — the account wins when there is one, because it is the name the rest of the
 * back-office knows this person by.
 */
export const getTicketRequesterName = (contact: IContact, fallbackLabel = ''): string => (
  (contact.user ? getUserFullName(contact.user) : '') ||
  // the same order as everywhere else (name, phone, email): a visitor who left a number only is named by it
  getDisplayIdentifier({ lastName: contact.name, phone: contact.phone, email: contact.email }, fallbackLabel)
);

/**
 * The two letters standing in for a requester with no picture — the queue has no room for more. Only
 * a name has initials: a requester known by their number alone gets none, and the avatar keeps its
 * default pictogram rather than showing "+2".
 */
export const getTicketRequesterInitials = (contact: IContact): string => {
  const personName = (contact.user ? getDisplayName(contact.user) : '') ||
    getDisplayName({ lastName: contact.name });

  const initials = personName
    .split(' ')
    .filter(Boolean)
    .map((part: string) => part.charAt(0))
    .join('');

  return initials.slice(0, 2).toUpperCase();
};

export const getTicketStatusLabelByValue = (status: TicketStatus): string => {
  const statusOption = TICKET_STATUS_OPTIONS.find((option: ISelectOption) => option.value === status);

  return statusOption?.label ?? '';
};

export const getTicketPriorityLabelByValue = (priority: TicketPriority): string => {
  const priorityOption = TICKET_PRIORITY_OPTIONS.find((option: ISelectOption) => option.value === priority);

  return priorityOption?.label ?? '';
};

/**
 * What the request is about, as the agent reads it: "Refund · Wrong amount", or the subject alone
 * when it takes no reason. Empty for a ticket that carries no subject — one from the website, or one
 * filed before subjects existed.
 */
export const getTicketSubjectLabel = (contact: Pick<IContact, 'subject' | 'reason'>, t: TFunction): string => {
  if (!contact.subject) return '';

  const subject = t(`user:contacts.subjects.${contact.subject}`);

  return contact.reason
    ? `${subject} · ${t(`user:contacts.reasons.${contact.subject}.${contact.reason}`)}`
    : subject;
};
