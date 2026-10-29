import { ReactNode } from 'react';

import { IPagination } from '@/types/app.type';
import { cn } from '@/utils/app.utils';
import { PAGINATION } from '@/utils/constants';
import { createQueryString } from '@/utils/next.utils';


import NextIcon from './NextIcon';
import TextLink from './typography/TextLink';

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

const Pagination = ({
  page: initialPage,
  total,
  className,
  searchParams,
  perPage = PAGINATION.perPage,
}: PaginationProps) => {
  let page = initialPage;

  page = !page || page < 1 ? 1 : page;

  const totalPages = Math.ceil(total / perPage);

  const prevPage = page - 1 > 0 ? page - 1 : 1;
  const nextPage = page + 1;
  // const isPageOutOfRange = page > totalPages;

  const pageNumbers = [];
  const offsetNumber = 3;

  for (let i = page - offsetNumber; i <= page + offsetNumber; i++) {
    if (i >= 1 && i <= totalPages) {
      pageNumbers.push(i);
    }
  }

  /**
   * add other (than page) query string to the url
   * ex: ?field=updatedAt&order=asc&page=2 instead of just ?page=2
   * @param page
   * @returns
   */
  const getPaginatedUrl = (page: number): string => {
    if (!searchParams) {
      return `?page=${page.toString()}`;
    }

    return `?${createQueryString({ ...searchParams, page })}`;
  };

  const renderArrow = (position: 'left' | 'right'): ReactNode => {
    return <NextIcon size={18} src={`/icons/chevrons-${position}.svg`} />;
  };

  return (
    <div
      className={cn(
        'flex flex-row items-center justify-center gap-4 rounded-[10px] p-4',
        className
      )}
    >
      {page <= 1 ? (
        <div aria-disabled="true" className="hidden opacity-50">
          {renderArrow('left')}
        </div>
      ) : (
        <TextLink
          aria-label="Previous Page"
          href={getPaginatedUrl(prevPage)}
          underline={false}
        >
          {renderArrow('left')}
        </TextLink>
      )}

      {pageNumbers.map((pageNumber, index) => (
        <TextLink
          key={index}
          href={getPaginatedUrl(pageNumber)}
          underline={false}
          className={cn(
            'text-base',
            page === pageNumber
              ? 'rounded-md bg-primary px-3 py-1 font-medium text-white'
              : `
                rounded-md px-2 py-1
                hover:text-primary
              `
          )}
        >
          {pageNumber}
        </TextLink>
      ))}

      {page >= totalPages ? (
        <div aria-disabled="true" className="hidden opacity-50">
          {renderArrow('right')}
        </div>
      ) : (
        <TextLink
          aria-label="Next Page"
          href={getPaginatedUrl(nextPage)}
          underline={false}
        >
          {renderArrow('right')}
        </TextLink>
      )}
    </div>
  );
};

export default Pagination;
