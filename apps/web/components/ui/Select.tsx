/* eslint-disable no-useless-escape */
'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { ComponentProps } from 'react';

import { cn } from '@/utils/app.utils';

import NextIcon from '../NextIcon';

const Select = (props: ComponentProps<typeof SelectPrimitive.Root>) => (
  <SelectPrimitive.Root data-slot='select' {...props} />
);

const SelectGroup = (props: ComponentProps<typeof SelectPrimitive.Group>) => (
  <SelectPrimitive.Group data-slot='select-group' {...props} />
);

const SelectValue = (props: ComponentProps<typeof SelectPrimitive.Value>) => (
  <SelectPrimitive.Value data-slot='select-value' {...props} />
);

type SelectTriggerProps = ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: 'sm' | 'default';
  hideCaretIcon?: boolean;
};
const SelectTrigger = ({
  className,
  size = 'default',
  children,
  hideCaretIcon = false,
  ...props
}: SelectTriggerProps) => (
  <SelectPrimitive.Trigger
    data-size={size}
    data-slot='select-trigger'
    className={cn(
      `
        flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2
        text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none
        focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50
        disabled:cursor-not-allowed disabled:opacity-50
        aria-invalid:border-destructive aria-invalid:ring-destructive/20
        data-placeholder:text-muted-foreground
        data-[size=default]:h-9
        data-[size=sm]:h-8
        *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex
        *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2
        dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40
        [&_svg]:pointer-events-none [&_svg]:shrink-0
        [&_svg:not([class*=\'size-\'])]:size-4 [&_svg:not([class*=\'text-\'])]:text-muted-foreground
      `,
      className
    )}
    {...props}
  >
    {children}
    {!hideCaretIcon && (
      <SelectPrimitive.Icon asChild>
        <>
          {/* light */}
          <NextIcon
            size={16}
            src="/icons/chevron-down.svg"
            className={`
              block opacity-50
              dark:hidden
            `}
          />
          {/* dark */}
          <NextIcon
            size={16}
            src="/icons/chevron-down-dark.svg"
            className={`
              hidden opacity-50
              dark:block
            `}
          />
        </>
      </SelectPrimitive.Icon>
    )}
  </SelectPrimitive.Trigger>
);

const SelectScrollUpButton = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollUpButton>) => (
  <SelectPrimitive.ScrollUpButton
    data-slot='select-scroll-up-button'
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <NextIcon size={12} src="/icons/chevron-up.svg" />
  </SelectPrimitive.ScrollUpButton>
);

const SelectScrollDownButton = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollDownButton>) => (
  <SelectPrimitive.ScrollDownButton
    data-slot='select-scroll-down-button'
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <NextIcon size={12} src="/icons/chevron-down.svg" />
  </SelectPrimitive.ScrollDownButton>
);

const SelectContent = ({
  className,
  children,
  position = 'popper',
  align = 'center',
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      align={align}
      data-slot='select-content'
      position={position}
      className={cn(
        `
          relative z-50 max-h-(--radix-select-content-available-height) min-w-32
          origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border
          bg-popover text-popover-foreground shadow-md
          data-[side=bottom]:slide-in-from-top-2
          data-[side=left]:slide-in-from-right-2
          data-[side=right]:slide-in-from-left-2
          data-[side=top]:slide-in-from-bottom-2
          data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
          data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
        `,
        position === 'popper' &&
          `
            data-[side=bottom]:translate-y-1
            data-[side=left]:-translate-x-1
            data-[side=right]:translate-x-1
            data-[side=top]:-translate-y-1
          `,
        className
      )}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width) scroll-my-1'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
);

const SelectLabel = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Label>) => (
  <SelectPrimitive.Label
    className={cn('px-2 py-1.5 text-xs text-muted-foreground', className)}
    data-slot='select-label'
    {...props}
  />
);

const SelectItem = ({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) => (
  <SelectPrimitive.Item
    data-slot='select-item'
    className={cn(
      `
        relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm
        outline-hidden select-none
        focus:bg-accent focus:text-accent-foreground
        data-disabled:pointer-events-none data-disabled:opacity-50
        [&_svg]:pointer-events-none [&_svg]:shrink-0
        [&_svg:not([class*=\'size-\'])]:size-4 [&_svg:not([class*=\'text-\'])]:text-muted-foreground
        *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2
      `,
      className
    )}
    {...props}
  >
    <span className='absolute right-2 flex size-3.5 items-center justify-center'>
      <SelectPrimitive.ItemIndicator>
        <NextIcon size={12} src="/icons/check.svg" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
);

const SelectSeparator = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Separator>) => (
  <SelectPrimitive.Separator
    className={cn('pointer-events-none -mx-1 my-1 h-px bg-border', className)}
    data-slot='select-separator'
    {...props}
  />
);

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
