import type { ActionCreatorWithPayload, ActionCreatorWithoutPayload } from '@reduxjs/toolkit';

import i18n from '@/config/i18n';
import {
  recycleBinTabOptions, DEFAULT_PAGINATION, EXPORT_MAX_ROWS, PAGINATION,
} from '@/constants/_core/app.constants';
import {
  actionWithLoader, clearListUnlessLoadedWith, onEnterActionWithLoader, rememberListQuery,
} from '@/redux/actions/_core/util.action';
import { setInfoMessageSlice, setMessageSlice } from '@/redux/reducers/_core/app.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { AppDispatch, AppThunkAction, RootState } from '@/redux/store';
import {
  fetchEntityList, fetchEntityListForExport, softDeleteEntity, toggleEntitiesFieldByIds,
} from '@/services/_core/crud.service';
import {
  ExportFormat, IExportColumn, IListTabCounts, IQueriesInput,
} from '@/types/_core/app.type';
import { Locale } from '@/types/_core/setting.type';
import { convertSearchParamsToFilters } from '@/utils/_core/app.utils';
import { exportRows } from '@/utils/_core/export.utils';

interface IEntityWithId {
  id: string;
}

interface ICrudSliceActions<TEntity extends IEntityWithId> {
  loadListSlice: ActionCreatorWithPayload<TEntity[]>;
  setCountSlice: ActionCreatorWithPayload<number>;
  clearOneSlice: ActionCreatorWithoutPayload;
  clearListSlice: ActionCreatorWithoutPayload;
  clearCountSlice: ActionCreatorWithoutPayload;
  // omit when the entity has no single soft-delete (ex: vehicle, page section — bulk-toggle only)
  removeFromListSlice?: ActionCreatorWithPayload<string>;
  // omit when the entity has no bulk-toggle (ex: payment, notification)
  removeManyFromListSlice?: ActionCreatorWithPayload<string[]>;
  /*
   * omit when the list endpoint does not report per-tab totals — the strip then carries labels
   * only, rather than showing a placeholder that never resolves
   */
  setTabCountsSlice?: ActionCreatorWithPayload<IListTabCounts>;
  // omit when the entity has no bulk action that changes a row instead of removing it from the list
  updateFieldInListSlice?: ActionCreatorWithPayload<{ ids: string[]; field: string; value: unknown }>;
}

export interface ICrudThunksConfig<TEntity extends IEntityWithId> {
  // class name used for the rights check, ex: 'Category'
  collection: string;
  /*
   * actual Parse class name touched by `deleteOne`/`toggleByIds`'s queries below — defaults to
   * `collection`. Override when rights are checked against a different collection than the one
   * being written to (ex: PageSection, gated by Page's rights but its own Parse class)
   */
  queryCollection?: string;
  // name of the paginated Cloud Function used by the list page, ex: 'getCategories'
  listCloudFunction: string;
  // fetches one entity by id, ex: category.action.ts' getCategory — omit if `deleteOne` is unused
  getOne?: (id: string) => Promise<TEntity | undefined>;
  slice: ICrudSliceActions<TEntity>;
  // db field used by the recycle-bin tab, defaults to 'deleted'
  recycleBinField?: string;
  // omit if `deleteOne` is unused (entity has no single soft-delete)
  deletedMessage?: (deletedId: string) => string;
  hasNoRightToDeleteMessage?: string;
  /*
   * header + value getter pairs for the CSV/Excel export button — omit to keep export disabled
   * for this entity. Receives the current display locale (translated fields, ex: category name)
   */
  getExportColumns?: (locale: Locale) => IExportColumn<TEntity>[];
  // ex: 'categories' -> 'categories-2026-07-23.csv'
  exportFileNamePrefix?: string;
}

/**
 * generic list/enter/leave/delete/bulk-toggle thunks shared by every domain entity in the BO —
 * every hand-written *.action.ts repeats this exact skeleton (only the collection name, cloud
 * function name and messages change), so it lives here once. Entity-specific mutations
 * (create/edit — translated fields, file uploads, pointer conversions, ...) stay hand-written and
 * are NOT covered here.
 */
