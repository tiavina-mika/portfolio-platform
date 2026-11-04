import { collections, USE_MASTER_KEY } from '@/constants/_core/constants';

import { readGroupedObjectId, withComputedFields } from '../../utils/_core/parse.utils.cloud';

type PageSectionCounts = {
  sectionsCount: number;
  publishedSectionsCount: number;
  blocksCount: number;
};

type SectionCountsGroup = {
  objectId?: unknown;
  _id?: unknown;
  sectionsCount: number;
  publishedSectionsCount: number;
  blocksCount: number;
};

/**
 * How much content each page actually holds, read from the sections that point at it. A section
 * belongs to several pages at once (`pages` is an array of pointers), so it is unwound before
 * being grouped — a section shared by two pages counts once for each of them.
 *
 * Grouped on the whole unwound element rather than on `pages.objectId`: an array element is stored
 * as a pointer object today, but a plain `<Class>$<objectId>` string is the other shape the
 * adapter emits, and reading a sub-field of it would silently group every row under `null`.
 */
const aggregateSectionCounts = async (): Promise<Map<string, PageSectionCounts>> => {
  const pipeline = [
    { $match: { deleted: { $ne: true } } },
    {
      $project: {
        pages: 1,
        active: 1,
        sectionBlocksCount: { $size: { $ifNull: ['$blocks', []] } },
      },
    },
    { $unwind: '$pages' },
    {
      $group: {
        _id: '$pages',
        sectionsCount: { $sum: 1 },
        publishedSectionsCount: { $sum: { $cond: ['$active', 1, 0] } },
        blocksCount: { $sum: '$sectionBlocksCount' },
      },
    },
  ];

  const groups: SectionCountsGroup[] = await new Parse.Query(collections.PageSection)
    .aggregate(pipeline as any);

  const countsByPageId = new Map<string, PageSectionCounts>();

  groups.forEach((group) => {
    const pageId = readGroupedObjectId(group.objectId ?? group._id);

    if (!pageId) return;

    countsByPageId.set(pageId, {
      sectionsCount: group.sectionsCount,
      publishedSectionsCount: group.publishedSectionsCount,
      blocksCount: group.blocksCount,
    });
  });

  return countsByPageId;
};

/**
 * Returns the pages of the list carrying the (non-persisted) section and block counts. They are
 * what tells an editor whether a page is actually filled in or still an empty shell, and neither
 * lives on the page itself — a page with no section at all simply has no group of its own, and is
 * reported as empty rather than left without the figures.
 *
 * Rebuilt copies rather than the fetched objects mutated in place: see `withComputedFields` for
 * why a Cloud Function must never hand back an object holding unsaved changes. The caller has to
 * use the returned array.
 */
export const attachPageListCounters = async (pages: Parse.Object[]): Promise<Parse.Object[]> => {
  if (pages.length === 0) return pages;

  const countsByPageId = await aggregateSectionCounts();

  return pages.map((page) => {
    const counts = countsByPageId.get(page.id);

    return withComputedFields(page, {
      sectionsCount: counts?.sectionsCount ?? 0,
      publishedSectionsCount: counts?.publishedSectionsCount ?? 0,
      blocksCount: counts?.blocksCount ?? 0,
    });
  });
};

export type PageTabCounts = {
  // the pages the list opens on
  all: number;
  // the ones sitting in the recycle bin
  deleted: number;
};

/**
 * How many pages each tab of the list holds. Both figures are read whichever tab is being fetched:
 * the strip states what there is to switch to, so the tab the reader is not on has to carry its own
 * total.
 *
 * Deliberately unaffected by the search and the filters applied to the list itself — a reader
 * narrowing the pages down to one is not told that the recycle bin has shrunk with it, and the
 * count they came for is the number of rows waiting in the other tab.
 *
 * `exists('user')` mirrors the list query: a page with no author is an artefact of an interrupted
 * creation and is not a row anywhere, so counting it would advertise a tab holding one row less
 * than it says.
 */
export const getPageTabCounts = async (): Promise<PageTabCounts> => {
  const countByTab = async (deleted: boolean): Promise<number> => (
    new Parse.Query(collections.Page)
      .equalTo('deleted', deleted)
      .exists('user')
      .count(USE_MASTER_KEY)
  );

  const [all, deleted] = await Promise.all([countByTab(false), countByTab(true)]);

  return { all, deleted };
};

export type PageBlocksRangeIds = {
  // pages holding at least the requested minimum — `undefined` when no minimum was asked for
  atLeastMinIds?: string[];
  // pages holding more than the requested maximum, to exclude — `undefined` when no maximum was asked for
  aboveMaxIds?: string[];
};

/**
 * Turns a "blocks between min and max" filter into the two id lists a Parse query can apply. The
 * count is summed across another class, so it cannot be compared inside the page query itself.
 *
 * The maximum is expressed as an exclusion rather than an inclusion on purpose: a page with no
 * section at all holds zero blocks and satisfies any maximum, but it has no row in the aggregate
 * to be listed by — only the pages that overshoot can be enumerated.
 */
export const getPageIdsByBlocksRange = async (
  minBlocks?: number,
  maxBlocks?: number
): Promise<PageBlocksRangeIds> => {
  const countsByPageId = await aggregateSectionCounts();
  const entries = [...countsByPageId.entries()];

  /*
   * a minimum of zero excludes nothing, and applying it as an inclusion would wrongly drop the
   * pages that hold no section at all — they have no row in the aggregate to be listed by
   */
  const hasMinimum = minBlocks !== undefined && minBlocks > 0;

  return {
    atLeastMinIds: hasMinimum
      ? entries.filter(([, counts]) => counts.blocksCount >= minBlocks).map(([pageId]) => pageId)
      : undefined,
    aboveMaxIds: maxBlocks === undefined
      ? undefined
      : entries.filter(([, counts]) => counts.blocksCount > maxBlocks).map(([pageId]) => pageId),
  };
};
