import { ReactNode } from 'react';

import { UIRoleEnum } from '@/types/_core/role.type';

type HasRightName = 'canCreate' | 'canFind' | 'canGet' | 'canUpdate' | 'canDelete' | 'canDestroy';

export interface ISidebarSubMenu {
  id: string;
  label: string;
  onClick: () => void;
  icon: ReactNode;
  className?: string;
  pathnamePosition?: number;
  subMenus?: ISidebarSubMenu[];
  uiRight?: UIRoleEnum | UIRoleEnum[];
  hasRightName?: HasRightName;
  // shown to every authenticated role regardless of rights — for items whose route has no permission guard
  alwaysVisible?: boolean;
  /*
   * notification keys counted into this item's badge on top of its collection's unseen rows — a
   * queue of work filed under the same entry (the open driver no-show reports on "Requests")
   */
  badgeKeys?: string[];
}

export interface ISidebarMenu {
  title: string;
  subMenus: ISidebarSubMenu[];
  hasRightName?: HasRightName;
}
