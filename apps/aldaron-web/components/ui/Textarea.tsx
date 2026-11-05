import { ComponentProps } from 'react';

import { cn } from '@/utils/app.utils';

export type TextareaProps = {
  error?: boolean;
} & ComponentProps<'textarea'>;

const Textarea = ({ className, error, ...props }: TextareaProps) => {
  return (
    <textarea
      data-error={!!error}
      data-slot="textarea"
      className={cn(
        `
          flex field-sizing-content min-h-28 w-full resize-y rounded-md border border-input bg-card px-3.5
          py-3 text-base leading-normal text-foreground transition-[border-color,box-shadow] duration-120
          ease-out outline-none
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

export { Textarea };
