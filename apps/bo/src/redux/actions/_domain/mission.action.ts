import { TargetEnum } from '@shared/types';

import type { MissionStatusEnum } from '@shared/domain-types';

import i18n from '@/config/i18n';
import { DEFAULT_PAGINATION, Errors, PAGINATION } from '@/constants/_core/app.constants';
import { MISSION_COLLECTION, MISSION_TAB_OPTIONS } from '@/constants/_domain/mission.constants';
import { actionWithLoader, onEnterActionWithLoader } from '@/redux/actions/_core/util.action';
import { setMessageSlice } from '@/redux/reducers/_core/app.reducer';
import { getSettingsLocaleSelector, getSettingsWorkspaceSelector } from '@/redux/reducers/_core/settings.reducer';
import {
  addMissionToMissionsSlice, clearMissionsSlice, loadMissionsSlice, setMissionsCountSlice,
  updateMissionInMissionsSlice,
} from '@/redux/reducers/_domain/mission.reducer';
import { AppDispatch, AppThunkAction, RootState } from '@/redux/store';
import {
  changeMissionStatus, createMission, fetchMissionAssignees, fetchMissions, updateMission,
} from '@/services/_domain/mission.service';
import { IQueriesInput } from '@/types/_core/app.type';
import {
  IMission, IMissionAssignee, IMissionFormValues, IMissionInput,
} from '@/types/_domain/mission.type';
import { convertSearchParamsToFilters } from '@/utils/_core/app.utils';

const collection = MISSION_COLLECTION;

// the language of the server's refusals and the workspace the call is made from
const getRequestContext = (state: RootState) => ({
  locale: getSettingsLocaleSelector(state),
  workspace: getSettingsWorkspaceSelector(state),
});

// what the form typed, as the server takes it: the empty boxes and pickers as `null`
const toMissionInput = (values: IMissionFormValues): IMissionInput => ({
  client: values.client,
  title: values.title,
  quote: values.quote || null,
  assignee: values.assignee || null,
  phase: values.phase || null,
  startDate: values.startDate ?? null,
  endDate: values.endDate ?? null,
  description: values.description || null,
});

const rightsError = (action: 'create' | 'update') => i18n.t(
  action === 'create' ? 'common:errors.hasNoRightToCreate' : 'common:errors.hasNoRightToUpdate',
  { value: i18n.t('project:mission.thisMission') }
);

export const loadMissions = (queries: IQueriesInput): any => {
  const {
    limit = PAGINATION.rowsPerPage,
    skip = 0,
    orderBy = 'updatedAt',
    order = 'desc',
    filters,
    search,
  } = queries;

  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const result = await fetchMissions({
      limit, skip, orderBy, order, filters, search, ...getRequestContext(getState?.()!),
    });

    dispatch(loadMissionsSlice(result.results));
    dispatch(setMissionsCountSlice(result.count));
  });
};

/**
 * writes a mission: edits the one given, or creates one
 * @param onSaved told the mission once saved: a dialog opened from another list (the quotes) closes then
 */
export const createOrUpdateMission = (
  values: IMissionFormValues, mission?: IMission | null, onSaved?: (saved: IMission) => void
): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const context = getRequestContext(getState?.()!);
    const input = toMissionInput(values);

    if (mission) {
      const updated = await updateMission(mission.id, input, context);

      dispatch(updateMissionInMissionsSlice(updated));
      dispatch(setMessageSlice(i18n.t('project:mission.messages.updated', { title: updated.title })));
      onSaved?.(updated);
      return;
    }

    const created = await createMission(input, context);

    dispatch(addMissionToMissionsSlice(created));
    dispatch(setMessageSlice(i18n.t('project:mission.messages.created', { title: created.title })));
    onSaved?.(created);
  },
  // rights
  {
    collection,
    action: mission ? 'update' : 'create',
    hasNoRightErrorMessage: rightsError(mission ? 'update' : 'create'),
  });
};

/**
 * starts, finishes or cancels a mission; the row stays where it is with its new status until the list
 * is reloaded, so the reader sees what they just did
 */
export const setMissionStatus = (mission: IMission, status: MissionStatusEnum): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const updated = await changeMissionStatus(mission.id, status, getRequestContext(getState?.()!));

    dispatch(updateMissionInMissionsSlice(updated));
    dispatch(setMessageSlice(i18n.t(`project:mission.messages.${status}`, { title: mission.title })));
  },
  // rights
  {
    collection,
    action: 'update',
    hasNoRightErrorMessage: rightsError('update'),
  });
};

// the teammates the mission form proposes, read once when the form opens
export const loadMissionAssignees = (onLoaded: (assignees: IMissionAssignee[]) => void): any => {
  return actionWithLoader(async (_dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    onLoaded(await fetchMissionAssignees(getRequestContext(getState?.()!)));
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
 * loads the first page of missions before the list is shown. The missions exist in the Aldaron
 * workspace only: an address typed by hand from the portfolio one goes back to the dashboard, as the
 * server would refuse the call anyway.
 */
export const onMissionsEnter = (route: any): AppThunkAction => {
  return onEnterActionWithLoader((dispatch: AppDispatch, getState?: () => RootState): void => {
    if (getSettingsWorkspaceSelector(getState?.()!) !== TargetEnum.AGENCY) {
      throw new Error(Errors.redirect);
    }

    const filters = convertSearchParamsToFilters({
      tabs: MISSION_TAB_OPTIONS,
      searchParams: route.search,
      filters: {},
    });

    dispatch(clearMissionsSlice());
    dispatch(loadMissions({
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
