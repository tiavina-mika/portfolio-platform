import {
  Box, Tab, Tabs, type Theme,
} from '@mui/material';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { getRoleCurrentUserIsAdminSelector } from '@/redux/reducers/role.reducer';
import { IListTabValue, ITabSearchParams } from '@/types/app.type';

const classes = {
  tab: (theme: Theme) => ({
    textTransform: 'none' as const,
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: theme.typography.pxToRem(15),
    marginRight: theme.spacing(1),
    color: theme.palette.mode === 'light'
      ? '#000'
      : '#fff',
    '&.Mui-selected': { color: theme.palette.primary.main },
    '&.Mui-focusVisible': { backgroundColor: 'rgba(100, 95, 228, 0.32)' },
  }),
};

type Props<T extends ITabSearchParams> = {
  tabs?: IListTabValue[];
  clearPagination?: () => void;
  onTabChange?: (tabValue: string) => void;
  mb?: number;
  searchParams: T;
  canDestroy?: boolean;
};

const ListTabs = <T extends ITabSearchParams>({
  tabs,
  clearPagination,
  onTabChange,
  searchParams,
  mb = 0,
  canDestroy = false,
}: Props<T>) => {
  const {
    t,
  } = useTranslation();
  const navigate = useNavigate();
  const router = useRouterState();

  const isAdmin = useSelector(getRoleCurrentUserIsAdminSelector);

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
      navigate({ to, search: null } as any);
      return;
    }

    navigate({ to, search: { tab: tabValue } } as any);
  };

  return (
    <Box mb={mb} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs aria-label="list tabs" value={searchParams.tab ?? t('route.all')} onChange={handleChange}>
        <Tab
          disableRipple
          css={classes.tab}
          label={t('all')}
          value={t('route.all')}
        />
        {/* <Tab disableRipple label={t('news')} value={t('route:tabs.news')} /> */}
        {tabs?.map((tab: IListTabValue, index: number) => {
          // admin only can see deleted tab

          if (tab.key === 'deleted' && !canDestroy) return null;
          if (!!tab.forAdmin && !isAdmin) return null;

          return (
            <Tab
              key={tab.tab + index}
              disableRipple
              css={classes.tab}
              label={tab.label}
              value={tab.tab}
            />
          );
        })}
      </Tabs>
    </Box>
  );
};

export default ListTabs;
