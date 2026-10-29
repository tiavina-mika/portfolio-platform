import { Outlet, createRoute } from '@tanstack/react-router';

import Contacts from '@/pages/contacts/Contacts';
import {
  onContactsEnter,
  onContactsLeave,
} from '@/redux/actions/contact.action';
import { onEnter } from '@/redux/actions/util.action';
import { validateTabSearch } from '@/utils/app.utils';
import { PATH_NAMES } from '@/utils/pathnames';

import { privateLayout } from './private.routes';

export const contactsLayout = createRoute({
  getParentRoute: () => privateLayout,
  component: () => <Outlet />,
  path: PATH_NAMES.contacts,
});

export const contactsRoute = createRoute({
  validateSearch: validateTabSearch,
  getParentRoute: () => contactsLayout,
  beforeLoad: onEnter(onContactsEnter),
  onLeave: onEnter(onContactsLeave),
  component: Contacts,
  path: '/',
});

const contactRoutes = [
  contactsRoute,
];

export default contactRoutes;
