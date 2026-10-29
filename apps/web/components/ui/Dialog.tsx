'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  ComponentProps,
} from 'react';

import { cn } from '@/utils/app.utils';

import NextIcon from '../NextIcon';

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
          fixed inset-0 z-50 bg-black/80
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
}: DialogContentProps) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      data-slot="dialog-content"
      className={cn(
        `
          fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-[-50%] gap-4 border bg-background p-6
          shadow-lg duration-200
          data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
          data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]
          data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
          data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]
          sm:rounded-lg
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
            absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity
            hover:opacity-100
            focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden
            disabled:pointer-events-none
            data-[state=open]:bg-accent data-[state=open]:text-muted-foreground
          `}
        >
          <NextIcon size={18} src="/icons/x.svg" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
);

const DialogHeader = ({
  className,
  ...props
}: ComponentProps<'div'>) => (
  <div
    data-slot="dialog-header"
    className={cn(
      `
        flex flex-col space-y-1.5 text-center
        sm:text-left
      `,
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
        flex flex-col-reverse
        sm:flex-row sm:justify-end sm:space-x-2
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
      'text-lg leading-none font-semibold tracking-tight',
      className
    )}
    {...props}
  />
);

const DialogDescription = ({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) => (
  <DialogPrimitive.Description
    className={cn('text-sm text-muted-foreground', className)}
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
