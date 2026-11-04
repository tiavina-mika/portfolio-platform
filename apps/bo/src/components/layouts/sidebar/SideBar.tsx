
import {
  Box, Collapse, ListSubheader,
} from '@mui/material';
import List from '@mui/material/List';
import { useRouterState, type RouterState } from '@tanstack/react-router';
import {
  Fragment, ReactNode, useState,
} from 'react';
import { useSelector } from 'react-redux';

import { FONT_SIZE_OVERLINE, SIDEBAR_GROUP_TITLE_ID } from '@/constants/_core/ui/ui.constants';
import { useNavigationMenus } from '@/hooks/useNavigationMenus';
import { getAppNotificationsSelector } from '@/redux/reducers/_core/app.reducer';
import { ISidebarSubMenu } from '@/types/_core/navigation.type';
import { IRole } from '@/types/_core/role.type';
import { canOpenMenuItem } from '@/utils/_core/role.utils';
import { getSidebarScrollbarStyles } from '@/utils/_core/theme/styles.utils';
import { SidebarTokens } from '@/utils/_core/theme/tokens.utils';

import SideBarItem from './SideBarItem';

const isSelected = (location: RouterState['location'], id: string, pathPosition = 0): boolean => {
  const isHome = location.pathname === '/';

  if (id === 'home') {
    return isHome;
  }

  const splittedPathnames = location.pathname.split('/');
  const pathnames = splittedPathnames.filter((path: string) => path);

  const firstPathname = pathnames[pathPosition];

  if (!firstPathname) return false;

  return id === `/${firstPathname}`;
};

const classes = {
  // mirrors `.sb-group-label` in the design reference
  subMenuHeader: (tokens: SidebarTokens) => ({
    backgroundColor: 'transparent',
    lineHeight: 1.4,
    fontWeight: 600,
    letterSpacing: 0.4,
    fontSize: FONT_SIZE_OVERLINE,
    textTransform: 'uppercase' as const,
    padding: '16px 14px 6px',
    color: tokens.group,
  }),
  // sub-items sit indented under their parent — no tree connector line in the design reference
  subMenuWrapper: { paddingLeft: 14 },
  /*
   * matches `nav{flex:1;overflow-y:auto;padding:8px 0}` in the design reference — growing and
   * scrolling here is what keeps the footer user block pinned to the bottom of the drawer.
   * minHeight:0 is required for a flex child to actually scroll instead of overflowing its parent.
   */
  nav: (tokens: SidebarTokens) => ({
    paddingTop: 8,
    paddingBottom: 8,
    flex: 1,
    minHeight: 0,
    overflowY: 'auto' as const,
    ...getSidebarScrollbarStyles(tokens),
  }),
};

type Props = {
  open: boolean;
  roles: IRole[];
  tokens: SidebarTokens;
  onClose: () => void;
};

