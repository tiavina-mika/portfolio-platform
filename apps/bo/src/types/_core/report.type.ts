import { z } from 'zod';

import type { IUser } from '@/types/_core/user.type';

import { reportFilterSchema, reportResolutionSchema } from '@/validations/_core/report.validations';

export enum ReportTargetTypeEnum {
  USER = 'user',
  RIDE = 'ride',
  RATING = 'rating',
  VEHICLE = 'vehicle'
}
export type ReportTargetType = `${ReportTargetTypeEnum}`;

export enum ReportStatusEnum {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}
export type ReportStatus = `${ReportStatusEnum}`;

export enum ReportReasonEnum {
  FAKE_REVIEW = 'fake_review',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  SPAM = 'spam',
  NO_SHOW = 'no_show',
  DANGEROUS_DRIVING = 'dangerous_driving',
  HARASSMENT = 'harassment',
  FRAUD = 'fraud',
  INAPPROPRIATE_BEHAVIOR = 'inappropriate_behavior',
  VEHICLE_MISMATCH = 'vehicle_mismatch',
  WRONG_ROUTE = 'wrong_route',
  EXTRA_PASSENGERS = 'extra_passengers',
  PRICE_DISPUTE = 'price_dispute',
  PERSONAL_DATA = 'personal_data',
  COERCED_REVIEW = 'coerced_review',
  OTHER = 'other'
}
export type ReportReason = `${ReportReasonEnum}`;

/** The part a person plays in the thing that was reported — whose ride, vehicle or review it is. */
export interface IReportTargetPerson {
  role: 'driver' | 'owner' | 'author';
  id: string;
  name: string;
}

/**
 * What the file of one report states about its target beyond the name, resolved server side when
 * the report is opened on its own page. Which facts are there depends on the kind of target — a
 * ride has a date and a price, a vehicle a type and seats — and none is stored on the report.
 */
export interface IReportTargetDetails {
  /** false when the class the report points at no longer holds this id at all */
  exists: boolean;
  /** true when the target is gone or flagged deleted — there is nothing live left to open */
  isDeleted: boolean;
  ridesCount?: number;
  rating?: number;
  date?: string;
  price?: number;
  vehicleType?: string;
  seats?: number;
  value?: number;
  publishedAt?: string;
  person?: IReportTargetPerson;
}

export interface IReportAttributes {
  objectId: string;
  reportedBy?: IUser;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  // the operator who took the report in charge, once it is under review
  reviewedBy?: IUser;
  reviewStartedAt?: string;
  resolvedBy?: IUser;
  resolvedAt?: string;
  resolution?: string;
  // the photos that back the message of a report on a ride
  attachments?: { publicId: string; url: string }[];
  // the person of the reported ride the report is about: its driver, or one of its passengers
  concernedUser?: IUser;
  // the support conversation a report on a ride opened — absent on the other reports
  ticket?: { objectId: string };
  isAnonymous: boolean;
  createdAt: string;
  /*
   * name of what was reported, resolved per page by `getReports` from whichever class `targetType`
   * names — never stored on the report, so it is only there on a list row or a history entry
   */
  targetLabel?: string;
  // how many reports this same target has drawn in total — same origin as `targetLabel`
  targetReportsCount?: number;
  // only read by the report's own page — a list row does not carry it
  targetDetails?: IReportTargetDetails;
}

export type IReport = IReportAttributes & { id: string };

/**
 * The report queue's URL parameters: which tab is open, and — when another screen linked here —
 * the single thing the queue is scoped to.
 */
export interface IReportSearchParams {
  tab: string;
  targetId?: string;
}

/**
 * How the whole report collection splits across the four things that can be reported, read apart
 * from the page itself so filtering the queue does not move the figures.
 */
export interface IReportSummary {
  total: number;
  byTargetType: Record<string, number>;
  /** open reports on a safety or money reason — what the queue has to handle first */
  urgentOpen: number;
}

export interface IReportState {
  loading: boolean;
  reports: IReport[];
  count: number;
  summary: IReportSummary | null;
  /** the other reports on the target of the file currently open, loaded when that file opens */
  targetHistory: IReport[];
  targetHistoryLoading: boolean;
  /** the report the page at its own address is about */
  report: IReport | null;
}

export type ReportResolutionInput = z.infer<typeof reportResolutionSchema>;
export type ReportFiltersInput = z.infer<typeof reportFilterSchema>;
