import { type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import { ComponentProps, ReactNode } from 'react';

import { Link as TranslatedLink } from '@/i18n/routing';
import { cn } from '@/utils/app.utils';

import { buttonVariants } from './Button';

type Props = {
  /**
   * An internal path of `ROUTES` (followed in the current language), or an external url with
   * `isExternal`
   */
  href: string;
  /**
   * An external link opens in a new tab and keeps the current language out of its url
   * @default false
   */
  isExternal?: boolean;
  /**
   * @default false
   */
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children: ReactNode;
  className?: string;
} & VariantProps<typeof buttonVariants> &
Omit<ComponentProps<'a'>, 'href' | 'className' | 'children'>;

/**
 * A link that looks like a `Button`: it goes to another page, where a button does something on this one.
 * Same variants and sizes as `Button`.
 */
const ButtonLink = ({
  href,
  isExternal = false,
  variant,
  size,
  fullWidth = false,
  iconLeft,
  iconRight,
  children,
  className,
  ...props
}: Props) => {
  const classes = cn(buttonVariants({ variant, size }), fullWidth && 'w-full', className);

  if (isExternal) {
    return (
      <Link
        className={classes}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
        {...props}
      >
        {iconLeft}
        {children}
        {iconRight}
      </Link>
    );
  }

  return (
    <TranslatedLink className={classes} href={href} {...(props as object)}>
      {iconLeft}
      {children}
      {iconRight}
    </TranslatedLink>
  );
};

export default ButtonLink;
