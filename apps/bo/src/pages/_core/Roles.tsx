
import {
  Box, Button, Chip, IconButton, Tab, Tabs, TableFooter, Tooltip,
} from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useNavigate } from '@tanstack/react-router';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiClock } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';

import ButtonActions from '@/components/ButtonActions';
import CreateButton from '@/components/CreateButton';
import EmptyData from '@/components/EmptyData';
import SearchInput from '@/components/form/inputs/SearchInput';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import ListToolbar from '@/components/table/ListToolbar';
import { PAGINATION } from '@/constants/_core/app.constants';
import { HIGHEST_LEVEL_ROLES, ROLE_DEFAULT_LIMIT, usersTabOptions } from '@/constants/_core/user.constants';
import HighestRoleAccounts from '@/containers/_core/roles/HighestRoleAccounts';
import RoleAuditLogDialog from '@/containers/_core/roles/RoleAuditLogDialog';
import RoleDeleteDialog from '@/containers/_core/roles/RoleDeleteDialog';
import RolePreviewDialog from '@/containers/_core/roles/RolePreviewDialog';
import { useToggle } from '@/hooks/_core/useToggle';
import {
  destroyRole, goToAddRole, goToEditRole, loadHighestRoleAccounts, loadRoles,
} from '@/redux/actions/_core/role.action';
import { loadRoleAuditLogs } from '@/redux/actions/_core/roleAuditLog.action';
import { goToUsers } from '@/redux/actions/_core/user.action';
import {
  getRoleCurrentUserIsAdminSelector, getRoleCurrentUserRolesSelector,
  getRoleHighestRoleAccountsLoadingSelector, getRoleHighestRoleAccountsSelector, getRoleRolesSelector,
} from '@/redux/reducers/_core/role.reducer';
import {
  clearRoleAuditLogsSlice, getRoleAuditLogCountSelector, getRoleAuditLogLoadingSelector,
  getRoleAuditLogLogsSelector,
} from '@/redux/reducers/_core/roleAuditLog.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { IRole } from '@/types/_core/role.type';
import { displayDate } from '@/utils/_core/date.utils';
import { getHighestRoleAccountIssues, getRoleLabel } from '@/utils/_core/role.utils';


type RolesTab = 'roles' | 'accounts';

const sx = {
  tabs: { borderBottom: 1, borderColor: 'divider', mb: 2 },
  tableHead: { bgcolor: 'action.hover' },
  tableHeadCell: { color: 'text.secondary', fontWeight: 600 },
};

