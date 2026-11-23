import { ClientStatusEnum } from '@shared/domain-types';
import { TargetEnum } from '@shared/types';
import pick from 'lodash/pick';

import i18n from '@/config/i18n';
import { DEFAULT_PAGINATION, Errors, PAGINATION } from '@/constants/_core/app.constants';
import {
  CLIENT_COLLECTION, CLIENT_INPUT_FIELDS, CLIENT_PICKER_OPTIONS_LIMIT, CLIENT_TAB_OPTIONS,
} from '@/constants/_domain/client.constants';
import { actionWithLoader, onEnterActionWithLoader } from '@/redux/actions/_core/util.action';
import { setMessageSlice } from '@/redux/reducers/_core/app.reducer';
import { getSettingsLocaleSelector, getSettingsWorkspaceSelector } from '@/redux/reducers/_core/settings.reducer';
import {
  addClientToClientsSlice, clearClientsSlice, loadClientsSlice, setClientsCountSlice,
  updateClientInClientsSlice,
} from '@/redux/reducers/_domain/client.reducer';
import { AppDispatch, AppThunkAction, RootState } from '@/redux/store';
import {
  archiveClient, createClient, fetchClients, updateClient,
} from '@/services/_domain/client.service';
import { IQueriesInput } from '@/types/_core/app.type';
import { IClient, IClientInput } from '@/types/_domain/client.type';
import { convertSearchParamsToFilters } from '@/utils/_core/app.utils';

const collection = CLIENT_COLLECTION;

// the language of the server's refusals and the workspace the call is made from
const getRequestContext = (state: RootState) => ({
  locale: getSettingsLocaleSelector(state),
  workspace: getSettingsWorkspaceSelector(state),
});

// only the typed fields: the form state also holds what the row was loaded with (id, status, dates)
const toClientInput = (values: IClientInput): IClientInput => (
  pick(values, CLIENT_INPUT_FIELDS) as IClientInput
);

export const loadClients = (queries: IQueriesInput): any => {
  const {
    limit = PAGINATION.rowsPerPage,
    skip = 0,
    orderBy = 'updatedAt',
    order = 'desc',
    filters,
    search,
  } = queries;

  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const result = await fetchClients({
      limit, skip, orderBy, order, filters, search, ...getRequestContext(getState?.()!),
    });

    dispatch(loadClientsSlice(result.results));
    dispatch(setClientsCountSlice(result.count));
  });
};

/**
 * @param onCreated handed the client just created, so a form that created it on the way (the quote
 * form) can pick it at once
 */
export const createOrUpdateClient = (
  values: IClientInput, client?: IClient | null, onCreated?: (client: IClient) => void
): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const context = getRequestContext(getState?.()!);
    const input = toClientInput(values);

    if (client) {
      dispatch(updateClientInClientsSlice(await updateClient(client.id, input, context)));
      dispatch(setMessageSlice(i18n.t('project:client.messages.updated', { name: input.name })));
      return;
    }

    const created = await createClient(input, context);

    dispatch(addClientToClientsSlice(created));
    dispatch(setMessageSlice(i18n.t('project:client.messages.created', { name: input.name })));
    onCreated?.(created);
  },
  // rights
  {
    collection,
    action: client ? 'update' : 'create',
    hasNoRightErrorMessage: client
      ? i18n.t('common:errors.hasNoRightToUpdate', { value: i18n.t('project:client.thisClient') })
      : i18n.t('common:errors.hasNoRightToCreate', { value: i18n.t('project:client.thisClient') }),
  });
};

/**
 * archives a client, or puts it back in the list; the row stays where it is with its new status until
 * the list is reloaded, so the reader sees what they just did
 */
export const setClientArchived = (client: IClient, archived: boolean): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const updatedClient = await archiveClient(client.id, archived, getRequestContext(getState?.()!));

    dispatch(updateClientInClientsSlice(updatedClient));
    dispatch(setMessageSlice(archived
      ? i18n.t('project:client.messages.archived', { name: client.name })
      : i18n.t('project:client.messages.restored', { name: client.name })));
  },
  // rights
  {
    collection,
    action: 'update',
    hasNoRightErrorMessage: i18n.t('common:errors.hasNoRightToUpdate', {
      value: i18n.t('project:client.thisClient'),
    }),
  });
};

/**
 * the active clients whose name or e-mail holds what is typed, for a client picker: an archived or
 * anonymized client gets no new quote
 * @param onLoaded handed the clients found
 */
export const searchActiveClients = (text: string, onLoaded: (clients: IClient[]) => void): any => {
  return actionWithLoader(async (_dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const result = await fetchClients({
      limit: CLIENT_PICKER_OPTIONS_LIMIT,
      skip: 0,
      orderBy: 'name',
      order: 'asc',
      filters: { status: ClientStatusEnum.ACTIVE },
      search: text ? { text } : undefined,
      ...getRequestContext(getState?.()!),
    });

    onLoaded(result.results);
  },
  // rights
  {
    collection,
    action: 'find',
  });
};

/*
 * ---------------------------------------- //
 * ------------- on page load ------------- //
 * ---------------------------------------- //
 */
/**
 * loads the first page of clients before the list is shown. The clients exist in the Aldaron workspace
 * only: an address typed by hand from the portfolio one goes back to the dashboard, as the server
 * would refuse the call anyway.
 */
export const onClientsEnter = (route: any): AppThunkAction => {
  return onEnterActionWithLoader((dispatch: AppDispatch, getState?: () => RootState): void => {
    if (getSettingsWorkspaceSelector(getState?.()!) !== TargetEnum.AGENCY) {
      throw new Error(Errors.redirect);
    }

    const filters = convertSearchParamsToFilters({
      tabs: CLIENT_TAB_OPTIONS,
      searchParams: route.search,
      filters: {},
    });

    dispatch(clearClientsSlice());
    dispatch(loadClients({
      skip: DEFAULT_PAGINATION.currentPage,
      limit: DEFAULT_PAGINATION.rowsPerPage,
      orderBy: DEFAULT_PAGINATION.orderBy,
      order: DEFAULT_PAGINATION.order,
      filters,
    }));
  },
  // rights
  {
    collection,
    action: 'find',
  });
};
