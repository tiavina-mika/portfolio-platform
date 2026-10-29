import Parse from 'parse';


import i18n, { locales } from '@/config/i18n';
import { recycleBinTabOptions } from '@/constants/app.constants';
import { actionWithLoader, onEnterActionWithLoader } from '@/redux/actions/util.action';
import { AppDispatch } from '@/redux/store';
import { IQueriesInput } from '@/types/app.type';
import { IContact } from '@/types/contact.type';
import { convertSearchParamsToFilters } from '@/utils/app.utils';
import { DEFAULT_PAGINATION, PAGINATION } from '@/utils/constants';

import { setMessageSlice } from '../reducers/app.reducer';
import {
  deleteContactsSlice,
  clearContactCountSlice,
  loadContactsSlice,
  setContactsCountSlice,
  clearContactsSlice,
  updateContactInListSlice,
} from '../reducers/contact.reducer';

const collection = 'Contact';

export const Contact = Parse.Object.extend(collection);


export const getContact = async (id: string, include: string[] = []): Promise<IContact | undefined> => {
  const contact = await Parse.Cloud.run('getContact', { id, include });

  return contact;
};


/*
 * ----------------------------------------------------- //
 * ------------------- Redux Actions ------------------- //
 * ----------------------------------------------------- //
 */
export const loadContacts = ({
  limit = PAGINATION.rowsPerPage,
  skip = 0,
  orderBy = 'updatedAt',
  order = 'desc',
  filters,
  search,
}: IQueriesInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    /*
     * result with count
     * we make it server side because we need to get user infos
     */
    const result: Record<string, any> = await Parse.Cloud.run('getContacts', {
      limit,
      skip,
      orderBy,
      order,
      filters,
      search,
      locales,
    });

    dispatch(loadContactsSlice(result.results));
    dispatch(setContactsCountSlice(result.count));
  });
};


/**
 * for user security reason, we do not delete the data from db
 * instead we just add a field "deleted" = true
 * @param id
 * @param redirectToRecycleBin redirect to recycle bin after the request is deleted
 * @returns
 */
export const deleteContact = (id: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
  // --------- request --------- //
    const contact = await getContact(id);

    if (!contact) return;

    /*
     * --------- update database --------- //
     * only the user or the MasterKey can update or deleted its own account
     * the master key can only accessible in server side
     * so we use the parse cloud function to do that, instead of a REST API
     * you can sse the cloud function in server in the /cloud/hooks/users.js file
     */
    contact.set('deleted', true);
    const deletedContact = await contact.save();

    // --------- update store --------- //
    dispatch(deleteContactsSlice([deletedContact.id]));
    dispatch(setMessageSlice(i18n.t('cms:messages.contactDeletedSuccessfully', { value: deletedContact.id })));
  },
  // rights
  {
    collection,
    action: 'delete',
    hasNoRightErrorMessage: i18n.t('user:contacts.hasNoRightToDeleteContact'),
  });
};

/**
 * mark seen field as true
 * so that its not more treated as notification
 * ex: (['xxx', 'yyy'], seen, false)
 * @param ids
 * @returns
 */
export const toggleContactsByIds = (ids: string[], field: string, value = true): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await new Parse.Query(Contact).containedIn('objectId', ids).each(async (contact) => {
      contact.set(field, value);

      await contact.save();
    });
    // delete
    dispatch(deleteContactsSlice(ids));
  },
  // rights
  {
    collection,
    action: field === 'deleted'
      ? 'delete'
      : 'update',
  });
};

export const setContactAsReplied = (contact: IContact): any => {
  return async (dispatch: AppDispatch): Promise<void> => {
    contact.set('replied', true);
    const updatedContact = await contact.save();

    // delete
    dispatch(updateContactInListSlice(updatedContact));
  };
};

/*
 * ---------------------------------------- //
 * ------------- on page load ------------- //
 * ---------------------------------------- //
 */
/**
 * load categories data from database before the page is loaded (in route)
 * then load it to the store
 * @param route
 * @returns
 */
export const onContactsEnter = (route?: any): any => {
  return onEnterActionWithLoader((dispatch: AppDispatch): any => {
    const values: Record<string, any> = {
      skip: DEFAULT_PAGINATION.currentPage,
      limit: DEFAULT_PAGINATION.rowsPerPage,
      orderBy: DEFAULT_PAGINATION.orderBy,
      order: DEFAULT_PAGINATION.order,
    };

    const filters: Record<string, boolean | string> = { deleted: false };

    // convert the url search params tab to (db) filters
    const newFilters = convertSearchParamsToFilters({
      tabs: recycleBinTabOptions,
      searchParams: route.search,
      filters,
      acceptedFields: ['deleted'],
    });

    values.filters = newFilters;

    dispatch(loadContacts(values));
  },
  // rights
  {
    collection,
    action: 'find',
  });
};

/*
 * ---------------------------------------- //
 * ------------- on page leave ------------ //
 * ---------------------------------------- //
 */
export const onContactsLeave = (): any => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearContactsSlice());
    dispatch(clearContactCountSlice());
  };
};
