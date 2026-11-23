import { getDisplayIdentifier, getDisplayName } from '@shared/utils';

import type { TargetEnum } from '@shared/types';

import { IContact, IContactDetailAction } from '@/types/_core/contact.type';
import { getUserFullName } from '@/utils/_core/user.utils';

/*
 * the actions a business domain adds to the message being read, filled once at startup from
 * `config/domain-registrations.ts`: the inbox renders them without importing the domain
 */
const contactDetailActions: IContactDetailAction[] = [];

/** Side-effect registration of the actions a domain adds to the message being read. */
export const registerContactDetailActions = (actions: IContactDetailAction[]): void => {
  contactDetailActions.push(
    ...actions.filter((action) => !contactDetailActions.some(({ id }) => id === action.id))
  );
};

/** the actions a domain added to the message being read, kept to those of the workspace worked in */
export const getContactDetailActions = (workspace: TargetEnum): IContactDetailAction[] => (
  contactDetailActions.filter((action) => action.workspaces.includes(workspace))
);

/**
 * Who sent the message: the account when there is one (the name the rest of the back-office knows
 * this person by), else the name typed in the form, else the number or the email they left.
 */
export const getContactName = (contact: IContact, fallbackLabel = ''): string => (
  (contact.user ? getUserFullName(contact.user) : '') ||
  getDisplayIdentifier({ lastName: contact.name, phone: contact.phone, email: contact.email }, fallbackLabel)
);

/**
 * The two letters standing in for a sender with no picture. Only a name has initials: a sender known
 * by a number alone gets none, and the avatar keeps its default pictogram.
 */
export const getContactInitials = (contact: IContact): string => {
  const personName = (contact.user ? getDisplayName(contact.user) : '') ||
    getDisplayName({ lastName: contact.name });

  const initials = personName
    .split(' ')
    .filter(Boolean)
    .map((part: string) => part.charAt(0))
    .join('');

  return initials.slice(0, 2).toUpperCase();
};
