import i18n from '@/config/i18n';
import { Errors } from '@/constants/_core/app.constants';
import { CONTACT_PAGE_SIZE, CONTACT_SORT } from '@/constants/_core/contact.constants';
import { markAsSeen } from '@/redux/actions/_core/app.action';
import {
  onEnterActionWithLoader, actionWithLoader, clearListUnlessLoadedWith, rememberListQuery,
} from '@/redux/actions/_core/util.action';
import { createCrudThunks } from '@/redux/factories/_core/crudThunks.factory';
import {
  clearContactSlice,
  deleteContactFromContactsSlice,
  deleteContactsSlice,
  clearContactCountSlice,
  loadContactSlice,
  loadContactsSlice,
  setContactLoadingSlice,
  setContactsCountSlice,
  clearContactsSlice,
  updateContactInListSlice,
} from '@/redux/reducers/_core/contact.reducer';
import { AppDispatch, AppThunkAction } from '@/redux/store';
import { fetchContact } from '@/services/_core/contact.service';
import { fetchEntityList } from '@/services/_core/crud.service';
import { IExportColumn } from '@/types/_core/app.type';
import { IContact } from '@/types/_core/contact.type';
import { displayDate } from '@/utils/_core/date.utils';
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
    header: i18n.t('user:contacts.sentDate'),
    getValue: (contact) => displayDate(contact.createdAt, true, true),
  },
];

export const getContact = fetchContact;

// generic list/enter/leave/delete/bulk-toggle/export thunks
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
export const exportContacts: any = contactCrud.exportList;
export const deleteContact: any = contactCrud.deleteOne;

/** What narrows the list: the text typed in its search box and the scope (the bin or not). */
export type ContactQuery = {
  text?: string;
  // the recycle bin is a scope of the list, not a separate list
  deleted?: boolean;
  skip?: number;
};

export const buildContactQueries = ({ text, deleted = false, skip = 0 }: ContactQuery) => ({
  limit: CONTACT_PAGE_SIZE,
  skip,
  orderBy: CONTACT_SORT.orderBy,
  order: CONTACT_SORT.order,
  filters: { deleted },
  search: text ? { text } : {},
});

const fillContactList = async (dispatch: AppDispatch, query: ContactQuery): Promise<void> => {
  const result = await fetchEntityList<IContact>('getContacts', buildContactQueries(query));

  dispatch(loadContactsSlice(result.results));
  dispatch(setContactsCountSlice(result.count));
  rememberListQuery(loadContactsSlice, query);
};

export const loadContactList = (query: ContactQuery = {}): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await fillContactList(dispatch, query);
  });
};

/**
 * The first page of the list when the page is opened, under the list's own loading flag: it shows
 * placeholder rows while it fills rather than the empty state.
 */
const loadFirstContactPage = (): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await fillContactList(dispatch, {});
  }, { localLoadingAction: setContactLoadingSlice });
};

/*
 * ---------------------------------------- //
 * ------------- on page load ------------- //
 * ---------------------------------------- //
 */
export const onContactsEnter = (): AppThunkAction => {
  return onEnterActionWithLoader((dispatch: AppDispatch): void => {
    dispatch(clearContactSlice());
    dispatch(clearListUnlessLoadedWith(
      loadContactsSlice, {}, [clearContactsSlice(), clearContactCountSlice()]
    ));
    dispatch(loadFirstContactPage());
  },
  // rights
  {
    collection,
    action: 'find',
  });
};

/**
 * Loads one message, then silently marks it as seen in the background (it also steps the sidebar
 * badge down). The list around it is fetched only when there is none yet: a link followed from
 * outside the page lands on a message with nothing beside it.
 */
export const onContactEnter = (route?: any): AppThunkAction => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch, getState?: () => any): Promise<void> => {
    if (!route?.params?.id) return;
    const contact = await getContact(route.params.id);

    if (!contact) {
      throw new Error(Errors.notFound);
    }

    dispatch(loadContactSlice(contact));

    if (!getState?.().contact.contacts.length) {
      dispatch(loadFirstContactPage());
    }

    if (contact.seen) return;

    dispatch(markAsSeen(collection, contact.id, false));
    dispatch(updateContactInListSlice({ ...contact, seen: true }));
  },
  // rights
  {
    collection,
    action: 'get',
  });
};

/*
 * ---------------------------------------- //
 * ------------- on page leave ------------ //
 * ---------------------------------------- //
 */
// run when the page as a whole is left, not when moving between the list and a message
export const onContactsLeave: any = contactCrud.onListLeave;

export const onContactLeave = (): any => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearContactSlice());
  };
};

/*
 * --------------------------------------- //
 * ------------- redirection ------------- //
 * --------------------------------------- //
 */
export const goToContact: any = (id: string) => ({ to: PATH_NAMES.contacts + '/$id', params: { id } });
