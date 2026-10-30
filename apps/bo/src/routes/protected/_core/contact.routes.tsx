import { Outlet, createRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { z } from 'zod';

import {
  onContactEnter, onContactLeave, onContactsEnter, onContactsLeave,
} from '@/redux/actions/_core/contact.action';
import { onEnter, onLeave } from '@/redux/actions/_core/util.action';
import { privateLayout } from '@/routes/protected/_core/privateLayout.routes';
import { IIdParams } from '@/types/_core/app.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';

const Contacts = lazy(() => import('@/pages/_core/contacts/Contacts'));

export const contactsLayout = createRoute({
  getParentRoute: () => privateLayout,
  component: () => <Outlet />,
  onLeave: onLeave(onContactsLeave),
  path: PATH_NAMES.contacts,
  staticData: { breadcrumb: { labelKey: 'user:contacts.contacts' } },
});

export const contactsRoute = createRoute({
  getParentRoute: () => contactsLayout,
  beforeLoad: onEnter(onContactsEnter),
  component: Contacts,
  path: '/',
});

/*
 * a ticket is not a page of its own: it is the inbox with that ticket open, so both routes render
 * the same screen. The address still names the ticket, which is what the notification centre, the
 * global search and a link pasted into a chat all point at.
 */
export const contactRoute = createRoute({
  parseParams: (params: IIdParams) => ({ id: z.string().parse(params.id) }),
  beforeLoad: onEnter(onContactEnter),
  onLeave: onLeave(onContactLeave),
  getParentRoute: () => contactsLayout,
  component: Contacts,
  path: '$id',
});

const contactRoutes = [
  contactsRoute,
  contactRoute,
];

export default contactRoutes;
