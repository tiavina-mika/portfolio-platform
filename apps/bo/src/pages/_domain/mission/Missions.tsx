import { MissionStatusEnum } from '@shared/domain-types';
import { getNextMissionStatuses } from '@shared/domain-utils';
import { TargetEnum } from '@shared/types';
import { useNavigate } from '@tanstack/react-router';
import {
  type ReactNode, useCallback, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheckCircle, FiPlay, FiXCircle } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import CreateButton from '@/components/CreateButton';
import Head from '@/components/Head';
import PageHeader from '@/components/layouts/PageHeader';
import ListWithSelection from '@/components/table/ListWithSelection';
import i18n from '@/config/i18n';
import { MENU_ITEM_ICON_SIZE } from '@/constants/_core/ui/ui.constants';
import {
  MISSION_COLLECTION, MISSION_STATUS_ACTION_LABEL_KEYS, MISSION_TAB_OPTIONS,
} from '@/constants/_domain/mission.constants';
import MissionDatesCell from '@/containers/_domain/mission/MissionDatesCell';
import MissionFormDialog from '@/containers/_domain/mission/MissionFormDialog';
import MissionStatusCell from '@/containers/_domain/mission/MissionStatusCell';
import MissionTitleCell from '@/containers/_domain/mission/MissionTitleCell';
import SearchMissions from '@/containers/_domain/mission/SearchMissions';
import { useProtect } from '@/hooks/_core/useProtect';
import { goToHome } from '@/redux/actions/_core/app.action';
import { createOrUpdateMission, loadMissions, setMissionStatus } from '@/redux/actions/_domain/mission.action';
import { getSettingsWorkspaceSelector } from '@/redux/reducers/_core/settings.reducer';
import { getMissionCountSelector, getMissionMissionsSelector } from '@/redux/reducers/_domain/mission.reducer';
import { missionsRoute } from '@/routes/protected/_domain/mission.routes';
import { IQueriesInput, IRenderSearchProps, ITableHeadCell } from '@/types/_core/app.type';
import { IMission, IMissionFormValues } from '@/types/_domain/mission.type';
import { MissionsRouteSearchParams } from '@/validations/_domain/mission.validation';

interface IData {
  mission: ReactNode;
  client: ReactNode;
  assignee: ReactNode;
  dates: ReactNode;
  status: ReactNode;
  actions: ReactNode;
}

// the icon of the row action that moves a mission to each status it can reach
const STATUS_ACTION_ICONS: Partial<Record<MissionStatusEnum, ReactNode>> = {
  [MissionStatusEnum.IN_PROGRESS]: <FiPlay aria-hidden size={MENU_ITEM_ICON_SIZE} />,
  [MissionStatusEnum.DONE]: <FiCheckCircle aria-hidden size={MENU_ITEM_ICON_SIZE} />,
  [MissionStatusEnum.CANCELLED]: <FiXCircle aria-hidden size={MENU_ITEM_ICON_SIZE} />,
};

// what the work is, for whom, by whom, when, and where it stands
const headCells: ITableHeadCell<keyof IData>[] = [
  {
    id: 'mission',
    label: i18n.t('project:mission.mission'),
    width: 260,
    sortFields: [{ id: 'title', label: i18n.t('project:mission.title') }],
  },
  {
    id: 'client',
    label: i18n.t('project:client.client'),
    disableSorting: true,
  },
  {
    id: 'assignee',
    label: i18n.t('project:mission.assignee'),
    disableSorting: true,
  },
  {
    id: 'dates',
    label: i18n.t('project:mission.dates'),
    sortFields: [
      { id: 'startDate', label: i18n.t('project:mission.startDate') },
      { id: 'endDate', label: i18n.t('project:mission.endDate') },
      { id: 'createdAt', label: i18n.t('common:createdAt') },
      { id: 'updatedAt', label: i18n.t('common:updatedAt') },
    ],
  },
  {
    id: 'status',
    label: i18n.t('common:status'),
    disableSorting: true,
  },
  {
    id: 'actions',
    label: i18n.t('common:actions'),
    align: 'right',
  },
];

/**
 * The missions of Aldaron: the work done for a client, most often after an accepted quote. A mission is
 * planned, then started, then done, or cancelled on the way; it never goes back and is never deleted.
 */
const Missions = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation(['project', 'common']);
  const missions = useSelector(getMissionMissionsSelector);
  const count = useSelector(getMissionCountSelector);
  const searchParams: MissionsRouteSearchParams = missionsRoute.useSearch();
  const { canCreate, canEdit } = useProtect(MISSION_COLLECTION);
  const workspace = useSelector(getSettingsWorkspaceSelector);
  const navigate = useNavigate();

  // the missions belong to Aldaron: switching to another workspace from this page leaves it
  useEffect(() => {
    if (workspace !== TargetEnum.AGENCY) navigate(goToHome());
  }, [workspace, navigate]);

  // the dialog is shared by "New mission" and "Edit": open on no mission to create one
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<IMission | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openDialog = useCallback((mission: IMission | null): void => {
    setSelectedMission(mission);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = (): void => {
    setIsDialogOpen(false);
    setSelectedMission(null);
  };

  // closed once saved only: a refusal keeps what was typed on screen
  const handleSubmit = async (values: IMissionFormValues): Promise<void> => {
    setIsSaving(true);
    const error = await dispatch(createOrUpdateMission(values, selectedMission));

    setIsSaving(false);
    if (!error) closeDialog();
  };

  const handleUpdateData = (queries: IQueriesInput): void => {
    dispatch(loadMissions(queries));
  };

  const dataTable = useMemo((): IData[] => missions.map((mission: IMission) => {
    const data: Record<string, any> = {
      id: mission.id, // required even if not displayed
      mission: <MissionTitleCell mission={mission} />,
      client: mission.client.name,
      assignee: mission.assignee?.name ?? t('project:mission.noAssignee'),
      dates: <MissionDatesCell mission={mission} />,
      status: <MissionStatusCell mission={mission} />,
      actions: (
        <ActionsMenu
          label={mission.title}
          // a done or cancelled mission is still edited: its phase (warranty, closed) and its dates move
          onEdit={canEdit ? () => openDialog(mission) : undefined}
          type="row"
          menus={getNextMissionStatuses(mission.status).map((status) => ({
            onClick: () => dispatch(setMissionStatus(mission, status)),
            display: canEdit,
            label: t(MISSION_STATUS_ACTION_LABEL_KEYS[status] ?? ''),
            icon: STATUS_ACTION_ICONS[status],
          }))}
        />
      ),
    };

    return data as IData;
  }), [missions, canEdit, openDialog, dispatch, t]);

  return (
    <>
      <Head title={t('project:mission.missions')} />
      <PageHeader
        title={t('project:mission.missions')}
        actions={canCreate && (
          <CreateButton label={t('project:mission.createMission')} onClick={() => openDialog(null)} />
        )}
      />
      <ListWithSelection<IData>
        canUpdate={canEdit}
        count={count}
        defaultFilters={searchParams}
        enableMultipleSelect={false}
        headCells={headCells}
        items={dataTable}
        onUpdateData={handleUpdateData}
        renderFilter={(props: IRenderSearchProps) => <SearchMissions {...props} />}
        tabs={MISSION_TAB_OPTIONS}
      />
      <MissionFormDialog
        loading={isSaving}
        mission={selectedMission}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        open={isDialogOpen}
      />
    </>
  );
};

export default Missions;
