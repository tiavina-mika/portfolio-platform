'use client';

import { ReactNode } from 'react';

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenu as UIDropdownMenu,
} from '@/components/ui/DropdownMenu';
import { IMenuItem } from '@/types/app.type';

import NextIcon from './NextIcon';

type Props = {
  menus: IMenuItem[];
  title?: string;
  trigger?: ReactNode;
};
const DropdownMenu = ({ menus, title, trigger }: Props) => {
  return (
    <UIDropdownMenu>
      <DropdownMenuTrigger>
        {trigger || (
          <NextIcon alt="menus" size={18} src="/icons/more-horizontal.svg" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {title && (
          <>
            <DropdownMenuLabel>{title}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        {menus.map((menu: IMenuItem, index: number) => (
          <DropdownMenuItem key={index} onClick={menu.onClick}>
            {menu.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </UIDropdownMenu>
  );
};

export default DropdownMenu;
