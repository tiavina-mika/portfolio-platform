'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import {
  ComponentProps,
} from 'react';

import { cn } from '@/utils/app.utils';

import NextIcon from '../NextIcon';

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
          flex cursor-default items-center rounded-xs px-2 py-1.5 text-sm outline-hidden select-none
          focus:bg-accent
          data-[state=open]:bg-accent
        `,
        inset && 'pl-8',
        className
      )}
      {...props}
    >
      {children}
      <NextIcon className="ml-auto" size={18} src="/icons/chevron-right.svg" />
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
          z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg
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
          'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-popover-foreground shadow-md',
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
          relative flex cursor-default items-center rounded-xs px-2 py-1.5 text-sm outline-hidden
          transition-colors select-none
          hover:cursor-pointer
          focus:border-0 focus:bg-accent focus:text-accent-foreground
          data-[disabled]:pointer-events-none data-[disabled]:opacity-50
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
          relative flex cursor-default items-center rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden
          transition-colors select-none
          focus:bg-accent focus:text-accent-foreground
          data-[disabled]:pointer-events-none data-[disabled]:opacity-50
        `,
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <NextIcon size={18} src="/icons/check.svg" />
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
          relative flex cursor-default items-center rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden
          transition-colors select-none
          focus:bg-accent focus:text-accent-foreground
          data-[disabled]:pointer-events-none data-[disabled]:opacity-50
        `,
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <NextIcon
            className="fill-current"
            size={18}
            src="/icons/dot-circle-solid.svg"
          />
          {' '}
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
        'px-2 py-1.5 text-sm font-semibold',
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
      className={cn('ml-auto text-xs tracking-widest opacity-60', className)}
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
