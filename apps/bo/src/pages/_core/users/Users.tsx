import {
  Badge, Chip, IconButton, ListItem, ListItemAvatar, ListItemText, Rating, Skeleton, Stack, Tooltip,
  Typography,
} from '@mui/material';
import { PlatformEnum } from '@shared/types';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import {
  MouseEvent, ReactNode, Suspense, useCallback, useMemo, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { FiShield } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import Avatar from '@/components/Avatar';
import ButtonActions from '@/components/ButtonActions';
import CreateButton from '@/components/CreateButton';
import Dialog from '@/components/Dialog';
import SearchInput from '@/components/form/inputs/SearchInput';
import Head from '@/components/Head';
import { RowSendIcon } from '@/components/icons/RowActionIcons';
import PageHeader from '@/components/layouts/PageHeader';
import ListWithSelection from '@/components/table/ListWithSelection';
import i18n from '@/config/i18n';
import { ROW_ACTIONS_ICON_SIZE } from '@/constants/_core/ui/list.constants';
import { SKELETON_LINE_HEIGHT, SKELETON_PRIMARY_LINE_WIDTH } from '@/constants/_core/ui/ui.constants';
import { RELATION_OPTIONS_LIMIT, usersTabOptions } from '@/constants/_core/user.constants';
import InviteUserForm from '@/containers/_core/roles/InviteUserForm';
import AuditLogAdvancedFilterForm from '@/containers/_core/users/AuditLogAdvancedFilterForm';
import RolesChip from '@/containers/_core/users/RolesChip';
import SendMessageForm from '@/containers/_core/users/SendMessageForm';
import UserAdvancedFilterForm from '@/containers/_core/users/UserAdvancedFilterForm';
import UserContacts from '@/containers/_core/users/UserContacts';
import UserProfileCompletenessCell from '@/containers/_core/users/UserProfileCompletenessCell';
import { useProtect } from '@/hooks/_core/useProtect';
import { useToggle } from '@/hooks/_core/useToggle';
import { markAllAsSeen } from '@/redux/actions/_core/app.action';
import { loadAuditLogs } from '@/redux/actions/_core/auditLog.action';
import { sendBOInvitation } from '@/redux/actions/_core/invitation.action';
import { loadRoles } from '@/redux/actions/_core/role.action';
import {
  deleteUserById, deleteUsersById, exportUsers, goToUser, loadUsers, sendMessageToUser,
  toggleUsersNotification,
} from '@/redux/actions/_core/user.action';
import { getAuditLogCountSelector, getAuditLogLogsSelector } from '@/redux/reducers/_core/auditLog.reducer';
import { getRoleCanManageStaffSelector, getRoleRolesSelector } from '@/redux/reducers/_core/role.reducer';
import {
  getUserCountSelector, getUserFiltersSelector, getUserUsersSelector, loadUsersSlice,
} from '@/redux/reducers/_core/user.reducer';
import { usersRoute } from '@/routes/protected/_core/users.routes';
import {
  ExportFormat, IQueriesInput, IRenderSearchProps, ITableHeadCell,
} from '@/types/_core/app.type';
import { ISendInvitationInput } from '@/types/_core/invitation.type';
import {
  IUser, IUsersRouteSearchParams, SendMessageFormInput,
} from '@/types/_core/user.type';
import { isCurrentTab } from '@/utils/_core/app.utils';
import { displayDate } from '@/utils/_core/date.utils';
import {
  getAuditLogContactLines, getFullPhoneNumber, getUserActiveSuspensionUntil, getUserAuditLogColumns,
  getUserFullName, getUserLastConnectedAt, getUserLastPlatformLabel, getUserListColumns, getUserNameLines,
} from '@/utils/_core/user.utils';

const SEND_MESSAGE_TO_USER_FORM_ID = 'send-message-form-id';
const INVITE_USER_FORM_ID = 'invite-user-form-id';
const AUDIT_LOG_TAB_KEY = 'auditLog';
const ADMIN_TAB_KEY = 'platform';

interface IData {
  id: string;
  fullName: ReactNode;
  contact: ReactNode;
  rating: ReactNode;
  profileCompleteness: ReactNode;
  activity: ReactNode;
  roles?: ReactNode;
  actions: ReactNode;
  // extra columns contributed by domains via `registerUserListColumn` (e.g. vehicles)
  [key: string]: unknown;
}

interface IDataAuditLog {
  id: string;
  user: ReactNode;
  action: ReactNode;
  initiatedBy: string;
  deletionReason: string;
  date: ReactNode;
  // extra columns contributed by domains via `registerUserAuditLogColumn` (e.g. rides, avgRating)
  [key: string]: unknown;
}

interface IDataRecycleBin {
  id: string;
  fullName: ReactNode;
  email: string;
  phone: string;
  deletionReason: string;
  deletedAt: ReactNode;
  actions: ReactNode;
}

/*
 * The columns answer, in order, the questions an operator asks of an account: who it is, how to
 * reach them, how the platform rates them, what a domain adds about them (the vehicles they own),
 * how much of their profile they filled in, and since when they have been here.
 */
const headCells: ITableHeadCell<string>[] = [
  {
    id: 'fullName',
    label: i18n.t('user:fullName'),
  },
  {
    id: 'contact',
    label: i18n.t('user:contact'),
    disableSorting: true,
  },
  {
    id: 'rating',
    label: i18n.t('user:stats.rating'),
    align: 'right',
    disableSorting: true,
  },
  ...getUserListColumns().map((column) => column.headCell),
  {
    id: 'profileCompleteness',
    label: i18n.t('user:profileCompleteness.label'),
    /*
     * derived from the account's own fields rather than stored on it, so there is no single field
     * the list could order on
     */
    disableSorting: true,
  },
  {
    id: 'activity',
    align: 'right',
    label: i18n.t('common:createdAt'),
  },
  /*
   * the next two lines are only given a row of their own on a card: the table states the ban and the
   * suspension beside the name, and the second factor beside the name too
   */
  {
    id: 'security',
    label: i18n.t('user:security'),
    disableSorting: true,
    cardOnly: true,
  },
  {
    id: 'mfa',
    label: i18n.t('user:mfa.label'),
    disableSorting: true,
    cardOnly: true,
  },
  {
    id: 'roles',
    align: 'right',
    label: i18n.t('user:role.roles'),
  },
  {
    id: 'actions',
    align: 'right',
    label: 'Actions',
  },
];

/*
 * Columns that only describe an account someone actually travels with — an administrator invited
 * from the back-office is never rated, owns no vehicle and fills in no traveller profile, so on
 * that tab they would be a screen of dashes.
 */
const MEMBER_ONLY_COLUMN_IDS = [
  'rating',
  'security',
  'profileCompleteness',
  ...getUserListColumns().map((column) => column.headCell.id),
];

// the second factor is a back-office safeguard: a traveller's account has none to state
const ADMIN_ONLY_COLUMN_IDS = ['roles', 'mfa'];

const headCellsRecycleBin: ITableHeadCell<keyof IDataRecycleBin>[] = [
  {
    id: 'fullName',
    label: i18n.t('user:fullName'),
  },
  {
    id: 'email',
    label: i18n.t('user:originalEmail'),
    align: 'center',
  },
  {
    id: 'phone',
    label: i18n.t('user:originalPhone'),
    align: 'center',
  },
  {
    id: 'deletionReason',
    label: i18n.t('user:deletionReason'),
    align: 'center',
  },
  {
    id: 'deletedAt',
    align: 'right',
    label: i18n.t('common:deletedAt'),
  },
  {
    id: 'actions',
    align: 'right',
    label: 'Actions',
  },
];

const headCellsAuditLog: ITableHeadCell<string>[] = [
  {
    id: 'user',
    label: i18n.t('user:auditLogs.user'),
  },
  {
    id: 'action',
    label: i18n.t('user:auditLogs.action'),
    align: 'center',
  },
  {
    id: 'initiatedBy',
    label: i18n.t('user:auditLogs.initiatedBy'),
    align: 'center',
  },
  {
    id: 'deletionReason',
    label: i18n.t('user:auditLogs.deletionReason'),
    align: 'center',
  },
  ...getUserAuditLogColumns().map((column) => column.headCell),
  {
    id: 'date',
    align: 'right',
    label: i18n.t('common:createdAt'),
  },
];

/**
 * parse search params to queries input
 */
const getDefaultFilters = (searchParams: IUsersRouteSearchParams) => {
  const values: Record<string, any> = {};

  if (searchParams.role) {
    values.roles = [searchParams.role];
  }
  if (searchParams.from) {
    values.fromBO = searchParams.from === PlatformEnum.BO;
  }

  values.tab = searchParams.tab;

  return values;
};

const AUDIT_LOG_TAB = usersTabOptions.find((o) => o.key === AUDIT_LOG_TAB_KEY);
const ADMIN_TAB = usersTabOptions.find((o) => o.key === ADMIN_TAB_KEY);

const collection = '_User';

const Users = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const users = useSelector(getUserUsersSelector);
  const count = useSelector(getUserCountSelector);
  const filters = useSelector(getUserFiltersSelector);
  const auditLogs = useSelector(getAuditLogLogsSelector);
  const auditLogCount = useSelector(getAuditLogCountSelector);
  const roles = useSelector(getRoleRolesSelector);
  // the server lets an owner, a super administrator or the staff right invite an admin: the button follows
  const canManageStaff = useSelector(getRoleCanManageStaffSelector);
  // whether this visit already read the roles for the invite form — see handleOpenInviteDialog
  const hasLoadedInviteRolesRef = useRef(false);
  const searchParams: IUsersRouteSearchParams = usersRoute.useSearch();

  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const {
    open: openInviteDialog, toggle: toggleInviteDialog,
  } = useToggle();

  const {
    t,
  } = useTranslation();

  const {
    canDelete,
    canPreview,
    canEdit,
    canDestroy,
    canCreate,
  } = useProtect(collection);

  const isAuditLogTab = searchParams.tab === AUDIT_LOG_TAB?.tab;
  const isRecycleBin = canDestroy && isCurrentTab(searchParams?.tab);
  // an account marked seen leaves this tab and stays on every other one
  const isUnseenTab = isCurrentTab(searchParams?.tab, 'news');

  // delete a row
  const handleDelete = useCallback(
    (user: IUser): void => {
      dispatch(deleteUserById(user.id, true));
    },
    [dispatch]
  );

  // go to preview page
  const handlePreview = useCallback(
    (id: string): void => {
      navigate(goToUser(id));
    },
    [navigate]
  );

  // delete selected rows
  const handleDeleteSelected = (ids: string[]) => {
    dispatch(deleteUsersById(ids));
  };

  const handleCloseDialog = () => {
    setSelectedUser(null);
  };

  const handleSelectRow = (user: IUser) => (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    setSelectedUser(user);
  };

  const handleSendMessageFormSubmit = async (values: SendMessageFormInput) => {
    if (!selectedUser) return;
    // the dialog only asks what to send and how — the recipient is the row it opened on
    await dispatch(sendMessageToUser(selectedUser, { ...values, userId: selectedUser.id }));
    handleCloseDialog();
  };

  /*
   * the invite form's role select is the only reader of the roles on this page, so they are read
   * when it first opens rather than on every visit of the list, and kept for the next openings.
   * Read once per visit rather than whenever the store holds some: the role pages leave behind a
   * list without the highest-level roles, which would silently narrow the form's options
   */
  const handleOpenInviteDialog = () => {
    if (!hasLoadedInviteRolesRef.current || roles.length === 0) {
      hasLoadedInviteRolesRef.current = true;
      dispatch(loadRoles({ limit: RELATION_OPTIONS_LIMIT }));
    }

    toggleInviteDialog();
  };

  const handleInviteFormSubmit = async (values: ISendInvitationInput) => {
    await dispatch(sendBOInvitation(values));
    toggleInviteDialog();
  };

  const handleUpdateData = (queries: IQueriesInput) => {
    const newQueries = { ...queries, filters: { ...filters, ...queries.filters } };

    if (newQueries.filters?.[AUDIT_LOG_TAB_KEY] || isCurrentTab(newQueries.filters?.tab)) {
      dispatch(loadAuditLogs(newQueries));
    }
    else {
      dispatch(loadUsers(newQueries));
    }
  };

  const handleSelectedAsSeen = (ids: string[], value: boolean) => {
    dispatch(toggleUsersNotification(ids, value, isUnseenTab));
  };

  const handleMarkAllAsSeen = () => {
    dispatch(markAllAsSeen<IUser>({
      collection,
      items: users,
      isUnseenTab,
      callback: loadUsersSlice,
    }));
  };

  const handleExport = (format: ExportFormat, queries: IQueriesInput) => {
    const newQueries = { ...queries, filters: { ...filters, ...queries.filters } };

    dispatch(exportUsers(newQueries, format));
  };

  /*
   * compared against the very string the tab was declared with, not a second translation of the
   * same idea: the declaration is translated once when the module loads, so translating again here
   * gives another string as soon as the language differs between the two moments (a browser language
   * that is not the one the app renders in) — the tab would never be recognised, and with it
   * unrecognised the Roles column is dropped from the table altogether
   */
  const isAdminTab = searchParams.tab === ADMIN_TAB?.tab;

  /*
   * roles only make sense for the administrators tab and the member columns only make sense for
   * the accounts that travel — drop whichever side doesn't apply instead of rendering it empty
   */
  const filteredHeadCells = useMemo(
    () => headCells.filter((cell) => (isAdminTab
      ? !MEMBER_ONLY_COLUMN_IDS.includes(cell.id)
      : !ADMIN_ONLY_COLUMN_IDS.includes(cell.id))),
    [isAdminTab]
  );

  // users table data
  const dataTable = useMemo((): IData[] => {
    return users.map((user: IUser) => {
      const lastConnectedAt = getUserLastConnectedAt(user);
      const platformLabel = getUserLastPlatformLabel(user);
      const suspendedUntil = user.banned ? undefined : getUserActiveSuspensionUntil(user);
      const suspendedLabel = suspendedUntil
        ? t('user:suspendedUntil', { date: displayDate(suspendedUntil, false) })
        : '';
      const security = user.banned
        ? { label: t('user:banned'), color: 'error.main' }
        : suspendedUntil
          ? { label: suspendedLabel, color: 'warning.main' }
          : { label: t('common:active'), color: 'text.primary' };

      const cells: Record<string, ReactNode> = {
        // `component="div"`: a cell of the table, not a row of a list — an `li` outside any `ul`
        fullName: (
          <ListItem component="div" sx={{ gap: 2, p: 0 }}>
            <ListItemAvatar>
              <Badge
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                color="success"
                invisible={!user.isOnline}
                overlap="circular"
                variant="dot"
              >
                <Avatar size={36} sx={{ marginLeft: 'auto', marginRight: 0 }} user={user} />
              </Badge>
            </ListItemAvatar>
            <ListItemText {...getUserNameLines(user, t('user:unnamedMember'))} />
            {user.banned && <Chip color="error" label={t('user:banned')} size="small" />}
            {suspendedUntil && (
              <Chip
                color="warning"
                label={suspendedLabel}
                size="small"
              />
            )}
            {isAdminTab && user.mfa?.enabled && (
              <Chip
                color="primary"
                icon={<FiShield />}
                label={t('user:mfa.badge')}
                size="small"
                variant="outlined"
              />
            )}
          </ListItem>
        ),
        security: (
          <Typography sx={{ color: security.color }} variant="body1">{security.label}</Typography>
        ),
        mfa: (
          <Typography sx={{ color: user.mfa?.enabled ? 'success.main' : 'text.secondary' }} variant="body1">
            {user.mfa?.enabled ? t('user:mfa.enabled') : t('user:mfa.disabled')}
          </Typography>
        ),
        contact: <UserContacts user={user} />,
        profileCompleteness: <UserProfileCompletenessCell user={user} />,
        roles: <RolesChip roles={user.roles || []} />,
        ...Object.fromEntries(
          getUserListColumns().map((column) => {
            const { Component } = column;

            // registered cells are lazy: a line skeleton holds the cell while its chunk loads
            return [
              column.headCell.id,
              <Suspense
                fallback={<Skeleton height={SKELETON_LINE_HEIGHT} width={SKELETON_PRIMARY_LINE_WIDTH} />}
                key={column.headCell.id}
              >
                <Component user={user} />
              </Suspense>,
            ];
          })
        ),
        rating: user.stats && user.stats.reviewsCount > 0
          ? (
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <Rating
                readOnly
                precision={0.5}
                size="small"
                value={user.stats.rating}
              />
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                }}
              >
                ({user.stats.reviewsCount})
              </Typography>
            </Stack>
          )
          : '—',
        activity: (
          <Stack sx={{
            alignItems: 'flex-end',
          }}
          >
            <Typography variant="body2">{displayDate(user.createdAt, false, true)}</Typography>
            {dayjs(lastConnectedAt).isValid() && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {t('user:lastConnected')} : {displayDate(lastConnectedAt, false, true)}
              </Typography>
            )}
            {platformLabel && (
              <Typography sx={{ color: 'text.secondary' }} variant="caption">
                {platformLabel}
              </Typography>
            )}
          </Stack>
        ),
        actions: (
          <ButtonActions
            value={getUserFullName(user)}
            leadingActions={(
              <Tooltip title={t('user:sendMessage.sendTo', { name: getUserFullName(user) })}>
                <IconButton aria-label="sendMessage" onClick={handleSelectRow(user)}>
                  <RowSendIcon size={ROW_ACTIONS_ICON_SIZE} />
                </IconButton>
              </Tooltip>
            )}
            onDelete={canDelete
              ? () => handleDelete(user)
              : undefined}
            onPreview={canPreview
              ? () => handlePreview(user.id)
              : undefined}
          />
        ),
      };

      /*
       * both renderings of the list pair a row's keys with the head cells by position, so the row
       * has to hold exactly the columns being shown, in their order — an extra or missing key
       * shifts every column after it under the wrong header
       */
      const row: Record<string, unknown> = {
        id: user.id,
        unseen: !user.seen,
        ...Object.fromEntries(filteredHeadCells.map((cell) => [cell.id, cells[cell.id]])),
      };

      return row as IData;
    });
  }, [
    users,
    filteredHeadCells,
    isAdminTab,
    handleDelete,
    handlePreview,
    t,
    canDelete,
    canPreview,
  ]);

  // audit log table data
  const auditLogDataTable = useMemo((): IDataAuditLog[] => {
    const initiatedByLabel = (value: string) => {
      if (value === 'admin') return t('user:auditLogs.byAdmin');
      if (value === 'system') return t('user:auditLogs.bySystem');
      return t('user:auditLogs.byUser');
    };

    return (auditLogs).map((log) => ({
      id: log.id,
      user: (
        <ListItemText
          primary={log.fullNameBefore || t('user:unnamedMember')}
          secondary={getAuditLogContactLines(log).join(' · ')}
        />
      ),
      action: (
        <Chip
          color="error"
          label={t('user:auditLogs.accountDeleted')}
          size="small"
        />
      ),
      initiatedBy: initiatedByLabel(log.deletionInitiatedBy),
      deletionReason: log.deletionReason ?? '—',
      ...Object.fromEntries(
        getUserAuditLogColumns().map((column) => [column.headCell.id, column.render(log)])
      ),
      date: displayDate(log.timestamp, false, true),
    }));
  }, [auditLogs, t]);

  // recycle bin table — reads from UserAuditLog (GDPR: _User no longer holds PII after deletion)
  const recycleBinDataTable = useMemo((): IDataRecycleBin[] => {
    return (auditLogs).map((log) => ({
      id: log.userId,
      fullName: (
        <ListItemText
          primary={log.fullNameBefore || t('user:unnamedMember')}
          secondary={getAuditLogContactLines(log).join(' · ')}
        />
      ),
      email: log.emailBefore ?? '—',
      // masked by the server when the account was closed: enough to tell two members apart, no more
      phone: getFullPhoneNumber(log.phoneBefore) || '—',
      deletionReason: log.deletionReason ?? '—',
      deletedAt: displayDate(log.timestamp, false, true),
      actions: (
        <ActionsMenu
          label={log.fullNameBefore}
          onPreview={() => handlePreview(log.userId)}
          type="row"
        />
      ),
    }));
  }, [auditLogs, handlePreview, t]);

  return (
    <>
      <Head title={t('user:users')} />
      <PageHeader
        title={t('user:users')}
        actions={canCreate && canManageStaff && isAdminTab && (
          <CreateButton label={t('user:invitation.inviteAnAdmin')} onClick={handleOpenInviteDialog} />
        )}
      />
      <ListWithSelection<IData | IDataAuditLog | IDataRecycleBin>
        canDelete={canDelete && !isAuditLogTab && !isRecycleBin}
        /*
         * a permission, not a statement about the open tab: it only decides whether the recycle
         * bin has a slot in the tab strip. Narrowing it per tab took that slot away from every
         * other tab — standing on the audit log left no way back to the bin
         */
        canDestroy={canDestroy}
        canUpdate={canEdit}
        count={isAuditLogTab || isRecycleBin ? auditLogCount : count}
        defaultFilters={getDefaultFilters(searchParams)}
        enableMultipleSelect={!canDestroy && !isAuditLogTab && !isRecycleBin}
        items={isAuditLogTab ? auditLogDataTable : isRecycleBin ? recycleBinDataTable : dataTable}
        onDeleteSelected={isRecycleBin ? undefined : handleDeleteSelected}
        onExport={isAuditLogTab || isRecycleBin ? undefined : handleExport}
        onMarkAllAsSeen={isAuditLogTab || isRecycleBin ? undefined : handleMarkAllAsSeen}
        onMarkAsSeenSelected={isAuditLogTab || isRecycleBin ? undefined : handleSelectedAsSeen}
        onRowClick={isAuditLogTab ? undefined : handlePreview}
        onUpdateData={handleUpdateData}
        tabs={usersTabOptions}
        headCells={isAuditLogTab
          ? (headCellsAuditLog as any)
          : isRecycleBin ? (headCellsRecycleBin) : filteredHeadCells}
        renderFilter={isAuditLogTab || isRecycleBin
          ? (props: IRenderSearchProps) => (
            <>
              <SearchInput onChange={props.onSearch} placeholder={t('user:searchByNameOrEmail')} />
              <AuditLogAdvancedFilterForm onSubmit={props.onAdvancedSearch} />
            </>
          )
          : (props: IRenderSearchProps) => (
            <>
              <SearchInput onChange={props.onSearch} placeholder={t('user:searchByNameEmailOrPhone')} />
              <UserAdvancedFilterForm onSubmit={props.onAdvancedSearch} />
            </>
          )}
      />
      <Dialog
        fullWidth
        formId={SEND_MESSAGE_TO_USER_FORM_ID}
        maxWidth="sm"
        open={!!selectedUser}
        primaryButtonText={t('send')}
        toggle={handleCloseDialog}
        title={selectedUser
          ? t('user:sendMessage.sendTo', { name: getUserFullName(selectedUser) })
          : ''}
      >
        {selectedUser && (
          <SendMessageForm
            formId={SEND_MESSAGE_TO_USER_FORM_ID}
            onSubmit={handleSendMessageFormSubmit}
            user={selectedUser}
          />
        )}
      </Dialog>
      {canCreate && canManageStaff && isAdminTab && (
        <>
          <Dialog
            fullWidth
            formId={INVITE_USER_FORM_ID}
            maxWidth="sm"
            open={openInviteDialog}
            primaryButtonText={t('user:invitation.sendInvitation')}
            title={t('user:invitation.inviteAnAdmin')}
            toggle={toggleInviteDialog}
          >
            <InviteUserForm formId={INVITE_USER_FORM_ID} onSubmit={handleInviteFormSubmit} />
          </Dialog>
        </>
      )}
    </>
  );
};

export default Users;
