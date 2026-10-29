
import { Box, Button, TableFooter } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';

import AddFab from '@/components/AddFab';
import ButtonActions from '@/components/ButtonActions';
import Dialog from '@/components/Dialog';
import EmptyData from '@/components/EmptyData';
import ConfirmDeletionFormModalAction from '@/components/form/ConfirmDeletionFormModalAction';
import Layout from '@/components/layouts/Layout';
import { useToggle } from '@/hooks/useToggle';
import {
  createRole, destroyRole, loadRoles, updateRole,
} from '@/redux/actions/role.action';
import { getRoleRolesSelector } from '@/redux/reducers/role.reducer';
import { IRole, IRoleInput } from '@/types/role.type';
import { ROLE_DEFAULT_LIMIT } from '@/utils/constants';
import { displayDate } from '@/utils/date.utils';
import { lowerFirstLetter } from '@/utils/utils';


import RoleForm from '../containers/roles/RoleForm';

const ROLE_FORM_ID = 'role-form-id';

const sx = { tableHeadCell: { color: '#fff' } };

const Roles = () => {
  const dispatch = useDispatch();
  const {
    t,
  } = useTranslation(['common', 'user']);
  const roles = useSelector(getRoleRolesSelector);
  const {
    open: openAddFormDialog, toggle: toggleAddFormDialog,
  } = useToggle();
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null);
  const [page, setPage] = useState<number>(0);

  const clearSelectedRole = () => setSelectedRole(null);

  const handleRoleFormSubmit = async (values: IRoleInput) => {
    if (selectedRole) {
      await dispatch(updateRole(selectedRole.get('name'), values));
      clearSelectedRole();
      return;
    }
    await dispatch(createRole(values));
    toggleAddFormDialog();
  };

  const handleDelete = (role: IRole) => {
    dispatch(destroyRole(role.id));
  };

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
    <Layout title={t('user:role.roles')}>
      {roles?.length === 0
        ? (
          <EmptyData />
        )
        : (
          <TableContainer>
            <Table aria-label="table">
              <TableHead sx={{ bgcolor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={sx.tableHeadCell}>{t('common:name')}</TableCell>
                  <TableCell sx={sx.tableHeadCell}>{t('common:createdAt')}</TableCell>
                  <TableCell sx={sx.tableHeadCell}>{t('user:numberOfUsers')}</TableCell>
                  <TableCell align="right" sx={sx.tableHeadCell}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role, index) => (
                  <TableRow key={role.get('name') + index} sx={{ '& > *': { borderBottom: 'unset' } }}>
                    <TableCell scope="row">{role.get('name')}</TableCell>
                    <TableCell scope="row">{displayDate(role.createdAt, false, true)}</TableCell>
                    <TableCell scope="row">{role.get('count') || 0}</TableCell>
                    <TableCell scope="row">
                      <ButtonActions
                        onEdit={() => setSelectedRole(role)}
                        value={role.get('name')}
                        dialogDescription={
                          (role.get('count') ?? 0) > 0
                            ? t('user:role.sureToDeleteRoleWithUsers', { name: role.get('name'), userCount: role.get('count') })
                            : null
                        }
                        onDelete={(role.get('count') ?? 0) < 1
                          ? () => handleDelete(role)
                          : undefined}
                      >
                        {(role.get('count') ?? 0) > 0 && (
                          <ConfirmDeletionFormModalAction
                            label={lowerFirstLetter(t('user:role.thisRole'))}
                            onConfirmed={() => handleDelete(role)}
                            type={t('user:role.theRoleName')}
                            value={role.get('name')}
                          />
                        )}
                      </ButtonActions>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter />
            </Table>
            <Box className="flexRow flex1 justifyEnd" sx={{ mt: 2 }}>
              <Button onClick={handleLoadMode} sx={{ textTransform: 'inherit', fontSize: 16 }} variant="contained">
                {t('common:loadMore')}
              </Button>
            </Box>
          </TableContainer>
        )}

      <AddFab onClick={toggleAddFormDialog} />

      <Dialog
        fullScreen
        formId={ROLE_FORM_ID}
        open={selectedRole
          ? !!selectedRole
          : openAddFormDialog}
        title={selectedRole
          ? t('user:role.editRole', { role: selectedRole.get('name') })
          : t('user:role.addRole')}
        toggle={selectedRole
          ? clearSelectedRole
          : toggleAddFormDialog}
      >
        <RoleForm
          formId={ROLE_FORM_ID}
          onSubmit={handleRoleFormSubmit}
          roles={roles}
          selectedRole={selectedRole}
        />
      </Dialog>
    </Layout>
  );
};

export default Roles;
