import {
  alpha, Divider, styled, Theme, AppBar as MuiAppBar, type AppBarProps as MuiAppBarProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link, useRouter, useRouterState } from '@tanstack/react-router';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronRight, FiMenu } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import Logo from '@/components/Logo';
import {
  APPBAR_COMPACT_BREAKPOINT, APPBAR_ICON_BUTTON_SIZE, APPBAR_LOGO_HEIGHT, FONT_SIZE_META, RADIUS_SM,
  RESPONSIVE_BREAKPOINT, SIDEBAR_RAIL_WIDTH, SIDEBAR_WIDTH, TOOLBAR_HEIGHT,
  TOOLBAR_HORIZONTAL_PADDING, TOOLBAR_SMALL_SCREEN_HEIGHT,
} from '@/constants/_core/ui/ui.constants';
import { useAllowedCountryOptions } from '@/hooks/_core/useAllowedCountryOptions';
import { useBreadcrumbTrail } from '@/hooks/_core/useBreadcrumbTrail';
import { useBreakpoint } from '@/hooks/_core/useBreakpoint';
import { useSidebarGroupLabel } from '@/hooks/_core/useSidebarGroupLabel';
import { getAppPageTitlePathnameSelector, getAppPageTitleSelector } from '@/redux/reducers/_core/app.reducer';
import {
  changeMoneyCountrySlice, getSettingsIsSideBarOpenSelector, getSettingsMoneyCountrySelector,
} from '@/redux/reducers/_core/settings.reducer';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

import MoneyCountrySelect from './MoneyCountrySelect';
import NotificationCenter from './notifications/NotificationCenter';
import ProfileMenu from './ProfileMenu';
import GlobalSearch from './search/GlobalSearch';

// gap between the toolbar's own blocks (hamburger / brand / right-hand cluster)
const TOOLBAR_GAP = 16;
// tighter gap inside the right-hand cluster so search, bell and profile read as one group
const ACTIONS_GAP = 12;

interface IAppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const StyledAppBar = styled(MuiAppBar, { shouldForwardProp: prop => prop !== 'open' })<IAppBarProps>(({
  theme,
}) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.85),
  backdropFilter: 'blur(12px)',
  borderBottom: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary,
  backgroundImage: 'none',
  boxShadow: 'none',
  /*
   * the sidebar's own closed-state rail (64px) only stays visible from `xl` up — below that it
   * fully hides (see `classes.drawer` in DashboardLayout.tsx) — so only offset the app bar there,
   * otherwise it gets pushed into empty space with no sidebar behind it
   */
  marginLeft: 0,
  [theme.breakpoints.up('xl')]: {
    marginLeft: SIDEBAR_RAIL_WIDTH,
    width: `calc(100% - ${SIDEBAR_RAIL_WIDTH}px)`,
  },

  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),

  variants: [{
    props: (
      {
        open,
      }
    ) => open,

    style: {
      [theme.breakpoints.up(RESPONSIVE_BREAKPOINT)]: {
        marginLeft: SIDEBAR_WIDTH,
        width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
      },
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
  }],
}));

/*
 * gutters are disabled and the padding set here instead: the toolbar's own `MuiToolbar-gutters`
 * rule lives inside a media query, so a plain padding override is not guaranteed to win over it
 */
const StyledToolbar = styled(Toolbar)(({
  theme,
}) => ({
  // positioning context for GlobalSearch's mobile overlay (fills the whole toolbar row)
  position: 'relative',
  gap: TOOLBAR_GAP,
  paddingLeft: TOOLBAR_HORIZONTAL_PADDING,
  paddingRight: TOOLBAR_HORIZONTAL_PADDING,
  minHeight: TOOLBAR_HEIGHT,
  height: TOOLBAR_HEIGHT,

  /*
   * same `sm` step as `theme.mixins.toolbar`, which sizes the spacer sitting under the app bar in
   * DashboardLayout — both must switch at the same breakpoint or the page content shifts under it
   */
  [theme.breakpoints.down('sm')]: {
    minHeight: TOOLBAR_SMALL_SCREEN_HEIGHT,
    height: TOOLBAR_SMALL_SCREEN_HEIGHT,
  },
}));

const sx = {
  menuButton: (isSideBarOpen: boolean) => (theme: Theme) => ({
    width: APPBAR_ICON_BUTTON_SIZE,
    height: APPBAR_ICON_BUTTON_SIZE,
    borderRadius: `${RADIUS_SM}px`,
    flexShrink: 0,
    // the open sidebar keeps the toggle in a pressed state, so the button reflects what it controls
    color: isSideBarOpen
      ? theme.palette.text.primary
      : theme.palette.text.secondary,
    backgroundColor: isSideBarOpen
      ? getDesignTokens(theme).surfaceSecondary
      : 'transparent',
    '&:hover': { color: theme.palette.text.primary },
  }),
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: `${TOOLBAR_GAP}px`,
    minWidth: 0,
    overflow: 'hidden',
  },
  breadcrumbs: {
    // the trail is the first thing to drop on a phone — the page title already says where the user is
    display: { xs: 'none', sm: 'flex' },
    fontSize: FONT_SIZE_META,
    color: 'text.secondary',
    whiteSpace: 'nowrap',
    minWidth: 0,
    overflow: 'hidden',

    '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' },
    '& .MuiBreadcrumbs-separator': {
      mx: 0.75,
      opacity: 0.6,
    },
    '& a': {
      color: 'inherit',
      textDecoration: 'none',
    },
    '& a:hover': {
      color: 'primary.main',
      textDecoration: 'underline',
    },
  },
  crumb: { fontSize: FONT_SIZE_META },
  currentCrumb: {
    fontSize: FONT_SIZE_META,
    fontWeight: 500,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: `${ACTIONS_GAP}px`,
    flexShrink: 0,
  },
  actionsDivider: {
    height: 28,
    display: { xs: 'none', sm: 'block' },
  },
};

