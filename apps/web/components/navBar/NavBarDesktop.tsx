
import { Suspense } from 'react';

import DownloadCV from '@/containers/app/DownloadCV';
import { Locale } from '@/i18n/config';
import { IMenu } from '@/types/app.type';
import { cn } from '@/utils/app.utils';

import Section from '../layouts/Section';
import LogoSVG from '../LogoSVG';
import NextIcon from '../NextIcon';
import ToggleTheme from '../ToggleTheme';
import FixedNavBarDesktop from './FixedNavBarDesktop';
import NavBarItem from './NavBarItem';
import Search from './Search';
import TextLink from '../typography/TextLink';

type Props = {
  className?: string;
  menus: IMenu[];
  locale: Locale;
  isHome?: boolean;
  buttonText?: string;
  searchPlaceholder?: string;
  noResultMessage?: string;
};

const NavBarDesktop = ({
  className, menus, locale,
  /*
   * Because storybook doesn't support RSC async yet, we put pass
   * These props from the parent RSC component
   */
  isHome, buttonText, searchPlaceholder, noResultMessage,
}: Props) => {
  return (
    <FixedNavBarDesktop
      className={cn(
        `
          hidden h-[93px] flex-col justify-center bg-white
          lg:flex
          dark:bg-neutral-900
        `,
        className
      )}
    >
      <Section className="flex flex-row items-center justify-between self-stretch">
        <div className="flex items-center self-stretch">
          <TextLink href="/">
            <LogoSVG />
          </TextLink>
        </div>
        <ul className={cn('flex flex-1 flex-row items-center', className)}>
          <li className="mx-4 flex w-full flex-1 flex-row items-center justify-end self-stretch">
            <Search
              locale={locale}
              tNoResults={noResultMessage || 'No results found'}
              tSearch={searchPlaceholder || 'Search'}
            />
          </li>
          {/* links */}
          <li>
            <ul className="flex flex-row items-center justify-between px-0">
              {menus.map((menu, index) => (
                <NavBarItem
                  href={menu.value}
                  key={menu.label + index}
                  label={menu.label}
                  rootClassName={cn(
                    `
                      flex flex-row items-center self-stretch
                      md:px-[10px]
                      lg:px-[1vw]
                      xl:px-[20px]
                    `,
                    { 'lg:max-2xl:hidden': index === 0 }
                  )}
                />
              ))}
            </ul>
          </li>
          <li className="ml-5 flex flex-row items-center self-stretch">
            <ul className="flex flex-row items-center justify-between px-0">
              {/* cv download button (display if not in home) */}
              {!isHome && (
                <li>
                  <Suspense fallback={null}>
                    <DownloadCV

                      componentType="button"
                      variant="text"
                      className={`
                        flex flex-row rounded-md border! px-5 py-3 text-base font-medium
                        max-2xl:px-2 max-2xl:py-1
                        dark:bg-secondary dark:text-neutral-900! dark:hover:bg-secondary/90
                      `}
                    >
                      <NextIcon
                        alt="download"
                        size={24}
                        src="/icons/download.svg"
                        className={`
                          block
                          dark:hidden
                        `}
                      />
                      <NextIcon
                        alt="download"
                        size={24}
                        src="/icons/download-dark.svg"
                        className={`
                          hidden
                          dark:block
                        `}
                      />
                      <span className={`
                        ml-2
                        max-2xl:hidden
                      `}
                      >
                        {buttonText}
                      </span>
                    </DownloadCV>
                  </Suspense>
                </li>
              )}
              {/* theme selection */}
              <li className="flex items-center px-4">
                <ToggleTheme />
              </li>
            </ul>
          </li>
        </ul>
      </Section>
    </FixedNavBarDesktop>
  );
};

export default NavBarDesktop;
