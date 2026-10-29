'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { ReactNode } from 'react';


import Socials from '@/components/footer/Socials';
import { IMenu } from '@/types/app.type';

import NextIcon from '../NextIcon';
import TextLink from '../typography/TextLink';

const classes = {
  menu: 'height-[calc(100vh-55px)] fixed bottom-0 left-0 right-0 top-[55px] z-50 flex flex-1 flex-col justify-between self-stretch bg-white dark:bg-neutral-900',

};

// Client Components:
type Props = {
  menus: IMenu[];
  toggleTheme: ReactNode;
  toggleMenu: () => void;
  openMenu: boolean;
};
const NavBarMobileOpenMenu = ({
  menus,
  toggleTheme,
  toggleMenu,
  openMenu,
}: Props) => {
  return (
    <AnimatePresence>
      {openMenu && (
        <motion.div
          animate={{ x: 0 }}
          // className={classes.menu}
          exit={{ transition: { duration: 0.4 } }}
          initial={{ x: -54 }}
          key="menu"
          transition={{ duration: 0.7 }}
          {...(classes && { className: classes.menu })} // avoid className not recognized

        >
          <ul className="m-0 flex flex-1 flex-col self-stretch p-0">
            {menus.map((menu, index) => (
              <li
                key={menu.label + index}
                className={`
                  self-stretch border-b p-4
                  dark:border-neutral-800/90
                `}
              >
                <TextLink
                  className="flex flex-row justify-between font-medium"
                  href={menu.value}
                  onClick={toggleMenu}
                  underline={false}
                >
                  {menu.label}
                  <NextIcon size={18} src="/icons/chevron-right.svg" />
                </TextLink>
              </li>
            ))}
            <li className="self-stretch p-4">{toggleTheme}</li>
          </ul>
          <Socials className="mb-6" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NavBarMobileOpenMenu;
