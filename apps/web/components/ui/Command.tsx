'use client';


import { Command as CommandPrimitive } from 'cmdk';
import {
  ComponentProps,
} from 'react';

import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { cn } from '@/utils/app.utils';

import NextIcon from '../NextIcon';

const Command = ({ className, ...props }: ComponentProps<typeof CommandPrimitive>) => (
  <CommandPrimitive
    data-slot="command"
    className={cn(
      'flex size-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
      className
    )}
    {...props}
  />
);

type CommandDialogProps = ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
};

const CommandDialog = ({
  children,
  showCloseButton = true,
  ...props
}: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0" showCloseButton={showCloseButton}>
        { }
        <Command className={`
          [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium
          [&_[cmdk-group-heading]]:text-muted-foreground
          [&_[cmdk-group]]:px-2
          [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0
          [&_[cmdk-input-wrapper]_svg]:size-5
          [&_[cmdk-input]]:h-12
          [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3
          [&_[cmdk-item]_svg]:size-5
        `}
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = ({ className, ...props }: ComponentProps<typeof CommandPrimitive.Input>) => (
  <div
    className="flex items-center border-b px-3"
    cmdk-input-wrapper=""
    data-slot="command-input-wrapper"
  >
    <NextIcon
      className="mr-2 shrink-0 opacity-50"
      size={12}
      src="/icons/check.svg"
    />

    <CommandPrimitive.Input
      data-slot="command-input"
      className={cn(
        `
          flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden
          placeholder:text-muted-foreground
          disabled:cursor-not-allowed disabled:opacity-50
        `,
        className
      )}
      {...props}
    />
  </div>
);


const CommandList = ({ className, ...props }: ComponentProps<typeof CommandPrimitive.List>) => (
  <CommandPrimitive.List
    className={cn('max-h-[300px] overflow-x-hidden overflow-y-auto', className)}
    data-slot="command-list"
    {...props}
  />
);

const CommandEmpty = (props: ComponentProps<typeof CommandPrimitive.Empty>) => (
  <CommandPrimitive.Empty
    className="py-6 text-center text-sm"
    data-slot="command-empty"
    {...props}
  />
);

const CommandGroup = ({ className, ...props }: ComponentProps<typeof CommandPrimitive.Group>) => (
  <CommandPrimitive.Group
    data-slot="command-group"
    className={cn(
      `
        overflow-hidden p-1 text-foreground
        [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs
        [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground
      `,
      className
    )}
    {...props}
  />
);

const CommandSeparator = ({ className, ...props }: ComponentProps<typeof CommandPrimitive.Separator>) => (
  <CommandPrimitive.Separator
    className={cn('-mx-1 h-px bg-border', className)}
    data-slot="command-separator"
    {...props}
  />
);

const CommandItem = ({ className, ...props }: ComponentProps<typeof CommandPrimitive.Item>) => (
  <CommandPrimitive.Item
    data-slot="command-item"
    className={cn(
      `
        relative flex cursor-default items-center rounded-xs px-2 py-1.5 text-sm outline-hidden select-none
        aria-selected:bg-accent aria-selected:text-accent-foreground
        data-[disabled]:pointer-events-none data-[disabled]:opacity-50
      `,
      className
    )}
    {...props}
  />
);

const CommandShortcut = ({
  className,
  ...props
}: ComponentProps<'span'>) => {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground',
        className
      )}
      {...props}
    />
  );
};

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
