'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import { ComponentProps } from 'react';

import { cn } from '@/utils/app.utils';

const Tabs = TabsPrimitive.Root;

const tabsListVariants = cva(`
  group/tabs-list
  [scrollbar-width:none]
  overflow-x-auto
`, {
  variants: {
    variant: {
      underline: 'flex items-stretch gap-6 border-b border-border',
      pill: 'inline-flex gap-1 rounded-lg bg-muted p-1',
    },
  },
  defaultVariants: {
    variant: 'underline',
  },
});

type TabsListProps = ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>;

/**
 * `underline` splits a screen in sections, `pill` filters a list
 */
const TabsList = ({ className, variant = 'underline', ...props }: TabsListProps) => (
  <TabsPrimitive.List
    className={cn(tabsListVariants({ variant }), className)}
    data-slot="tabs-list"
    data-variant={variant}
    {...props}
  />
);

const TabsTrigger = ({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) => (
  <TabsPrimitive.Trigger
    data-slot="tabs-trigger"
    className={cn(
      `
        relative inline-flex cursor-pointer items-center gap-2 leading-none font-medium whitespace-nowrap
        text-muted-foreground transition-colors duration-120 ease-out
        not-disabled:hover:text-foreground
        disabled:cursor-not-allowed disabled:opacity-45
        data-[state=active]:text-foreground
      `,
      `
        group-data-[variant=underline]/tabs-list:min-h-11 group-data-[variant=underline]/tabs-list:px-0.5
        group-data-[variant=underline]/tabs-list:text-[15px]
        group-data-[variant=underline]/tabs-list:data-[state=active]:after:absolute
        group-data-[variant=underline]/tabs-list:data-[state=active]:after:inset-x-0
        group-data-[variant=underline]/tabs-list:data-[state=active]:after:-bottom-px
        group-data-[variant=underline]/tabs-list:data-[state=active]:after:h-0.5
        group-data-[variant=underline]/tabs-list:data-[state=active]:after:bg-foreground
        group-data-[variant=underline]/tabs-list:data-[state=active]:after:content-['']
      `,
      `
        group-data-[variant=pill]/tabs-list:min-h-9 group-data-[variant=pill]/tabs-list:rounded-md
        group-data-[variant=pill]/tabs-list:px-3.5 group-data-[variant=pill]/tabs-list:text-sm
        group-data-[variant=pill]/tabs-list:data-[state=active]:bg-card
        group-data-[variant=pill]/tabs-list:data-[state=active]:shadow-sm
      `,
      className
    )}
    {...props}
  />
);

/**
 * A count after the label of a tab (the number of items it holds)
 */
const TabsCount = ({ className, ...props }: ComponentProps<'span'>) => (
  <span
    data-slot="tabs-count"
    className={cn(
      `
        rounded-full bg-muted px-1.5 py-[3px] font-mono text-xs leading-none font-medium text-muted-foreground
        group-data-[variant=pill]/tabs-list:bg-background
      `,
      className
    )}
    {...props}
  />
);

const TabsContent = ({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content
    className={cn('pt-5', className)}
    data-slot="tabs-content"
    {...props}
  />
);

export {
  Tabs, TabsList, TabsTrigger, TabsCount, TabsContent,
};
