import { Outlet, createRoute } from '@tanstack/react-router';
import { z } from 'zod';

import AuthRouteLayout from '@/containers/auth/AuthRouteLayout';
import ConfirmAccount from '@/pages/auth/ConfirmAccount';
import ConfirmResetPasswordCodeSentByEmail from '@/pages/auth/ConfirmResetPasswordCodeSentByEmail';
import ResetPassword from '@/pages/auth/ResetPassword';
import SendEmailResetPassword from '@/pages/auth/SendEmailResetPassword';
import { onEnterConfirmationCode, onEnterResetPassword, onEnterSendResetPasswordEmail } from '@/redux/actions/auth.action';
import { onEnter } from '@/redux/actions/util.action';
import { PATH_NAMES } from '@/utils/pathnames';

import { appLayout } from '../routes';

const accountPublicLayout = createRoute({
  getParentRoute: () => appLayout,
  component: AuthRouteLayout,
  path: PATH_NAMES.account.root,
});

const verifyAccountRoute = createRoute({
  getParentRoute: () => accountPublicLayout,
  component: ConfirmAccount,
  path: PATH_NAMES.account.verifyAccount,
  beforeLoad: onEnter(onEnterConfirmationCode),
});

const codeToResetPasswordAccountRoute = createRoute({
  getParentRoute: () => accountPublicLayout,
  component: ConfirmResetPasswordCodeSentByEmail,
  path: PATH_NAMES.account.confirmResetPasswordCode,
});

// send email reset password and rest password layout
const resetPasswordPublicLayout = createRoute({
  getParentRoute: () => accountPublicLayout,
  component: () => <Outlet />,
  path: PATH_NAMES.account.resetPassword,
});

const senEmailResetPasswordRoute = createRoute({
  getParentRoute: () => resetPasswordPublicLayout,
  component: SendEmailResetPassword,
  beforeLoad: onEnter(onEnterSendResetPasswordEmail),
  path: '/',
});

const resetPasswordRoute = createRoute({
  parseParams: (params: {
    encryptedEmail: string;
  }) => ({
    // string because it's encrypted encryptedEmail
    encryptedEmail: z.string().parse(params.encryptedEmail),
  }),
  getParentRoute: () => resetPasswordPublicLayout,
  beforeLoad: onEnter(onEnterResetPassword),
  component: ResetPassword,
  path: '/$encryptedEmail',
});

const accountPublicRoutes = accountPublicLayout.addChildren([
  verifyAccountRoute,
  codeToResetPasswordAccountRoute,
  resetPasswordPublicLayout.addChildren([senEmailResetPasswordRoute, resetPasswordRoute]),
]);

export default accountPublicRoutes;
