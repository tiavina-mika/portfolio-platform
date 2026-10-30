import { getDisplayIdentifier } from '@shared/utils';

import type { Locale } from '@/types/app.type';
import type { ReportTargetType } from '@/types/report.type';

import {
  collections, DEFAULT_QUERY_LIMIT, OPEN_REPORT_STATUSES, URGENT_REPORT_REASONS, USE_MASTER_KEY,
} from '@/constants/_core/constants';
import { ReportTargetTypeEnum } from '@/types/report.type';
import { escapeText } from '@/utils/_core/utils';

import { newAgentQuery, withComputedFields } from '../../utils/_core/parse.utils.cloud';
import { getUserPhoneSearchQueries } from '../../utils/_core/user-search.utils.cloud';
import { getUserFullName } from '../../utils/_core/user.utils.cloud';

/**
 * How many targets one search of the report queue may resolve to. A report names its target by id,
 * so filtering the queue by target name means finding the targets first — and a target search that
 * silently stopped at a page boundary would drop reports from a filtered list without saying so.
 */
const TARGET_SEARCH_LIMIT = 200;

/** Report counts per target type, plus the two figures the queue header states. */
export type ReportSummary = {
  total: number;
  byTargetType: Record<string, number>;
  /** open reports whose reason touches safety or money — the "handle first" figure */
  urgentOpen: number;
};

type TargetKey = string;

/**
 * A report points at one of several different classes, so its target has no single field to group or
 * join on — the pair is what identifies it everywhere below.
 */
const toTargetKey = (targetType: string, targetId: string): TargetKey => `${targetType}|${targetId}`;

/*
 * ---------------------------------------------- //
 * ------------- target resolution -------------- //
 * ---------------------------------------------- //
 */

/*
 * a member who signed up by phone has no email and may not have a name yet: the number names them
 * rather than leaving the row blank
 */
export const buildUserLabel = (user: Parse.Object): string => getDisplayIdentifier({
  firstName: user.get('firstName'),
  lastName: user.get('lastName'),
  phone: user.get('phone'),
  email: user.get('email'),
}, '');

const buildRatingLabel = (rating: Parse.Object): string => {
  const value = rating.get('value');
  const to: Parse.User | undefined = rating.get('to');
  const target = to ? getUserFullName(to) : '';

  return target ? `${value}★ — ${target}` : `${value}★`;
};

/**
 * What a business domain tells this generic service about one class a report can point at: the
 * fields its label is built from, the fields a search of the queue by target name looks through,
 * and the facts its file states. `searchFields` stays a subset the class actually stores as text —
 * a route is two nested place names, not a column, which is why a ride is searched on those two
 * keys rather than on a label that only exists once it is built.
 */
export type ReportTargetDefinition = {
  className: string;
  selectFields: string[];
  includeFields?: string[];
  searchFields: string[];
  // queries added to the OR of the search fields when a field alone cannot answer it (a phone number)
  extraSearchQueries?: (text: string) => Parse.Query[];
  buildLabel: (object: Parse.Object) => string;
  /** what the file of a report reads on the target, beyond its name */
  detail: {
    selectFields: string[];
    includeFields?: string[];
    buildDetails: (object: Parse.Object) => Omit<ReportTargetDetails, 'exists' | 'isDeleted'>;
  };
  /** present when a report on this class may name a person of the target (the driver or a passenger of a ride) */
  assertConcernedUser?: (targetId: string, concernedUserId: string, locale: Locale) => Promise<void>;
};

const reportTargets = new Map<ReportTargetType, ReportTargetDefinition>();

/**
 * Declares a class a report can point at. A registry, so this service never has to know which
 * entities exist: the user and the review are registered below, the rest by the domain.
 */
export const registerReportTarget = (
  targetType: ReportTargetType,
  definition: ReportTargetDefinition
): void => {
  reportTargets.set(targetType, definition);
};

export const getReportTarget = (targetType: ReportTargetType): ReportTargetDefinition | undefined =>
  reportTargets.get(targetType);

