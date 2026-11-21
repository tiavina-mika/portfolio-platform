'use client';

import { usePathname } from '@/i18n/routing';
import { IMenu } from '@/types/app.type';
import { cn, isLinkActive } from '@/utils/app.utils';

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
 * A page link of the navigation. The current page is told with `aria-current` and a line under the
 * link, never by color alone.
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
        `
          flex min-h-11 flex-row items-center text-[15px] font-medium transition-colors duration-120
          hover:text-foreground
          motion-reduce:transition-none
        `,
        isActive ? 'text-foreground' : 'text-muted-foreground',
        variant === 'inline' && cn('px-3', isActive && 'shadow-[inset_0_-2px_0_var(--brand)]'),
        variant === 'row' && cn(
          `
            w-full rounded-md px-3
            hover:bg-muted
          `,
          isActive && 'bg-muted'
        )
      )}
    >
      {label}
    </TextLink>
  );
};

export default NavBarLink;
