import type { IContact } from '@/types/_core/contact.type';
import type { ReactNode } from 'react';

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
