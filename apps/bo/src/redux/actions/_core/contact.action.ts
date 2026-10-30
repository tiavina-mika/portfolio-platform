import dayjs from 'dayjs';

import i18n from '@/config/i18n';
import { COLLECTIONS, PAGINATION, Errors } from '@/constants/_core/app.constants';
import {
  CONTACT_INBOX_PAGE_SIZE, CONTACT_INBOX_SORT, SOS_NOTIFICATION_KEY,
} from '@/constants/_core/ticket.constants';
import { refreshNotification } from '@/redux/actions/_core/app.action';
import {
  onEnterActionWithLoader, actionWithLoader, clearListUnlessLoadedWith, rememberListQuery,
} from '@/redux/actions/_core/util.action';
import { createCrudThunks } from '@/redux/factories/_core/crudThunks.factory';
import {
  clearContactSlice,
  clearTicketContextSlice,
  deleteContactFromContactsSlice,
  deleteContactsSlice,
  clearContactCountSlice,
  loadContactSlice,
  loadContactsSlice,
  loadContactSummarySlice,
  loadTicketAgentsSlice,
  loadTicketContextSlice,
  setContactLoadingSlice,
  setContactsCountSlice,
  setTicketContextLoadingSlice,
  clearContactsSlice,
  updateContactInListSlice,
  loadTicketMessagesSlice,
  appendTicketMessageSlice,
  setTicketMessagesCountSlice,
  setTicketMessagesLoadingSlice,
  clearTicketMessagesSlice,
  getContactContactsSelector,
} from '@/redux/reducers/_core/contact.reducer';
import { AppDispatch, AppThunkAction, RootState } from '@/redux/store';
import { fetchCurrentUserSessionToken } from '@/services/_core/auth.service';
import {
  assignTicketService, fetchContact, fetchContactSummary, fetchOpenSosTicketsCount, fetchTicketAgents,
  fetchTicketContext,
  markContactAsReplied, fetchTicketMessages, sendTicketMessageService,
  updateTicketStatusService, updateTicketPriorityService, markTicketAsSeenByAdmin,
} from '@/services/_core/contact.service';
import { fetchEntityList } from '@/services/_core/crud.service';
import { IExportColumn } from '@/types/_core/app.type';
import { IContact, IContactInboxFilters } from '@/types/_core/contact.type';
import { TicketPriority, TicketSourceEnum, TicketStatus } from '@/types/_core/ticket-message.type';
import { displayDate } from '@/utils/_core/date.utils';
import { uploadFilesAPI } from '@/utils/_core/file.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { getUserFullName } from '@/utils/_core/user.utils';


const collection = 'Contact';

const contactExportColumns: IExportColumn<IContact>[] = [
  {
    header: i18n.t('cms:name'),
    getValue: (contact) => (contact.user
      ? getUserFullName(contact.user)
      : contact.name ?? ''),
  },
  {
    header: i18n.t('user:email'),
    getValue: (contact) => contact.email ?? '',
  },
  {
    header: i18n.t('user:phoneNumber'),
    getValue: (contact) => contact.phone ?? '',
  },
  {
    header: i18n.t('user:contacts.message'),
    getValue: (contact) => contact.message,
  },
  {
    header: i18n.t('user:contacts.replied'),
    getValue: (contact) => (contact.replied
      ? i18n.t('common:yes')
      : i18n.t('common:no')),
  },
  {
    header: i18n.t('user:contacts.sentDate'),
    getValue: (contact) => displayDate(contact.createdAt, true, true),
  },
];

export const getContact = fetchContact;

/*
 * generic list/enter/leave/delete/bulk-toggle/export thunks.
 * `onContactsEnter`'s filters/tabs are the plain recycle-bin defaults, so contact is a clean fit —
 * only `setContactAsReplied` (in-place list update, not a generic CRUD operation) stays hand-written.
 */
const contactCrud = createCrudThunks<IContact>({
  collection,
  listCloudFunction: 'getContacts',
  getOne: (id: string) => getContact(id),
  slice: {
    loadListSlice: loadContactsSlice,
    setCountSlice: setContactsCountSlice,
    clearOneSlice: clearContactSlice,
    clearListSlice: clearContactsSlice,
    clearCountSlice: clearContactCountSlice,
    removeFromListSlice: deleteContactFromContactsSlice,
    removeManyFromListSlice: deleteContactsSlice,
  },
  deletedMessage: (id: string) => i18n.t('cms:messages.contactDeletedSuccessfully', { value: id }),
  hasNoRightToDeleteMessage: i18n.t('user:contacts.hasNoRightToDeleteContact'),
  getExportColumns: () => contactExportColumns,
  exportFileNamePrefix: 'contacts',
});

/*
 * ----------------------------------------------------- //
 * ------------------- Redux Actions ------------------- //
 * ----------------------------------------------------- //
 */
