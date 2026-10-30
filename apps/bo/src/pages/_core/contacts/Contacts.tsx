import Box from '@mui/material/Box';
import { useNavigate } from '@tanstack/react-router';
import debounce from 'lodash/debounce';
import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import type { Theme } from '@mui/material/styles';

import ExportButton from '@/components/ExportButton';
import Head from '@/components/Head';
import PageHeader from '@/components/layouts/PageHeader';
import {
  CONTACT_INBOX_ALL_SCOPE, CONTACT_INBOX_DELETED_SCOPE, CONTACT_INBOX_PAGE_SIZE,
  CONTACT_INBOX_SEARCH_DEBOUNCE, TICKET_STATUS_OPTIONS,
} from '@/constants/_core/ticket.constants';
import {
  INBOX_COLUMN_GAP, INBOX_CONTEXT_WIDTH, INBOX_MIN_HEIGHT, INBOX_QUEUE_WIDTH, INBOX_VIEWPORT_OFFSET,
} from '@/constants/_core/ui/inbox.constants';
import { RESPONSIVE_BREAKPOINT } from '@/constants/_core/ui/ui.constants';
import ContactContextPanel from '@/containers/_core/contacts/ContactContextPanel';
import ContactConversation from '@/containers/_core/contacts/ContactConversation';
import ContactInboxQueue, { ContactInboxScope } from '@/containers/_core/contacts/ContactInboxQueue';
import { useProtect } from '@/hooks/_core/useProtect';
import { destroyObjects } from '@/redux/actions/_core/app.action';
import {
  assignTicket, buildContactInboxQueries, ContactInboxQuery, deleteContact, exportContacts,
  loadContactInbox, sendTicketMessage, updateTicketPriority, updateTicketStatus,
} from '@/redux/actions/_core/contact.action';
import { goToPreview } from '@/redux/actions/_core/util.action';
import {
  deleteContactsSlice,
  getContactAgentsSelector, getContactContactSelector, getContactContactsSelector,
  getContactCountSelector, getContactLoadingSelector, getContactSummarySelector,
  getContactTicketContextLoadingSelector, getContactTicketContextSelector,
  getContactTicketMessagesLoadingSelector, getContactTicketMessagesSelector,
} from '@/redux/reducers/_core/contact.reducer';
import { ExportFormat, ISelectOption } from '@/types/_core/app.type';
import { IContactInboxFilters } from '@/types/_core/contact.type';
import { TicketPriority, TicketStatus, TicketStatusEnum } from '@/types/_core/ticket-message.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { sortLiveSosFirst } from '@/utils/_core/ticket.utils';

const collection = 'Contact';

/*
 * three columns read left to right as "which ticket", "what was said", "who is saying it". The two
 * side columns are fixed and the middle one takes whatever the screen adds — it is the only one
 * holding prose. Under the breakpoint the context column drops below the thread rather than
 * squeezing it: what is known about the requester is what an agent reaches for second. With no
 * ticket open there is no third column at all — the empty state takes the whole width left of the
 * queue rather than sitting in a middle column with a hole beside it.
 */
const classes = {
  inbox: (theme: Theme, isTicketOpen: boolean) => ({
    display: 'grid',
    gridTemplateColumns: isTicketOpen
      ? `${INBOX_QUEUE_WIDTH}px minmax(0, 1fr) ${INBOX_CONTEXT_WIDTH}px`
      : `${INBOX_QUEUE_WIDTH}px minmax(0, 1fr)`,
    gap: `${INBOX_COLUMN_GAP}px`,
    alignItems: 'stretch',
    /*
     * the page itself never scrolls: the columns fill what is left of the viewport under the head
     * and scroll inside themselves, so the composer stays reachable however long the thread is
     */
    height: `calc(100vh - ${INBOX_VIEWPORT_OFFSET}px)`,
    minHeight: INBOX_MIN_HEIGHT,
    [theme.breakpoints.down(RESPONSIVE_BREAKPOINT)]: {
      gridTemplateColumns: `${INBOX_QUEUE_WIDTH}px minmax(0, 1fr)`,
      gridTemplateRows: 'auto auto',
      height: 'auto',
    },
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '1fr',
      height: 'auto',
    },
  }),
  /*
   * on a phone the queue and the thread are two screens rather than two columns: the one being
   * read takes the width, and the other is dropped rather than stacked under it
   */
  queue: (theme: Theme, isTicketOpen: boolean) => ({
    minHeight: INBOX_MIN_HEIGHT,
    [theme.breakpoints.down('md')]: { display: isTicketOpen ? 'none' : 'flex' },
  }),
  conversation: (theme: Theme, isTicketOpen: boolean) => ({
    minHeight: INBOX_MIN_HEIGHT,
    [theme.breakpoints.down('md')]: { display: isTicketOpen ? 'flex' : 'none' },
  }),
  context: (theme: Theme, isTicketOpen: boolean) => ({
    [theme.breakpoints.down(RESPONSIVE_BREAKPOINT)]: { gridColumn: '1 / -1' },
    [theme.breakpoints.down('md')]: { display: isTicketOpen ? 'flex' : 'none' },
  }),
};

