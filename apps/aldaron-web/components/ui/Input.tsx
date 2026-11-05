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
          h-11 w-full min-w-0 rounded-md border border-input bg-card px-3.5 text-base text-foreground
          transition-[border-color,box-shadow] duration-120 ease-out outline-none
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
        className
      )}
      {...props}
    />
  );
};

export { Input };