export const loadContacts: any = contactCrud.loadList;
export const exportContacts: any = contactCrud.exportList;
export const deleteContact: any = contactCrud.deleteOne;
export const toggleContactsByIds: any = contactCrud.toggleByIds;

/**
 * What narrows the inbox queue: the text typed in its search box, the scope its strip is on and
 * the filters behind the button beside the search. All of them are one query — a scope with a
 * search and a filter in it is still one page of one list.
 */
export type ContactInboxQuery = IContactInboxFilters & {
  text?: string;
  status?: TicketStatus;
  // the recycle bin is a scope of the queue, not a separate list — see `CONTACT_INBOX_DELETED_SCOPE`
  deleted?: boolean;
  skip?: number;
};

export const buildContactInboxQueries = ({
  text, status, deleted = false, skip = 0, priority, source, subject, country,
  addedWithinDays,
}: ContactInboxQuery) => ({
  limit: CONTACT_INBOX_PAGE_SIZE,
  skip,
  orderBy: CONTACT_INBOX_SORT.orderBy,
  order: CONTACT_INBOX_SORT.order,
  filters: { deleted },
  search: {
    ...(text ? { text } : {}),
    ...(status ? { status: [status] } : {}),
    ...(priority ? { priority: [priority] } : {}),
    ...(source ? { source } : {}),
    ...(subject ? { subject: [subject] } : {}),
    ...(country ? { countries: [country] } : {}),
    /*
     * sent as a calendar day rather than an instant: the server opens the range at the start of
     * that day, and an ISO timestamp would move the day under a timezone offset
     */
    ...(addedWithinDays
      ? { createdAt: [dayjs().subtract(addedWithinDays - 1, 'day').format('YYYY-MM-DD'), null] }
      : {}),
  },
});

/** One page of the queue the inbox draws, newest activity first. */
const fillContactInbox = async (dispatch: AppDispatch, query: ContactInboxQuery): Promise<void> => {
  const result = await fetchEntityList<IContact>('getContacts', buildContactInboxQueries(query));

  dispatch(loadContactsSlice(result.results));
  dispatch(setContactsCountSlice(result.count));
  rememberListQuery(loadContactsSlice, query);
};

export const loadContactInbox = (query: ContactInboxQuery = {}): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await fillContactInbox(dispatch, query);
  });
};

/**
 * The queue's first page when the inbox is opened. Read in the background of the page's first draw,
 * under the queue's own loading flag: the queue shows its placeholder rows while it fills rather than
 * the "no ticket" state an empty list would otherwise read as.
 */
const loadFirstContactInboxPage = (): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await fillContactInbox(dispatch, {});
  }, { localLoadingAction: setContactLoadingSlice });
};

/** The figures above the inbox scopes — they describe the whole queue, not the current search. */
export const loadContactSummary = (): any => {
  return async (dispatch: AppDispatch): Promise<void> => {
    try {
      const summary = await fetchContactSummary();

      dispatch(loadContactSummarySlice(summary));
    }
    // dispatched in the background: the figures are secondary, the queue stands on its own without them
    catch { /* the header simply goes without its figures */ }
  };
};

/** The requester's record and their previous tickets, drawn beside the open thread. */
export const loadTicketContext = (ticketId: string): any => {
  return async (dispatch: AppDispatch): Promise<void> => {
    dispatch(setTicketContextLoadingSlice(true));

    try {
      const context = await fetchTicketContext(ticketId);

      dispatch(loadTicketContextSlice(context));
    }
    finally {
      dispatch(setTicketContextLoadingSlice(false));
    }
  };
};

/** The back-office users a ticket can be handed to — read once per visit to the inbox. */
export const loadTicketAgents = (): any => {
  return async (dispatch: AppDispatch): Promise<void> => {
    try {
      const agents = await fetchTicketAgents();

      dispatch(loadTicketAgentsSlice(agents));
    }
    // dispatched in the background: without the list, only the hand-over field has no one to offer
    catch { /* the assignment field stays empty */ }
  };
};

export const assignTicket = (ticketId: string, agentId: string | null): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const updatedContact = await assignTicketService(ticketId, agentId);

    dispatch(loadContactSlice(updatedContact));
    dispatch(updateContactInListSlice(updatedContact));
  });
};

export const setContactAsReplied = (contact: IContact): any => {
  return async (dispatch: AppDispatch): Promise<void> => {
    const updatedContact = await markContactAsReplied(contact);

    dispatch(updateContactInListSlice(updatedContact));
  };
};

/*
 * ---------------------------------------- //
 * ------------- on page load ------------- //
 * ---------------------------------------- //
 */

/**
 * Everything the inbox opens on: the queue itself, the figures above its scopes and the agents a
 * ticket can be handed to. None of it is awaited — the queue draws its own placeholder rows while
 * it fills, so the page appears at once. Each thunk reports or swallows its own errors.
 */
