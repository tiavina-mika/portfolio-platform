import { useRouterState } from '@tanstack/react-router';
import { useMemo } from 'react';

import { useNavigationMenus } from '@/hooks/useNavigationMenus';
import { ISidebarSubMenu } from '@/types/_core/navigation.type';

const getFirstPathSegment = (path: string): string | undefined => path.split('/').find(Boolean);

const matchesCurrentSegment = (subMenu: ISidebarSubMenu, currentSegment: string): boolean => (
  getFirstPathSegment(subMenu.id) === currentSegment ||
  !!subMenu.subMenus?.some(subMenu2 => getFirstPathSegment(subMenu2.id) === currentSegment)
);

/**
 * label of the sidebar group (`SideBar`'s `nav-label`, e.g. "Operations", "Content") the current
 * route belongs to — matched against `useNavigationMenus` by comparing the first URL segment, so
 * it also resolves for pages without their own sidebar entry (e.g. `/articles/:id/edit`).
 */
export const useSidebarGroupLabel = (): string | undefined => {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const menus = useNavigationMenus();

  return useMemo(() => {
    const currentSegment = getFirstPathSegment(pathname);

    if (!currentSegment) return undefined;

    const matchingMenu = menus.find(
      menu => menu.subMenus.some(subMenu => matchesCurrentSegment(subMenu, currentSegment))
    );

    return matchingMenu?.title;
  }, [menus, pathname]);
};
