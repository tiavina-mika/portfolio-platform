'use client';

import { useTranslations } from 'next-intl';
import {
  ReactNode, useCallback, useEffect, useId, useState,
} from 'react';

import LanguageSwitcher from '@/components/languages/LanguageSwitcher';
import { useIsScrolled } from '@/hooks/useIsScrolled';
import { Locale } from '@/i18n/config';
import { usePathname } from '@/i18n/routing';
import { IMenu } from '@/types/app.type';
import { cn } from '@/utils/app.utils';

import Section from '../layouts/Section';
import LogoSVG from '../LogoSVG';
import LogoSVGMobile from '../LogoSVGMobile';
import NextIcon from '../NextIcon';
import ToggleTheme from '../ToggleTheme';
import AnimatedHamburgerMenu from './AnimatedHamburgerMenu';
import NavBarLinks from './NavBarLinks';
import NavBarMobileMenu from './NavBarMobileMenu';
import NavBarSearch from './NavBarSearch';
import TextLink from '../typography/TextLink';

type Props = {
  menus: IMenu[];
  locale: Locale;
  /**
   * The CV download button of the desktop bar, a server component rendered by the layout.
   * It is hidden on the home page, which already offers it.
   */
  cvButton?: ReactNode;
  /**
   * The icon-only CV download button of the mobile bar, a server component rendered by the layout
   */
  cvIcon?: ReactNode;
};

/**
 * The site navigation, one component for every width: from lg a bar with the logo, the search, the
 * pages, the CV download, the language and the theme; below lg a bar with the logo, the search, the
 * CV download and a burger opening the full menu. The breakpoint is pure CSS, so the server render is
 * already the right one on both.
 *
 * Opening the search closes the menu and the other way round; Escape closes the one that is open.
 */
const NavBar = ({
  menus, locale, cvButton, cvIcon,
}: Props) => {
  const t = useTranslations('NavBar');
  const menuId = useId();
  const isScrolled = useIsScrolled();
  // `/` whatever the locale
  const isHome = usePathname() === '/';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
    setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(prev => !prev);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (!isSearchOpen && !isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      setIsSearchOpen(false);
      setIsMenuOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isMenuOpen]);

  return (
    <header
      className={cn(
        `
          sticky top-0 z-50 self-stretch bg-white transition-shadow duration-200
          motion-reduce:transition-none
          dark:bg-neutral-900
        `,
        { 'shadow-md': isScrolled }
      )}
    >
      {/* ------------- desktop ------------- */}
      <div className={`
        hidden h-[93px] flex-col justify-center
        lg:flex
      `}
      >
        <Section className="flex flex-row items-center justify-between self-stretch">
          <div className="flex items-center self-stretch">
            <TextLink aria-label={t('home')} href="/">
              <LogoSVG />
            </TextLink>
          </div>
          <div className="flex flex-1 flex-row items-center">
            <div className="mx-4 flex w-full flex-1 flex-row items-center justify-end self-stretch">
              <NavBarSearch locale={locale} />
            </div>
            <NavBarLinks menus={menus} />
            <div className="ml-5 flex flex-row items-center gap-4 self-stretch">
              {/* cv download button (display if not in home) */}
              {!isHome && cvButton}
              <LanguageSwitcher className="w-[120px]!" />
              <ToggleTheme />
            </div>
          </div>
        </Section>
      </div>

      {/* ------------- mobile ------------- */}
      <div
        className={cn(
          `
            flex h-[55px] flex-col justify-center border-b border-dark-300 bg-white
            lg:hidden
            dark:border-neutral-800/90 dark:bg-neutral-900
          `,
          { 'fixed top-0 right-0 left-0 z-50': isMenuOpen }
        )}
      >
        <Section className="flex flex-row items-center justify-between self-stretch">
          {isSearchOpen ? (
            <div className="relative flex flex-1 flex-row items-center self-stretch">
              <NavBarSearch
                className="max-w-none"
                inputClassName="border-none px-0 pl-7"
                locale={locale}
                onNavigate={() => setIsSearchOpen(false)}
                searchIconClassName="left-0"
              />
              <button
                aria-label={t('closeSearch')}
                className="absolute right-0 flex h-full flex-col justify-center self-stretch"
                onClick={toggleSearch}
                type="button"
              >
                <NextIcon
                  alt=""
                  aria-hidden="true"
                  size={20}
                  src="/icons/x.svg"
                />
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-1 flex-row items-center">
                <TextLink aria-label={t('home')} href="/">
                  <LogoSVGMobile />
                </TextLink>
              </div>
              <div className="flex flex-row items-center justify-between gap-6">
                <button
                  aria-label={t('search')}
                  className="flex flex-col items-center justify-center self-stretch"
                  onClick={toggleSearch}
                  type="button"
                >
                  <NextIcon
                    alt=""
                    aria-hidden="true"
                    size={20}
                    src="/icons/search2.svg"
                    className={`
                      block
                      dark:hidden
                    `}
                  />
                  <NextIcon
                    alt=""
                    aria-hidden="true"
                    size={20}
                    src="/icons/search2-dark.svg"
                    className={`
                      hidden
                      dark:block
                    `}
                  />
                </button>
                {cvIcon}
                <AnimatedHamburgerMenu
                  aria-controls={menuId}
                  onClick={toggleMenu}
                  open={isMenuOpen}
                />
              </div>
            </>
          )}
        </Section>
      </div>
      <NavBarMobileMenu
        id={menuId}
        isOpen={isMenuOpen && !isSearchOpen}
        menus={menus}
        onNavigate={closeMenu}
      />
    </header>
  );
};

export default NavBar;
