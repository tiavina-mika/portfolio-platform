'use client';

import { useTranslations } from 'next-intl';
import {
  ReactNode, useCallback, useEffect, useId, useState,
} from 'react';

import { ROUTES } from '@/i18n/routes';
import { IMenu } from '@/types/app.type';
import { cn } from '@/utils/app.utils';

import ButtonLink from '../buttons/ButtonLink';
import Section from '../layouts/Section';
import Logo from '../Logo';
import ToggleTheme from '../ToggleTheme';
import NavBarLinks from './NavBarLinks';
import NavBarMobileMenu from './NavBarMobileMenu';
import TextLink from '../typography/TextLink';

type Props = {
  menus: IMenu[];
  /**
   * The currency select, a client container the bar only places
   */
  currencySelect?: ReactNode;
};

/**
 * The site navigation, one component for every width: from lg a bar with the logo, the pages and the
 * actions; below lg the logo, the actions and a button that drops the pages in a panel. The breakpoint
 * is pure CSS, so the server render is already the right one on both. Escape closes the panel.
 */
const NavBar = ({ menus, currencySelect }: Props) => {
  const t = useTranslations('NavBar');
  const menuId = useId();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  return (
    <header className="relative self-stretch border-b border-border bg-background">
      <Section className="min-h-[72px] flex-row items-center justify-between gap-4">
        <TextLink aria-label={t('home')} className="flex min-h-11 items-center" href="/">
          <Logo className="h-7" />
        </TextLink>
        <div className={`
          hidden
          lg:block
        `}
        >
          <NavBarLinks menus={menus} />
        </div>
        <div className="flex flex-row items-center gap-2">
          <ButtonLink
            className="max-sm:hidden"
            href={ROUTES.simulator}
            size="sm"
            variant="brand"
          >
            {t('estimate')}
          </ButtonLink>
          {currencySelect}
          <ToggleTheme />
          <button
            aria-controls={menuId}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(prev => !prev)}
            type="button"
            className={cn(`
              inline-flex h-11 cursor-pointer items-center rounded-md border border-input bg-transparent
              px-3.5 text-[15px] font-medium text-foreground
              hover:bg-muted
              lg:hidden
            `)}
          >
            {isMenuOpen ? t('closeMenu') : t('menu')}
          </button>
        </div>
      </Section>
      {isMenuOpen && <NavBarMobileMenu id={menuId} menus={menus} onNavigate={closeMenu} />}
    </header>
  );
};

export default NavBar;
