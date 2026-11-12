'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight, Dot } from 'lucide-react';
import { ComponentProps } from 'react';

import { cn } from '@/utils/app.utils';

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = ({
  className,
  inset,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) => {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-inset={inset}
      data-slot="dropdown-menu-sub-trigger"
      className={cn(
        `
          flex min-h-10 cursor-default items-center rounded-sm px-2.5 text-[15px] outline-hidden select-none
          focus:bg-muted
          data-[state=open]:bg-muted
        `,
        inset && 'pl-8',
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight aria-hidden className="ml-auto" size={16} />
    </DropdownMenuPrimitive.SubTrigger>
  );
};

const DropdownMenuSubContent = ({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubContent>) => {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        `
          z-50 min-w-55 overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg
          data-[side=bottom]:slide-in-from-top-2
          data-[side=left]:slide-in-from-right-2
          data-[side=right]:slide-in-from-left-2
          data-[side=top]:slide-in-from-bottom-2
          data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
          data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
        `,
        className
      )}
      {...props}
    />
  );
};

const DropdownMenuContent = ({
  className,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) => {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-55 overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg',
          `
            data-[side=bottom]:slide-in-from-top-2
            data-[side=left]:slide-in-from-right-2
            data-[side=right]:slide-in-from-left-2
            data-[side=top]:slide-in-from-bottom-2
            data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
            data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
          `,

          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
};

const DropdownMenuItem = ({
  className,
  inset,
  variant = 'default',
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}) => {
  return (
    <DropdownMenuPrimitive.Item
      data-inset={inset}
      data-slot="dropdown-menu-item"
      data-variant={variant}
      className={cn(
        `
          relative flex min-h-10 cursor-default items-center gap-2.5 rounded-sm px-2.5 text-[15px]
          outline-hidden transition-colors duration-120 select-none
          hover:cursor-pointer
          focus:bg-muted
          data-[disabled]:pointer-events-none data-[disabled]:opacity-45
          data-[variant=destructive]:text-destructive-text data-[variant=destructive]:focus:bg-danger-subtle
        `,
        inset && 'pl-8',
        className
      )}
      {...props}
    />
  );
};

const DropdownMenuCheckboxItem = ({
  className,
  children,
  checked,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) => {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      checked={checked}
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        `
          relative flex min-h-10 cursor-default items-center rounded-sm pr-2.5 pl-8 text-[15px] outline-hidden
          transition-colors duration-120 select-none
          focus:bg-muted
          data-[disabled]:pointer-events-none data-[disabled]:opacity-45
        `,
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check aria-hidden size={16} />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
};

const DropdownMenuRadioItem = ({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) => {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        `
          relative flex min-h-10 cursor-default items-center rounded-sm pr-2.5 pl-8 text-[15px] outline-hidden
          transition-colors duration-120 select-none
          focus:bg-muted
          data-[disabled]:pointer-events-none data-[disabled]:opacity-45
        `,
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Dot aria-hidden size={18} strokeWidth={4} />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
};

const DropdownMenuLabel = ({
  className,
  inset,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) => {
  return (
    <DropdownMenuPrimitive.Label
      data-inset={inset}
      data-slot="dropdown-menu-label"
      className={cn(
        'px-2.5 pt-2.5 pb-1.5 label-mono text-muted-foreground',
        inset && 'pl-8',
        className
      )}
      {...props}
    />
  );
};

const DropdownMenuSeparator = ({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) => {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      data-slot="dropdown-menu-separator"
      {...props}
    />
  );
};

const DropdownMenuShortcut = ({
  className,
  ...props
}: ComponentProps<'span'>) => {
  return (
    <span
      className={cn('ml-auto font-mono text-xs font-medium text-muted-foreground', className)}
      data-slot="dropdown-menu-shortcut"

      {...props}
    />
  );
};


export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