const Roles = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    t,
  } = useTranslation(['common', 'user']);
  const roles = useSelector(getRoleRolesSelector);
  const auditLogs = useSelector(getRoleAuditLogLogsSelector);
  const auditLogCount = useSelector(getRoleAuditLogCountSelector);
  const isAuditLogLoading = useSelector(getRoleAuditLogLoadingSelector);
  // the server only lets an owner or super administrator create, edit or delete posts
  const isAdmin = useSelector(getRoleCurrentUserIsAdminSelector);
  const highestRoleAccounts = useSelector(getRoleHighestRoleAccountsSelector);
  const isHighestRoleAccountsLoading = useSelector(getRoleHighestRoleAccountsLoadingSelector);
  // giving OWNER is OWNER-only on the server: a super administrator is not offered the invitation
  const isCurrentUserOwner = useSelector(getRoleCurrentUserRolesSelector)
    .some((role) => role.name === HIGHEST_LEVEL_ROLES[0]);
  const [tab, setTab] = useState<RolesTab>('roles');
  const {
    open: openAuditLogDialog, toggle: toggleAuditLogDialog,
  } = useToggle();
  const [page, setPage] = useState<number>(0);
  const [auditLogPage, setAuditLogPage] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [previewedRole, setPreviewedRole] = useState<IRole | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<IRole | null>(null);
  const locale = useSelector(getSettingsLocaleSelector);

  // who holds the highest powers is for the owners and super administrators to review, nobody else
  useEffect(() => {
    if (isAdmin) dispatch(loadHighestRoleAccounts());
  }, [isAdmin, dispatch]);

  useEffect(() => {
    if (openAuditLogDialog) {
      dispatch(loadRoleAuditLogs({ skip: auditLogPage * PAGINATION.rowsPerPage }));
    }
  }, [openAuditLogDialog, auditLogPage, dispatch]);

  const query = search.trim().toLowerCase();
  const filteredRoles = query
    ? roles.filter((role: IRole) => (
      getRoleLabel(role, locale).toLowerCase().includes(query) || role.name.toLowerCase().includes(query)
    ))
    : roles;

  // the owners' review is for the highest roles only: any other account only ever sees the posts
  const currentTab: RolesTab = isAdmin ? tab : 'roles';
  const accountsToCheckCount = highestRoleAccounts
    .filter(account => getHighestRoleAccountIssues(account).length > 0).length;

  const handleTabChange = (_: SyntheticEvent, value: RolesTab) => setTab(value);

  // the administrators tab holds the invitation button
  const handleInviteOwner = () => {
    const administratorsTab = usersTabOptions.find((option) => option.key === 'platform');

    navigate(goToUsers({ tab: administratorsTab?.tab }));
  };

  const handleGoToCreateRole = () => navigate(goToAddRole());

  const handleGoToEditRole = (role: IRole) => navigate(goToEditRole(role.id));

  const handleDelete = (role: IRole) => {
    dispatch(destroyRole(role.id));
    setRoleToDelete(null);
  };

  /*
   * the audit log slice is shared by the preview (one role) and the history (every role): it is
   * emptied first so the entries of the other one are not shown while the new ones load
   */
  const handleOpenAuditLog = () => {
    dispatch(clearRoleAuditLogsSlice());
    setAuditLogPage(0);
    toggleAuditLogDialog();
  };

  const handlePreview = (role: IRole) => {
    dispatch(clearRoleAuditLogsSlice());
    setPreviewedRole(role);
    dispatch(loadRoleAuditLogs({ roleName: role.name }));
  };

  const handleClosePreview = () => setPreviewedRole(null);

  const handleCloseDelete = () => setRoleToDelete(null);

  const handleSearchChange = (_name: string, value: string) => setSearch(value);

  const handleLoadMode = () => {
    setPage((prev: number) => prev + 1);
    const values = {
      withAdminOrBetter: false,
      withUsersCount: true,
      skip: ROLE_DEFAULT_LIMIT * (page + 1),
      incrementItems: true,
    };

    dispatch(loadRoles(values));
  };

  return (
    <Layout
      actions={isAdmin ? <CreateButton label={t('user:role.addRole')} onClick={handleGoToCreateRole} /> : undefined}
      title={t('user:role.roles')}
      rightActions={(
        <Tooltip title={t('user:role.auditLog.viewAuditLog')}>
          <IconButton aria-label={t('user:role.auditLog.viewAuditLog')} onClick={handleOpenAuditLog} size="small">
            <FiClock />
          </IconButton>
        </Tooltip>
      )}
    >
      <Head title={t('user:role.roles')} />

      {isAdmin && (
        <Tabs
          aria-label={t('user:role.tabsLabel')}
          onChange={handleTabChange}
          sx={sx.tabs}
          value={currentTab}
        >
          <Tab label={t('user:role.roles')} value="roles" />
          <Tab
            value="accounts"
            label={(
              <Box className="flexRow" sx={{ alignItems: 'center', gap: 1 }}>
                {t('user:role.highestAccounts.title')}
                {accountsToCheckCount > 0 && (
                  <Chip
                    color="warning"
                    label={accountsToCheckCount}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            )}
          />
        </Tabs>
      )}

      {currentTab === 'accounts' && (
        <HighestRoleAccounts
          accounts={highestRoleAccounts}
          loading={isHighestRoleAccountsLoading}
          onInviteOwner={isCurrentUserOwner ? handleInviteOwner : undefined}
        />
      )}

      {currentTab === 'roles' && (roles?.length === 0
        ? (
          <EmptyData
            action={isAdmin ? { label: t('user:role.addRole'), onClick: handleGoToCreateRole } : undefined}
          />
        )
        : (
          <>
            <ListToolbar total={t('user:role.rolesCount', { count: filteredRoles.length })}>
              <SearchInput onChange={handleSearchChange} placeholder={t('user:role.searchRole')} />
            </ListToolbar>
            {filteredRoles.length === 0
              ? <EmptyData title={t('common:noData')} />
              : (
                <TableContainer>
                  <Table aria-label="table">
                    <TableHead sx={sx.tableHead}>
                      <TableRow>
                        <TableCell sx={sx.tableHeadCell}>{t('user:role.label')}</TableCell>
                        <TableCell sx={sx.tableHeadCell}>{t('user:role.uniqueCode')}</TableCell>
                        <TableCell sx={sx.tableHeadCell}>{t('common:createdAt')}</TableCell>
                        <TableCell sx={sx.tableHeadCell}>{t('user:numberOfUsers')}</TableCell>
                        <TableCell align="right" sx={sx.tableHeadCell}>
                          {t('common:actions')}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRoles.map((role: IRole, index: number) => (
                        <TableRow key={role.name + index} sx={{ '& > *': { borderBottom: 'unset' } }}>
                          <TableCell scope="row">{getRoleLabel(role, locale)}</TableCell>
                          <TableCell scope="row">{role.name}</TableCell>
                          <TableCell scope="row">{displayDate(role.createdAt, false, true)}</TableCell>
                          <TableCell scope="row">{role.count || 0}</TableCell>
                          <TableCell scope="row">
                            <ButtonActions
                              onDelete={isAdmin ? () => setRoleToDelete(role) : undefined}
                              onEdit={isAdmin ? () => handleGoToEditRole(role) : undefined}
                              onPreview={() => handlePreview(role)}
                              value={role.name}
                              withDeletionModal={false}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter />
                  </Table>
                  {/* a page that was not full was the last one */}
                  {roles.length % ROLE_DEFAULT_LIMIT === 0 && (
                    <Box
                      className="flexRow flex1 justifyEnd"
                      sx={{
                        mt: 2,
                      }}
                    >
                      <Button onClick={handleLoadMode} variant="contained">
                        {t('common:loadMore')}
                      </Button>
                    </Box>
                  )}
                </TableContainer>
              )}
          </>
        ))}

      <RolePreviewDialog
        auditLogs={auditLogs}
        loading={isAuditLogLoading}
        onClose={handleClosePreview}
        role={previewedRole}
        roleLabel={previewedRole ? getRoleLabel(previewedRole, locale) : ''}
      />

      <RoleDeleteDialog
        key={roleToDelete?.id ?? 'none'}
        onClose={handleCloseDelete}
        onConfirm={handleDelete}
        role={roleToDelete}
        roleLabel={roleToDelete ? getRoleLabel(roleToDelete, locale) : ''}
      />

      <RoleAuditLogDialog
        auditLogs={auditLogs}
        count={auditLogCount}
        onPageChange={setAuditLogPage}
        open={openAuditLogDialog}
        page={auditLogPage}
        toggle={toggleAuditLogDialog}
      />
    </Layout>
  );
};

export default Roles;
