'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import Socials from '@/components/footer/Socials';
import LanguageButtons from '@/components/languages/LanguageButtons';
import ToggleTheme from '@/components/ToggleTheme';
import { IMenu } from '@/types/app.type';

import NavBarLink from './NavBarLink';

type Props = {
  /** id the burger button points at with aria-controls */
  id: string;
  menus: IMenu[];
  isOpen: boolean;
  /** called when a link is followed, to close the menu */
  onNavigate: () => void;
};

/**
 * The full-screen menu of the mobile bar (below lg)
 */
const NavBarMobileMenu = ({
  id, menus, isOpen, onNavigate,
}: Props) => {
  const t = useTranslations('NavBar');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          animate={{ x: 0 }}
          exit={{ transition: { duration: 0.4 } }}
          id={id}
          initial={{ x: -54 }}
          key="menu"
          transition={{ duration: 0.7 }}
          className={`
            fixed inset-x-0 top-[55px] bottom-0 z-50 flex flex-1 flex-col justify-between self-stretch
            overflow-y-auto bg-white
            lg:hidden
            dark:bg-neutral-900
          `}
        >
          <nav aria-label={t('mainNavigation')} className="flex flex-1 flex-col self-stretch">
            <ul className="m-0 flex list-none flex-col self-stretch p-0">
              {menus.map((menu, index) => (
                <li
                  key={menu.label + index}
                  className={`
                    self-stretch border-b px-4
                    dark:border-neutral-800/90
                  `}
                >
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
          <div className="flex flex-col gap-4 p-4">
            <LanguageButtons />
            <ToggleTheme />
            <Socials isCentered className="pb-2" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NavBarMobileMenu;