const SideBar = ({
  open, roles, tokens, onClose,
}: Props) => {
  /*
   * unseen counts keyed by collection name (NOTIFICATION_COLLECTIONS) — drives the item badges.
   * Read here rather than handed down by the dashboard layout, so a badge refresh (polling,
   * LiveQuery push, tab focus) re-renders the menu only, not the whole shell around the page
   */
  const notifications = useSelector(getAppNotificationsSelector);
  /*
   * the location only: the whole router state also changes on every pending/resolved step of a
   * navigation, and each of those rebuilt the full menu tree with its per-item rights
   */
  const location = useRouterState({ select: state => state.location });
  const menus = useNavigationMenus();

  // expand the parent of whichever sub-route is active on load (bookmark, reload, shared link)
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>(() => menus.reduce(
    (acc: Record<string, boolean>, menu) => {
      menu.subMenus.forEach((subMenu) => {
        const hasActiveChild = !!subMenu.subMenus?.some(
          subMenu2 => isSelected(location, subMenu2.id, subMenu2.pathnamePosition)
        );

        if (hasActiveChild) {
          acc[subMenu.id] = true;
        }
      });

      return acc;
    },
    {}
  ));

  /*
   * the item's unseen rows, plus whatever other queue of work is filed under the same entry — the
   * badge says there is something to open behind the item, and both are
   */
  const getBadgeCount = (subMenu: ISidebarSubMenu): number => [
    ...(subMenu.className ? [subMenu.className] : []),
    ...(subMenu.badgeKeys ?? []),
  ].reduce((sum: number, key: string) => sum + (notifications[key] ?? 0), 0);

  const handleToggleSubMenu = (id: string) => {
    setOpenSubMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    // a plain block, not a list: it holds one list per group, and a `ul` may only contain `li`
    <List component="div" css={classes.nav(tokens)}>
      {menus.map((menu, index) => {
        const filteredSubMenus = menu.subMenus.reduce(
          (acc: ReactNode[], subMenu: ISidebarSubMenu, subMenuIndex: number) => {
            if (canOpenMenuItem(roles, subMenu)) {
              const isSubMenuOpen = openSubMenus[subMenu.id] ?? false;
              // a descendant route is active while this parent is still collapsed
              const hasActiveChild = !!subMenu.subMenus?.some(
                subMenu2 => isSelected(location, subMenu2.id, subMenu2.pathnamePosition)
              );

              acc.push(
                <Fragment key={subMenu.label + subMenuIndex}>
                  <SideBarItem
                    badgeCount={getBadgeCount(subMenu)}
                    isActiveGroup={!isSubMenuOpen && hasActiveChild}
                    isSubMenuOpen={isSubMenuOpen}
                    open={open}
                    subMenu={subMenu}
                    tokens={tokens}
                    isSelected={
                      !subMenu.subMenus && isSelected(location, subMenu.id, subMenu.pathnamePosition)
                    }
                    onClose={subMenu.subMenus
                      ? () => handleToggleSubMenu(subMenu.id)
                      : onClose
                    }
                  />
                  {/* the nested list belongs inside a row of the group, not beside it */}
                  {!!subMenu.subMenus?.length && (
                    <Box component="li" css={classes.subMenuWrapper}>
                      {subMenu.subMenus.map((subMenu2: ISidebarSubMenu, subMenu2Index: number) => {
                        if (!canOpenMenuItem(roles, subMenu2)) return null;

                        return (
                          /*
                           * unmountOnExit removes collapsed sub-items from the DOM/tab order on purpose —
                           * they follow their parent's disclosure state, so a collapsed group can't be
                           * tabbed into without first expanding it (same pattern as any tree/disclosure nav)
                           */
                          <Collapse
                            unmountOnExit
                            in={isSubMenuOpen}
                            key={subMenu2.label + subMenu2Index}
                            timeout="auto"
                          >
                            <List disablePadding>
                              <SideBarItem
                                isLevel2
                                isSelected={isSelected(location, subMenu2.id, subMenu2.pathnamePosition)}
                                onClose={onClose}
                                open={open}
                                subMenu={subMenu2}
                                tokens={tokens}
                              />
                            </List>
                          </Collapse>
                        );
                      })}
                    </Box>
                  )}
                </Fragment>
              );
            }

            return acc;
          }, [] as ReactNode[]);

        if (filteredSubMenus.length === 0) return null;

        return (
          /*
           * no horizontal inset: nav items run edge to edge inside the sidebar so the active
           * item's tint spans its full width — mirrors `nav{padding:8px 0}` in the design reference
           */
          <List
            disablePadding
            // the group is named by its own title, so the rows under it are read as belonging to it
            aria-labelledby={open ? `${SIDEBAR_GROUP_TITLE_ID}-${index}` : undefined}
            key={index}
            subheader={
              open
                ? (
                  <ListSubheader
                    disableSticky
                    css={classes.subMenuHeader(tokens)}
                    id={`${SIDEBAR_GROUP_TITLE_ID}-${index}`}
                  >
                    {menu.title}
                  </ListSubheader>
                )
                // collapsed rail: groups are separated by a plain gap, not a rule
                : index > 0
                  ? <Box aria-hidden component="li" sx={{ height: 8 }} />
                  : null
            }
          >
            {filteredSubMenus}
          </List>
        );
      })}
    </List>
  );
};

export default SideBar;
