import { ComponentProps } from 'react';

import { cn } from '@/utils/app.utils';

export type InputProps = {
  error?: boolean;
} & ComponentProps<'input'>;

const Input = ({
  className, type, error = false, ...props
}: InputProps) => {
  return (
    <input
      data-error={!!error}
      data-slot="input"
      type={type}
      className={cn(
        `
          h-[54px] w-full rounded-md border-input bg-transparent px-3 text-base transition-colors
          focus-visible:ring-2 focus-visible:outline-none
          dark:border-0
        `,
        `
          w-full min-w-0 bg-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none
          selection:bg-primary selection:text-primary-foreground
          file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium
          file:text-foreground
          placeholder:text-muted-foreground
          disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
          md:text-sm
          dark:bg-input/30
        `,
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        `
          aria-invalid:border-destructive aria-invalid:ring-destructive/20
          dark:aria-invalid:ring-destructive/40
        `,
        `
          data-[error=true]:border-error data-[error=true]:placeholder:text-error
          dark:data-[error=true]:border-error-dark dark:data-[error=true]:placeholder:text-error-dark
        `,
        className
      )}
      {...props}
    />
  );
};

export { Input };