export const onContactsEnter = (): AppThunkAction => {
  return onEnterActionWithLoader((dispatch: AppDispatch): void => {
    dispatch(clearContactSlice());
    // the queue of the default scope, the one this first read fetches
    dispatch(clearListUnlessLoadedWith(
      loadContactsSlice, {}, [clearContactsSlice(), clearContactCountSlice()]
    ));
    dispatch(loadFirstContactInboxPage());
    dispatch(loadContactSummary());
    dispatch(loadTicketAgents());
  },
  // rights
  {
    collection,
    action: 'find',
  });
};

export const loadTicketMessages = (
  ticketId: string,
  skip = 0
): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    dispatch(setTicketMessagesLoadingSlice(true));

    try {
      const result = await fetchTicketMessages(ticketId, PAGINATION.rowsPerPage, skip);

      dispatch(loadTicketMessagesSlice(result.results));
      dispatch(setTicketMessagesCountSlice(result.count));
    }
    finally {
      dispatch(setTicketMessagesLoadingSlice(false));
    }
  });
};

/**
 * loads one ticket, its first page of messages and the panel drawn beside it, then silently records
 * the visit in the background (mirrors `onRideEnter`'s mark-as-seen-on-enter pattern) — not
 * awaited, so it never delays the page render.
 *
 * The queue around the ticket is fetched here only when there is none yet: a link followed from
 * outside the inbox lands on a ticket with nothing beside it, whereas moving from one ticket to
 * the next inside the inbox must not pull the list the agent is scrolling out from under them.
 */
export const onContactEnter = (route?: any): AppThunkAction => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    if (!route?.params?.id) return;
    const contact = await getContact(route.params.id);

    if (!contact) {
      throw new Error(Errors.notFound);
    }

    dispatch(loadContactSlice(contact));
    dispatch(loadTicketMessages(contact.id));
    dispatch(loadTicketContext(contact.id));

    if (!getContactContactsSelector(getState?.() ?? {}).length) {
      dispatch(loadFirstContactInboxPage());
      dispatch(loadContactSummary());
      dispatch(loadTicketAgents());
    }

    /*
     * every visit is recorded, not only the ones that had something new to read: the trigger keeps
     * `seenAt` on the agent who picked the ticket up first and stamps this one under
     * `lastSeenAt`/`seenCount`. `unreadByAdmin` is only cleared when it was actually raised — it is
     * what the inbox badge counts, and re-saving it unchanged would cost a write for nothing.
     */
    markTicketAsSeenByAdmin(contact.id, !!contact.unreadByAdmin).catch(() => undefined);
  },
  // rights
  {
    collection,
    action: 'get',
  });
};

export const sendTicketMessage = (
  ticketId: string,
  message: string,
  files?: File[],
  isInternal = false
): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    let attachments;

    if (files?.length) {
      const sessionToken = await fetchCurrentUserSessionToken();

      attachments = await uploadFilesAPI({ files, folder: 'tickets', sessionToken: sessionToken ?? null });
    }

    const ticketMessage = await sendTicketMessageService(ticketId, message, attachments, isInternal);

    dispatch(appendTicketMessageSlice(ticketMessage));
  });
};

/**
 * recounts the SOS alerts support has not closed yet, in the background — the dedicated SOS badge
 * of the notification centre. Polled: `Contact` is read through a role, which a LiveQuery
 * subscription cannot follow.
 */
export const refreshOpenSosTicketsCount = (): any => refreshNotification(COLLECTIONS.contact, {
  key: SOS_NOTIFICATION_KEY,
  fetchCount: fetchOpenSosTicketsCount,
});

export const updateTicketStatus = (ticketId: string, status: TicketStatus): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const updatedContact = await updateTicketStatusService(ticketId, status);

    dispatch(loadContactSlice(updatedContact));
    dispatch(updateContactInListSlice(updatedContact));

    // closing an SOS takes it off the SOS badge now rather than at the next poll
    if (updatedContact.source === TicketSourceEnum.SOS) {
      dispatch(refreshOpenSosTicketsCount());
    }
  });
};

export const updateTicketPriority = (ticketId: string, priority: TicketPriority): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const updatedContact = await updateTicketPriorityService(ticketId, priority);

    dispatch(loadContactSlice(updatedContact));
    dispatch(updateContactInListSlice(updatedContact));
  });
};

/*
 * ---------------------------------------- //
 * ------------- on page leave ------------ //
 * ---------------------------------------- //
 */
/*
 * run when the inbox as a whole is left, not when moving between the queue and a ticket: the
 * ticket route re-reads the queue only when it finds none, which is how it tells an arrival from
 * outside the inbox — a queue kept past the inbox would never be read again from there
 */
export const onContactsLeave: any = contactCrud.onListLeave;

export const onContactLeave = (): any => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearContactSlice());
    dispatch(clearTicketMessagesSlice());
    dispatch(clearTicketContextSlice());
  };
};

/*
 * --------------------------------------- //
 * ------------- redirection ------------- //
 * --------------------------------------- //
 */
export const goToContact: any = (id: string) => ({ to: PATH_NAMES.contacts + '/$id', params: { id } });
