import { Outlet, createRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { z } from 'zod';

// eslint-disable-next-line import/order -- pre-existing import/order + pathGroups quirk, unrelated to this task
import { onEnterConfirmationCode, onEnterResetPassword, onEnterSendResetPasswordEmail } from '@/redux/actions/_core/auth.action';

const AuthRouteLayout = lazy(() => import('@/containers/_core/auth/AuthRouteLayout'));
const ConfirmAccount = lazy(() => import('@/pages/_core/auth/ConfirmAccount'));
const ConfirmResetPasswordCodeSentByEmail = lazy(
  () => import('@/pages/_core/auth/ConfirmResetPasswordCodeSentByEmail')
);
const ResetPassword = lazy(() => import('@/pages/_core/auth/ResetPassword'));
const SendCodeResetPassword = lazy(() => import('@/pages/_core/auth/SendCodeResetPassword'));

import { onEnter } from '@/redux/actions/_core/util.action';
import { appLayout } from '@/routes/app.routes';
import { PATH_NAMES } from '@/utils/_core/pathnames';


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
  component: SendCodeResetPassword,
  beforeLoad: onEnter(onEnterSendResetPasswordEmail),
  path: '/',
});

export const resetPasswordRoute = createRoute({
  parseParams: (params: {
    resetToken: string;
  }) => ({
    // single-use token minted by the server when the emailed code was confirmed
    resetToken: z.string().parse(params.resetToken),
  }),
  getParentRoute: () => resetPasswordPublicLayout,
  beforeLoad: onEnter(onEnterResetPassword),
  component: ResetPassword,
  path: '/$resetToken',
});

const accountPublicRoutes = accountPublicLayout.addChildren([
  verifyAccountRoute,
  codeToResetPasswordAccountRoute,
  resetPasswordPublicLayout.addChildren([senEmailResetPasswordRoute, resetPasswordRoute]),
]);

export default accountPublicRoutes;
