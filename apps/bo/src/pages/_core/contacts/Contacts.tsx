import Box from '@mui/material/Box';
import { useNavigate } from '@tanstack/react-router';
import debounce from 'lodash/debounce';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import type { Theme } from '@mui/material/styles';

import ExportButton from '@/components/ExportButton';
import Head from '@/components/Head';
import PageHeader from '@/components/layouts/PageHeader';
import {
  CONTACT_ALL_SCOPE, CONTACT_DELETED_SCOPE, CONTACT_PAGE_SIZE, CONTACT_SEARCH_DEBOUNCE,
} from '@/constants/_core/contact.constants';
import {
  INBOX_COLUMN_GAP, INBOX_MIN_HEIGHT, INBOX_QUEUE_WIDTH, INBOX_VIEWPORT_OFFSET,
} from '@/constants/_core/ui/inbox.constants';
import ContactDetail from '@/containers/_core/contacts/ContactDetail';
import ContactInboxQueue, { ContactInboxScope } from '@/containers/_core/contacts/ContactInboxQueue';
import { useProtect } from '@/hooks/_core/useProtect';
import { destroyObjects } from '@/redux/actions/_core/app.action';
import {
  buildContactQueries, ContactQuery, deleteContact, exportContacts, loadContactList,
} from '@/redux/actions/_core/contact.action';
import { goToPreview } from '@/redux/actions/_core/util.action';
import {
  deleteContactsSlice, getContactContactSelector, getContactContactsSelector,
  getContactCountSelector, getContactLoadingSelector,
} from '@/redux/reducers/_core/contact.reducer';
import { ExportFormat } from '@/types/_core/app.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';

const collection = 'Contact';

/*
 * two columns, "which message" then "what it says". The list column is fixed and the other takes
 * whatever the screen adds. On a phone they are two screens: the one being read takes the width.
 */
const classes = {
  layout: (theme: Theme) => ({
    display: 'grid',
    gridTemplateColumns: `${INBOX_QUEUE_WIDTH}px minmax(0, 1fr)`,
    gap: `${INBOX_COLUMN_GAP}px`,
    alignItems: 'stretch',
    // the page itself never scrolls: each column scrolls inside itself
    height: `calc(100vh - ${INBOX_VIEWPORT_OFFSET}px)`,
    minHeight: INBOX_MIN_HEIGHT,
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '1fr',
      height: 'auto',
    },
  }),
  list: (theme: Theme, isContactOpen: boolean) => ({
    minHeight: INBOX_MIN_HEIGHT,
    [theme.breakpoints.down('md')]: { display: isContactOpen ? 'none' : 'flex' },
  }),
  detail: (theme: Theme, isContactOpen: boolean) => ({
    minHeight: INBOX_MIN_HEIGHT,
    [theme.breakpoints.down('md')]: { display: isContactOpen ? 'flex' : 'none' },
  }),
};

/** The messages received from the website contact form: a list beside the one being read. */
const Contacts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'user']);

  const contacts = useSelector(getContactContactsSelector);
  const contact = useSelector(getContactContactSelector);
  const count = useSelector(getContactCountSelector);
  const loading = useSelector(getContactLoadingSelector);

  const { canDelete, canDestroy } = useProtect(collection);

  const [scope, setScope] = useState<string>(CONTACT_ALL_SCOPE);
  const [search, setSearch] = useState('');
  // zero-based; every change of scope or search goes back to the first page
  const [page, setPage] = useState(0);

  const buildQuery = (nextScope: string, nextSearch: string): ContactQuery => ({
    text: nextSearch || undefined,
    deleted: nextScope === CONTACT_DELETED_SCOPE,
  });

  // the bin is only offered to an account that may destroy a message
  const scopes: ContactInboxScope[] = [
    { value: CONTACT_ALL_SCOPE, label: t('common:all') },
    ...(canDestroy ? [{ value: CONTACT_DELETED_SCOPE, label: t('common:recycleBin') }] : []),
  ];

  // the list is searched by typing, so the query waits while the letters are still coming
  const debouncedLoad = useMemo(() => debounce(
    (query: ContactQuery) => dispatch(loadContactList(query)),
    CONTACT_SEARCH_DEBOUNCE
  ), [dispatch]);

  useEffect(() => () => debouncedLoad.cancel(), [debouncedLoad]);

  const handleScopeChange = (nextScope: string) => {
    debouncedLoad.cancel();
    setScope(nextScope);
    setPage(0);
    dispatch(loadContactList(buildQuery(nextScope, search)));
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
    debouncedLoad(buildQuery(scope, value));
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    dispatch(loadContactList({ ...buildQuery(scope, search), skip: nextPage * CONTACT_PAGE_SIZE }));
  };

  // opening a message is a navigation: every message keeps its own address
  const handleSelect = (id: string) => {
    navigate(goToPreview('contacts', id) as any);
  };

  // the export holds what the list is narrowed to, unpaginated
  const handleExport = (format: ExportFormat) => {
    const { limit, skip, ...queries } = buildContactQueries(buildQuery(scope, search));

    dispatch(exportContacts(queries, format));
  };

  // removing the last message of a page must not leave the reader on a page with nothing on it
  const reloadList = () => {
    const nextPage = contacts.length <= 1 && page > 0 ? page - 1 : page;

    setPage(nextPage);
    dispatch(loadContactList({ ...buildQuery(scope, search), skip: nextPage * CONTACT_PAGE_SIZE }));
  };

  const handleDelete = async () => {
    if (!contact) return;
    await dispatch(deleteContact(contact.id));
    navigate({ to: PATH_NAMES.contacts } as any);
    reloadList();
  };

  const handleDestroy = async () => {
    if (!contact) return;

    await dispatch(destroyObjects([contact.id], {
      collection,
      messageLabel: t('user:contacts.contacts'),
      updateListCallback: deleteContactsSlice,
    }));
    navigate({ to: PATH_NAMES.contacts } as any);
  };

  const isContactOpen = !!contact;

  return (
    <>
      <Head title={t('user:contacts.contacts')} />
      <PageHeader
        actions={<ExportButton onExport={handleExport} />}
        title={t('user:contacts.contacts')}
      />
      <Box css={classes.layout}>
        <Box css={(theme: Theme) => classes.list(theme, isContactOpen)}>
          <ContactInboxQueue
            activeScope={scope}
            contacts={contacts}
            count={count}
            loading={loading}
            onPageChange={handlePageChange}
            onScopeChange={handleScopeChange}
            onSearch={handleSearch}
            onSelect={handleSelect}
            page={page}
            scopes={scopes}
            selectedId={contact?.id}
          />
        </Box>
        <Box css={(theme: Theme) => classes.detail(theme, isContactOpen)}>
          <ContactDetail
            canDelete={canDelete}
            canDestroy={canDestroy}
            contact={contact}
            key={contact?.id}
            onDelete={handleDelete}
            onDestroy={handleDestroy}
          />
        </Box>
      </Box>
    </>
  );
};

export default Contacts;
