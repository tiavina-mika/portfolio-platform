export type StatisticsPeriod = '7d' | '30d' | '90d' | '12m';

/** The views of the statistics section, one route each, switched from the page's own navigation. */
export enum StatisticsViewEnum {
  OVERVIEW = 'overview',
  USERS = 'users',
  RIDES = 'rides',
  PAYMENTS = 'payments',
  VEHICLES = 'vehicles',
  CANCELLATIONS = 'cancellations',
  REPORTS = 'reports'
}

/**
 * How a change against the previous period is stated: a relative change for what is counted or
 * summed (rides, revenue), a plain difference for what is already a rate or a duration — "+2 pt" on
 * an acceptance rate, "-3 min" on a delay — since a percentage of a percentage reads as noise.
 */
export type StatisticsComparisonFormat = 'percent' | 'difference';

/**
 * For a count or an amount, the totals are summed over each period. For a rate or an average they
 * hold that rate computed over the whole period, so the difference between them is the change.
 */
export interface IPeriodComparison {
  currentTotal: number;
  previousTotal: number;
  changePercent: number | null;
}

/**
 * The comparison of a rate or an average, which can have nothing to measure on one side (no ride
 * departed, no signup old enough to have a retention): that side is null rather than a misleading 0.
 */
export interface INullablePeriodComparison {
  currentTotal: number | null;
  previousTotal: number | null;
  changePercent: number | null;
}

export interface IStatisticsNavItem {
  view: StatisticsViewEnum;
  label: string;
}

export interface IOverviewStatisticsPoint {
  month: string;
  newUsers: number;
  ridesPublished: number;
  requestsConfirmed: number;
  revenue: number;
  fillRate: number | null;
  activeDrivers: number;
  activePassengers: number;
  averageRating: number | null;
}

export interface IOverviewStatistics {
  /** ISO 4217 code the money figures are in */
  currency?: string;
  points: IOverviewStatisticsPoint[];
  /** the same months, one period earlier — drawn dashed behind the series when comparing */
  previousPoints?: IOverviewStatisticsPoint[];
  comparisons: {
    newUsers: IPeriodComparison;
    ridesPublished: IPeriodComparison;
    revenue: IPeriodComparison;
    fillRate: INullablePeriodComparison;
    activeUsers: IPeriodComparison;
  };
}

export interface IUserStatisticsPoint {
  date: string;
  newUsers: number;
  totalUsers: number;
  activeUsers: number;
  retention30: number | null;
  retention90: number | null;
  conversionRate: number | null;
  averageRating: number | null;
}

export interface IUserVerificationSplit {
  verified: number;
  pending: number;
  unverified: number;
}

export interface IUserAccountSplit {
  active: number;
  suspended: number;
  banned: number;
}

export interface IUserRoleSplit {
  drivers: number;
  passengers: number;
}

export interface IUsersStatistics {
  points: IUserStatisticsPoint[];
  previousPoints?: IUserStatisticsPoint[];
  comparisons: {
    averageRating: INullablePeriodComparison;
    newUsers: IPeriodComparison;
    activeUsers: IPeriodComparison;
    retention30: INullablePeriodComparison;
    conversionRate: INullablePeriodComparison;
  };
  roleSplit: IUserRoleSplit;
  verificationSplit: IUserVerificationSplit;
  accountSplit: IUserAccountSplit;
}

export interface IRideStatisticsPoint {
  date: string;
  ridesPublished: number;
  /** bookings that reached a confirmed seat — every booking whose payment went through */
  requestsConfirmed: number;
  requestsTotal: number;
  emptyRidesRate: number | null;
  seatsOffered: number;
  seatsBooked: number;
}

export interface ITopRoutePoint {
  departure: string;
  destination: string;
  rides: number;
  revenue: number;
  averageDistanceKm: number | null;
  averagePrice: number | null;
}

export interface IRideStatusSplit {
  completed: number;
  upcoming: number;
  ongoing: number;
  canceled: number;
}

export interface IRideRegionPoint {
  region: string;
  rides: number;
}

export interface IRidesStatistics {
  /** ISO 4217 code the route revenues and prices are in */
  currency?: string;
  points: IRideStatisticsPoint[];
  previousPoints?: IRideStatisticsPoint[];
  comparisons: {
    seatsOffered: IPeriodComparison;
    ridesPublished: IPeriodComparison;
    requestsConfirmed: IPeriodComparison;
    emptyRidesRate: INullablePeriodComparison;
  };
  topRoutes: ITopRoutePoint[];
  statusSplit: IRideStatusSplit;
  byRegion: IRideRegionPoint[];
}

export interface IRideActivityHeatmapPoint {
  day: number;
  hour: number;
  count: number;
}

export interface IPaymentStatisticsPoint {
  date: string;
  revenue: number;
  paymentsFailed: number;
  paymentsTotal: number;
  failureRate: number;
  refunds: number;
  refundedAmount: number;
  averageCollectionDays: number | null;
  commission: number;
  averageBasket: number | null;
}

export interface IPaymentServiceSharePoint {
  service: string;
  count: number;
  amount: number;
  failed: number;
  /** percent of this operator's payments that failed */
  failureRate: number;
}

