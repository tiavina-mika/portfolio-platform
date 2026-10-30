import { PaymentTypeEnum } from '@shared/types';

import type { TFunction } from 'i18next';

import { IExportColumn } from '@/types/_core/app.type';
import {
  IDriverWithPendingDebt, IFinanceOverviewPoint, IOverduePendingPayment,
} from '@/types/_core/finance.type';
import { displayDate, isDateExpired } from '@/utils/_core/date.utils';
import { getFullPhoneNumber, getPartialUserFullName } from '@/utils/_core/user.utils';

export const getFinanceOverviewExportColumns = (
  t: TFunction
): IExportColumn<IFinanceOverviewPoint>[] => [
  { header: t('common:date'), getValue: (point) => point.date },
  { header: t('finance:gmv'), getValue: (point) => point.gmv },
  { header: t('finance:netRevenue'), getValue: (point) => point.netRevenue },
];

/**
 * Who paid and who was paid on a payment stuck in PENDING. The platform's own side of a payment
 * is its merchant account, which names no one: it is stated as such rather than as an unknown user,
 * which would read as a record with a missing name.
 */
export const getOverduePaymentParties = (
  payment: IOverduePendingPayment,
  t: TFunction
): { payer: string; receiver: string } => {
  const platform = t('finance:platform');
  const isPaidByPlatform = payment.type === PaymentTypeEnum.APP_TO_DRIVER ||
    payment.type === PaymentTypeEnum.APP_TO_PASSENGER;
  const isReceivedByPlatform = payment.type === PaymentTypeEnum.PASSENGER_TO_APP ||
    payment.type === PaymentTypeEnum.DRIVER_TO_APP;

  return {
    payer: isPaidByPlatform
      ? platform
      : getPartialUserFullName(payment.snapshot?.payer) ?? t('finance:unknownUser'),
    receiver: isReceivedByPlatform
      ? platform
      : getPartialUserFullName(payment.snapshot?.receiver) ?? t('finance:unknownUser'),
  };
};

export const getDriverWalletsExportColumns = (
  t: TFunction
): IExportColumn<IDriverWithPendingDebt>[] => [
  { header: t('user:name'), getValue: (driver) => getPartialUserFullName(driver) },
  { header: t('user:phoneNumber'), getValue: (driver) => getFullPhoneNumber(driver.phone) },
  { header: t('user:email'), getValue: (driver) => driver.email },
  { header: t('finance:wallet.rating'), getValue: (driver) => driver.rating },
  {
    header: t('finance:wallet.lastPayout'),
    getValue: (driver) => (driver.lastPayoutAt ? displayDate(driver.lastPayoutAt, false) : ''),
  },
  { header: t('finance:wallet.pendingPenalty'), getValue: (driver) => driver.pendingPenalty },
  {
    header: t('finance:wallet.status'),
    getValue: (driver) => (driver.isSuspendedUntil && !isDateExpired(driver.isSuspendedUntil)
      ? t('finance:wallet.suspended')
      : t('finance:wallet.active')),
  },
];
