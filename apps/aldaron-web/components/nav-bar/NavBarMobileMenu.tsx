'use client';

import { useTranslations } from 'next-intl';

import { IMenu } from '@/types/app.type';

import NavBarLink from './NavBarLink';

type Props = {
  /** id the menu button points at with aria-controls */
  id: string;
  menus: IMenu[];
  /** called when a link is followed, to close the menu */
  onNavigate: () => void;
};

/**
 * The menu that drops under the bar below lg: the page links in a floating panel
 */
const NavBarMobileMenu = ({ id, menus, onNavigate }: Props) => {
  const t = useTranslations('NavBar');

  return (
    <nav
      aria-label={t('mainNavigation')}
      id={id}
      className={`
        absolute inset-x-4 top-full z-50 rounded-lg border border-border bg-popover p-2 shadow-lg
        md:inset-x-6
        lg:hidden
      `}
    >
      <ul className="m-0 grid list-none gap-1 p-0">
        {menus.map(menu => (
          <li key={menu.id}>
            <NavBarLink
              href={menu.value}
              label={menu.label}
              onClick={onNavigate}
              variant="row"
            />
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavBarMobileMenu;