export interface IPendingPayoutPoint {
  driverId: string;
  fullName: string;
  ridesCount: number;
  amount: number;
  oldestAt: string;
}

export interface IPaymentsStatistics {
  /** ISO 4217 code every amount of the report is in */
  currency?: string;
  points: IPaymentStatisticsPoint[];
  previousPoints?: IPaymentStatisticsPoint[];
  comparisons: {
    commission: IPeriodComparison;
    averageBasket: INullablePeriodComparison;
    revenue: IPeriodComparison;
    failureRate: IPeriodComparison;
    refunds: IPeriodComparison;
    averageCollectionDays: INullablePeriodComparison;
  };
  byService: IPaymentServiceSharePoint[];
  pendingPayouts: IPendingPayoutPoint[];
}

export interface IVehicleStatisticsPoint {
  date: string;
  vehiclesAdded: number;
  averageFleetAge: number | null;
  // hours between a paper's upload and the team's decision, null when no paper was reviewed in the bucket
  averageReviewHours: number | null;
}

export interface IVehicleTypeDistributionPoint {
  type: string;
  count: number;
}

export interface IExpiringDocumentPoint {
  vehicleId: string;
  brand: string;
  model: string;
  number: string;
  documentType: string;
  expiresAt: string;
}

export interface IVehicleValidationSplit {
  verified: number;
  pending: number;
  rejected: number;
}

export interface IVehicleBrandPoint {
  brand: string;
  count: number;
}

export interface IVehiclesStatistics {
  points: IVehicleStatisticsPoint[];
  previousPoints?: IVehicleStatisticsPoint[];
  byType: IVehicleTypeDistributionPoint[];
  validationSplit: IVehicleValidationSplit;
  brandSplit: IVehicleBrandPoint[];
  comparisons: {
    vehiclesAdded: IPeriodComparison;
    averageFleetAge: INullablePeriodComparison;
    averageReviewHours: INullablePeriodComparison;
  };
  expiringDocuments: IExpiringDocumentPoint[];
}

export interface ICancellationStatisticsPoint {
  date: string;
  requestsTotal: number;
  /** bookings that reached a confirmed seat at some point — the cancellation rate's denominator */
  confirmedCohort: number;
  canceledByDriver: number;
  canceledByPassenger: number;
  cancellationRate: number;
  canceledEarly: number;
  canceledMid: number;
  canceledLate: number;
  lostRevenue: number;
  /** confirmed bookings of rides that left: completed, declared absent, or absence contested */
  departed: number;
  /** bookings whose passenger stands declared absent — a contest under examination is not one */
  noShow: number;
  /** established absences over the departed bookings, in percent */
  noShowRate: number;
}

export interface ICancellationStatistics {
  /** ISO 4217 code the lost revenue is in */
  currency?: string;
  points: ICancellationStatisticsPoint[];
  previousPoints?: ICancellationStatisticsPoint[];
  comparisons: {
    canceled: IPeriodComparison;
    cancellationRate: IPeriodComparison;
    lostRevenue: IPeriodComparison;
    noShowRate: IPeriodComparison;
  };
}

export interface ICancellationReasonPoint {
  reason: string;
  count: number;
}

export interface ISuspendedUserPoint {
  userId: string;
  fullName: string;
  suspendedUntil: string;
  cancellationsInWindow: number;
  pendingPenalty: number;
  /** ISO 4217 code the penalty is owed in */
  currency?: string;
}

export interface IReportStatisticsPoint {
  date: string;
  received: number;
  averageHandlingHours: number | null;
}

export interface IReportReasonPoint {
  reason: string;
  count: number;
}

export interface IReportStatusPoint {
  status: string;
  count: number;
}

export interface IOldestOpenReportPoint {
  reportId: string;
  reason: string;
  targetType: string;
  createdAt: string;
  ageDays: number;
  status: string;
}

export interface IReportsStatistics {
  points: IReportStatisticsPoint[];
  previousPoints?: IReportStatisticsPoint[];
  comparisons: {
    received: IPeriodComparison;
    averageHandlingHours: INullablePeriodComparison;
  };
  byReason: IReportReasonPoint[];
  byStatus: IReportStatusPoint[];
  oldestOpen: IOldestOpenReportPoint[];
}

export interface IStatisticsState {
  overview: IOverviewStatistics | null;
  users: IUsersStatistics | null;
  rides: IRidesStatistics | null;
  ridesHeatmap: IRideActivityHeatmapPoint[] | null;
  payments: IPaymentsStatistics | null;
  vehicles: IVehiclesStatistics | null;
  cancellations: ICancellationStatistics | null;
  reports: IReportsStatistics | null;
  cancellationReasons: ICancellationReasonPoint[] | null;
  suspendedUsers: ISuspendedUserPoint[] | null;
  loading: boolean;
  /*
   * the heatmap and the suspended accounts are read beside a view's figures rather than with them,
   * each under its own flag, so the figures are drawn without waiting on the slower reads
   */
  ridesHeatmapLoading: boolean;
  suspendedUsersLoading: boolean;
}
