'use client';


import dynamic from 'next/dynamic';
import React, { ReactNode, useState } from 'react';

import { Locale } from '@/i18n/config';
import { IMenu } from '@/types/app.type';
import { cn } from '@/utils/app.utils';

import Section from '../layouts/Section';
import LogoSVGMobile from '../LogoSVGMobile';
import NextIcon from '../NextIcon';
import HamburgerMenuSvgMobile from './HamburgerMenuSvgMobile';
import Search from './Search';
import TextLink from '../typography/TextLink';

// Client Components:
const NavBarMobileOpenMenu = dynamic(() => import('./NavBarMobileOpenMenu'), {
  ssr: false,
});

type Props = {
  menus: IMenu[];
  className?: string;
  toggleTheme: ReactNode;
  cvDownloadButton: ReactNode;
  locale: Locale;
  tSearch: string;
  tNoResults: string;
};
const NavBarMobile = ({
  menus,
  className,
  toggleTheme,
  locale,
  tSearch,
  tNoResults,
  cvDownloadButton,
}: Props) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [openSearchInput, setSearchInput] = useState(false);

  const toggleMenu = () => setOpenMenu(prev => !prev);
  const toggleSearchInput = () => setSearchInput(prev => !prev);

  return (
    <nav
      className={cn(
        `
          z-50 flex h-[55px] flex-col justify-center border-b border-dark-300 bg-white
          lg:hidden
          dark:border-neutral-800/90 dark:bg-neutral-900
        `,
        openMenu ? 'fixed top-0 right-0 left-0 h-[55px]' : '',
        className
      )}
    >
      <Section className="flex flex-row items-center justify-between self-stretch">
        {openSearchInput ? (
          <div className="relative flex flex-1 flex-row items-center self-stretch">
            <Search
              className="max-w-none"
              inputClassName="border-none px-0 pl-7"
              locale={locale}
              searchIconClassName="left-0"
              tNoResults={tNoResults}
              tSearch={tSearch}
            />
            <button
              className="absolute right-0 flex h-full flex-col justify-center self-stretch"
              type="button"
              onClick={toggleSearchInput}
            >
              <NextIcon size={20} src="/icons/x.svg" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-1 flex-row items-center">
              <TextLink href="/">
                <LogoSVGMobile />
              </TextLink>
            </div>
            <div className="flex flex-row justify-between space-x-4">
              <button
                className="mr-10 flex flex-col items-center justify-center self-stretch"
                type="button"
                onClick={toggleSearchInput}
              >
                <NextIcon
                  size={20}
                  src="/icons/search2.svg"
                  className={`
                    block
                    dark:hidden
                  `}
                />
                <NextIcon
                  size={20}
                  src="/icons/search2-dark.svg"
                  className={`
                    hidden
                    dark:block
                  `}
                />
              </button>
              {/* SSR download button */}
              {cvDownloadButton}
              <button
                className="flex flex-col items-center justify-center self-stretch"
                type="button"
                onClick={toggleMenu}
              >
                <HamburgerMenuSvgMobile open={openMenu} />
              </button>
            </div>
            <NavBarMobileOpenMenu
              menus={menus}
              openMenu={openMenu}
              toggleMenu={toggleMenu}
              toggleTheme={toggleTheme}
            />
          </>
        )}
      </Section>
    </nav>
  );
};

export default NavBarMobile;
