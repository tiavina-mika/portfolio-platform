import {
  Box, Button, Stack, Theme,
} from '@mui/material';
import { BanTypeEnum } from '@shared/types';
import { hasVerifiedContacts } from '@shared/utils';
import { useNavigate } from '@tanstack/react-router';
import {
  ReactNode, Suspense, useEffect, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';
import {
  FiActivity, FiAlertTriangle, FiClock, FiCreditCard, FiEye, FiFileText, FiFlag, FiInbox, FiLifeBuoy, FiList,
  FiLock, FiLogOut, FiMail, FiMessageSquare, FiMonitor, FiPauseCircle, FiPhone, FiShield, FiShieldOff,
  FiSlash, FiSmartphone, FiUser, FiUserCheck,
} from 'react-icons/fi';
import { IoWarning } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';

import type { IUserAuditTrailEntry } from '@shared/types';

import ActionsMenu from '@/components/ActionsMenu';
import Dialog from '@/components/Dialog';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import PreviewSections from '@/components/layouts/PreviewSections';
import { HIGHEST_LEVEL_ROLES, usersTabOptions } from '@/constants/_core/user.constants';
import RoleForUserForm from '@/containers/_core/roles/RoleForUserForm';
import SendMessageForm from '@/containers/_core/users/SendMessageForm';
import AccountHelpReasonForm from '@/containers/_core/users/user/AccountHelpReasonForm';
import BanUserForm from '@/containers/_core/users/user/BanUserForm';
import ChangeMemberContactForm from '@/containers/_core/users/user/ChangeMemberContactForm';
import ChangeMemberCountryForm from '@/containers/_core/users/user/ChangeMemberCountryForm';
import ImpersonateUserForm from '@/containers/_core/users/user/ImpersonateUserForm';
import ImpersonationSessionPanel from '@/containers/_core/users/user/ImpersonationSessionPanel';
import ResetUserMfaDialog from '@/containers/_core/users/user/ResetUserMfaDialog';
import RevokeAllSessionsDialog from '@/containers/_core/users/user/RevokeAllSessionsDialog';
import SuspendUserForm from '@/containers/_core/users/user/SuspendUserForm';
import UserAccountHelp from '@/containers/_core/users/user/UserAccountHelp';
import UserAuditTrailTable from '@/containers/_core/users/user/UserAuditTrailTable';
import UserBans from '@/containers/_core/users/user/UserBans';
import UserContactDetails from '@/containers/_core/users/user/UserContactDetails';
import UserDetails from '@/containers/_core/users/user/UserDetails';
import UserEmergencyContact from '@/containers/_core/users/user/UserEmergencyContact';
import UserHeaderFacts from '@/containers/_core/users/user/UserHeaderFacts';
import UserNotificationsTable from '@/containers/_core/users/user/UserNotificationsTable';
import UserPageTitle from '@/containers/_core/users/user/UserPageTitle';
import UserPaymentsTable from '@/containers/_core/users/user/UserPaymentsTable';
import UserPlatforms from '@/containers/_core/users/user/UserPlatforms';
import UserRecordHistory from '@/containers/_core/users/user/UserRecordHistory';
import UserRecordViews from '@/containers/_core/users/user/UserRecordViews';
import UserReportsTable from '@/containers/_core/users/user/UserReportsTable';
import UserRoles from '@/containers/_core/users/user/UserRoles';
import UserSessions from '@/containers/_core/users/user/UserSessions';
import UserSmsFallbackStatus from '@/containers/_core/users/user/UserSmsFallbackStatus';
import UserSuspensionBanner from '@/containers/_core/users/user/UserSuspensionBanner';
import UserSuspensionSummary from '@/containers/_core/users/user/UserSuspensionSummary';
import UserTicketsTable from '@/containers/_core/users/user/UserTicketsTable';
import { useToggle } from '@/hooks/_core/useToggle';
import { useUserBlock } from '@/hooks/_core/useUserBlock';
import { loadAuditLogByUserId } from '@/redux/actions/_core/auditLog.action';
import { goToContact } from '@/redux/actions/_core/contact.action';
import {
  endImpersonationSessionById, impersonateUserById,
} from '@/redux/actions/_core/impersonation.action';
import { resetUserMfaById } from '@/redux/actions/_core/mfa.action';
import { goToNotification } from '@/redux/actions/_core/notification.action';
import { addRolesToUser, removeRolesForUser } from '@/redux/actions/_core/role.action';
import {
  banUserById, changeMemberContact, changeMemberCountry, goToUsers, liftUserBanById,
  resendMemberPhoneVerificationCode,
  sendMemberPasswordResetCode, sendMessageToUser, toggleUsersNotification,
} from '@/redux/actions/_core/user.action';
import {
  loadUserSessions, revokeAllUserSessionsById, revokeUserSessionById, suspendUserById,
} from '@/redux/actions/_core/userSession.action';
import { goToList, goToPreview } from '@/redux/actions/_core/util.action';
import { getAppCurrentUserSelector } from '@/redux/reducers/_core/app.reducer';
import { getAuditLogCurrentSelector } from '@/redux/reducers/_core/auditLog.reducer';
import {
  clearImpersonationSessionSlice, getImpersonationSessionSelector,
} from '@/redux/reducers/_core/impersonation.reducer';
import {
  getRoleCanManageStaffSelector, getRoleCurrentUserRolesSelector, getRoleRolesDelegationLoadingSelector,
  getRoleRolesDelegationSelector, getRoleUserRolesLoadingSelector, getRoleUserRolesSelector,
} from '@/redux/reducers/_core/role.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { getUserUserSelector } from '@/redux/reducers/_core/user.reducer';
import {
  getUserSessionsHasErrorSelector, getUserSessionsLoadingSelector, getUserSessionsSelector,
} from '@/redux/reducers/_core/userSession.reducer';
import {
  fetchUserAuditTrail, fetchUserNotifications, fetchUserPayments, fetchUserReportsAgainst,
  fetchUserReportsMade,
  fetchUserTickets,
  UserReportsExtra, UserTicketsExtra,
} from '@/services/_core/userBlock.service';
import { IPreviewGroup, IPreviewSection } from '@/types/_core/app.type';
import { IContact } from '@/types/_core/contact.type';
import { ImpersonateUserInput } from '@/types/_core/impersonation.type';
import { INotification } from '@/types/_core/notification.type';
import { IPayment } from '@/types/_core/payment.type';
import { IReport, ReportTargetTypeEnum } from '@/types/_core/report.type';
import { IRole, RolesForUserInput, UIRoleEnum } from '@/types/_core/role.type';
import {
  AccountHelpReasonInput, BanUserInput, ChangeMemberContactFormInput, ChangeMemberCountryFormInput, IUser,
  SendMessageFormInput,
  UserSectionGroup,
} from '@/types/_core/user.type';
import { SuspendUserInput } from '@/types/_core/userSession.type';
import { canAccessTo, getRoleLabel } from '@/utils/_core/role.utils';
import {
  getActiveTeamBan, getUserExtensions, getUserFullName, getUserSectionExtensions, getUserSuspensionSources,
  isUserFromBO, isUserSmsFallbackEnabled,
} from '@/utils/_core/user.utils';

const ADD_ROLE_USER_FORM_ID = 'add-role-form-id';
const SEND_MESSAGE_TO_USER_FORM_ID = 'send-message-to-user-form-id';
const BAN_USER_FORM_ID = 'ban-user-form-id';
const IMPERSONATE_USER_FORM_ID = 'impersonate-user-form-id';
const SUSPEND_USER_FORM_ID = 'suspend-user-form-id';
const RESEND_PHONE_CODE_FORM_ID = 'resend-phone-code-form-id';
const CHANGE_CONTACT_FORM_ID = 'change-contact-form-id';
const CHANGE_COUNTRY_FORM_ID = 'change-country-form-id';
const RESET_PASSWORD_FORM_ID = 'reset-password-form-id';

// the pages the record is read by, in the order the summary lists them
const GROUP_ORDER: UserSectionGroup[] = [
  'profile', 'access', 'activity', 'moderation', 'exchanges', 'history',
];

// a block of the page, placed within its group by `order` — a domain's own blocks slot in between
type OrderedSection = IPreviewSection & { group: UserSectionGroup; order: number };

const User = () => {
  const { t } = useTranslation(['common', 'user']);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(getUserUserSelector);
  const currentUser = useSelector(getAppCurrentUserSelector);
  const roles = useSelector(getRoleUserRolesSelector);
  const isRolesLoading = useSelector(getRoleUserRolesLoadingSelector);
  const sessions = useSelector(getUserSessionsSelector);
  const isSessionsLoading = useSelector(getUserSessionsLoadingSelector);
  const hasSessionsError = useSelector(getUserSessionsHasErrorSelector);
  const currentUserRoles = useSelector(getRoleCurrentUserRolesSelector);
  // the server lets an owner, a super administrator or the staff right change posts: the controls follow
  const canManageStaff = useSelector(getRoleCanManageStaffSelector);
  /*
   * a team lead may not change their own posts, nor those of an owner or a super administrator: the
   * server says so for this very account, and the controls stay out of reach until it has answered
   */
  const rolesDelegation = useSelector(getRoleRolesDelegationSelector);
  const isRolesDelegationLoading = useSelector(getRoleRolesDelegationLoadingSelector);
  const rolesLock = rolesDelegation?.lock;
  const canChangeRoles = canManageStaff && !isRolesDelegationLoading && !rolesLock;
  // the reset of another admin's second factor is for an owner alone, not for a super administrator
  const isCurrentUserOwner = currentUserRoles.some((role) => role.name === HIGHEST_LEVEL_ROLES[0]);
  const locale = useSelector(getSettingsLocaleSelector);
  // the posts that give the signed-in account its right over staff — named in the notice of a locked account
  const staffRoleLabels = currentUserRoles
    .filter((role) => role.ui?.includes(UIRoleEnum.STAFF))
    .map((role) => getRoleLabel(role, locale));
  const [roleToRemove, setRoleToRemove] = useState<IRole | null>(null);
  const impersonationSession = useSelector(getImpersonationSessionSelector);
  const currentAuditLog = useSelector(getAuditLogCurrentSelector);

  const { open: openAddRoleToUser, toggle: toggleOpenAddRoleToUser } = useToggle();
  const { open: isOpenMessageDialog, toggle: toggleOpenMessageFormDialog } = useToggle();
  const { open: isOpenBanDialog, toggle: toggleOpenBanDialog } = useToggle();
  const { open: isOpenImpersonateDialog, toggle: toggleOpenImpersonateDialog } = useToggle();
  const { open: isOpenRevokeAllSessionsDialog, toggle: toggleOpenRevokeAllSessionsDialog } = useToggle();
  const { open: isOpenResetMfaDialog, toggle: toggleOpenResetMfaDialog } = useToggle();
  const { open: isOpenSuspendDialog, toggle: toggleOpenSuspendDialog } = useToggle();
  const { open: isOpenResendCodeDialog, toggle: toggleOpenResendCodeDialog } = useToggle();
  const { open: isOpenChangeContactDialog, toggle: toggleOpenChangeContactDialog } = useToggle();
  const { open: isOpenChangeCountryDialog, toggle: toggleOpenChangeCountryDialog } = useToggle();
  const { open: isOpenResetPasswordDialog, toggle: toggleOpenResetPasswordDialog } = useToggle();

  const userId = user?.id;
  const payments = useUserBlock<IPayment>('payments', userId, fetchUserPayments);
  const reportsAgainst = useUserBlock<IReport, UserReportsExtra>(
    'reportsAgainst', userId, fetchUserReportsAgainst
  );
  const reportsMade = useUserBlock<IReport>('reportsMade', userId, fetchUserReportsMade);
  const tickets = useUserBlock<IContact, UserTicketsExtra>('tickets', userId, fetchUserTickets);
  const notifications = useUserBlock<INotification>('notifications', userId, fetchUserNotifications);
  const auditTrail = useUserBlock<IUserAuditTrailEntry>('auditTrail', userId, fetchUserAuditTrail);

  /*
   * the blocks a domain contributes, each reading its own data. Their hooks are called on every
   * render in registration order — the registry is filled once at startup and never changes. An
   * account not read yet stands in as an empty one: the page draws nothing until it is in.
   */
  const domainSections = getUserSectionExtensions().map((extension) => ({
    key: extension.key,
    group: extension.group,
    order: extension.order,
    section: extension.useSection(user ?? ({} as IUser)),
  }));

  const isDeleted = !!user?.deleted;
  const canImpersonate = canAccessTo(currentUserRoles, undefined, undefined, UIRoleEnum.IMPERSONATION);
  // closing someone's sessions or suspending them is an edit of the account, not a read of it
  const canUpdateUser = canAccessTo(currentUserRoles, '_User', 'update');

  useEffect(() => {
    if (userId && isDeleted) {
      dispatch(loadAuditLogByUserId(userId));
    }
  }, [userId, isDeleted, dispatch]);

  if (!user) return null;

  /*
   * a closed account has lost its name and its contacts: the name it had when it was closed is what
   * support still knows it by, so it comes before the fallbacks of the shared display identifier
   */
  const userFullName = (isDeleted && currentAuditLog?.fullNameBefore) ||
    getUserFullName(user, t('user:unnamedMember'));

  // what keeps the account out of the platform right now: a ban by the team, and any domain policy
  const teamBan = getActiveTeamBan(user);
  const suspensionSources = getUserSuspensionSources();
  const policyRows = suspensionSources.map((source) => ({
    key: source.key,
    label: source.label,
    suspension: source.getActive(user),
  }));
  const activePolicySuspensions = policyRows.flatMap((row) => (row.suspension ? [row.suspension] : []));
  const isSuspended = !!teamBan || activePolicySuspensions.length > 0;
  const isPermanentlyBanned = teamBan?.type === BanTypeEnum.PERMANENT;
  const canSuspend = canUpdateUser && !isDeleted && !isSuspended;
  const canLift = canUpdateUser && !isDeleted && isSuspended;

  const openReportsCount = reportsAgainst.extra?.openCount ?? 0;
  const openTicketsCount = tickets.extra?.openCount ?? 0;

  /*
   * ---------------------------------------- //
   * -------------- handlers ---------------- //
   * ---------------------------------------- //
   */
  const handleGoToList = () => navigate(goToUsers());

  // lifting the suspension lifts every cause of it at once: the team's ban and each policy's
  const handleLiftSuspension = () => {
    if (user.banned) dispatch(liftUserBanById(user.id));

    suspensionSources
      .filter((source) => !!source.getActive(user))
      .forEach((source) => dispatch(source.lift(user)));
  };

  const onBanFormSubmit = (values: BanUserInput) => {
    dispatch(banUserById(user.id, values));
    toggleOpenBanDialog();
  };

  /*
   * The dialog stays open on purpose: the link the server answers with is shown inside it, once,
   * and closing on submit is exactly why the whole feature was unusable — the session was created
   * and nothing ever handed the agent the way into it.
   */
  const onImpersonateFormSubmit = (values: ImpersonateUserInput) => {
    dispatch(impersonateUserById(user.id, values.reason));
  };

  const handleCloseImpersonateDialog = () => {
    if (impersonationSession) dispatch(clearImpersonationSessionSlice());
    toggleOpenImpersonateDialog();
  };

  const handleEndImpersonationSession = () => {
    if (!impersonationSession) return;
    dispatch(endImpersonationSessionById(impersonationSession.sessionId));
    toggleOpenImpersonateDialog();
  };

  const handleResetMfa = () => {
    dispatch(resetUserMfaById(user.id));
  };

  const handleRevokeAllSessions = (shouldSuspend: boolean) => {
    dispatch(revokeAllUserSessionsById(user.id, shouldSuspend));
  };

  const onSuspendFormSubmit = (values: SuspendUserInput) => {
    dispatch(suspendUserById(user.id, values));
    toggleOpenSuspendDialog();
  };

  /*
   * the three help actions close their dialog once asked: the answer (sent, or not sent) comes back
   * as a message, and the history block is read again by the action itself
   */
  const onResendCodeFormSubmit = async (values: AccountHelpReasonInput) => {
    await dispatch(resendMemberPhoneVerificationCode(user, values));
    toggleOpenResendCodeDialog();
  };

  const onChangeContactFormSubmit = async (values: ChangeMemberContactFormInput) => {
    await dispatch(changeMemberContact(user, values));
    toggleOpenChangeContactDialog();
  };

  const onChangeCountryFormSubmit = async (values: ChangeMemberCountryFormInput) => {
    await dispatch(changeMemberCountry(user, values));
    toggleOpenChangeCountryDialog();
  };

  const onResetPasswordFormSubmit = async (values: AccountHelpReasonInput) => {
    await dispatch(sendMemberPasswordResetCode(user, values));
    toggleOpenResetPasswordDialog();
  };

  const handleMarkAsSeen = () => {
    dispatch(toggleUsersNotification([user.id], !user.seen));
  };

  const handleConfirmRemoveRole = () => {
    if (roleToRemove) dispatch(removeRolesForUser(user.id, [roleToRemove]));
  };

  const handleCloseRemoveRole = () => setRoleToRemove(null);

  const onSubmitRoles = async (values: RolesForUserInput) => {
    const error = await dispatch(addRolesToUser(user.id, values));

    // a refusal of the server stays in the dialog, above the posts, rather than closing it on a failure
    if (!error) toggleOpenAddRoleToUser();
  };

  const onSendMessageFormSubmit = async (values: SendMessageFormInput) => {
    // the dialog only asks what to send and how — the recipient is the user being viewed
    await dispatch(sendMessageToUser(user, { ...values, userId: user.id }));
    toggleOpenMessageFormDialog();
  };

  const handleGoToAuditLog = () => {
    const auditLogTab = usersTabOptions.find((option) => option.key === 'auditLog');

    navigate(goToUsers({ tab: auditLogTab?.tab }));
  };

  const handleGoToUserPayments = () => navigate(goToList('payments', { user: user.id }));

  const menus = [
    {
      onClick: toggleOpenSuspendDialog,
      display: canSuspend,
      label: t('user:detail.menu.suspend'),
      icon: <FiPauseCircle />,
    },
    {
      onClick: toggleOpenBanDialog,
      display: canSuspend,
      label: t('user:ban'),
      icon: <IoWarning css={(theme: Theme) => ({ color: theme.palette.error.main })} />,
    },
    {
      onClick: handleLiftSuspension,
      display: canLift,
      label: t('user:detail.menu.lift'),
      icon: <FaCheck css={(theme: Theme) => ({ color: theme.palette.success.main })} />,
    },
    {
      onClick: toggleOpenRevokeAllSessionsDialog,
      display: canUpdateUser && !isDeleted && sessions.length > 0,
      label: t('user:sessions.signOutAll'),
      icon: <FiLogOut />,
    },
    {
      onClick: toggleOpenResetMfaDialog,
      // OWNER only: the server refuses anyone else, so the entry is not offered to them
      display: isCurrentUserOwner && !isDeleted && !!user.mfa?.enabled && user.id !== currentUser?.id,
      label: t('user:mfa.adminReset.title'),
      icon: <FiShieldOff />,
    },
    {
      onClick: handleMarkAsSeen,
      // saving `seen` is an update on the user, which a read-only role does not hold
      display: canUpdateUser,
      label: user.seen ? t('markAsUnseen') : t('markAsSeen'),
      icon: user.seen ? <FaCheck /> : <FaCheckDouble />,
    },
    {
      onClick: toggleOpenImpersonateDialog,
      // a deleted account has nothing left to support, and the right is a dedicated one
      display: !isDeleted && canImpersonate,
      label: t('user:impersonation.loginAsUser'),
      icon: <FiUserCheck />,
    },
    {
      onClick: handleGoToUserPayments,
      display: true,
      label: t('user:detail.menu.viewPayments'),
      icon: <FiCreditCard />,
    },
    {
      onClick: handleGoToAuditLog,
      display: isDeleted,
      label: t('user:detail.menu.viewAudit'),
      icon: <FiList />,
    },
  ];

  /*
   * ---------------------------------------- //
   * --------------- blocks ----------------- //
   * ---------------------------------------- //
   */
  const coreSections: OrderedSection[] = [
    // ------------- profile ------------- //
    {
      id: 'details',
      group: 'profile',
      order: 10,
      label: t('user:detail.sections.details'),
      icon: <FiFileText />,
      content: <UserDetails deletionAudit={currentAuditLog} user={user} />,
    },
    {
      id: 'contact',
      group: 'profile',
      order: 20,
      label: t('user:detail.sections.contact'),
      icon: <FiPhone />,
      content: <UserContactDetails user={user} />,
    },
    {
      id: 'emergencyContact',
      group: 'profile',
      order: 30,
      label: t('user:detail.sections.emergencyContact'),
      icon: <FiAlertTriangle />,
      content: <UserEmergencyContact emergencyContact={user.emergencyContact} />,
    },
    // ------------- access ------------- //
    {
      // where support signs a stolen phone out; a closed account has no session left to show
      id: 'sessions',
      group: 'access',
      order: 10,
      label: t('user:detail.sections.sessions'),
      icon: <FiMonitor />,
      hide: isDeleted,
      count: sessions.length || undefined,
      countLoading: isSessionsLoading && sessions.length === 0,
      content: (
        <UserSessions
          canRevoke={canUpdateUser}
          canSuspend={canSuspend}
          hasError={hasSessionsError}
          loading={isSessionsLoading}
          onRetry={() => dispatch(loadUserSessions(user.id))}
          onRevoke={(sessionId: string) => dispatch(revokeUserSessionById(user.id, sessionId))}
          onRevokeAll={toggleOpenRevokeAllSessionsDialog}
          onSuspend={toggleOpenSuspendDialog}
          sessions={sessions}
        />
      ),
    },
    {
      // support's way back into an account the member can no longer reach — an edit of the account
      id: 'accountHelp',
      group: 'access',
      order: 15,
      label: t('user:detail.sections.accountHelp'),
      icon: <FiLifeBuoy />,
      hide: isDeleted || !canUpdateUser,
      content: (
        <UserAccountHelp
          onChangeContact={toggleOpenChangeContactDialog}
          onChangeCountry={toggleOpenChangeCountryDialog}
          onResendCode={toggleOpenResendCodeDialog}
          onResetPassword={toggleOpenResetPasswordDialog}
          user={user}
        />
      ),
    },
    {
      id: 'platforms',
      group: 'access',
      order: 20,
      label: t('user:detail.sections.platforms'),
      icon: <FiSmartphone />,
      content: <UserPlatforms platforms={user.platforms} />,
    },
    {
      // an account created from the back-office is the only one a post can be granted to
      id: 'roles',
      group: 'access',
      order: 30,
      label: t('user:detail.sections.roles'),
      icon: <FiShield />,
      hide: !isUserFromBO(user),
      count: roles.length || undefined,
      countLoading: isRolesLoading,
      content: (
        <UserRoles
          loading={isRolesLoading}
          lock={rolesLock}
          onAdd={canChangeRoles ? toggleOpenAddRoleToUser : undefined}
          onRemove={canChangeRoles ? (role: IRole) => setRoleToRemove(role) : undefined}
          roles={roles}
          staffRoleLabels={staffRoleLabels}
        />
      ),
    },
    // ------------- activity ------------- //
    {
      id: 'payments',
      group: 'activity',
      order: 60,
      label: t('user:detail.sections.payments'),
      icon: <FiCreditCard />,
      status: payments.status,
      onRetry: payments.retry,
      content: (
        <UserPaymentsTable
          count={payments.count}
          onOpen={(payment: IPayment) => navigate(goToPreview('payments', payment.id))}
          onViewAll={handleGoToUserPayments}
          payments={payments.items}
        />
      ),
    },
    // ------------- moderation ------------- //
    {
      id: 'suspension',
      group: 'moderation',
      order: 10,
      label: t('user:detail.sections.suspension'),
      icon: <FiLock />,
      alertBadge: isSuspended,
      count: isSuspended ? 1 : undefined,
      rightActions: (canSuspend || canLift) && (
        <Button
          onClick={canLift ? handleLiftSuspension : toggleOpenSuspendDialog}
          size="small"
          variant="outlined"
        >
          {canLift ? t('user:detail.menu.lift') : t('user:detail.menu.suspend')}
        </Button>
      ),
      content: <UserSuspensionSummary policyRows={policyRows} teamBan={teamBan} />,
    },
    {
      id: 'bans',
      group: 'moderation',
      order: 20,
      label: t('user:detail.sections.bans'),
      icon: <FiSlash />,
      count: user.bans?.length || undefined,
      content: <UserBans bans={user.bans} />,
    },
    {
      id: 'reportsAgainst',
      group: 'moderation',
      order: 30,
      label: t('user:detail.sections.reportsAgainst'),
      icon: <FiFlag />,
      status: reportsAgainst.status,
      onRetry: reportsAgainst.retry,
      count: openReportsCount || undefined,
      countLoading: reportsAgainst.status === 'loading',
      alertBadge: true,
      subtitle: openReportsCount > 0
        ? t('user:detail.reports.subtitlePending', { count: openReportsCount })
        : undefined,
      content: (
        <UserReportsTable
          count={reportsAgainst.count}
          direction="against"
          reports={reportsAgainst.items}
          onViewAll={() => navigate(goToList('reports', {
            targetType: ReportTargetTypeEnum.USER, targetId: user.id,
          }))}
        />
      ),
    },
    {
      id: 'reportsMade',
      group: 'moderation',
      order: 40,
      label: t('user:detail.sections.reportsMade'),
      icon: <FiAlertTriangle />,
      status: reportsMade.status,
      onRetry: reportsMade.retry,
      content: <UserReportsTable count={reportsMade.count} direction="made" reports={reportsMade.items} />,
    },
    // ------------- exchanges ------------- //
    {
      id: 'tickets',
      group: 'exchanges',
      order: 10,
      label: t('user:detail.sections.tickets'),
      icon: <FiMessageSquare />,
      status: tickets.status,
      onRetry: tickets.retry,
      count: openTicketsCount || undefined,
      countLoading: tickets.status === 'loading',
      alertBadge: true,
      content: (
        <UserTicketsTable
          onOpen={(ticket: IContact) => navigate(goToContact(ticket.id))}
          tickets={tickets.items}
          userId={user.id}
        />
      ),
    },
    {
      id: 'notifications',
      group: 'exchanges',
      order: 20,
      label: t('user:detail.sections.notifications'),
      icon: <FiInbox />,
      status: notifications.status,
      onRetry: notifications.retry,
      content: (
        <Stack sx={{ gap: 2 }}>
          {/* a closed account was erased with its contacts: its switches are not worth stating */}
          {!isDeleted && <UserSmsFallbackStatus isEnabled={isUserSmsFallbackEnabled(user)} />}
          <UserNotificationsTable
            notifications={notifications.items}
            onOpen={(notification: INotification) => navigate(goToNotification(notification.id))}
            userId={user.id}
          />
        </Stack>
      ),
    },
    // ------------- history ------------- //
    {
      id: 'history',
      group: 'history',
      order: 10,
      label: t('user:detail.sections.history'),
      icon: <FiClock />,
      content: <UserRecordHistory user={user} />,
    },
    {
      id: 'views',
      group: 'history',
      order: 20,
      label: t('user:detail.sections.views'),
      icon: <FiEye />,
      subtitle: user.seenCount ? t('user:detail.views.subtitle', { count: user.seenCount }) : undefined,
      content: <UserRecordViews currentUserId={currentUser?.objectId} user={user} />,
    },
    {
      id: 'auditTrail',
      group: 'history',
      order: 30,
      label: t('user:detail.sections.auditTrail'),
      icon: <FiActivity />,
      status: auditTrail.status,
      onRetry: auditTrail.retry,
      content: (
        <UserAuditTrailTable
          entries={auditTrail.items}
          onViewAll={isDeleted ? handleGoToAuditLog : undefined}
        />
      ),
    },
  ];

  const sections: IPreviewSection[] = [
    ...coreSections,
    ...domainSections.map(({
      key, group, order, section,
    }): OrderedSection => ({
      ...section, id: key, group, order,
    })),
  ].sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) || a.order - b.order);

  const groupIcons: Record<UserSectionGroup, ReactNode> = {
    profile: <FiUser />,
    access: <FiLock />,
    activity: <FiActivity />,
    moderation: <FiShield />,
    exchanges: <FiMail />,
    history: <FiClock />,
  };

  const groups: IPreviewGroup[] = GROUP_ORDER.map((key) => ({
    key,
    label: t(`user:detail.groups.${key}`),
    icon: groupIcons[key],
    // the activity page holds too many blocks for one screen: its blocks are listed under it
    listSections: key === 'activity',
  }));

  // the figures worth checking before a page is opened: the devices signed in, and what needs acting on
  const accessGroup = groups.find((group) => group.key === 'access')!;
  const moderationGroup = groups.find((group) => group.key === 'moderation')!;
  const exchangesGroup = groups.find((group) => group.key === 'exchanges')!;

  if (!isDeleted) {
    accessGroup.count = sessions.length || undefined;
    accessGroup.countLoading = isSessionsLoading && sessions.length === 0;
  }

  moderationGroup.count = (openReportsCount + (isSuspended ? 1 : 0)) || undefined;
  moderationGroup.countLoading = reportsAgainst.status === 'loading';
  moderationGroup.alertBadge = true;
  exchangesGroup.count = openTicketsCount || undefined;
  exchangesGroup.countLoading = tickets.status === 'loading';
  exchangesGroup.alertBadge = true;

  return (
    <Layout
      isCard={false}
      pretitle={t('user:user')}
      actions={(
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
          {!isDeleted && (
            <Button onClick={toggleOpenMessageFormDialog} startIcon={<FiMail />} variant="outlined">
              {t('user:detail.sendMessage')}
            </Button>
          )}
          <ActionsMenu
            goToList={handleGoToList}
            label={userFullName}
            menus={menus}
            type="preview"
          />
        </Stack>
      )}
      description={(
        <UserHeaderFacts
          user={user}
          domainFacts={getUserExtensions('headerFact').map((extension) => (
            // no placeholder: a fact only shows on the accounts it applies to
            <Suspense fallback={null} key={extension.key}>
              <extension.Component user={user} />
            </Suspense>
          ))}
        />
      )}
      title={(
        <UserPageTitle
          isFromBO={isUserFromBO(user)}
          isPermanentlyBanned={isPermanentlyBanned}
          isSuspended={isSuspended}
          isVerified={hasVerifiedContacts(user)}
          name={userFullName}
          user={user}
        />
      )}
    >
      <Head title={userFullName || t('user:user')} />
      <PreviewSections
        groups={groups}
        sections={sections}
        header={(isSuspended || isDeleted) && (
          <UserSuspensionBanner
            canLift={canLift}
            deletedAt={isDeleted ? user.deletedAt : undefined}
            onLift={handleLiftSuspension}
            policySuspensions={activePolicySuspensions}
            teamBan={teamBan}
          />
        )}
      />

      <Dialog
        fullWidth
        formId={SEND_MESSAGE_TO_USER_FORM_ID}
        maxWidth="sm"
        open={isOpenMessageDialog}
        primaryButtonText={t('send')}
        title={t('user:sendMessage.sendTo', { name: userFullName })}
        toggle={toggleOpenMessageFormDialog}
      >
        <SendMessageForm
          formId={SEND_MESSAGE_TO_USER_FORM_ID}
          onSubmit={onSendMessageFormSubmit}
          user={user}
        />
      </Dialog>

      <Dialog
        fullWidth
        formId={BAN_USER_FORM_ID}
        maxWidth="sm"
        open={isOpenBanDialog}
        primaryButtonText={t('user:bans.ban')}
        title={t('user:bans.banThisUser', { name: userFullName })}
        toggle={toggleOpenBanDialog}
      >
        <BanUserForm formId={BAN_USER_FORM_ID} onSubmit={onBanFormSubmit} />
      </Dialog>

      <ResetUserMfaDialog
        isLocked={!!user.mfa?.isLocked}
        onConfirm={handleResetMfa}
        open={isOpenResetMfaDialog}
        toggle={toggleOpenResetMfaDialog}
        userFullName={userFullName}
      />

      <RevokeAllSessionsDialog
        canSuspend={canSuspend}
        onConfirm={handleRevokeAllSessions}
        open={isOpenRevokeAllSessionsDialog}
        toggle={toggleOpenRevokeAllSessionsDialog}
        userFullName={userFullName}
      />

      <Dialog
        fullWidth
        formId={SUSPEND_USER_FORM_ID}
        maxWidth="sm"
        open={isOpenSuspendDialog}
        primaryButtonText={t('user:sessions.suspension.suspend')}
        title={t('user:sessions.suspension.title', { name: userFullName })}
        toggle={toggleOpenSuspendDialog}
      >
        <SuspendUserForm formId={SUSPEND_USER_FORM_ID} onSubmit={onSuspendFormSubmit} />
      </Dialog>

      <Dialog
        fullWidth
        formId={RESEND_PHONE_CODE_FORM_ID}
        maxWidth="sm"
        open={isOpenResendCodeDialog}
        primaryButtonText={t('user:detail.accountHelp.resendCode.action')}
        title={t('user:detail.accountHelp.resendCode.dialogTitle', { name: userFullName })}
        toggle={toggleOpenResendCodeDialog}
      >
        <AccountHelpReasonForm formId={RESEND_PHONE_CODE_FORM_ID} onSubmit={onResendCodeFormSubmit} />
      </Dialog>

      <Dialog
        fullWidth
        formId={CHANGE_CONTACT_FORM_ID}
        maxWidth="sm"
        open={isOpenChangeContactDialog}
        primaryButtonText={t('user:detail.accountHelp.changeContact.action')}
        title={t('user:detail.accountHelp.changeContact.dialogTitle', { name: userFullName })}
        toggle={toggleOpenChangeContactDialog}
      >
        <ChangeMemberContactForm formId={CHANGE_CONTACT_FORM_ID} onSubmit={onChangeContactFormSubmit} />
      </Dialog>

      <Dialog
        fullWidth
        formId={CHANGE_COUNTRY_FORM_ID}
        maxWidth="sm"
        open={isOpenChangeCountryDialog}
        primaryButtonText={t('user:detail.accountHelp.changeCountry.action')}
        title={t('user:detail.accountHelp.changeCountry.dialogTitle', { name: userFullName })}
        toggle={toggleOpenChangeCountryDialog}
      >
        <ChangeMemberCountryForm
          currentCountry={user.country}
          formId={CHANGE_COUNTRY_FORM_ID}
          onSubmit={onChangeCountryFormSubmit}
        />
      </Dialog>

      <Dialog
        fullWidth
        formId={RESET_PASSWORD_FORM_ID}
        maxWidth="sm"
        open={isOpenResetPasswordDialog}
        primaryButtonText={t('user:detail.accountHelp.resetPassword.action')}
        title={t('user:detail.accountHelp.resetPassword.dialogTitle', { name: userFullName })}
        toggle={toggleOpenResetPasswordDialog}
      >
        <AccountHelpReasonForm formId={RESET_PASSWORD_FORM_ID} onSubmit={onResetPasswordFormSubmit} />
      </Dialog>

      <Dialog
        fullWidth
        /*
         * the form's submit button disappears once the session exists — what is left on screen is
         * the link itself, and its own "end the session" action
         */
        formId={impersonationSession ? undefined : IMPERSONATE_USER_FORM_ID}
        maxWidth="sm"
        open={isOpenImpersonateDialog}
        primaryButtonText={impersonationSession ? undefined : t('user:impersonation.startSession')}
        title={t('user:impersonation.loginAsThisUser', { name: userFullName })}
        toggle={handleCloseImpersonateDialog}
      >
        {impersonationSession ? (
          <ImpersonationSessionPanel
            onEndSession={handleEndImpersonationSession}
            session={impersonationSession}
            userFullName={userFullName}
          />
        ) : (
          <ImpersonateUserForm formId={IMPERSONATE_USER_FORM_ID} onSubmit={onImpersonateFormSubmit} />
        )}
      </Dialog>

      <Dialog
        buttonColor="error"
        onPrimaryButtonAction={handleConfirmRemoveRole}
        open={!!roleToRemove}
        primaryButtonText={t('user:role.removeRole')}
        title={t('user:role.removeRoleTitle')}
        toggle={handleCloseRemoveRole}
        description={t('user:role.confirmRemoveRole', {
          role: roleToRemove ? getRoleLabel(roleToRemove, locale) : '',
          name: userFullName,
        })}
      />

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
