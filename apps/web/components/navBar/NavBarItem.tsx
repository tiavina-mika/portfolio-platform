'use client';

import { usePathname } from '@/i18n/routing';
import { IMenu } from '@/types/app.type';
import { cn } from '@/utils/app.utils';


import NextIcon from '../NextIcon';
import TextLink, { TextLinkProps } from '../typography/TextLink';

const isLinkActive = (currentPath: string, href: IMenu['value']): boolean => {
  if ((href as any).pathname) {
    return currentPath.startsWith((href as any).pathname);
  }

  return href === currentPath;
};

type Props = {
  label: IMenu['label'];
  href: IMenu['value'];
  className?: string;
  rootClassName?: string;
  withArrow?: boolean;
  onClick?: () => void;
} & TextLinkProps;
const NavBarItem = ({
  label,
  href,
  className,
  rootClassName,
  onClick,
  withArrow = false,
  ...linkProps
}: Props) => {
  const currentPath = usePathname();

  return (
    <li className={cn(`
      border-b border-gray-100
      md:border-b-0
    `, rootClassName)}
    >
      <TextLink
        {...linkProps}
        href={href}
        onClick={onClick}
        underline={false}
        className={cn(
          {
            'text-black dark:text-secondary': isLinkActive(
              currentPath as string,
              href
            ),
          },
          className,
          `
            flex flex-row justify-between py-3 font-medium
            md:py-0
          `
        )}
      >
        {label}
        <NextIcon
          size={18}
          src="/icons/chevron-right.svg"
          className={cn('opacity-50', {
            'inline-block md:hidden': !withArrow,
          })}
        />
      </TextLink>
    </li>
  );
};

export default NavBarItem;
