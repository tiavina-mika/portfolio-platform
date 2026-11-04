import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';

import { Link } from '@/i18n/routing';
import { IPagination } from '@/types/app.type';
import { cn } from '@/utils/app.utils';
import { PAGINATION } from '@/utils/constants';
import { createQueryString } from '@/utils/next.utils';

export type PaginationProps = {
  /**
   * total number of items
   * @type {number}
   * @required
   */
  total: number;
  /**
   * Other classes to be added
   * @type {string}
   */
  className?: string;
  /**
   * Search params to be added to the url
   * @example { field: 'updatedAt', order: 'asc', page: 2 } => ?field=updatedAt&order=asc&page=2
   */
  searchParams?: Record<string, string>;
} & IPagination;

type PageItem = number | 'ellipsis';

/**
 * first, current and last page, plus the neighbors of the current one when `isWide`
 * a gap of exactly one page shows that page, a bigger gap shows an ellipsis
 */
const getPageItems = (page: number, totalPages: number, isWide: boolean): PageItem[] => {
  const pages = new Set([1, totalPages, page]);

  if (isWide) {
    pages.add(page - 1);
    pages.add(page + 1);
  }

  const sorted = [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const items: PageItem[] = [];

  sorted.forEach((n, index) => {
    if (index > 0) {
      const gap = n - sorted[index - 1];

      if (gap === 2) items.push(n - 1);
      else if (gap > 2) items.push('ellipsis');
    }
    items.push(n);
  });

  return items;
};

const CONTROL_CLASS_NAME = `
  box-border inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border-[1.5px]
  border-solid border-input text-base font-semibold text-foreground no-underline
`;
const LINK_CLASS_NAME = `
  hover:border-primary
  focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring
`;
const ARROW_CLASS_NAME = 'px-0 md:px-4.5';

const ChevronIcon = ({ direction }: { direction: 'left' | 'right' }) => (
  <svg
    aria-hidden="true"
    className="flex-none"
    fill="none"
    height="18"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="18"
  >
    <path d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
  </svg>
);

const Pagination = ({
  page: initialPage,
  total,
  className,
  searchParams,
  perPage = PAGINATION.perPage,
}: PaginationProps) => {
  const t = useTranslations('Pagination');

  const totalPages = Math.ceil(total / perPage);

  if (totalPages <= 1) return null;

  const page = Math.min(Math.max(initialPage || 1, 1), totalPages);

  /**
   * keep the other query params in the url
   * ex: ?field=updatedAt&order=asc&page=2 instead of just ?page=2
   */
  const getPaginatedUrl = (pageNumber: number): string => {
    if (!searchParams) return `?page=${pageNumber}`;

    return `?${createQueryString({ ...searchParams, page: pageNumber })}`;
  };

  const renderArrow = (direction: 'left' | 'right'): ReactNode => {
    const isPrevious = direction === 'left';
    const label = isPrevious ? t('previous') : t('next');
    const isDisabled = isPrevious ? page <= 1 : page >= totalPages;
    // the label shows from md, below it the arrow is icon only (still named by aria-label)
    const content = (
      <>
        {isPrevious && <ChevronIcon direction="left" />}
        <span className={`
          hidden
          md:inline
        `}
        >{label}</span>
        {!isPrevious && <ChevronIcon direction="right" />}
      </>
    );

    // kept in the row, disabled, so the row does not shift on the first and last page
    if (isDisabled) {
      return (
        <span
          aria-disabled="true"
          className={cn(CONTROL_CLASS_NAME, ARROW_CLASS_NAME, 'cursor-not-allowed opacity-40')}
        >
          {content}
        </span>
      );
    }

    return (
      <Link
        aria-label={label}
        className={cn(CONTROL_CLASS_NAME, LINK_CLASS_NAME, ARROW_CLASS_NAME)}
        href={getPaginatedUrl(isPrevious ? page - 1 : page + 1)}
        prefetch={false}
      >
        {content}
      </Link>
    );
  };

  const renderItems = (isWide: boolean): ReactNode => getPageItems(
    page,
    totalPages,
    isWide
  ).map((item, index) => {
    if (item === 'ellipsis') {
      return (
        <li aria-hidden="true" className="min-w-6 text-center text-base font-semibold text-muted-foreground" key={`ellipsis-${index}`}>
          …
        </li>
      );
    }

    const isCurrent = item === page;

    return (
      <li key={item}>
        <Link
          aria-current={isCurrent ? 'page' : undefined}
          aria-label={isCurrent ? `${t('page', { page: item })}, ${t('current')}` : t('page', { page: item })}
          href={getPaginatedUrl(item)}
          prefetch={false}
          className={cn(
            CONTROL_CLASS_NAME,
            LINK_CLASS_NAME,
            'px-3',
            isCurrent && 'border-primary bg-primary font-bold text-primary-foreground'
          )}
        >
          {item}
        </Link>
      </li>
    );
  });

  return (
    <nav
      aria-label={t('label')}
      className={cn(`
        flex flex-wrap items-center justify-center gap-1
        md:gap-2
      `, className)}
    >
      {renderArrow('left')}
      {/* short window below md, full window from md: only the visible list is exposed */}
      <ol className={`
        m-0 flex list-none items-center gap-1 p-0
        md:hidden
      `}
      >{renderItems(false)}</ol>
      <ol className={`
        m-0 hidden list-none items-center gap-2 p-0
        md:flex
      `}
      >{renderItems(true)}</ol>
      {renderArrow('right')}
    </nav>
  );
};

export default Pagination;