/**
 * Reads the human name of every target of this page of reports, one query per target class rather
 * than one per row. Without it the queue names its targets by raw object id, which tells an
 * operator nothing about who or what was reported.
 * @param reports one page of reports
 * @returns the label of each target, keyed by target type and id
 */
const resolveTargetLabels = async (
  reports: Parse.Object[]
): Promise<Map<TargetKey, string>> => {
  const idsByType = new Map<ReportTargetType, Set<string>>();

  reports.forEach((report) => {
    const targetType: ReportTargetType = report.get('targetType');
    const targetId: string = report.get('targetId');

    if (!reportTargets.has(targetType) || !targetId) return;

    const ids = idsByType.get(targetType) ?? new Set<string>();

    ids.add(targetId);
    idsByType.set(targetType, ids);
  });

  const labels = new Map<TargetKey, string>();

  await Promise.all([...idsByType].map(async ([targetType, ids]) => {
    const reader = reportTargets.get(targetType)!;
    const query = new Parse.Query(reader.className)
      .containedIn('objectId', [...ids])
      .select(reader.selectFields)
      .limit(ids.size);

    if (reader.includeFields) query.include(reader.includeFields);

    const targets = await query.find(USE_MASTER_KEY);

    targets.forEach((target) => {
      labels.set(toTargetKey(targetType, target.id), reader.buildLabel(target));
    });
  }));

  return labels;
};

/**
 * How many reports each of these targets has drawn in total, open or closed. This is the fact that
 * separates a one-off complaint from a pattern, and no single row can carry it — a report only
 * knows about itself.
 * @param reports one page of reports
 * @returns the total report count of each target, keyed by target type and id
 */
const getTargetReportsCounts = async (
  reports: Parse.Object[]
): Promise<Map<TargetKey, number>> => {
  /*
   * grouped over the whole class rather than counted per row: a page of reports can name the same
   * target several times, and one query per row would be a query per report on every page load
   */
  const pipeline = [
    {
      $match: {
        deleted: false,
        targetId: { $in: [...new Set(reports.map((report) => report.get('targetId')))] },
      },
    },
    { $group: { _id: { targetType: '$targetType', targetId: '$targetId' }, count: { $sum: 1 } } },
  ];

  const groups: { objectId?: any; _id?: any; count: number }[] = await new Parse.Query(
    collections.Report
  ).aggregate(pipeline as any);

  return new Map(groups.map((group) => {
    // Parse Server renames the $group `_id` to `objectId` — fall back to `_id` for safety
    const key = group.objectId ?? group._id;

    return [toTargetKey(key.targetType, key.targetId), group.count] as [TargetKey, number];
  }));
};

/**
 * Returns one page of reports carrying the two facts the queue shows that a report does not store:
 * the name of what was reported, and how many times that same target has been reported. Both are
 * read for the whole page in one query each rather than per row.
 *
 * Rebuilt copies rather than the fetched objects mutated in place — see `withComputedFields` for
 * why a Cloud Function must never hand back an object holding unsaved changes. The caller has to
 * use the returned array.
 * @param reports one page of reports
 * @returns the same reports, rebuilt with `targetLabel` and `targetReportsCount` on them
 */
export const attachReportListFields = async (
  reports: Parse.Object[]
): Promise<Parse.Object[]> => {
  if (reports.length === 0) return reports;

  const [labels, counts] = await Promise.all([
    resolveTargetLabels(reports),
    getTargetReportsCounts(reports),
  ]);

  return reports.map((report) => {
    const key = toTargetKey(report.get('targetType'), report.get('targetId'));

    return withComputedFields(report, {
      targetLabel: labels.get(key) ?? '',
      targetReportsCount: counts.get(key) ?? 1,
    });
  });
};

/**
 * Finds the targets whose name matches a piece of text, across the classes a report can point
 * at. A report stores its target as an id, so a search of the queue by target name has to resolve
 * to ids before it can become a query term.
 * @param text what the operator typed in the target field
 * @param targetTypes narrows the search to these classes — all those registered when left out
 * @returns the ids of the matching targets, across every class searched
 */
