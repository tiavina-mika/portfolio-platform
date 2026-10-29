import { Collapse, Divider, ListSubheader } from '@mui/material';
import List from '@mui/material/List';
import { useNavigate, useRouterState, type RouterState } from '@tanstack/react-router';
import {
  Fragment, ReactNode, useState, useMemo, useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import { FaLockOpen } from 'react-icons/fa';
import {
  FiChevronRight,
  FiChevronUp,
  FiSettings,
  FiUsers,
  FiLayers,
  FiFileText,
  FiLayout,
  FiTool,
  FiPackage,
  FiMessageCircle,
  FiServer,
  FiGrid,
} from 'react-icons/fi';
import { capitalize } from 'string-ts';

import { goToMisc, goToSettings, goToTests } from '@/redux/actions/app.action';
import { goToArticles } from '@/redux/actions/article.action';
import { goToCategories } from '@/redux/actions/category.action';
import { goToPages } from '@/redux/actions/page.action';
import { goToPageSections } from '@/redux/actions/pageSection.action';
import { goToProjects } from '@/redux/actions/project.action';
import { goToRoles } from '@/redux/actions/role.action';
import { goToUsers } from '@/redux/actions/user.action';
import { goToList } from '@/redux/actions/util.action';
import { IRole, UIRoleEnum } from '@/types/role.type';
import { PATH_NAMES } from '@/utils/pathnames';
import { getRights } from '@/utils/role.utils';

import SideBarItem from './SideBarItem';

/**
 * mark list as selected if the current route is match the list id
 * @param {RouterState['location']} location
 * @param {string} id
 * @returns
 */
const isSelected = (location: RouterState['location'], id: string, pathPosition = 0): boolean => {
  const isHome = location.pathname === '/';

  // the home url is an exception since it's just /
  if (id === 'home') {
    return isHome;
  }

  // ex: /recycle-bin/contacts => recycle-
  const splittedPathnames = location.pathname.split('/');
  const pathnames = splittedPathnames.filter((path: string) => path);

  /*
   * ex: /articles/categories => /categories (position: 2)
   * ex: /articles/xxxx => /articles
   */
  const firstPathname = pathnames[pathPosition];

  if (!firstPathname) return false;

  return id.includes(firstPathname);
};

const renderRightIcon = (withSubMenus: boolean, openSubMenu: boolean): ReactNode | null => {
  if (!withSubMenus) return null;
  return openSubMenu ? <FiChevronUp /> : <FiChevronRight />;
};

type HasRightName = 'canCreate' | 'canFind' | 'canGet' | 'canUpdate' | 'canDelete' | 'canDestroy';

export interface ISubMenu {
  id: string;
  label: string;
  onClick?: () => void;
  icon: ReactNode;
  className?: string;
  notification?: number;
  pathnamePosition?: number;
  subMenus?: ISubMenu[];
  uiRight?: UIRoleEnum;
  hasRightName?: HasRightName;
}

interface IMenu {
  title?: string;
  subMenus: ISubMenu[];
  hasRightName?: HasRightName;
}

const classes = {
  subMenuHeader: {
    lineHeight: 1.57,
    fontWeight: 500,
    opacity: 0.8,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    marginTop: 14,
    marginBottom: 9,
  },
};

const ICON_SIZE = 20;
// const SUBMENU_ICON_SIZE = 16;

type Props = {
  open: boolean;
  roles: IRole[];
  onClose: () => void;
};

const SideBar = ({
  open, roles, onClose,
}: Props) => {
  const {
    t,
  } = useTranslation(['common', 'route', 'user']);
  const {
    location,
  } = useRouterState();
  const navigate = useNavigate();

  const [openSubMenu, setOpenSubMenu] = useState<boolean>(true);
  const toggleOpenSubMenu = useCallback(() => setOpenSubMenu((prev) => !prev), []);

  // Memoize menus for performance
  const menus: IMenu[] = useMemo(() => [
    {
      // title: t('common:webSite'),
      subMenus: [
        {
          id: PATH_NAMES.articles,
          label: t('cms:articles'),
          onClick: () => navigate(goToArticles()),
          icon: <FiFileText size={ICON_SIZE} />,
          className: 'Article',
          hasRightName: 'canFind',
        },
        {
          id: 'page-group',
          // id: PATH_NAMES.pages,
          onClick: toggleOpenSubMenu,
          label: t('cms:webPage'),
          icon: <FiLayers size={ICON_SIZE} />,
          className: 'Page',
          hasRightName: 'canFind',
          subMenus: [
            {
              id: PATH_NAMES.pages,
              label: t('cms:pages'),
              onClick: () => navigate(goToPages()),
              icon: <FiLayout size={ICON_SIZE} />,
              className: 'Page',
              hasRightName: 'canFind',
            },
            {
              id: PATH_NAMES.pageSections,
              label: t('cms:sections'),
              onClick: () => navigate(goToPageSections()),
              icon: <FiServer size={ICON_SIZE} />,
              className: 'Page',
              hasRightName: 'canFind',
            },
          ],
        },
        {
          id: PATH_NAMES.categories,
          label: t('cms:category.categories'),
          onClick: () => navigate(goToCategories()),
          icon: <FiGrid size={ICON_SIZE} />,
          className: 'Category',
          hasRightName: 'canFind',
        },
      ],
    },
    {
      // title: 'Apps',
      subMenus: [
        {
          id: PATH_NAMES.users,
          label: t('user:users'),
          onClick: () => navigate(goToUsers()),
          icon: <FiUsers size={ICON_SIZE} />,
          className: '_User',
          hasRightName: 'canFind',
        },
        {
          id: PATH_NAMES.contacts,
          label: t('user:contacts.contacts'),
          onClick: () => navigate(goToList('contacts')),
          icon: <FiMessageCircle size={ICON_SIZE} />,
          className: 'Contact',
          hasRightName: 'canFind',
        },
      ],
    },
    {
      // title: 'Apps',
      subMenus: [
        {
          id: PATH_NAMES.projects,
          label: t('common:project.projects'),
          onClick: () => navigate(goToProjects()),
          icon: <FiPackage size={ICON_SIZE} />,
          className: 'Project',
          hasRightName: 'canFind',
        },
      ],
    },
    {
      // title: t('common:settings'),
      subMenus: [
        {
          id: PATH_NAMES.roles,
          label: t('user:role.rights'),
          onClick: () => navigate(goToRoles()),
          icon: <FaLockOpen size={ICON_SIZE} />,
          className: '_Role',
          hasRightName: 'canFind',
        },
        {
          id: PATH_NAMES.settings,
          label: t('common:settings'),
          onClick: () => navigate(goToSettings()),
          icon: <FiSettings size={ICON_SIZE} />,
          hasRightName: 'canFind',
        },
        {
          id: PATH_NAMES.miscellaneous,
          label: capitalize(t('route:miscellaneous')),
          onClick: () => navigate(goToMisc()),
          icon: <FiServer size={ICON_SIZE} />,
          uiRight: UIRoleEnum.MISCELLANEOUS,
          hasRightName: 'canFind',
        },
        {
          id: PATH_NAMES.tests,
          label: capitalize(t('route:tests')),
          onClick: () => navigate(goToTests()),
          icon: <FiTool size={ICON_SIZE} />,
          uiRight: UIRoleEnum.TESTS,
          hasRightName: 'canFind',
        },
      ],
    },
  ], [t, navigate, toggleOpenSubMenu]);

  // Memoize filtered submenus for each menu
  const filteredMenus = useMemo(() => menus.map((menu) => {
    const filteredSubMenus = menu.subMenus.reduce(
      (acc: ReactNode[], subMenu: ISubMenu, subMenuIndex: number) => {
        // check rights
        const rightObj = getRights(roles, subMenu.className, subMenu.uiRight);
        // e.g: rightObj.canFind: true
        const hasRight = rightObj[subMenu.hasRightName!];

        if (hasRight) {
          acc.push(
            <Fragment key={subMenu.label + subMenuIndex}>
              <SideBarItem
                isSelected={isSelected(location, subMenu.id, subMenu.pathnamePosition)}
                open={open}
                rightIcon={renderRightIcon(!!subMenu.subMenus, openSubMenu)}
                subMenu={subMenu}
                onClose={onClose}
              />
              {subMenu.subMenus?.map((subMenu2: ISubMenu, subMenu2Index: number) => (
                <Collapse
                  key={subMenu2.label + subMenu2Index}
                  unmountOnExit
                  in={openSubMenu}
                  timeout="auto"
                >
                  <List disablePadding component="div">
                    <SideBarItem
                      isLevel2
                      isSelected={isSelected(location, subMenu2.id, subMenu2.pathnamePosition)}
                      open={open}
                      subMenu={subMenu2}
                      onClose={onClose}
                    />
                  </List>
                </Collapse>
              ))}
            </Fragment>
          );
        }

        return acc;
      }, [] as ReactNode[]);

    return { ...menu, filteredSubMenus };
  }), [menus, roles, location, open, openSubMenu, onClose]);

  return (
    <List sx={{ p: 0 }}>
      {filteredMenus.map((menu, index) => (
        <List
          key={index}
          css={{ padding: 0 }}
          // subheader is the title of the menu
          subheader={menu.title
            ? (
              <ListSubheader component="div" css={classes.subMenuHeader} id="nested-list-subheader">
                {open ? menu.title : ''}
              </ListSubheader>
            )
            : null}
        >
          {menu.filteredSubMenus}
          {/* divider */}
          {(menu.filteredSubMenus.length > 0 &&
            !menu.title &&
            index !== filteredMenus.length - 1
          ) && (
            <Divider />
          )}
        </List>
      ))}
    </List>
  );
};

export default SideBar;
