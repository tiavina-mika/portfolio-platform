import { cva, type VariantProps } from 'class-variance-authority';
import { ExternalLink } from 'lucide-react';
import Link, { type LinkProps } from 'next/link';
import React, { Fragment, ReactNode } from 'react';
import { Balancer } from 'react-wrap-balancer';

import { Link as TranslatedLink } from '@/i18n/routing';
import { cn } from '@/utils/app.utils';

import Text from './Text';


export const linkVariants = cva('', {
  variants: {
    buttonVariant: {
      contained: '',
      outlined: '',
    },
    variant: {
      text: `
        flex flex-row transition-colors duration-120
        hover:text-brand-text
      `,
      button:
        `
          inline-flex h-11 items-center justify-center gap-2 rounded-md px-4.5 text-[15px] font-medium
          transition-colors duration-120
        `,
    },
    color: {
      active: 'text-brand-text',
      default: 'text-foreground',
    },
  },
  compoundVariants: [
    // dark
    {
      variant: 'button',
      buttonVariant: 'outlined',
      class:
        `
          border border-input text-foreground
          hover:border-input-hover hover:bg-muted
        `,
    },
    {
      variant: 'button',
      buttonVariant: 'contained',
      class:
        `
          border border-transparent bg-primary text-primary-foreground
          hover:bg-primary-hover hover:text-primary-foreground
        `,
    },
    {
      variant: 'text',
      buttonVariant: 'contained',
      class: '',
    },
  ],
  defaultVariants: {
    variant: 'text',
  },
});

export type TextLinkProps = {
  /**
   * if external link, open in new tab
   * no internal routing
   * @default false
   */
  isExternal?: boolean;
  children?: ReactNode;
  /**
   * override styles
   * - if useChildSpan false => styles for <a>
   * - if useChildSpan true => styles for <span>
   */
  className?: string;
  /**
   * url
   */
  href?: any;
  /**
   * translate the link or not
   * @default true
   */
  translate?: boolean;
  /**
   * if true, text-decoration: underline
   * @default true
   */
  underline?: boolean;
  /**
   * if true, change styles on hover
   * @default false
   */
  withHover?: boolean;
  /**
   * button variant
   * only if variant = button
   * @default false
   */
  buttonVariant?: 'contained' | 'outlined';
  /**
   * type of link
   * @default default
   */
  color?: 'active' | 'default';
  /**
   * used if useChildSpan true
   * @default md
   */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /**
   * if true, use a span as a direct child of <a>
   * @default true
   */
  useChildSpan?: boolean;
  /**
   * variant of link
   * @default text
   */
  variant?: 'text' | 'button';
  /**
   * click handler of the <a>
   */
  onClick?: () => void;
  /**
   * marks the link of the current page for assistive technologies
   */
  'aria-current'?: 'page' | undefined;
} & VariantProps<typeof linkVariants> &
LinkProps;

const TextLink = ({
  children,
  shallow,
  replace,
  scroll,
  prefetch = false,
  className,
  isExternal,
  href,
  useChildSpan = true,
  withHover = false,
  buttonVariant = 'contained',
  color = 'default',
  variant = 'text',
  translate = true,
  underline = true,
  onClick,
  'aria-current': ariaCurrent,
}: TextLinkProps) => {
  const Component = translate ? TranslatedLink : Link;
  const ChildComponent = useChildSpan ? Text : Fragment;
  const childProps = useChildSpan
    ? { // e.g: <a><span>text</span></a>
      as: 'span' as any,
      className: cn(linkVariants({ buttonVariant, variant, color }), className, {
        underline: underline && variant === 'text' && !withHover,
        'hover:text-brand-text hover:underline': withHover,
      }),
    }
    : {}; // e.g: <a>text</a>

  return (
    <Component
      aria-current={ariaCurrent}
      className={useChildSpan ? '' : className} // if no span as a direct child of <a>, then apply the className to the <a>
      href={href}
      onClick={onClick}
      prefetch={prefetch ?? false}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      target={isExternal ? '_blank' : undefined}
    >
      <ChildComponent {...childProps}>
        {isExternal ? (
          <Balancer as="span">
            <span className="max-w-full leading-relaxed">{children}</span>
            <ExternalLink aria-hidden size={12} />
          </Balancer>
        ) : (
          children
        )}
      </ChildComponent>
    </Component>
  );
};

export default TextLink;