export const findTargetIdsMatchingText = async (
  text: string,
  targetTypes?: ReportTargetType[]
): Promise<string[]> => {
  const searched = text.trim();

  if (!searched) return [];

  const pattern = escapeText(searched);

  const searchedTypes = targetTypes?.length
    ? targetTypes.filter((targetType) => reportTargets.has(targetType))
    : [...reportTargets.keys()];

  const idsPerType = await Promise.all(searchedTypes.map(async (targetType) => {
    const reader = reportTargets.get(targetType)!;

    const queries = [
      ...reader.searchFields.map((field) => new Parse.Query(reader.className).matches(field, pattern)),
      ...(reader.extraSearchQueries?.(searched) ?? []),
    ];

    const targets = await Parse.Query.or(...queries)
      .select(['objectId'])
      .limit(TARGET_SEARCH_LIMIT)
      .find(USE_MASTER_KEY);

    return targets.map((target) => target.id);
  }));

  return idsPerType.flat();
};

/*
 * ---------------------------------------------- //
 * ----------------- summary -------------------- //
 * ---------------------------------------------- //
 */

/**
 * How the report queue splits across the things that can be reported, plus how much of it
 * needs handling first. The figures describe the whole collection, not the current search: they
 * say how much there is to switch to, so narrowing the list must not move them.
 * @returns the per-target-type counts, the collection size, and the urgent open count
 */
export const getReportSummaryService = async (): Promise<ReportSummary> => {
  const targetTypes = Object.values(ReportTargetTypeEnum);

  const [total, urgentOpen, perType] = await Promise.all([
    newAgentQuery(collections.Report).equalTo('deleted', false).count(USE_MASTER_KEY),

    newAgentQuery(collections.Report)
      .equalTo('deleted', false)
      .containedIn('reason', URGENT_REPORT_REASONS)
      .containedIn('status', OPEN_REPORT_STATUSES)
      .count(USE_MASTER_KEY),

    Promise.all(targetTypes.map(async (targetType): Promise<[string, number]> => [
      targetType,
      await newAgentQuery(collections.Report)
        .equalTo('deleted', false)
        .equalTo('targetType', targetType)
        .count(USE_MASTER_KEY),
    ])),
  ]);

  return { total, urgentOpen, byTargetType: Object.fromEntries(perType) };
};

/*
 * ---------------------------------------------- //
 * ------------------ history ------------------- //
 * ---------------------------------------------- //
 */

type GetReportTargetHistoryInput = {
  targetType: ReportTargetType;
  targetId: string;
  /** the report the file is open on — it is the subject of the page, not part of its history */
  excludeReportId?: string;
};

/**
 * The other reports filed against the same target. A single report rarely justifies suspending
 * anyone; what it is being weighed against is everything else that target has drawn, which is why
 * the file shows them side by side rather than making the operator search the queue for them.
 * @param input the target to read the history of, and the report to leave out of it
 * @returns the target's other reports, newest first
 */
export const getReportTargetHistoryService = async ({
  targetType,
  targetId,
  excludeReportId,
}: GetReportTargetHistoryInput): Promise<Parse.Object[]> => {
  const query = new Parse.Query(collections.Report)
    .equalTo('deleted', false)
    .equalTo('targetType', targetType)
    .equalTo('targetId', targetId)
    /*
     * a history entry can be opened as the subject of the file, so it carries what a file needs
     * — the target it points at and, once closed, how it was ruled on — not only what a list needs
     */
    .select([
      'targetType', 'targetId', 'reason', 'details', 'status', 'reportedBy', 'isAnonymous',
      'resolvedBy', 'resolvedAt', 'resolution', 'createdAt',
    ])
    .include(['reportedBy', 'resolvedBy'])
    .descending('createdAt')
    .limit(DEFAULT_QUERY_LIMIT);

  if (excludeReportId) query.notEqualTo('objectId', excludeReportId);

  return query.find(USE_MASTER_KEY);
};

/*
 * ---------------------------------------------- //
 * ------------------ detail -------------------- //
 * ---------------------------------------------- //
 */

/** The person a target belongs to, named by the part they play in it. */
type ReportTargetPerson = {
  role: 'driver' | 'owner' | 'author';
  id: string;
  name: string;
};

