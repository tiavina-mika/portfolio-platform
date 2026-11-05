import { ComponentProps } from 'react';

import { cn } from '@/utils/app.utils';

// figures line up on their units: right aligned, in the mono font with tabular digits
const NUMERIC_CLASS_NAME = 'text-right font-mono tabular-nums';

type NumericProps = {
  /**
   * The column holds figures
   * @default false
   */
  isNumeric?: boolean;
};

const Table = ({ className, ...props }: ComponentProps<'table'>) => (
  <div
    className="w-full overflow-x-auto rounded-lg border border-border bg-card"
    data-slot="table-container"
  >
    <table
      className={cn('w-full border-collapse text-sm leading-[1.4]', className)}
      data-slot="table"
      {...props}
    />
  </div>
);

const TableHeader = (props: ComponentProps<'thead'>) => <thead data-slot="table-header" {...props} />;

const TableBody = (props: ComponentProps<'tbody'>) => <tbody data-slot="table-body" {...props} />;

const TableRow = ({ className, ...props }: ComponentProps<'tr'>) => (
  <tr
    data-slot="table-row"
    className={cn(
      `
        border-b border-border transition-colors duration-120 ease-out
        last:border-b-0
        hover:bg-muted/60
        aria-selected:bg-accent
      `,
      className
    )}
    {...props}
  />
);

const TableHead = ({ className, isNumeric = false, ...props }: ComponentProps<'th'> & NumericProps) => (
  <th
    data-slot="table-head"
    className={cn(
      'bg-background px-4 py-3 text-left label-mono whitespace-nowrap text-muted-foreground',
      isNumeric && 'text-right',
      className
    )}
    {...props}
  />
);

const TableCell = ({ className, isNumeric = false, ...props }: ComponentProps<'td'> & NumericProps) => (
  <td
    className={cn('px-4 py-3.5 align-middle', isNumeric && NUMERIC_CLASS_NAME, className)}
    data-slot="table-cell"
    {...props}
  />
);

const TableCaption = ({ className, ...props }: ComponentProps<'caption'>) => (
  <caption
    className={cn('px-4 py-2.5 text-left text-[13px] text-muted-foreground', className)}
    data-slot="table-caption"
    {...props}
  />
);

export {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption,
};
