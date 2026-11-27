'use client';

import { useTranslations } from 'next-intl';
import {
  ReactNode, useCallback, useEffect, useId, useRef, useState,
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
 * The site navigation, one component for every width: when the bar is at least 1040px wide, the logo,
 * the pages and the actions; below that, the logo, the actions and a button that drops the pages in a
 * panel. The switch is a CSS container query, so the server render is already the right one on both.
 * Escape closes the panel, and so does widening the bar.
 */
const NavBar = ({ menus, currencySelect }: Props) => {
  const t = useTranslations('NavBar');
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    /*
     * a wide bar hides the menu button: its width drops to 0, and the panel must not come back
     * open when the bar narrows again
     */
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === 0) setIsMenuOpen(false);
    });

    if (menuButtonRef.current) observer.observe(menuButtonRef.current);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    // above the page content, which the menu panel drops over
    <header className="relative z-40 self-stretch bg-background">
      <Section>
        <div className="@container relative w-full">
          {/* the line sits on the row, not on the header: it stops at the edges of the page content */}
          <div className={`
            flex min-h-[72px] flex-row items-center justify-between gap-4 border-b border-border
          `}
          >
            <TextLink aria-label={t('home')} className="flex min-h-11 items-center" href="/">
              {/* the wordmark would push the actions off a very narrow bar: the symbol stands in for it */}
              <Logo className={`
                h-7
                @max-[400px]:hidden
              `}
              />
              <Logo
                variant="symbol"
                className={`
                  h-7
                  @min-[400px]:hidden
                `}
              />
            </TextLink>
            <div className={`
              hidden
              @min-[1040px]:block
            `}
            >
              <NavBarLinks menus={menus} />
            </div>
            <div className="flex flex-row items-center gap-2">
              {currencySelect}
              <ToggleTheme className="size-9" />
              <ButtonLink
                href={ROUTES.simulator}
                size="sm"
                variant="brand"
                className={`
                  px-3.5 font-semibold tracking-normal
                  max-sm:hidden
                `}
              >
                {t('estimate')}
              </ButtonLink>
              <button
                aria-controls={menuId}
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen(prev => !prev)}
                ref={menuButtonRef}
                type="button"
                className={cn(`
                  inline-flex h-11 cursor-pointer items-center rounded-md border border-input bg-transparent
                  px-3.5 text-[15px] leading-none font-medium whitespace-nowrap text-foreground
                  hover:bg-muted
                  @min-[1040px]:hidden
                `)}
              >
                {isMenuOpen ? t('closeMenu') : t('menu')}
              </button>
            </div>
          </div>
          {isMenuOpen && <NavBarMobileMenu id={menuId} menus={menus} onNavigate={closeMenu} />}
        </div>
      </Section>
    </header>
  );
};

export default NavBar;
