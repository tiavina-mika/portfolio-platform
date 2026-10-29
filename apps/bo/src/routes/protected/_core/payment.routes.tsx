import { Outlet, createRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { z } from 'zod';

import {
  onPaymentEnter,
  onPaymentsEnter,
} from '@/redux/actions/_core/payment.action';
import { onEnter } from '@/redux/actions/_core/util.action';
import { privateLayout } from '@/routes/protected/_core/privateLayout.routes';
import { IIdParams } from '@/types/_core/app.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { paymentsRouteSearchParams } from '@/validations/_core/payment.validations';


const Payment = lazy(() => import('@/pages/_core/payments/Payment'));
const Payments = lazy(() => import('@/pages/_core/payments/Payments'));

export const paymentsLayout = createRoute({
  getParentRoute: () => privateLayout,
  component: () => <Outlet />,
  path: PATH_NAMES.payments,
  staticData: { breadcrumb: { labelKey: 'user:payments.payments' } },
});

export const paymentsRoute = createRoute({
  validateSearch: search => paymentsRouteSearchParams.parse(search),
  getParentRoute: () => paymentsLayout,
  beforeLoad: onEnter(onPaymentsEnter),
  component: Payments,
  path: '/',
});

export const paymentRoute = createRoute({
  parseParams: (params: IIdParams) => ({ id: z.string().parse(params.id) }),
  beforeLoad: onEnter(onPaymentEnter),
  getParentRoute: () => paymentsLayout,
  component: Payment,
  path: '$id',
});

const paymentRoutes = [
  paymentsRoute,
  paymentRoute,
];

export default paymentRoutes;
