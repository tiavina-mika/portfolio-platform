'use client';

import { usePathname } from '@/i18n/routing';
import { IMenu } from '@/types/app.type';
import { cn, isLinkActive } from '@/utils/app.utils';

import NextIcon from '../NextIcon';
import TextLink from '../typography/TextLink';

type Props = {
  label: IMenu['label'];
  href: IMenu['value'];
  /**
   * `inline` is a link of the desktop bar, `row` a full-width row of the mobile menu
   * @default 'inline'
   */
  variant?: 'inline' | 'row';
  onClick?: () => void;
};

/**
 * A page link of the navigation. The current page is told with `aria-current`, never by color alone.
 */
const NavBarLink = ({
  label, href, variant = 'inline', onClick,
}: Props) => {
  const isActive = isLinkActive(usePathname() as string, href);

  return (
    <TextLink
      aria-current={isActive ? 'page' : undefined}
      href={href}
      onClick={onClick}
      underline={false}
      className={cn(
        'flex flex-row justify-between py-3 font-medium',
        { 'text-black dark:text-secondary': isActive },
        variant === 'inline' && 'md:py-0',
        variant === 'row' && 'w-full'
      )}
    >
      {label}
      {variant === 'row' && (
        <NextIcon
          alt=""
          aria-hidden="true"
          className="opacity-50"
          size={18}
          src="/icons/chevron-right.svg"
        />
      )}
    </TextLink>
  );
};

export default NavBarLink;
