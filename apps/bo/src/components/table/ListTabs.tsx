import {
  Box, Tab, Tabs, type Theme,
} from '@mui/material';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { ALL_TAB_COUNT_KEY } from '@/constants/_core/app.constants';
import {
  LIST_TAB_COUNT_SKELETON_HEIGHT, LIST_TAB_COUNT_SKELETON_WIDTH, LIST_TAB_FONT_SIZE, LIST_TAB_GAP,
  LIST_TAB_HEIGHT, LIST_TAB_PADDING_X, LIST_TABS_GAP, LIST_TABS_PADDING,
} from '@/constants/_core/ui/list.constants';
import { BUTTON_TOUCH_HEIGHT, RADIUS, RADIUS_SM } from '@/constants/_core/ui/ui.constants';
import { getRoleCurrentUserIsAdminSelector } from '@/redux/reducers/_core/role.reducer';
import { IListTabCounts, IListTabValue, ITabSearchParams } from '@/types/_core/app.type';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

/*
 * the strip scopes the list under it rather than navigating anywhere, so it is drawn as a recessed
 * track with the open slot raised back onto the card surface — the same figure as the settings pill
 * tabs, one step smaller and outlined so it can stand between a page title and a list card. An
 * underlined strip here would read as a second level of navigation under the sidebar entry that
 * opened the list.
 */
const classes = {
  tabs: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      minHeight: 'auto',
      display: 'inline-flex',
      padding: LIST_TABS_PADDING,
      borderRadius: `${RADIUS}px`,
      backgroundColor: tokens.surfaceSecondary,
      border: `1px solid ${tokens.border}`,
      // the raised slot is what marks the open tab — the theme's rail and its indicator both go
      boxShadow: 'none',
      '& .MuiTabs-indicator': { display: 'none' },
      '& .MuiTabs-list': { gap: LIST_TABS_GAP },
      // on touch the strip takes the width and its slots share it, so each is a 44px target
      [theme.breakpoints.down('sm')]: { display: 'flex', width: '100%' },
    };
  },
  tab: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      minHeight: LIST_TAB_HEIGHT,
      height: LIST_TAB_HEIGHT,
      padding: `0 ${LIST_TAB_PADDING_X}px`,
      /*
       * a tab stacks its label into a column by default, which would drop the count onto a second
       * line under the name it belongs to — it reads as part of the label, on the same line
       */
      flexDirection: 'row' as const,
      gap: `${LIST_TAB_GAP}px`,
      fontSize: LIST_TAB_FONT_SIZE,
      borderRadius: `${RADIUS_SM}px`,
      color: tokens.textMuted,
      transition: theme.transitions.create(['background-color', 'color', 'box-shadow'], {
        duration: theme.transitions.duration.shortest,
      }),
      '&:hover': { color: tokens.text, backgroundColor: tokens.tabHover },
      /*
       * the open slot is raised rather than tinted: it is the surface the card under it is drawn
       * on, so it takes that ground and keeps the body tone instead of turning primary — the strip
       * says which scope is open, not which link was followed
       */
      '&.Mui-selected': {
        color: tokens.text,
        backgroundColor: tokens.surface,
        boxShadow: tokens.shadow,
        fontWeight: theme.typography.fontWeightMedium,
      },
      /*
       * an empty scope keeps its slot and loses only its tone: the strip still states that the
       * recycle bin is there, and that there is nothing in it to switch to
       */
      '&.Mui-disabled': { color: tokens.textDisabled, opacity: 1 },
      // on touch each slot grows to the 44px minimum target, as every other control does
      [theme.breakpoints.down('sm')]: {
        flex: 1,
        minHeight: BUTTON_TOUCH_HEIGHT,
        height: BUTTON_TOUCH_HEIGHT,
      },
    };
  },
  // stated after the label as a muted figure — it is a detail of the tab, not a badge on it
  count: (theme: Theme) => ({
    color: getDesignTokens(theme).textMuted,
    fontWeight: theme.typography.fontWeightRegular,
  }),
  /*
   * the figure's placeholder holds its width until it lands, so the strip does not shift under the
   * pointer once the counts come back
   */
  countPlaceholder: (theme: Theme) => ({
    display: 'block',
    width: LIST_TAB_COUNT_SKELETON_WIDTH,
    height: LIST_TAB_COUNT_SKELETON_HEIGHT,
    borderRadius: LIST_TAB_COUNT_SKELETON_HEIGHT / 2,
    backgroundColor: getDesignTokens(theme).borderLight,
  }),
};

type Props<T extends ITabSearchParams> = {
  tabs?: IListTabValue[];
  clearPagination?: () => void;
  onTabChange?: (tabValue: string) => void;
  mb?: number;
  searchParams: T;
  canDestroy?: boolean;
  /*
   * how many rows each tab holds, keyed by its database field with `all` for the unscoped tab.
   * Omitted by a list that has no totals to state — the strip then carries labels only.
   */
  tabCounts?: IListTabCounts;
};

const ListTabs = <T extends ITabSearchParams>({
  tabs,
  clearPagination,
  onTabChange,
  searchParams,
  mb = 0,
  canDestroy = false,
  tabCounts,
}: Props<T>) => {
  const {
    t,
  } = useTranslation();
  const navigate = useNavigate();
  const router = useRouterState();

  const isAdmin = useSelector(getRoleCurrentUserIsAdminSelector);

  const currentTab = searchParams.tab ?? t('route.all');

  /*
   * add the translated tab value to the url search params
   * use these url search params as a filter to query in database
   */
  const handleChange = (_: any, tabValue: string) => {
    // reset pagination to page 1
    clearPagination?.();

    onTabChange?.(tabValue);
    const to = router.location.pathname;

    if (tabValue === t('route.all')) {
      navigate({ to, search: {} });
      return;
    }

    navigate({ to, search: { tab: tabValue } });
  };

  /*
   * the label and, when the list supplies totals, how many rows the scope holds. A count that has
   * not landed yet is drawn as a bar of its own width rather than as a zero, which would state
   * that the tab is empty until the answer arrives.
   */
  const renderLabel = (label: string, countKey: string) => {
    if (!tabCounts) return label;

    const count = tabCounts[countKey];

    return (
      <>
        {label}
        {count === undefined
          ? <Box component="span" css={classes.countPlaceholder} />
          : <Box component="span" css={classes.count}>{`· ${count}`}</Box>}
      </>
    );
  };

  return (
    // the rail under the strip comes from the theme — the box only spaces it from what follows
    <Box sx={{ mb: mb }}>
      <Tabs
        aria-label="list tabs"
        css={classes.tabs}
        onChange={handleChange}
        value={currentTab}
      >
        <Tab
          disableRipple
          css={classes.tab}
          label={renderLabel(t('all'), ALL_TAB_COUNT_KEY)}
          value={t('route.all')}
        />
        {tabs?.map((tab: IListTabValue, index: number) => {
          // admin only can see deleted tab

          if (tab.key === 'deleted' && !canDestroy) return null;
          if (!!tab.forAdmin && !isAdmin) return null;

          /*
           * an empty scope is not worth switching to, so its slot is inert — except while it is the
           * open one, where disabling it would take away the tab the reader is standing on
           */
          const countKey = tab.countKey ?? tab.key;
          const isEmpty = tabCounts?.[countKey] === 0 && currentTab !== tab.tab;

          return (
            <Tab
              disableRipple
              css={classes.tab}
              disabled={isEmpty}
              key={tab.tab + index}
              label={renderLabel(tab.label, countKey)}
              value={tab.tab}
            />
          );
        })}
      </Tabs>
    </Box>
  );
};

export default ListTabs;
