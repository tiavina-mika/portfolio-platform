import { DISPUTE_SLA_HOURS } from '@shared/domain-constants';
import dayjs from 'dayjs';

import i18n from '@/config/i18n';
import {
  REPORT_REASON_OPTIONS, REPORT_STATUS_OPTIONS, REPORT_TARGET_TYPE_OPTIONS, URGENT_REPORT_REASONS,
} from '@/constants/_core/report.constants';
import { ISelectOption } from '@/types/_core/app.type';
import {
  IReportTargetDetails, IReportTargetPerson, ReportReason, ReportStatus, ReportStatusEnum,
  ReportTargetType, ReportTargetTypeEnum,
} from '@/types/_core/report.type';
import { displayDate } from '@/utils/_core/date.utils';
import { formatPriceWithCurrency } from '@/utils/_core/utils';

export const getReportReasonLabelByValue = (reason: ReportReason): string => {
  const reasonOption = REPORT_REASON_OPTIONS.find((option: ISelectOption) => option.value === reason);

  return reasonOption?.label ?? '';
};

export const getReportTargetTypeLabelByValue = (targetType: ReportTargetType): string => {
  const targetTypeOption = REPORT_TARGET_TYPE_OPTIONS.find(
    (option: ISelectOption) => option.value === targetType
  );

  return targetTypeOption?.label ?? '';
};

export const getReportStatusLabelByValue = (status: ReportStatus): string => {
  const statusOption = REPORT_STATUS_OPTIONS.find((option: ISelectOption) => option.value === status);

  return statusOption?.label ?? '';
};

export const isUrgentReportReason = (reason: ReportReason): boolean =>
  URGENT_REPORT_REASONS.includes(reason);

/** a report still owes someone a decision — resolved and dismissed are both closed */
export const isOpenReportStatus = (status: ReportStatus): boolean =>
  status === ReportStatusEnum.PENDING || status === ReportStatusEnum.UNDER_REVIEW;

/**
 * How long a report has been in the queue, in whole days. Days rather than hours because that is
 * the unit the backlog is actually discussed in — an operator asks what has been waiting three
 * days, never what has been waiting seventy-one hours.
 * @param createdAt when the report was filed
 * @returns its age in days, never negative
 */
export const getReportAgeInDays = (createdAt: string): number =>
  Math.max(0, dayjs().diff(createdAt, 'day'));

/**
 * A report is late when it is still open and has passed the dispute SLA. A closed one is never
 * late however old it is — its age is then a record, not a debt.
 * @param createdAt when the report was filed
 * @param status where the report currently stands
 * @returns whether the queue has to call this row out
 */
export const isReportOverdue = (createdAt: string, status: ReportStatus): boolean =>
  isOpenReportStatus(status) && dayjs().diff(createdAt, 'hour') > DISPUTE_SLA_HOURS;

/**
 * What the queue calls a target when the class it points at could not be read — a deleted ride, a
 * user whose account is gone. The raw id is worth showing: it is the only handle left on what was
 * reported, and an empty cell would read as a row with no target at all.
 * @param targetLabel the name resolved server side, when there was one
 * @param targetId the report's own reference to its target
 * @returns what to print in the target cell
 */
export const displayReportTarget = (targetLabel: string | undefined, targetId: string): string =>
  targetLabel?.trim() || targetId;

/**
 * Whether the back-office has a page of its own for what was reported. A review is read and ruled on
 * from the review queue, in a dialog — there is no page to open it on.
 * @param targetType the kind of thing the report is about
 * @returns whether the target can be opened from the report
 */
export const isReportTargetOpenable = (targetType: ReportTargetType): boolean =>
  targetType !== ReportTargetTypeEnum.RATING;

type ReportTargetSubtitleFormatter = (details: IReportTargetDetails) => string;

const targetSubtitleFormatters: Partial<Record<ReportTargetType, ReportTargetSubtitleFormatter>> = {};

/**
 * Lets the business domain write the subtitle of the targets the generic report file knows nothing
 * about (a vehicle), from a composition point outside `_core/`.
 */
export const registerReportTargetSubtitleFormatter = (
  targetType: ReportTargetType,
  formatter: ReportTargetSubtitleFormatter
): void => {
  targetSubtitleFormatters[targetType] = formatter;
};

/**
 * The line under a target's name in a report's file: the few facts that tell one ride, vehicle,
 * account or review apart from another at a glance. Facts a target does not have are left out
 * rather than printed as zero or a dash — an account that has never driven has no trip count to
 * state.
 * @param targetType the kind of thing the report is about
 * @param details what the server read about it
 * @returns the line, empty when there is nothing to say
 */
export const getReportTargetSubtitle = (
  targetType: ReportTargetType,
  details?: IReportTargetDetails
): string => {
  if (!details) return '';
  if (!details.exists || details.isDeleted) return i18n.t('user:reports.targetGone');

  switch (targetType) {
    case ReportTargetTypeEnum.USER:
      return [
        details.ridesCount
          ? i18n.t('user:reports.targetFacts.ridesWithCount', { count: details.ridesCount })
          : undefined,
        details.rating
          ? `${details.rating.toLocaleString(i18n.language, { maximumFractionDigits: 1 })} ★`
          : undefined,
      ].filter(Boolean).join(' · ');
    case ReportTargetTypeEnum.RIDE:
      return [
        details.date ? displayDate(details.date, true) : undefined,
        details.price !== undefined ? formatPriceWithCurrency(details.price) : undefined,
      ].filter(Boolean).join(' · ');
    case ReportTargetTypeEnum.RATING:
      return details.value !== undefined && details.publishedAt
        ? i18n.t('user:reports.targetFacts.ratingOutOfFive', {
          value: details.value,
          date: displayDate(details.publishedAt, false),
        })
        : '';
    default:
      return targetSubtitleFormatters[targetType]?.(details) ?? '';
  }
};

/**
 * What the person behind a target is to it, in words — the driver of a ride, the owner of a
 * vehicle, the author of a review.
 * @param role the part the person plays
 * @returns the label
 */
export const getReportTargetPersonRoleLabel = (role: IReportTargetPerson['role']): string =>
  i18n.t(`user:reports.personRoles.${role}`);
