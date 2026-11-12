import { ComponentProps, ReactNode } from 'react';

import { cn } from '@/utils/app.utils';

export type InputProps = {
  error?: boolean;
  /**
   * @default md
   */
  size?: 'sm' | 'md';
  /**
   * An icon before the text; it is not interactive
   */
  leading?: ReactNode;
  /**
   * A unit or a short text after the value (a currency, a suffix); it is not interactive
   */
  trailing?: ReactNode;
} & Omit<ComponentProps<'input'>, 'size'>;

const ADORNMENT_CLASSES = 'pointer-events-none absolute flex items-center text-muted-foreground';

const Input = ({
  className, type, error = false, size = 'md', leading, trailing, ...props
}: InputProps) => {
  const input = (
    <input
      aria-invalid={error || props['aria-invalid']}
      data-error={!!error}
      data-slot="input"
      type={type}
      className={cn(
        `
          h-11 w-full min-w-0 rounded-md border border-input bg-card px-3.5 text-base leading-[1.4]
          text-foreground transition-[border-color,box-shadow] duration-120 ease-out outline-none
          selection:bg-primary selection:text-primary-foreground
          file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium
          file:text-foreground
          placeholder:text-muted-foreground
          not-disabled:hover:border-input-hover
          disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-45
          md:text-[15px]
        `,
        `
          focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/22
          focus-visible:ring-offset-0
        `,
        `
          aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20
          data-[error=true]:border-destructive data-[error=true]:focus-visible:ring-destructive/20
        `,
        size === 'sm' && `
          h-9 px-3 text-sm
          md:text-sm
        `,
        leading && 'pl-10',
        trailing && 'pr-11',
        className
      )}
      {...props}
    />
  );

  if (!leading && !trailing) return input;

  return (
    <span className="relative flex w-full items-center">
      {leading && <span aria-hidden className={cn(ADORNMENT_CLASSES, 'left-3.25')}>{leading}</span>}
      {input}
      {trailing && (
        <span aria-hidden className={cn(ADORNMENT_CLASSES, 'right-3.5 font-mono text-[13px] font-medium')}>
          {trailing}
        </span>
      )}
    </span>
  );
};

export { Input };
