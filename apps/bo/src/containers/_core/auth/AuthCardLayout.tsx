import { Card, type Theme } from '@mui/material';
import { ReactNode } from 'react';

import Logo from '@/components/Logo';
import {
  AUTH_CARD_LOGO_HEIGHT,
  AUTH_CARD_LOGO_MARGIN_BOTTOM,
  AUTH_CARD_TOP_PADDING,
  AUTH_CARD_WIDTH,
} from '@/constants/_core/ui/ui.constants';
import PublicSettingsControls from '@/containers/_core/settings/PublicSettingsControls';

const classes = {
  root: (theme: Theme) => ({
    backgroundColor: theme.palette.background.default,
    paddingTop: 64,
    paddingBottom: 48,
    minHeight: '100vh',
    [theme.breakpoints.up('md')]: {
      paddingTop: AUTH_CARD_TOP_PADDING,
    },
  }),
  logoContainer: (theme: Theme) => ({
    marginBottom: 32,
    [theme.breakpoints.up('md')]: {
      marginBottom: AUTH_CARD_LOGO_MARGIN_BOTTOM,
    },
  }),
  card: (theme: Theme) => ({
    width: '100%',
    // on a phone the card runs edge to edge, only its top and bottom rules remain
    [theme.breakpoints.down('sm')]: {
      padding: '12px 12px 40px !important',
      borderLeftWidth: 0,
      borderRightWidth: 0,
      borderRadius: 0,
    },
    [theme.breakpoints.up('sm')]: {
      width: AUTH_CARD_WIDTH,
      padding: 12,
      paddingBottom: 40,
    },
  }),
};

type Props = {
  children: ReactNode;
};

/**
 * Logo-above-Card chrome shared by every public auth page other than the login page itself
 * (which uses the two-column AuthPageLayout) — extracted from AuthRouteLayout so a page whose
 * route isn't nested under it (e.g. MfaVerify, parented by the bare PublicRouteLayout) can still
 * get the same look without duplicating the markup.
 */
const AuthCardLayout = ({
  children,
}: Props) => {
  return (
    <div className="flexColumn center" css={classes.root}>
      <PublicSettingsControls />
      <div css={classes.logoContainer}>
        <Logo height={AUTH_CARD_LOGO_HEIGHT} />
      </div>
      <Card className="flexCenter" css={classes.card}>
        {children}
      </Card>
    </div>
  );
};

export default AuthCardLayout;
