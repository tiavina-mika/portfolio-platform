import { PaymentStatus, PaymentType } from '@/types/_core/payment.type';
import { IPeriodComparison } from '@/types/_core/statistics.type';
import { IPhone } from '@/types/_core/user.type';
import { DateType } from '@/types/_core/utils.type';

export interface IFinanceOverviewPoint {
  date: string;
  gmv: number;
  netRevenue: number;
}

export interface IFinanceOverview {
  /** ISO 4217 code every amount of the overview is in */
  currency?: string;
  points: IFinanceOverviewPoint[];
  gmvComparison: IPeriodComparison;
  netRevenueComparison: IPeriodComparison;
  pendingOverdueCount: number;
}

export interface IOverduePendingPayment {
  objectId: string;
  amount: number;
  /** ISO 4217 code the payment is in */
  currency?: string;
  type: PaymentType;
  createdAt: DateType;
  snapshot?: {
    payer?: { firstName?: string; lastName?: string };
    receiver?: { firstName?: string; lastName?: string };
  };
}

export interface IDriverPayout {
  objectId: string;
  amount: number;
  /** ISO 4217 code the payout was paid in */
  currency?: string;
  status: PaymentStatus;
  commission?: number;
  commissionRate?: number;
  createdAt: DateType;
}

export interface IDriverWalletBalance {
  driverId: string;
  firstName?: string;
  lastName?: string;
  pendingPenalty: number;
  /** ISO 4217 code the penalty is owed in */
  currency?: string;
  isSuspendedUntil: DateType | null;
  payouts: IDriverPayout[];
}

export interface IDriverWithPendingDebt {
  objectId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: IPhone;
  // null for a driver nobody has reviewed yet — never a 0, which would read as the worst score
  rating: number | null;
  reviewsCount: number;
  pendingPenalty: number;
  /** ISO 4217 code the penalty is owed in */
  currency?: string;
  isSuspendedUntil: DateType | null;
  // derived from the payout ledger, not stored: null for a driver who has never been paid
  lastPayoutAt: DateType | null;
}

/** the whole population of a country's drivers who owe something, whatever the list is filtered to */
export interface IDriversPendingDebtTotals {
  /** ISO 4217 code the debt is in */
  currency?: string;
  pendingPenalty: number;
  suspended: number;
  tracked: number;
}

export interface IFinanceState {
  overview: IFinanceOverview | null;
  overduePendingPayments: IOverduePendingPayment[] | null;
  driverWallet: IDriverWalletBalance | null;
  driversWithPendingDebt: IDriverWithPendingDebt[] | null;
  driversWithPendingDebtCount: number;
  driversWithPendingDebtTotals: IDriversPendingDebtTotals | null;
  loading: boolean;
}
