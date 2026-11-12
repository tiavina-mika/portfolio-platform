'use client';

import { MoreHorizontal } from 'lucide-react';
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
          <MoreHorizontal aria-hidden size={18} />
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
