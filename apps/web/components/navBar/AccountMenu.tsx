'use client';

import { useParams } from 'next/navigation';
import { Fragment } from 'react';


import { usePathname, useRouter } from '@/i18n/routing';
import { IMenu } from '@/types/app.type';
import { getTranslatedAbsoluteUrl } from '@/utils/app.utils';


import NextIcon from '../NextIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';

/**
 * add redirect query to logout url
 * @param menu
 * @param fullUrl
 * @returns
 */
const getRedirectionUrl = (menu: IMenu, fullUrl: string): IMenu['value'] => {
  if (typeof menu.value !== 'string') return '';

  // add the current (full) url to redirect to it after logout
  if (menu.id === 'logout') {
    return `${menu.value}?redirect=${fullUrl}`;
  }

  return menu.value;
};

type Props = {
  menus: IMenu[];
};
const AccountMenu = ({ menus }: Props) => {
  const router = useRouter();
  const pathname = usePathname() as string;
  const params = useParams();
  const currentFullUrl = getTranslatedAbsoluteUrl(pathname, params as Record<string, string>);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`
        hidden
        focus-visible:ring-0
        md:block
      `}
      >
        <NextIcon
          aria-hidden="true"
          size={18}
          src="/icons/user.svg"
          className={`
            mr-2 text-muted-foreground/70
            focus-visible:ring-transparent
          `}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="px-4 py-3"
        onCloseAutoFocus={e => e.preventDefault()}
      >
        {menus.map((menu: IMenu, index: number) => (
          <Fragment key={index}>
            {menu.id === 'logout' && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={() =>
                router.push(getRedirectionUrl(menu, currentFullUrl))}
            >
              {menu.icon && (
                <NextIcon
                  aria-hidden="true"
                  className="mr-2 text-muted-foreground/70"
                  size={18}
                  src={menu.icon as string}
                />
              )}
              {menu.label}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountMenu;
