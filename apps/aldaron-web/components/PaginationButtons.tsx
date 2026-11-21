'use client';

import { cn } from '@/utils/app.utils';

export type PaginationButtonsLabels = {
  /** the name of the navigation landmark */
  nav: string;
  previous: string;
  next: string;
  /** written before the number of a page, in its accessible name: "Page 2" */
  page: string;
};

type Props = {
  /**
   * The current page, from 1
   */
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  labels: PaginationButtonsLabels;
  className?: string;
};

type PageItem = number | 'gap';

// every page up to 7, then the first, the last and the neighbors of the current one around gaps
const getPageItems = (page: number, pageCount: number): PageItem[] => {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);

  const first = Math.max(2, page - 1);
  const last = Math.min(pageCount - 1, page + 1);
  const items: PageItem[] = [1];

  if (first > 2) items.push('gap');
  for (let current = first; current <= last; current += 1) items.push(current);
  if (last < pageCount - 1) items.push('gap');
  items.push(pageCount);

  return items;
};

const BUTTON_CLASS_NAME = `
  inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-md border
  border-transparent bg-transparent px-3 text-[15px] leading-none font-medium text-foreground
  transition-colors duration-120 ease-out
  not-disabled:not-aria-[current=page]:hover:bg-muted
  disabled:cursor-not-allowed disabled:opacity-45
  aria-[current=page]:cursor-default aria-[current=page]:bg-primary
  aria-[current=page]:text-primary-foreground
  motion-reduce:transition-none
`;

/**
 * The pagination of a list held in the page's state: Previous, the page numbers, Next. Below md the
 * numbers give way to the status "2 / 5".
 */
const PaginationButtons = ({
  page, pageCount, onChange, labels, className,
}: Props) => {
  const goTo = (target: number) => {
    if (target >= 1 && target <= pageCount && target !== page) onChange(target);
  };

  return (
    <nav aria-label={labels.nav} className={cn('flex flex-wrap items-center justify-center gap-2', className)}>
      <button
        className={cn(BUTTON_CLASS_NAME, 'border-input')}
        disabled={page <= 1}
        onClick={() => goTo(page - 1)}
        type="button"
      >
        {labels.previous}
      </button>
      <span
        aria-current="page"
        className={`
          inline-flex min-h-11 items-center px-2 font-mono text-sm font-medium text-muted-foreground
          md:hidden
        `}
      >
        {page} / {pageCount}
      </span>
      <ul className={`
        m-0 hidden list-none items-center gap-1 p-0
        md:flex
      `}
      >
        {getPageItems(page, pageCount).map((item, index) => (
          <li key={item === 'gap' ? `gap-${index}` : item}>
            {item === 'gap' ? (
              <span
                aria-hidden
                className={`
                  inline-flex min-h-11 min-w-11 items-center justify-center font-mono text-sm
                  text-muted-foreground
                `}
              >
                …
              </span>
            ) : (
              <button
                aria-current={item === page ? 'page' : undefined}
                aria-label={`${labels.page} ${item}`}
                className={cn(BUTTON_CLASS_NAME, 'p-0 font-mono text-sm')}
                onClick={() => goTo(item)}
                type="button"
              >
                {item}
              </button>
            )}
          </li>
        ))}
      </ul>
      <button
        className={cn(BUTTON_CLASS_NAME, 'border-input')}
        disabled={page >= pageCount}
        onClick={() => goTo(page + 1)}
        type="button"
      >
        {labels.next}
      </button>
    </nav>
  );
};

export default PaginationButtons;
