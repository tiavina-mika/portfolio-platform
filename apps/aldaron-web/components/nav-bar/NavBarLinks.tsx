'use client';

import { useTranslations } from 'next-intl';

import { IMenu } from '@/types/app.type';
import { cn } from '@/utils/app.utils';

import NavBarLink from './NavBarLink';


type Props = {
  menus: IMenu[];
};

/**
 * The page links of the desktop bar (>= lg)
 */
const NavBarLinks = ({ menus }: Props) => {
  const t = useTranslations('NavBar');

  return (
    <nav aria-label={t('mainNavigation')}>
      <ul className="flex flex-row items-center justify-between px-0">
        {menus.map((menu, index) => (
          <li
            key={menu.label + index}
            className={cn(`
              flex flex-row items-center self-stretch
              md:px-[10px]
              lg:px-[1vw]
              xl:px-[20px]
            `, { 'lg:max-2xl:hidden': index === 0 })}
          >
            <NavBarLink href={menu.value} label={menu.label} />
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavBarLinks;
