import { cva, type VariantProps } from 'class-variance-authority';
import Link, { type LinkProps } from 'next/link';
import React, { Fragment, ReactNode } from 'react';
import { Balancer } from 'react-wrap-balancer';

import { Link as TranslatedLink } from '@/i18n/routing';
import { cn } from '@/utils/app.utils';

import NextIcon from '../NextIcon';
import Text from './Text';


export const linkVariants = cva('', {
  variants: {
    buttonVariant: {
      contained: '',
      outlined: '',
    },
    variant: {
      text: `
        flex flex-row
        hover:opacity-90
      `,
      button:
        `
          rounded-md px-4 py-3 text-base
          hover:opacity-75
          md:px-6 md:py-4 md:text-lg
        `,
    },
    color: {
      active: 'text-primary',
      default: 'text-default',
    },
  },
  compoundVariants: [
    // dark
    {
      variant: 'button',
      buttonVariant: 'outlined',
      class:
        `
          border border-dark-300 text-black
          hover:bg-neutral-50
          dark:border-dark-400 dark:hover:bg-dark-500
        `,
    },
    {
      variant: 'button',
      buttonVariant: 'contained',
      class:
        `
          border border-primary bg-primary text-white
          hover:bg-dark-500
          dark:hover:bg-dark-500
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
   * alt text for icon
   */
  alt?: string;
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
} & VariantProps<typeof linkVariants> &
LinkProps;

const TextLink = ({
  children,
  alt,
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
}: TextLinkProps) => {
  const Component = translate ? TranslatedLink : Link;
  const ChildComponent = useChildSpan ? Text : Fragment;
  const childProps = useChildSpan
    ? { // e.g: <a><span>text</span></a>
      as: 'span' as any,
      className: cn(linkVariants({ buttonVariant, variant, color }), className, {
        underline: underline && variant === 'text' && !withHover,
        'hover:text-info-light hover:underline': withHover,
      }),
    }
    : {}; // e.g: <a>text</a>

  return (
    <Component
      className={useChildSpan ? '' : className} // if no span as a direct child of <a>, then apply the className to the <a>
      href={href}
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
            <NextIcon alt={alt} size={12} src="/icons/external-link.svg" />
          </Balancer>
        ) : (
          children
        )}
      </ChildComponent>
    </Component>
  );
};

export default TextLink;
