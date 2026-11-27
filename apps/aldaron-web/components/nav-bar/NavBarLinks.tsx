'use client';

import { useTranslations } from 'next-intl';

import { IMenu } from '@/types/app.type';

import NavBarLink from './NavBarLink';

type Props = {
  menus: IMenu[];
};

/**
 * The page links of the wide bar
 */
const NavBarLinks = ({ menus }: Props) => {
  const t = useTranslations('NavBar');

  return (
    <nav aria-label={t('mainNavigation')}>
      <ul className="m-0 flex list-none flex-row items-center gap-1 p-0">
        {menus.map(menu => (
          <li key={menu.id}>
            <NavBarLink href={menu.value} label={menu.label} />
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavBarLinks;
