import type { IPayment } from '@/types/_core/payment.type';
import type { IReport } from '@/types/_core/report.type';
import type { IUser } from '@/types/_core/user.type';

/*
 * a dashboard row is sent as `Parse.Object#toJSON()`, which carries `objectId` and never the `id`
 * a list page row gains on the client — the row types declare the one that is actually there
 */
export type DashboardRow<T> = T & { objectId: string };

/*
 * every part is optional: the server only computes a part for an account allowed to list the
 * collection it comes from, and leaves it out otherwise — the card or column it feeds is then
 * left out too, never drawn as a zero
 */
export interface IDashboardKpis {
  totalUsers?: number;
  newUsersThisWeek?: number;
  monthRevenue?: number;
  /** ISO 4217 code of `monthRevenue`, absent on a server that does not send it yet */
  monthRevenueCurrency?: string;
  monthPaymentsCount?: number;
}

export interface IDashboardAlerts {
  // the latest few only — the card links to the full list for the rest
  failedPayments?: DashboardRow<IPayment>[];
  // the whole backlog, which is what the card's count states
  failedPaymentsCount?: number;
  openReports?: IReport[];
  openReportsCount?: number;
}

export interface IDashboardRecent {
  users?: IUser[];
}

export interface IDashboardStats {
  kpis: IDashboardKpis;
  alerts: IDashboardAlerts;
  recent: IDashboardRecent;
}

// a page the dashboard offers to open, in place of the figures an account may not read
export interface IDashboardLink {
  id: string;
  label: string;
  onClick: () => void;
}

export interface IDashboardState {
  /*
   * the three parts are read by separate calls, and each band is drawn as soon as its own part is
   * in — null until then
   */
  kpis: IDashboardKpis | null;
  alerts: IDashboardAlerts | null;
  recent: IDashboardRecent | null;
  // true until all three parts of a load have landed, or one of them has failed
  loading: boolean;
  // the last load failed: the page swaps its bands for the retry card until a load succeeds
  hasError: boolean;
  // when all three parts were last read, as an ISO string so the store stays serializable
  updatedAt: string | null;
}