/**
 * What the file of one report states about its target beyond the name: a few facts to tell it apart
 * at a glance, and the person behind it. Which facts are present depends on the class — a ride has
 * a date and a price, a vehicle a type and seats — so each is optional and the client words them.
 */
export type ReportTargetDetails = {
  /** false when the class the report points at no longer holds this id at all */
  exists: boolean;
  /** true when the target is gone or flagged deleted — the file then has nothing live to open */
  isDeleted: boolean;
  ridesCount?: number;
  rating?: number;
  date?: string;
  price?: number;
  vehicleType?: string;
  seats?: number;
  value?: number;
  publishedAt?: string;
  person?: ReportTargetPerson;
};

export const buildPerson = (role: ReportTargetPerson['role'], user?: Parse.User): ReportTargetPerson | undefined =>
  (user ? { role, id: user.id, name: buildUserLabel(user) } : undefined);

registerReportTarget(ReportTargetTypeEnum.USER, {
  className: collections.User,
  selectFields: ['firstName', 'lastName', 'email', 'phone'],
  searchFields: ['firstName', 'lastName', 'email'],
  extraSearchQueries: getUserPhoneSearchQueries,
  buildLabel: buildUserLabel,
  detail: {
    selectFields: ['rating', 'rideStats'],
    buildDetails: (user) => ({
      ridesCount: Number(user.get('rideStats')?.completed ?? 0),
      rating: user.get('rating') ?? undefined,
    }),
  },
});

registerReportTarget(ReportTargetTypeEnum.RATING, {
  className: collections.Rating,
  selectFields: ['value', 'to'],
  includeFields: ['to'],
  // a review is found through the person it was left about, since it carries no name of its own
  searchFields: ['feedback'],
  buildLabel: buildRatingLabel,
  detail: {
    selectFields: ['value', 'from.firstName', 'from.lastName', 'from.email'],
    includeFields: ['from'],
    buildDetails: (rating) => ({
      value: rating.get('value'),
      publishedAt: rating.createdAt?.toISOString(),
      person: buildPerson('author', rating.get('from')),
    }),
  },
});

/**
 * Reads the facts the file of a report states about its target. A target that cannot be read is an
 * answer, not an error: reports outlive what they were filed against, and the file of a deleted
 * ride is still one an operator has to be able to rule on.
 * @param targetType the class the report points at
 * @param targetId the id of the target in that class
 * @returns the target's facts, or a marker saying it is gone
 */
const getReportTargetDetails = async (
  targetType: ReportTargetType,
  targetId: string
): Promise<ReportTargetDetails> => {
  const definition = reportTargets.get(targetType);

  if (!definition || !targetId) return { exists: false, isDeleted: true };

  const { detail } = definition;
  const query = new Parse.Query(definition.className)
    .equalTo('objectId', targetId)
    .select([...detail.selectFields, 'deleted']);

  if (detail.includeFields) query.include(detail.includeFields);

  // `first` answers undefined for an id nothing holds, where `get` would throw
  const target = await query.first(USE_MASTER_KEY);

  if (!target) return { exists: false, isDeleted: true };

  return { exists: true, isDeleted: !!target.get('deleted'), ...detail.buildDetails(target) };
};

/**
 * One report as its own page reads it: the report, who filed it and who ruled on it, plus the three
 * things a report does not store — the name of its target, how many times that target has been
 * reported, and a few facts about the target.
 *
 * Rebuilt copies rather than the fetched object mutated in place — see `withComputedFields`.
 * @param reportId the report to read
 * @returns the report carrying `targetLabel`, `targetReportsCount` and `targetDetails`
 * @throws when no such report exists
 */
export const getReportDetailService = async (reportId: string): Promise<Parse.Object> => {
  const report = await new Parse.Query(collections.Report)
    .equalTo('deleted', false)
    .include(['reportedBy', 'resolvedBy', 'reviewedBy', 'concernedUser'])
    .get(reportId, USE_MASTER_KEY);

  const [[withListFields = report], targetDetails] = await Promise.all([
    attachReportListFields([report]),
    getReportTargetDetails(report.get('targetType'), report.get('targetId')),
  ]);

  return withComputedFields(withListFields, { targetDetails });
};
