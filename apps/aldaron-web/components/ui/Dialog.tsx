'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ComponentProps } from 'react';

import { cn } from '@/utils/app.utils';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = ({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Overlay>) => {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        `
          fixed inset-0 z-50 bg-overlay
          data-[state=closed]:animate-out data-[state=closed]:fade-out-0
          data-[state=open]:animate-in data-[state=open]:fade-in-0
        `,
        className
      )}
      {...props}
    />
  );
};

type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
};
const DialogContent = ({
  className, children, showCloseButton = true, ...props
}: DialogContentProps) => {
  const t = useTranslations('Common');

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          `
            fixed top-[50%] left-[50%] z-50 grid w-[calc(100%-3rem)] max-w-lg translate-[-50%] gap-4
            rounded-xl border bg-popover p-6 text-popover-foreground shadow-lg duration-260 ease-out
            data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
            data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]
            data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
            data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]
            motion-reduce:animate-none
          `,
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className={`
              absolute top-3 right-3 flex size-11 cursor-pointer items-center justify-center rounded-md
              text-muted-foreground transition-colors duration-120
              hover:bg-muted hover:text-foreground
              disabled:pointer-events-none
            `}
          >
            <X aria-hidden size={18} />
            <span className="sr-only">{t('close')}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
};

const DialogHeader = ({
  className,
  ...props
}: ComponentProps<'div'>) => (
  <div
    data-slot="dialog-header"
    className={cn(
      'flex flex-col gap-2 pr-8 text-left',
      className
    )}
    {...props}
  />
);

const DialogFooter = ({
  className,
  ...props
}: ComponentProps<'div'>) => (
  <div
    data-slot="dialog-footer"
    className={cn(
      `
        flex flex-col-reverse gap-2
        sm:flex-row sm:justify-end
      `,
      className
    )}
    {...props}
  />
);

const DialogTitle = ({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) => (
  <DialogPrimitive.Title
    data-slot="dialog-title"
    className={cn(
      'font-display text-h4 font-bold',
      className
    )}
    {...props}
  />
);

const DialogDescription = ({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) => (
  <DialogPrimitive.Description
    className={cn('text-[15px] text-muted-foreground', className)}
    data-slot="dialog-description"
    {...props}
  />
);

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
