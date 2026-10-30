import i18n from '@/config/i18n';
import { IListTabValue, ISelectOption, OrderType } from '@/types/_core/app.type';
import {
  ReportReason, ReportReasonEnum, ReportStatusEnum, ReportTargetTypeEnum,
} from '@/types/_core/report.type';

/**
 * reasons that touch user safety rather than pure content moderation — colored differently
 * (see §8.4 of the notifications audit: one bell icon, not two, urgency conveyed by color)
 */
export const URGENT_REPORT_REASONS: ReportReason[] = [
  ReportReasonEnum.HARASSMENT,
  ReportReasonEnum.DANGEROUS_DRIVING,
  ReportReasonEnum.FRAUD,
];

/**
 * How wide the target column may grow. A cell in an auto-layout table takes whatever width its
 * content asks for, and a target's name is drawn on one line — so without a cap a long label (a
 * ride's full route, the title of a reviewed trip) widens the column until the table no longer fits
 * the page and the whole back-office scrolls sideways. The name is truncated at this width instead,
 * with the full text on its tooltip and in the report's own file.
 */
export const REPORT_TARGET_COLUMN_WIDTH = 240;

/**
 * How many reports a target has to have drawn before the count is worth stating, and before it is
 * worth alarming about. One is every row; two is the first time a complaint stops being an isolated
 * incident, which is the moment worth marking; three is a pattern, and a pattern is what separates
 * a warning from a suspension — so the file states it in the louder of the two tones.
 */
export const REPORT_REPEAT_THRESHOLD = 2;
export const REPORT_PATTERN_THRESHOLD = 3;

export const REPORT_TARGET_TYPE_OPTIONS: ISelectOption<ReportTargetTypeEnum>[] = [
  { label: i18n.t('user:reports.targetTypes.user'), value: ReportTargetTypeEnum.USER },
  { label: i18n.t('user:reports.targetTypes.ride'), value: ReportTargetTypeEnum.RIDE },
  { label: i18n.t('user:reports.targetTypes.rating'), value: ReportTargetTypeEnum.RATING },
  { label: i18n.t('user:reports.targetTypes.vehicle'), value: ReportTargetTypeEnum.VEHICLE },
];

export const REPORT_REASON_OPTIONS: ISelectOption<ReportReasonEnum>[] = [
  { label: i18n.t('user:reports.reasons.fake_review'), value: ReportReasonEnum.FAKE_REVIEW },
  { label: i18n.t('user:reports.reasons.inappropriate_content'), value: ReportReasonEnum.INAPPROPRIATE_CONTENT },
  { label: i18n.t('user:reports.reasons.spam'), value: ReportReasonEnum.SPAM },
  { label: i18n.t('user:reports.reasons.no_show'), value: ReportReasonEnum.NO_SHOW },
  { label: i18n.t('user:reports.reasons.dangerous_driving'), value: ReportReasonEnum.DANGEROUS_DRIVING },
  { label: i18n.t('user:reports.reasons.harassment'), value: ReportReasonEnum.HARASSMENT },
  { label: i18n.t('user:reports.reasons.fraud'), value: ReportReasonEnum.FRAUD },
  { label: i18n.t('user:reports.reasons.inappropriate_behavior'), value: ReportReasonEnum.INAPPROPRIATE_BEHAVIOR },
  { label: i18n.t('user:reports.reasons.vehicle_mismatch'), value: ReportReasonEnum.VEHICLE_MISMATCH },
  { label: i18n.t('user:reports.reasons.wrong_route'), value: ReportReasonEnum.WRONG_ROUTE },
  { label: i18n.t('user:reports.reasons.extra_passengers'), value: ReportReasonEnum.EXTRA_PASSENGERS },
  { label: i18n.t('user:reports.reasons.price_dispute'), value: ReportReasonEnum.PRICE_DISPUTE },
  { label: i18n.t('user:reports.reasons.personal_data'), value: ReportReasonEnum.PERSONAL_DATA },
  { label: i18n.t('user:reports.reasons.coerced_review'), value: ReportReasonEnum.COERCED_REVIEW },
  { label: i18n.t('user:reports.reasons.other'), value: ReportReasonEnum.OTHER },
];

export const REPORT_STATUS_OPTIONS: ISelectOption<ReportStatusEnum>[] = [
  { label: i18n.t('user:reports.statuses.pending'), value: ReportStatusEnum.PENDING },
  { label: i18n.t('user:reports.statuses.under_review'), value: ReportStatusEnum.UNDER_REVIEW },
  { label: i18n.t('user:reports.statuses.resolved'), value: ReportStatusEnum.RESOLVED },
  { label: i18n.t('user:reports.statuses.dismissed'), value: ReportStatusEnum.DISMISSED },
];

/**
 * The queue is scoped by what was reported rather than by how far along a report is. A report on a
 * person, on a ride, on a vehicle and on a review are four different jobs — checked against
 * different evidence, ending in different decisions — whereas the state a report is in is
 * something the operator changes as they work, which makes it a filter rather than a place to
 * stand. Report has no `seen` field either (see the getObjectsCount cloud function), so there is
 * no "new items" tab to keep alongside these.
 */
export const reportsTabOptions: IListTabValue[] = [
  {
    label: i18n.t('user:reports.targetTypes.users'),
    tab: i18n.t('route:tabs.users'),
    key: 'targetType',
    countKey: ReportTargetTypeEnum.USER,
    value: ReportTargetTypeEnum.USER,
  },
  {
    label: i18n.t('user:reports.targetTypes.rides'),
    tab: i18n.t('route:tabs.rides'),
    key: 'targetType',
    countKey: ReportTargetTypeEnum.RIDE,
    value: ReportTargetTypeEnum.RIDE,
  },
  {
    label: i18n.t('user:reports.targetTypes.ratings'),
    tab: i18n.t('route:tabs.ratings'),
    key: 'targetType',
    countKey: ReportTargetTypeEnum.RATING,
    value: ReportTargetTypeEnum.RATING,
  },
  {
    label: i18n.t('user:reports.targetTypes.vehicles'),
    tab: i18n.t('route:tabs.vehicles'),
    key: 'targetType',
    countKey: ReportTargetTypeEnum.VEHICLE,
    value: ReportTargetTypeEnum.VEHICLE,
  },
];

/** the age filter step standing for the dispute SLA rather than for a number of days */
export const REPORT_AGE_OVERDUE_VALUE = 'overdue';

/**
 * How old the queue can be narrowed to. Steps rather than a free number field: the question an
 * operator asks of the age column is "what has been sitting here too long", and a filter that makes
 * them pick the boundary themselves turns that into a guess. The first step is the dispute SLA
 * itself — the deadline the platform already holds itself to — and only the second is a plain age.
 */
export const REPORT_AGE_FILTER_OPTIONS: ISelectOption[] = [
  { label: i18n.t('user:reports.ageOverdue'), value: REPORT_AGE_OVERDUE_VALUE },
  { label: i18n.t('user:reports.ageOverDays', { count: 5 }), value: '5' },
];

/**
 * The queue opens in the order it should be worked, not in the order it was filled: what is
 * dangerous and still open first, then the rest, oldest first within each. `priority` is resolved
 * server side — it is not a field of the report, so it cannot be sorted on in the other direction.
 */
export const REPORT_LIST_DEFAULT_SORT = { orderBy: 'priority', order: 'desc' as OrderType };