export const createCrudThunks = <TEntity extends IEntityWithId>(config: ICrudThunksConfig<TEntity>) => {
  const {
    collection, queryCollection = collection, listCloudFunction, getOne, slice, recycleBinField = 'deleted',
    deletedMessage, hasNoRightToDeleteMessage, getExportColumns, exportFileNamePrefix,
  } = config;

  const loadList = (queries: IQueriesInput): AppThunkAction => {
    const {
      limit = PAGINATION.rowsPerPage,
      skip = 0,
      orderBy = 'updatedAt',
      order = 'desc',
      filters,
      search,
    } = queries;

    return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
      const result = await fetchEntityList<TEntity>(listCloudFunction, {
        limit, skip, orderBy, order, filters, search,
      });

      dispatch(slice.loadListSlice(result.results));
      dispatch(slice.setCountSlice(result.count));
      rememberListQuery(slice.loadListSlice, queries);

      /*
       * the strip above the list states every tab at once, including the one not being fetched
       * here — left undispatched when the endpoint reports no totals, so the strip keeps its labels
       */
      if (slice.setTabCountsSlice && result.tabCounts) {
        dispatch(slice.setTabCountsSlice(result.tabCounts));
      }
    });
  };

  /**
   * load the list data before the list route is entered — pagination/filters follow the same
   * shape (currentPage/rowsPerPage/orderBy/order) on every list page in the BO
   */
  const onListEnter = (route?: any): AppThunkAction => {
    return onEnterActionWithLoader((dispatch: AppDispatch): any => {
      const values: Record<string, any> = {
        skip: DEFAULT_PAGINATION.currentPage,
        limit: DEFAULT_PAGINATION.rowsPerPage,
        orderBy: DEFAULT_PAGINATION.orderBy,
        order: DEFAULT_PAGINATION.order,
      };

      const filters: Record<string, boolean | string> = { [recycleBinField]: false };

      values.filters = convertSearchParamsToFilters({
        tabs: recycleBinTabOptions,
        searchParams: route.search,
        filters,
        acceptedFields: [recycleBinField],
      });

      dispatch(slice.clearOneSlice());
      dispatch(clearListUnlessLoadedWith(
        slice.loadListSlice, values, [slice.clearListSlice(), slice.clearCountSlice()]
      ) as any);
      dispatch(loadList(values) as any);
    },
    { collection, action: 'find' });
  };

  /*
   * list pages keep their rows once left (see `clearListUnlessLoadedWith`) — this is for the one
   * that must not: the contacts inbox, whose ticket route tells an arrival from outside the inbox
   * by its queue being empty
   */
  const onListLeave = (): AppThunkAction => {
    return (dispatch: AppDispatch): void => {
      dispatch(slice.clearListSlice());
      dispatch(slice.clearCountSlice());
    };
  };

  const onOneLeave = (): AppThunkAction => {
    return (dispatch: AppDispatch): void => {
      dispatch(slice.clearOneSlice());
    };
  };

  /**
   * soft delete — for user security/audit reasons, we never delete the data from db,
   * instead we just set a "deleted" = true flag. No-op if the entity was configured without
   * `getOne`/`deletedMessage`/`slice.removeFromListSlice` (ex: entities with bulk-toggle only)
   */
  const deleteOne = (id: string): AppThunkAction => {
    return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
      if (!getOne || !deletedMessage || !slice.removeFromListSlice) return;

      const entity = await getOne(id);

      if (!entity) return;

      const deletedId = await softDeleteEntity(queryCollection, entity);

      dispatch(slice.removeFromListSlice(deletedId));
      dispatch(setMessageSlice(deletedMessage(deletedId)));
    },
    { collection, action: 'delete', hasNoRightErrorMessage: hasNoRightToDeleteMessage });
  };

  /**
   * bulk toggle a boolean field on several entities at once, ex: (['xxx', 'yyy'], 'deleted', true).
   * No-op if the entity was configured without `slice.removeManyFromListSlice`
   */
  const toggleByIds = (ids: string[], field: string, value = true): AppThunkAction => {
    return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
      if (!slice.removeManyFromListSlice) return;

      await toggleEntitiesFieldByIds(queryCollection, ids, field, value);

      dispatch(slice.removeManyFromListSlice(ids));
    },
    { collection, action: field === 'deleted' ? 'delete' : 'update' });
  };

  /**
   * bulk-write a boolean field on several entities at once and keep them in the list, ex:
   * (['xxx', 'yyy'], 'active', false). The counterpart of `toggleByIds` for the actions that
   * change a row rather than take it out of the current scope — switching rows off does not move
   * them anywhere, so removing them would hide exactly what the reader just acted on.
   * No-op if the entity was configured without `slice.updateFieldInListSlice`
   */
  const setFieldByIds = (ids: string[], field: string, value: boolean): AppThunkAction => {
    return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
      if (!slice.updateFieldInListSlice) return;

      await toggleEntitiesFieldByIds(queryCollection, ids, field, value);

      dispatch(slice.updateFieldInListSlice({ ids, field, value }));
    },
    { collection, action: 'update' });
  };

  /**
   * exports the rows the toolbar's export menu was scoped to, as CSV/Excel — no-op if
   * `getExportColumns`/`exportFileNamePrefix` weren't provided in the config.
   *
   * The scope reaches here inside `queries`: pagination left out means every entity matching the
   * current filters/search, pagination set means that page only, and `ids` narrows that page down
   * to the rows the reader ticked — the list cloud functions take filters rather than a set of ids,
   * so that last step is done on what came back instead of being asked of the server.
   */
  const exportList = (queries: IQueriesInput, format: ExportFormat): AppThunkAction => {
    return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
      if (!getExportColumns || !exportFileNamePrefix) return;

      const locale = getSettingsLocaleSelector(getState?.()!);
      const { ids, ...listQueries } = queries;

      const result = await fetchEntityListForExport<TEntity>(
        listCloudFunction, listQueries, EXPORT_MAX_ROWS
      );

      const rows = ids?.length
        ? result.results.filter((entity: TEntity) => ids.includes(entity.id))
        : result.results;

      await exportRows(rows, getExportColumns(locale), exportFileNamePrefix, format);

      // only an unpaginated export can hit the cap — a scoped one asked for a page it already sees
      if (!listQueries.limit && result.count > EXPORT_MAX_ROWS) {
        dispatch(setInfoMessageSlice(
          i18n.t('common:exportTruncatedWarning', { max: EXPORT_MAX_ROWS, total: result.count })
        ));
      }
    },
    { collection, action: 'find' });
  };

  return {
    loadList, onListEnter, onListLeave, onOneLeave, deleteOne, toggleByIds, setFieldByIds, exportList,
  };
};
