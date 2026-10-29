import { styled, type Theme, type CSSObject } from '@mui/material';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { Outlet } from '@tanstack/react-router';
import { SnackbarProvider } from 'notistack';
import { Suspense, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FiMenu } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';

import Dialog from '@/components/Dialog';
import Logo from '@/components/Logo';
import PageContentSkeleton from '@/components/PageContentSkeleton';
import ScreenSizeIndicator from '@/components/ScreenSizeIndicator';
import { DOWNLOAD_ALERTS_LIMIT, IMAGES } from '@/constants/_core/app.constants';
import {
  CONTENT_GAP, CONTENT_PADDING_BOTTOM, CONTENT_PADDING_TOP, CONTENT_PADDING_X,
  CONTENT_PADDING_X_MOBILE,
} from '@/constants/_core/ui/page.constants';
import {
  RADIUS_SM, RESPONSIVE_BREAKPOINT, SIDEBAR_RAIL_WIDTH, SIDEBAR_WIDTH,
} from '@/constants/_core/ui/ui.constants';
import MfaRequiredBanner from '@/containers/_core/auth/MfaRequiredBanner';
import { useInactivityLogout } from '@/hooks/_core/useInactivityLogout';
import { useRefreshRolesOnFocus } from '@/hooks/_core/useRefreshRolesOnFocus';
import { useNotificationCountsLiveQuery } from '@/hooks/useNotificationCountsLiveQuery';
import SnackBars from '@/pages/_core/SnackBars';
import { getAppCurrentUserSelector } from '@/redux/reducers/_core/app.reducer';
import { getRoleCurrentUserRolesSelector } from '@/redux/reducers/_core/role.reducer';
import {
  changeIsSideBarOpenSlice, getSettingsIsSideBarOpenSelector,
  getSettingsSidebarStyleSelector, getSettingsThemeColorSelector, getSettingsThemeSelector,
} from '@/redux/reducers/_core/settings.reducer';
import { getSidebarScrollbarStyles } from '@/utils/_core/theme/styles.utils';
import { getSidebarTokens, SidebarTokens } from '@/utils/_core/theme/tokens.utils';

import AppBar from '../../components/layouts/AppBar';
import PageFooter from '../../components/layouts/PageFooter';
import SideBar from '../../components/layouts/sidebar/SideBar';
import SideBarFooter from '../../components/layouts/sidebar/SideBarFooter';


const openedMixin = (theme: Theme): CSSObject => ({
  [theme.breakpoints.up(RESPONSIVE_BREAKPOINT)]: { width: SIDEBAR_WIDTH },
  [theme.breakpoints.down(RESPONSIVE_BREAKPOINT)]: { width: '100vw' },
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: SIDEBAR_RAIL_WIDTH,
});

const DrawerHeader = styled('div')(({
  theme,
}) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

// the sidebar's own brand row — kept separate from the generic DrawerHeader spacer above it
const SidebarBrand = styled(DrawerHeader, {
  shouldForwardProp: prop => prop !== 'sidebarBorder',
})<{ sidebarBorder: string }>(({
  sidebarBorder,
}) => ({
  justifyContent: 'flex-start',
  gap: 10,
  padding: '0 16px',
  borderBottom: `1px solid ${sidebarBorder}`,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: prop => prop !== 'open' && prop !== 'sidebarBg' && prop !== 'sidebarBorder',
})<{ open?: boolean; sidebarBg: string; sidebarBorder: string }>(({
  theme, open, sidebarBg, sidebarBorder,
}) => ({
  // THIS ONLY CHANGES DRAWER WIDTH NOT PAPER WIDTH INSIDE THE DRAWER
  [theme.breakpoints.up(RESPONSIVE_BREAKPOINT)]: { width: SIDEBAR_WIDTH },
  // THIS ONLY CHANGES DRAWER WIDTH NOT PAPER WIDTH INSIDE THE DRAWER
  [theme.breakpoints.down(RESPONSIVE_BREAKPOINT)]: { width: '100%' },
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': {
      backgroundColor: sidebarBg,
      borderRight: `1px solid ${sidebarBorder}`,
      ...openedMixin(theme),
      [theme.breakpoints.up(RESPONSIVE_BREAKPOINT)]: {
        width: SIDEBAR_WIDTH, // THIS ONLY CHANGES DRAWER WIDTH NOT PAPER WIDTH INSIDE THE DRAWER
      },
      // THIS ONLY CHANGES DRAWER WIDTH NOT PAPER WIDTH INSIDE THE DRAWER
      [theme.breakpoints.down(RESPONSIVE_BREAKPOINT)]: { width: '100%' },
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': {
      backgroundColor: sidebarBg,
      borderRight: `1px solid ${sidebarBorder}`,
      ...closedMixin(theme),
    },
  }),
}));

