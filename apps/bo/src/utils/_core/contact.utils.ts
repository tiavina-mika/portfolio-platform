import type { IContact, ITicketSosContext } from '@/types/_core/contact.type';
import type { ComponentType, ReactNode } from 'react';

export type ContactDetailRow = { label: string; value: ReactNode };

type ContactDetailRowBuilder = (contact: IContact) => ContactDetailRow | undefined;

const detailRowBuilders: ContactDetailRowBuilder[] = [];

/**
 * Lets the business domain add a fact to the generic ticket details card (the booking a ticket is
 * about), from a composition point outside `_core/`.
 */
export const registerContactDetailRow = (builder: ContactDetailRowBuilder): void => {
  detailRowBuilders.push(builder);
};

export const getContactDetailRows = (contact: IContact): ContactDetailRow[] =>
  detailRowBuilders
    .map((builder) => builder(contact))
    .filter((row): row is ContactDetailRow => !!row);

/**
 * Open registry: how a domain that raises SOS alerts shows them on a ticket — the badge in the
 * queue and the thread header, the bar under the header and the card beside the thread. The generic
 * ticket screens draw nothing for an SOS until a domain registers it.
 */
export type ContactSosExtension = {
  Badge: ComponentType<{ isClosed?: boolean; variant?: 'badge' | 'chip' }>;
  Bar: ComponentType<{ sosAlert: ITicketSosContext }>;
  Card: ComponentType<{ sosAlert: ITicketSosContext }>;
};

let contactSosExtension: ContactSosExtension | undefined;

export const registerContactSos = (extension: ContactSosExtension): void => {
  contactSosExtension = extension;
};

export const getContactSosExtension = (): ContactSosExtension | undefined => contactSosExtension;