/**
 * The contacts page is one conversation with the queue beside it. A support ticket is answered by
 * reading what was written and writing back — a table of tickets would make every answer a round
 * trip through a row, a dialog and a form, which is three steps too many for a queue worked
 * dozens of times a day.
 */
const Contacts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'user']);

  const contacts = useSelector(getContactContactsSelector);
  const contact = useSelector(getContactContactSelector);
  const count = useSelector(getContactCountSelector);
  const summary = useSelector(getContactSummarySelector);
  const agents = useSelector(getContactAgentsSelector);
  const ticketContext = useSelector(getContactTicketContextSelector);
  const isTicketContextLoading = useSelector(getContactTicketContextLoadingSelector);
  const messages = useSelector(getContactTicketMessagesSelector);
  const isMessagesLoading = useSelector(getContactTicketMessagesLoadingSelector);
  const loading = useSelector(getContactLoadingSelector);

  const {
    canEdit: canUpdate, canDelete, canDestroy,
  } = useProtect(collection);

  const [scope, setScope] = useState<string>(CONTACT_INBOX_ALL_SCOPE);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<IContactInboxFilters>({});
  // zero-based; every change of scope, search or filter goes back to the first page
  const [page, setPage] = useState(0);

  const buildQuery = useCallback((
    nextScope: string,
    nextSearch: string,
    nextFilters: IContactInboxFilters
  ): ContactInboxQuery => ({
    ...nextFilters,
    text: nextSearch || undefined,
    deleted: nextScope === CONTACT_INBOX_DELETED_SCOPE,
    status: [CONTACT_INBOX_ALL_SCOPE, CONTACT_INBOX_DELETED_SCOPE].includes(nextScope)
      ? undefined
      : (nextScope as TicketStatus),
  }), []);

  /*
   * the four statuses, plus the whole queue in front of them and — only for an account that may
   * destroy a ticket — the bin behind them. The bin carries no figure: it is not a share of the
   * queue the other scopes count, it is what has been taken out of it.
   */
  const scopes = useMemo((): ContactInboxScope[] => ([
    {
      value: CONTACT_INBOX_ALL_SCOPE,
      label: t('common:all'),
      count: summary?.total,
    },
    ...TICKET_STATUS_OPTIONS.map((option: ISelectOption<TicketStatusEnum>) => ({
      value: option.value,
      label: option.label,
      count: summary?.byStatus[option.value],
    })),
    ...(canDestroy ? [{ value: CONTACT_INBOX_DELETED_SCOPE, label: t('common:recycleBin') }] : []),
  ]), [summary, canDestroy, t]);

  /*
   * the queue is searched by typing rather than by submitting, so the query is delayed while the
   * letters are still coming; switching scope is a single decision and re-queries at once
   */
  const debouncedLoad = useMemo(() => debounce(
    (query: ContactInboxQuery) => dispatch(loadContactInbox(query)),
    CONTACT_INBOX_SEARCH_DEBOUNCE
  ), [dispatch]);

  useEffect(() => () => debouncedLoad.cancel(), [debouncedLoad]);

  const handleScopeChange = (nextScope: string) => {
    debouncedLoad.cancel();
    setScope(nextScope);
    setPage(0);
    dispatch(loadContactInbox(buildQuery(nextScope, search, filters)));
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
    debouncedLoad(buildQuery(scope, value, filters));
  };

  // a filter is picked, not typed: the queue follows each pick at once
  const handleFiltersChange = (nextFilters: IContactInboxFilters) => {
    debouncedLoad.cancel();
    setFilters(nextFilters);
    setPage(0);
    dispatch(loadContactInbox(buildQuery(scope, search, nextFilters)));
  };

  const handleResetFilters = () => handleFiltersChange({});

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    dispatch(loadContactInbox({
      ...buildQuery(scope, search, filters),
      skip: nextPage * CONTACT_INBOX_PAGE_SIZE,
    }));
  };

  /*
   * opening a ticket is a navigation, not a selection: every ticket keeps its own address, which is
   * what the notification centre, the global search and a link pasted into a chat all point at
   */
  const handleSelect = (id: string) => {
    navigate(goToPreview('contacts', id) as any);
  };

  const handleResolve = () => {
    if (!contact) return;
    dispatch(updateTicketStatus(contact.id, TicketStatusEnum.RESOLVED));
  };

  const handleChangeStatus = (status: TicketStatus) => {
    if (!contact) return;
    dispatch(updateTicketStatus(contact.id, status));
  };

  const handleChangePriority = (priority: TicketPriority) => {
    if (!contact) return;
    dispatch(updateTicketPriority(contact.id, priority));
  };

  const handleSendMessage = (message: string, isInternal: boolean, files: File[]) => {
    if (!contact) return;
    dispatch(sendTicketMessage(contact.id, message, files, isInternal));
  };

  const handleAssign = (agentId: string | null) => {
    if (!contact) return;
    dispatch(assignTicket(contact.id, agentId));
  };

  /*
   * the file holds what the queue is currently narrowed to, unpaginated: an export is asked for
   * once and read elsewhere, so it must not stop at the page the agent happens to be scrolling
   */
  const handleExport = (format: ExportFormat) => {
    const { limit, skip, ...queries } = buildContactInboxQueries(buildQuery(scope, search, filters));

    dispatch(exportContacts(queries, format));
  };

  /*
   * the page the agent is on is kept: removing one ticket must not send them back to the start —
   * unless it was the last one of that page, which would leave them on a page with nothing on it
   */
  const reloadQueue = () => {
    const nextPage = contacts.length <= 1 && page > 0 ? page - 1 : page;

    setPage(nextPage);
    dispatch(loadContactInbox({
      ...buildQuery(scope, search, filters),
      skip: nextPage * CONTACT_INBOX_PAGE_SIZE,
    }));
  };

  const handleDelete = async () => {
    if (!contact) return;
    await dispatch(deleteContact(contact.id));
    navigate({ to: PATH_NAMES.contacts } as any);
    reloadQueue();
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

  const isTicketOpen = !!contact;
  const queue = useMemo(() => sortLiveSosFirst(contacts), [contacts]);

  return (
    <>
      <Head title={t('user:contacts.contacts')} />
      <PageHeader
        actions={<ExportButton onExport={handleExport} />}
        title={t('user:contacts.contacts')}
        description={summary
          ? t('user:contacts.ticketsWithCount', { count: summary.total, unread: summary.unread })
          : undefined}
      />
      <Box css={(theme: Theme) => classes.inbox(theme, isTicketOpen)}>
        <Box css={(theme: Theme) => classes.queue(theme, isTicketOpen)}>
          <ContactInboxQueue
            activeScope={scope}
            contacts={queue}
            count={count}
            filters={filters}
            loading={loading}
            onFiltersChange={handleFiltersChange}
            onPageChange={handlePageChange}
            onResetFilters={handleResetFilters}
            onScopeChange={handleScopeChange}
            onSearch={handleSearch}
            onSelect={handleSelect}
            page={page}
            scopes={scopes}
            selectedId={contact?.id}
          />
        </Box>
        <Box css={(theme: Theme) => classes.conversation(theme, isTicketOpen)}>
          {/*
            keyed on the ticket so a panel left open, or a reply half written, never carries over
            to the next ticket the agent opens
          */}
          <ContactConversation
            canDelete={canDelete}
            canDestroy={canDestroy}
            canUpdate={canUpdate}
            contact={contact}
            isRequesterLoading={isTicketContextLoading}
            key={contact?.id}
            loading={isMessagesLoading}
            messages={messages}
            onDelete={handleDelete}
            onDestroy={handleDestroy}
            onResolve={handleResolve}
            onSendMessage={handleSendMessage}
            requester={ticketContext?.requester ?? null}
            sosAlert={isTicketContextLoading ? null : ticketContext?.sosAlert ?? null}
          />
        </Box>
        {!!contact && (
          <Box css={(theme: Theme) => classes.context(theme, isTicketOpen)}>
            <ContactContextPanel
              agents={agents}
              canUpdate={canUpdate}
              contact={contact}
              context={ticketContext}
              loading={isTicketContextLoading}
              onAssign={handleAssign}
              onChangePriority={handleChangePriority}
              onChangeStatus={handleChangeStatus}
              onSelectTicket={handleSelect}
            />
          </Box>
        )}
      </Box>
    </>
  );
};

export default Contacts;
