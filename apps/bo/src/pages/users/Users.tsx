import {
  IconButton, ListItem, ListItemAvatar, ListItemText,
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import {
  type MouseEvent, type ReactNode, useCallback, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { FiSend } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import Avatar from '@/components/Avatar';
import BooleanIcons from '@/components/BooleanIcons';
import ButtonActions from '@/components/ButtonActions';
import Dialog from '@/components/Dialog';
import SearchInput from '@/components/form/inputs/SearchInput';
import Head from '@/components/Head';
import ListWithSelection from '@/components/table/ListWithSelection';
import i18n from '@/config/i18n';
import { usersTabOptions } from '@/constants/user.constants';
import RolesChip from '@/containers/users/RolesChip';
import SendEmailForm from '@/containers/users/SendEmailForm';
import UserAdvancedFilterForm from '@/containers/users/UserAdvancedFilterForm';
import { useProtect } from '@/hooks/useProtect';
import {
  deleteUserById, deleteUsersById, goToUser, loadUsers, sendEmailToUser,
} from '@/redux/actions/user.action';
import {
  getUserCountSelector, getUserFiltersSelector, getUserUsersSelector,
} from '@/redux/reducers/user.reducer';
import { usersRoute } from '@/routes/protected/users.routes';
import { IQueriesInput, IRenderSearchProps, ITableHeadCell } from '@/types/app.type';
import {
  IUser, IUsersRouteSearchParams, PlatformEnum, SendEmailInput,
} from '@/types/user.type';
import { isCurrentTab } from '@/utils/app.utils';
import { displayDate } from '@/utils/date.utils';
import { getUserFullName } from '@/utils/user.utils';

const SEND_EMAIL_TO_USER_FORM_ID = 'send-email-form-id';

interface IData {
  id: string;
  fullName: string;
  email: string;
  createdAt: ReactNode;
  roles: ReactNode;
  verified: ReactNode;
  actions: ReactNode;
}

const headCells: ITableHeadCell<keyof IData>[] = [
  {
    id: 'fullName',
    label: i18n.t('user:fullName'),
  },
  {
    id: 'email',
    label: i18n.t('user:email'),
    align: 'center',
  },
  {
    id: 'verified',
    label: i18n.t('user:accountVerified'),
    align: 'center',
  },
  {
    id: 'createdAt',
    align: 'right',
    label: i18n.t('common:createdAt'),
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

const collection = '_User';

const Users = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const users = useSelector(getUserUsersSelector);
  const count = useSelector(getUserCountSelector);
  const filters = useSelector(getUserFiltersSelector);
  const searchParams = usersRoute.useSearch();

  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const {
    t,
  } = useTranslation();

  const {
    canDelete,
    canPreview,
    canEdit,
    canDestroy,
  } = useProtect(collection);

  // delete a row
  const handleDelete = useCallback(
    (id: string): void => {
      dispatch(deleteUserById(id, true));
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

  const handleSendEmailFormSubmit = async (values: SendEmailInput) => {
    if (!selectedUser) return;
    await dispatch(sendEmailToUser(selectedUser, values));
    handleCloseDialog();
  };

  const handleUpdateData = (queries: IQueriesInput) => {
    const newQueries = { ...queries, filters: { ...filters, ...queries.filters } };

    dispatch(loadUsers(newQueries));
  };

  // table data
  const dataTable = useMemo((): IData[] => {
    const isAdminTab = searchParams.tab === t('user:route.administrators');
    const isRecycleBin = canDestroy && isCurrentTab(searchParams?.tab);

    const usersData = users.map((user: IUser) => {
      // default data
      const data: Record<string, any> = {
        id: user.id,
        fullName: (
          <ListItem sx={{ p: 0 }}>
            <ListItemAvatar sx={{ mr: 2 }}>
              <Avatar size={36} sx={{ marginLeft: 'auto', marginRight: 0 }} user={user} />
            </ListItemAvatar>
            <ListItemText primary={user.get('lastName')} secondary={user.get('firstName')} />
          </ListItem>
        ),
        email: user.get('username'),
        verified: <BooleanIcons value={!!user.get('verified')} />,
        createdAt: displayDate(user.createdAt, false, true),
        roles: isAdminTab ? <RolesChip roles={user.get('roles') || []} /> : null,
        actions: isRecycleBin
          ? (
            <ActionsMenu
              label={user.get('lastName')}
              onPreview={() => handlePreview(user.id)}
              type="icon"
            />
          )
          : (
            <ButtonActions
              value={getUserFullName(user)}
              onDelete={canDelete
                ? () => handleDelete(user.id)
                : undefined}
              onPreview={canPreview
                ? () => handlePreview(user.id)
                : undefined}
            >
              <IconButton aria-label="sendMail" onClick={handleSelectRow(user)}>
                <FiSend size={20} />
              </IconButton>
            </ButtonActions>
          ),
      };

      return data as IData;
    });

    return usersData;
  }, [
    users,
    handleDelete,
    handlePreview,
    t,
    canDelete,
    canPreview,
    canDestroy,
    searchParams.tab,
  ]);

  return (
    <>
      <Head title="Users" />
      <ListWithSelection<IData>
        canDelete={canDelete}
        canDestroy={canDestroy}
        canUpdate={canEdit}
        count={count}
        defaultFilters={getDefaultFilters(searchParams)}
        enableMultipleSelect={!canDestroy}
        headCells={headCells}
        items={dataTable}
        onDeleteSelected={handleDeleteSelected}
        onRowClick={handlePreview}
        onUpdateData={handleUpdateData}
        tabs={usersTabOptions}
        renderFilter={(props: IRenderSearchProps) => (
          <>
            <SearchInput onChange={props.onSearch} placeholder={t('user:searchByNameOrEmail')} />
            <UserAdvancedFilterForm onSubmit={props.onAdvancedSearch} />
          </>
        )}
      />
      <Dialog
        fullWidth
        formId={SEND_EMAIL_TO_USER_FORM_ID}
        maxWidth="sm"
        open={!!selectedUser}
        primaryButtonText={t('send')}
        toggle={handleCloseDialog}
        title={selectedUser
          ? t('user:sendEmailTo', { name: getUserFullName(selectedUser) })
          : t('sendEmail')}
      >
        {selectedUser && (
          <SendEmailForm
            formId={SEND_EMAIL_TO_USER_FORM_ID}
            initialValues={{ email: selectedUser.get('email') }}
            onSubmit={handleSendEmailFormSubmit}
          />
        )}
      </Dialog>
    </>
  );
};

export default Users;
