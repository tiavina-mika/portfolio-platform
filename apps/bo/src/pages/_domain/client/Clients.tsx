import { ClientStatusEnum } from '@shared/domain-types';
import { TargetEnum } from '@shared/types';
import { useNavigate } from '@tanstack/react-router';
import {
  type ReactNode, useCallback, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { FiArchive, FiRotateCcw } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import CreateButton from '@/components/CreateButton';
import Head from '@/components/Head';
import PageHeader from '@/components/layouts/PageHeader';
import DatesCell from '@/components/table/DatesCell';
import ListWithSelection from '@/components/table/ListWithSelection';
import i18n from '@/config/i18n';
import { MENU_ITEM_ICON_SIZE } from '@/constants/_core/ui/ui.constants';
import { CLIENT_COLLECTION, CLIENT_TAB_OPTIONS } from '@/constants/_domain/client.constants';
import ClientFormDialog from '@/containers/_domain/client/ClientFormDialog';
import ClientNameCell from '@/containers/_domain/client/ClientNameCell';
import ClientStatusCell from '@/containers/_domain/client/ClientStatusCell';
import SearchClients from '@/containers/_domain/client/SearchClients';
import { useProtect } from '@/hooks/_core/useProtect';
import { goToHome } from '@/redux/actions/_core/app.action';
import { createOrUpdateClient, loadClients, setClientArchived } from '@/redux/actions/_domain/client.action';
import { getSettingsWorkspaceSelector } from '@/redux/reducers/_core/settings.reducer';
import { getClientClientsSelector, getClientCountSelector } from '@/redux/reducers/_domain/client.reducer';
import { clientsRoute } from '@/routes/protected/_domain/client.routes';
import { IQueriesInput, IRenderSearchProps, ITableHeadCell } from '@/types/_core/app.type';
import { IClient, IClientInput } from '@/types/_domain/client.type';
import { ClientsRouteSearchParams } from '@/validations/_domain/client.validations';

interface IData {
  client: ReactNode;
  kind: ReactNode;
  phone: ReactNode;
  dates: ReactNode;
  status: ReactNode;
  actions: ReactNode;
}

// who the client is, what kind, how to call them, when they were added, and whether they are still worked with
const headCells: ITableHeadCell<keyof IData>[] = [
  {
    id: 'client',
    label: i18n.t('project:client.client'),
    width: 280,
    sortFields: [
      { id: 'name', label: i18n.t('common:name') },
      { id: 'email', label: i18n.t('project:client.email') },
    ],
  },
  {
    id: 'kind',
    label: i18n.t('project:client.kind'),
    disableSorting: true,
  },
  {
    id: 'phone',
    label: i18n.t('project:client.phone'),
    disableSorting: true,
  },
  {
    id: 'dates',
    label: `${i18n.t('common:createdAt')} / ${i18n.t('common:updatedAt')}`,
    sortFields: [
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
 * The clients Aldaron works for: listed, created and edited here, archived rather than deleted so the
 * history they will carry (quotes, missions) is never lost.
 */
const Clients = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation(['project', 'common']);
  const clients = useSelector(getClientClientsSelector);
  const count = useSelector(getClientCountSelector);
  const searchParams: ClientsRouteSearchParams = clientsRoute.useSearch();
  const { canCreate, canEdit } = useProtect(CLIENT_COLLECTION);
  const workspace = useSelector(getSettingsWorkspaceSelector);
  const navigate = useNavigate();

  // the clients belong to Aldaron: switching to another workspace from this page leaves it
  useEffect(() => {
    if (workspace !== TargetEnum.AGENCY) navigate(goToHome());
  }, [workspace, navigate]);

  // the dialog is shared by "New client" and "Edit": open on no client to create one
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openDialog = useCallback((client: IClient | null): void => {
    setSelectedClient(client);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = (): void => {
    setIsDialogOpen(false);
    setSelectedClient(null);
  };

  // closed once saved only: a refusal (an e-mail already used) keeps what was typed on screen
  const handleSubmit = async (values: IClientInput): Promise<void> => {
    setIsSaving(true);
    const error = await dispatch(createOrUpdateClient(values, selectedClient));

    setIsSaving(false);
    if (!error) closeDialog();
  };

  const handleArchive = useCallback((client: IClient, archived: boolean): void => {
    dispatch(setClientArchived(client, archived));
  }, [dispatch]);

  const handleUpdateData = (queries: IQueriesInput): void => {
    dispatch(loadClients(queries));
  };

  const dataTable = useMemo((): IData[] => clients.map((client: IClient) => {
    const isArchived = client.status === ClientStatusEnum.ARCHIVED;

    const data: Record<string, any> = {
      id: client.id, // required even if not displayed
      client: <ClientNameCell client={client} />,
      kind: t(`project:client.kinds.${client.kind}`),
      phone: client.phone ?? '',
      dates: <DatesCell createdAt={client.createdAt} updatedAt={client.updatedAt} />,
      status: <ClientStatusCell client={client} />,
      actions: (
        <ActionsMenu
          label={client.name}
          onEdit={canEdit ? () => openDialog(client) : undefined}
          type="row"
          menus={[
            {
              onClick: () => handleArchive(client, !isArchived),
              // an anonymized client has nothing left to edit, archive or bring back
              display: canEdit && client.status !== ClientStatusEnum.ANONYMIZED,
              label: isArchived ? t('project:client.restoreClient') : t('project:client.archiveClient'),
              icon: isArchived
                ? <FiRotateCcw aria-hidden size={MENU_ITEM_ICON_SIZE} />
                : <FiArchive aria-hidden size={MENU_ITEM_ICON_SIZE} />,
            },
          ]}
        />
      ),
    };

    return data as IData;
  }), [clients, canEdit, handleArchive, openDialog, t]);

  return (
    <>
      <Head title={t('project:client.clients')} />
      <PageHeader
        title={t('project:client.clients')}
        actions={canCreate && (
          <CreateButton label={t('project:client.createClient')} onClick={() => openDialog(null)} />
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
        renderFilter={(props: IRenderSearchProps) => <SearchClients {...props} />}
        tabs={CLIENT_TAB_OPTIONS}
      />
      <ClientFormDialog
        client={selectedClient}
        loading={isSaving}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        open={isDialogOpen}
      />
    </>
  );
};

export default Clients;