type StyledMainProps = {
  theme?: Theme;
  open: boolean;
};
const StyledMain = styled('main', { shouldForwardProp: prop => prop !== 'open' })<StyledMainProps>(({
  theme, open,
}) => ({
  [theme.breakpoints.down(RESPONSIVE_BREAKPOINT)]: {
    display: open
      ? 'none'
      : 'block',
    paddingTop: 6,
  },
}));

const classes = {
  /*
   * no inset of its own: the content column inside it and the footer under it each pad themselves
   * on the same horizontal rail, which is what lets the footer's border run the full width
   */
  main: () => ({
    flexGrow: 1,
    minHeight: '100vh',
  }),
  drawer: (open: boolean, tokens: SidebarTokens) => (theme: Theme) => {
    return {
      [theme.breakpoints.between('xs', 'xl')]: {
        display: open
          ? 'block'
          : 'none',
      },
      [theme.breakpoints.up('xl')]: { display: 'block' },
      boxShadow: 'none',
      border: 'none',
      '& .MuiPaper-root': {
        borderColor: 'none',
        ...getSidebarScrollbarStyles(tokens),
      },
    };
  },
};

const DashboardLayout = () => {
  const {
    t,
  } = useTranslation(['user']);

  const roles = useSelector(getRoleCurrentUserRolesSelector);
  const currentUser = useSelector(getAppCurrentUserSelector);
  const isSideBarOpen = useSelector(getSettingsIsSideBarOpenSelector);
  const themeMode = useSelector(getSettingsThemeSelector);
  const themeColor = useSelector(getSettingsThemeColorSelector);
  const sidebarStyle = useSelector(getSettingsSidebarStyleSelector);
  const dispatch = useDispatch();
  const {
    isWarningVisible, remainingSeconds, stayLoggedIn,
  } = useInactivityLogout();

  useNotificationCountsLiveQuery();
  useRefreshRolesOnFocus();

  // a new object would hand the drawer's styles a new key, and emotion would serialize them again
  const sidebarTokens = useMemo(
    () => getSidebarTokens(themeMode, sidebarStyle, themeColor),
    [themeMode, sidebarStyle, themeColor]
  );
  const drawerCss = useMemo(
    () => classes.drawer(isSideBarOpen, sidebarTokens),
    [isSideBarOpen, sidebarTokens]
  );

  const handleDrawerClose = () => {
    dispatch(changeIsSideBarOpenSlice(false));
  };

  // stable, so the memoized app bar is not re-rendered by a layout render it takes nothing from
  const handleDrawerToggle = useCallback(() => {
    dispatch(changeIsSideBarOpenSlice(!isSideBarOpen));
  }, [dispatch, isSideBarOpen]);

  return (
    <SnackbarProvider maxSnack={DOWNLOAD_ALERTS_LIMIT}>
      <Box sx={{ display: 'flex' }}>
        {/* ---------- left (sidebar ) ---------- */}
        <Drawer
          css={drawerCss}
          ModalProps={{ keepMounted: true }}
          open={isSideBarOpen}
          sidebarBg={sidebarTokens.bg}
          sidebarBorder={sidebarTokens.border}
          variant="permanent"
        >
          <SidebarBrand sidebarBorder={sidebarTokens.border}>
            {isSideBarOpen
              ? (
                <>
                  <Logo variant={sidebarTokens.isLight ? 'auto' : 'white'} />
                  {/* below `lg` the drawer becomes a full-screen overlay hiding the app bar's own
                      hamburger, so this is the only way to close it on mobile/tablet */}
                  <IconButton
                    aria-label="close sidebar"
                    onClick={handleDrawerClose}
                    sx={{
                      display: { xs: 'inline-flex', [RESPONSIVE_BREAKPOINT]: 'none' },
                      ml: 'auto',
                      width: 34,
                      height: 34,
                      borderRadius: `${RADIUS_SM}px`,
                      color: sidebarTokens.textActive,
                      '&:hover': { backgroundColor: sidebarTokens.hoverBg },
                    }}
                  >
                    <FiMenu size={18} />
                  </IconButton>
                </>
              )
              : (
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <Box
                    alt="logo"
                    component="img"
                    sx={{ width: 24 }}
                    src={sidebarTokens.isLight
                      ? IMAGES.blackIconLogo
                      : IMAGES.whiteIconLogo}
                  />
                </Box>
              )}
          </SidebarBrand>
          {/* left sidebar */}
          <SideBar
            onClose={handleDrawerClose}
            open={isSideBarOpen}
            roles={roles}
            tokens={sidebarTokens}
          />
          {/* pinned to the bottom of the drawer, below the scrollable nav */}
          {currentUser && (
            <SideBarFooter
              open={isSideBarOpen}
              roles={roles}
              tokens={sidebarTokens}
              user={currentUser}
            />
          )}
        </Drawer>

        {/* ------- right (main content ) ------- */}
        <StyledMain
          className="flexColumn positionRelative"
          css={classes.main}
          open={isSideBarOpen}
        >
          {/* top app bar */}
          <AppBar onToggleDrawer={handleDrawerToggle} />
          <DrawerHeader />
          {/*
            * the content column: every band a page stacks is spaced by this one gap, so a page
            * that drops a band leaves no hole where it was. The column is written out here rather
            * than taken from the global `.flexColumn` class, which packs its children to the left
            * — a band has to take the full width of the zone or the page head's actions stop
            * short of the right edge instead of closing the row
            */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              alignSelf: 'stretch',
              flex: 1,
              gap: `${CONTENT_GAP}px`,
              px: { xs: `${CONTENT_PADDING_X_MOBILE}px`, md: `${CONTENT_PADDING_X}px` },
              pt: `${CONTENT_PADDING_TOP}px`,
              pb: `${CONTENT_PADDING_BOTTOM}px`,
            }}
          >
            {/* the page head and a content block, so the zone keeps its height while a page's chunk loads */}
            <Suspense fallback={<PageContentSkeleton />}>
              <Outlet />
            </Suspense>
          </Box>
          {/* closes the column, on the rail the app bar draws at the other end of the page */}
          <PageFooter />
        </StyledMain>
        {/* <SnackBar open={!!error} message={error} severity="error" toggle={toggleSnackBar} />
        <SnackBar open={!!infoMessage} message={infoMessage} severity="info" toggle={toggleSnackBar} />
        <SnackBar open={!!message} message={message} severity="success" toggle={toggleSnackBar} /> */}
        <SnackBars />
        {window.IS_LOCAL && <ScreenSizeIndicator />}

        {/* session inactivity warning */}
        <Dialog
          description={t('user:session.inactivityWarningMessage', { seconds: remainingSeconds })}
          onPrimaryButtonAction={stayLoggedIn}
          open={isWarningVisible}
          primaryButtonText={t('user:session.stayLoggedIn')}
          title={t('user:session.inactivityWarningTitle')}
          toggle={stayLoggedIn}
          withCancelButton={false}
        />

        <MfaRequiredBanner roles={roles} />
      </Box>
    </SnackbarProvider>
  );
};

export default DashboardLayout;
