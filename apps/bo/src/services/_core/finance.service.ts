import Parse from 'parse';

import { IQueriesInput } from '@/types/_core/app.type';
import {
  IDriversPendingDebtTotals, IDriverWalletBalance, IDriverWithPendingDebt, IFinanceOverview,
  IOverduePendingPayment,
} from '@/types/_core/finance.type';
import { PaymentStatus } from '@/types/_core/payment.type';
import { StatisticsPeriod } from '@/types/_core/statistics.type';

export const fetchFinanceOverview = async (
  period?: StatisticsPeriod,
  country?: string
): Promise<IFinanceOverview> => {
  return Parse.Cloud.run('getFinanceOverview', { period, country });
};

export const fetchOverduePendingPayments = async (): Promise<IOverduePendingPayment[]> => {
  return Parse.Cloud.run('getOverduePendingPayments');
};

/** Asks the operator again about a payment stuck in PENDING; resolves with the status it now holds */
export const recheckPendingPayment = async (id: string): Promise<{ status: PaymentStatus }> => {
  return Parse.Cloud.run('recheckPendingPayment', { id });
};

export const fetchDriverWallet =async (driverId: string): Promise<IDriverWalletBalance | null> => {
  return Parse.Cloud.run('getDriverWalletBalance', { driverId });
};

export const fetchDriversWithPendingDebt = async (
  queries: IQueriesInput,
  country?: string
): Promise<{
  results: IDriverWithPendingDebt[];
  count: number;
  totals: IDriversPendingDebtTotals;
}> => {
  return Parse.Cloud.run('getDriversWithPendingDebt', { ...queries, country });
};
