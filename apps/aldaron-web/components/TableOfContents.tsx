'use client';

import { useActiveHeading } from '@/hooks/useActiveHeading';
import { ITableOfContentsItem } from '@/types/app.type';
import { cn } from '@/utils/app.utils';

type Props = {
  /**
   * the entries to list, in reading order
   * @example [{ id: 'toc-services', label: 'Services' }]
   */
  items: ITableOfContentsItem[];
  /**
   * names the navigation for screen readers
   * @example 'Contents'
   */
  label: string;
  /**
   * the entry marked as current. Left out, it follows the heading the visitor is reading
   */
  activeId?: string;
  className?: string;
};

/**
 * Links to the sections of a long text. A row of chips on mobile and tablet, a vertical list with a
 * rule on its left from the large breakpoint up.
 */
const TableOfContents = ({
  items, label, activeId, className,
}: Props) => {
  const readingId = useActiveHeading(items.map((item) => item.id));
  const currentId = activeId ?? readingId;

  if (!items.length) return null;

  return (
    <nav aria-label={label} className={cn('p-0', className)}>
      <ul
        className={`
          m-0 flex list-none flex-row gap-2 overflow-x-auto p-0 pb-1
          lg:w-65 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-l lg:border-border lg:pb-0
        `}
      >
        {items.map((item) => (
          <li
            key={item.id}
            className={`
              flex-none
              lg:flex-auto
            `}
          >
            <a
              aria-current={currentId === item.id ? 'true' : undefined}
              href={`#${item.id}`}
              className={`
                flex min-h-11 items-center rounded-full border border-border px-4 text-sm text-foreground
                no-underline
                hover:bg-accent
                focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none
                aria-[current=true]:border-foreground aria-[current=true]:font-semibold
                lg:-ml-px lg:rounded-none lg:border-0 lg:border-l-2 lg:border-transparent lg:text-base
                lg:text-muted-foreground lg:hover:bg-transparent lg:hover:underline
                lg:aria-[current=true]:border-foreground lg:aria-[current=true]:text-foreground
              `}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;
