import {
  Box, Button, Chip, Stack, type Theme, Tooltip, Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';
import { FaCertificate } from 'react-icons/fa6';
import { FiCheck, FiPlus } from 'react-icons/fi';
import { IoWarning } from 'react-icons/io5';
import { useSelector, useDispatch } from 'react-redux';

import type { ReactNode } from 'react';

import ActionsMenu from '@/components/ActionsMenu';
import BooleanIcons from '@/components/BooleanIcons';
import Dialog from '@/components/Dialog';
import SendEmailFab from '@/components/EmailFab';
import Head from '@/components/Head';
import Items from '@/components/Items';
import ItemsStatus from '@/components/ItemsStatus';
import Layout from '@/components/layouts/Layout';
import RoleForUserForm from '@/containers/roles/RoleForUserForm';
import RolesChip from '@/containers/users/RolesChip';
import SendEmailForm from '@/containers/users/SendEmailForm';
import UserBans from '@/containers/users/user/UserBans';
import UserPlatforms from '@/containers/users/user/UserPlatforms';
import UserInfo from '@/containers/users/UserInfos';
import { useToggle } from '@/hooks/useToggle';
import { addRolesToUser, removeRolesForUser } from '@/redux/actions/role.action';
import {
  goToUsers, sendEmailToUser, toggleBanUserById, toggleUsersNotification,
} from '@/redux/actions/user.action';
import { getRoleUserRolesSelector } from '@/redux/reducers/role.reducer';
import { getUserUserSelector } from '@/redux/reducers/user.reducer';
import { ISelectOption } from '@/types/app.type';
import { IRole, RolesForUserInput } from '@/types/role.type';
import { SendEmailInput } from '@/types/user.type';
import { PREVIEW_PAGE_GRID } from '@/utils/constants';
import { displayDate, getAgeByBirthday } from '@/utils/date.utils';
import {
  getFullPhoneNumber, getSexLabelByValue, getUserFullName, isUserFromBO,
} from '@/utils/user.utils';

const ADD_ROLE_USER_FORM_ID = 'add-role-form-id';
const SEND_EMAIL_TO_USER_FORM_ID = 'send-email-to-user-form-id';

const User = () => {
  const {
    t,
  } = useTranslation(['common', 'user']);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(getUserUserSelector);
  const roles = useSelector(getRoleUserRolesSelector);
  const {
    open: openAddRoleToUser, toggle: toggleOpenAddRoleToUser,
  } = useToggle();
  const {
    open: isOpenEmailDialog, toggle: toggleOpenEmailFormDialog,
  } = useToggle();

  if (!user) return null;

  const userFullName = getUserFullName(user);

  const infosItems: ISelectOption[] = [
    {
      label: t('user:firstName'),
      value: user.get('firstName') ?? '',
    },
    {
      label: t('user:lastName'),
      value: user.get('lastName'),
    },
    {
      label: t('common:createdAt'),
      value: displayDate(user.createdAt),
    },
    {
      label: t('common:updatedAt'),
      value: displayDate(user.updatedAt),
    },
    {
      label: t('common:deletedAt'),
      value: displayDate(user.get('deletedAt')),
      hide: !user.has('deletedAt'),
    },
    {
      label: t('user:sex'),
      value: user.get('sex')
        ? getSexLabelByValue(user.get('sex')!)
        : '',
    },
    {
      label: t('user:aboutTheUser'),
      value: user.get('aboutMe') ?? '',
    },
    {
      label: t('user:birthday'),
      value: user.get('birthday')
        ? `${displayDate(
          user.get('birthday')?.iso,
          false
        )} (${getAgeByBirthday(user.get('birthday')?.iso)})`
        : '',
    },
  ];

  const contactItems: ISelectOption[] = [
    {
      label: t('user:email'),
      value: user.get('username') ?? '',
    },
    {
      label: t('user:phoneNumber'),
      value: user.get('phone')
        ? getFullPhoneNumber(user.get('phone')!)
        : '',
    },
    {
      label: t('user:address'),
      value: user.get('address') ?? '',
    },
  ];

  const statusItems: ISelectOption<ReactNode>[] = [
    {
      label: t('seen'),
      value: <BooleanIcons value={!!user.get('seen')} />,
    },
    {
      label: t('user:banned'),
      value: <BooleanIcons value={!!user.get('banned')} />,
    },
    {
      label: t('user:accountVerified'),
      value: <BooleanIcons value={!!user.get('verified')} />,
    },
  ];

  const handleGoToList = () => {
    navigate(goToUsers());
  };

  const toggleBanUser = () => {
    dispatch(toggleBanUserById(user.id, !user.get('banned')));
  };

  // for notification
  const handleMarkAsSeen = () => {
    dispatch(toggleUsersNotification([user.id], !user.get('seen')));
  };

  const onSubmitRoles = (values: RolesForUserInput) => {
    dispatch(addRolesToUser(user.id, values));
    toggleOpenAddRoleToUser();
  };

  const onSendEmailFormSubmit = async (values: SendEmailInput) => {
    await dispatch(sendEmailToUser(user, values));
    toggleOpenEmailFormDialog();
  };

  const handleRemoveRoleForUser = (role: IRole) => {
    dispatch(removeRolesForUser(user.id, [role]));
  };

  const menus = [
    {
      onClick: toggleBanUser,
      display: true,
      label: user.get('banned')
        ? t('common:activate')
        : t('user:ban'),
      icon: user.get('banned')
        ? <FiCheck css={(theme: Theme) => ({ color: theme.palette.success.main })} />
        : <IoWarning css={(theme: Theme) => ({ color: theme.palette.error.main })} />,
    },
    {
      onClick: handleMarkAsSeen,
      display: true,
      label: user.get('seen')
        ? t('markAsUnseen')
        : t('markAsSeen'),
      icon: user.get('seen')
        ? <FaCheck />
        : <FaCheckDouble />,
    },
  ];

  return (
    <Layout
      isCard={false}
      actions={(
        <ActionsMenu
          goToList={handleGoToList}
          label={user.get('lastName')}
          menus={menus}
        />
      )}
      title={(
        <>
          <span css={{ marginRight: 10 }}>{t('user:user')}</span>
          <span> - </span>
          <span>{user.get('lastName')}</span>
          <Tooltip title={t('user:accountVerified')}>
            <FaCertificate
              css={(theme: Theme) => ({ color: theme.palette.info.main, marginLeft: 10 })}
              size={16}
            />
          </Tooltip>
        </>
      )}
    >
      <Head title={t('user:user')} />
      <Grid container spacing={PREVIEW_PAGE_GRID.spacing}>
        {/* left */}
        <Grid size={PREVIEW_PAGE_GRID.left}>
          <Stack spacing={3}>
            <Layout cardTitle={t('common:details')}>
              <Items items={infosItems} />
            </Layout>
            <Layout cardTitle={t('user:contact')}>
              <Items items={contactItems} />
            </Layout>
            <Stack direction="row" spacing={2}>
              {/* --------- platforms --------- */}
              <Layout cardTitle={t('common:platforms')}>
                <UserPlatforms platforms={user.get('platforms')} />
              </Layout>
              {/* --------- platforms --------- */}
              <Layout cardTitle={t('user:bans.bansHistory')}>
                <UserBans bans={user.get('bans')} />
              </Layout>
            </Stack>
          </Stack>
        </Grid>

        {/* right */}
        <Grid size={PREVIEW_PAGE_GRID.right}>
          <Stack spacing={3}>
            <Layout>
              <UserInfo user={user} />
            </Layout>

            {/* show add or edit role only for user created from BO */}
            {isUserFromBO(user) && (
              <Layout cardTitle={t('user:role.roles')}>
                {roles.length > 0
                  ? (
                    <Stack direction="row" spacing={1}>
                      <RolesChip onRemove={handleRemoveRoleForUser} roles={roles} />
                      <Chip
                        color="primary"
                        label="+"
                        onClick={toggleOpenAddRoleToUser}
                        sx={{ fontSize: 22 }}
                      />
                    </Stack>
                  )
                  : (
                    <div css={{ marginTop: 2 }}>
                      <Stack spacing={1}>
                        <Typography color="textSecondary" variant="body2">
                          {t('user:role.userHasNotPost')}
                        </Typography>
                        <div>
                          <Button onClick={toggleOpenAddRoleToUser} size="small" startIcon={<FiPlus />}>
                            {t('user:role.addPost')}
                          </Button>
                        </div>
                      </Stack>
                    </div>
                  )}
              </Layout>
            )}

            <Layout cardTitle="Status">
              <ItemsStatus entity={user} items={statusItems} />
            </Layout>
          </Stack>
        </Grid>
      </Grid>

      <SendEmailFab onClick={toggleOpenEmailFormDialog} />

      <Dialog
        fullWidth
        formId={SEND_EMAIL_TO_USER_FORM_ID}
        maxWidth="sm"
        open={isOpenEmailDialog}
        primaryButtonText={t('send')}
        title={t('user:sendEmailTo', { name: userFullName })}
        toggle={toggleOpenEmailFormDialog}
      >
        <SendEmailForm
          formId={SEND_EMAIL_TO_USER_FORM_ID}
          initialValues={{ email: user.get('email') }}
          onSubmit={onSendEmailFormSubmit}
        />
      </Dialog>

      <Dialog
        fullWidth
        formId={ADD_ROLE_USER_FORM_ID}
        maxWidth="sm"
        open={openAddRoleToUser}
        title={t('user:role.addRolesForThisUser')}
        toggle={toggleOpenAddRoleToUser}
      >
        <Box sx={{ mt: 2 }}>
          <RoleForUserForm formId={ADD_ROLE_USER_FORM_ID} onSubmit={onSubmitRoles} userRoles={roles} />
        </Box>
      </Dialog>
    </Layout>
  );
};

export default User;