type Props = {
  onToggleDrawer: () => void;
};

const AppBar = ({
  onToggleDrawer,
}: Props) => {
  const isSideBarOpen = useSelector(getSettingsIsSideBarOpenSelector);
  const moneyCountry = useSelector(getSettingsMoneyCountrySelector);
  const countryOptions = useAllowedCountryOptions();
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = useRouterState({ select: state => state.location.pathname });
  const isCompactHeader = useBreakpoint(APPBAR_COMPACT_BREAKPOINT);
  const ancestors = useBreadcrumbTrail();
  // the figures on screen were read for the previous country: read them again for the new one
  const handleMoneyCountryChange = async (country: string) => {
    dispatch(changeMoneyCountrySlice(country));
    await router.invalidate();
  };

  /*
   * the roles arrive after the app bar is drawn: once they say the picked country is not one the
   * user may work on, the figures move to the first one they may
   */
  useEffect(() => {
    const [firstAllowed] = countryOptions;

    if (firstAllowed && !countryOptions.some((option) => option.value === moneyCountry)) {
      dispatch(changeMoneyCountrySlice(String(firstAllowed.value)));
      void router.invalidate();
    }
  }, [countryOptions, moneyCountry, dispatch, router]);
  const currentTitle = useSelector(getAppPageTitleSelector);
  const currentTitlePathname = useSelector(getAppPageTitlePathnameSelector);
  const sidebarGroupLabel = useSidebarGroupLabel();
  const { t } = useTranslation();

  const isHome = pathname === '/';
  /*
   * false while the next route's entity is still loading — `currentTitle` still holds the
   * previous page's value at that point, see `Head.tsx`
   */
  const isCurrentTitleFresh = currentTitlePathname === pathname;

  return (
    <StyledAppBar elevation={0} open={isSideBarOpen} position="fixed">
      <StyledToolbar disableGutters>
        {/* ----- hamburger menu (toggles sidebar open/closed) ----- */}
        <IconButton
          aria-label="toggle sidebar"
          onClick={onToggleDrawer}
          sx={sx.menuButton(isSideBarOpen)}
        >
          <FiMenu size={18} />
        </IconButton>

        {/* ----- logo + breadcrumb ----- */}
        <Box sx={sx.brand}>
          {/* below `xl` the sidebar rail hides entirely, so the app bar carries the brand mark instead */}
          {isCompactHeader && <Logo height={APPBAR_LOGO_HEIGHT} />}

          {!isHome &&
              (sidebarGroupLabel || ancestors.length > 0 || (isCurrentTitleFresh && currentTitle)) && (
            // two navigation landmarks share the page with the sidebar: each has to name itself
            <MuiBreadcrumbs
              aria-label={t('breadcrumb')}
              itemsAfterCollapse={1}
              itemsBeforeCollapse={1}
              maxItems={3}
              separator={<FiChevronRight size={12} />}
              sx={sx.breadcrumbs}
            >
              {sidebarGroupLabel && (
                <Typography color="inherit" component="span" sx={sx.crumb}>
                  {sidebarGroupLabel}
                </Typography>
              )}

              {ancestors.map(ancestor => (
                <Link key={ancestor.to} to={ancestor.to as any}>
                  {ancestor.label}
                </Link>
              ))}

              {!isCurrentTitleFresh
                ? <Skeleton height={16} variant="text" width={90} />
                : currentTitle && (
                  <Typography color="text.primary" component="span" sx={sx.currentCrumb}>
                    {currentTitle}
                  </Typography>
                )}
            </MuiBreadcrumbs>
          )}
        </Box>

        {/* ----- flexible spacer pushes the right-hand cluster to the end ----- */}
        <Box sx={{ flexGrow: 1 }} />

        {/* ----- right-hand cluster: search (icon-only in compact header), notifications, profile ----- */}
        <Box sx={sx.actions}>
          <MoneyCountrySelect
            onChange={handleMoneyCountryChange}
            options={countryOptions}
            value={moneyCountry}
          />

          <GlobalSearch />

          <NotificationCenter />

          <Divider orientation="vertical" sx={sx.actionsDivider} />

          <ProfileMenu />
        </Box>
      </StyledToolbar>
    </StyledAppBar>
  );
};

// the dashboard layout re-renders on every sidebar toggle and theme change, none of which it passes on
export default memo(AppBar);
