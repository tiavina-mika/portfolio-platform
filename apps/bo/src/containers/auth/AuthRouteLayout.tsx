import { Card, type Theme } from '@mui/material';
import { Outlet } from '@tanstack/react-router';

import Logo from '@/components/Logo';

const classes = {
  root: (theme: Theme) => ({
    backgroundColor: theme.palette.background.default,
    paddingTop: 16,
    [theme.breakpoints.up('md')]: {
      minHeight: '100vh',
      paddingTop: 100,
    },
  }),
  logoContainer: (theme: Theme) => ({
    marginBottom: 20,
    [theme.breakpoints.up('md')]: {
      marginBottom: 40,
    },
  }),
  card: (theme: Theme) => ({
    [theme.breakpoints.down('sm')]: {
      padding: '20px !important',
    },
    [theme.breakpoints.up('sm')]: {
      width: 500,
      padding: 12,
      paddingBottom: 40,
    },
  }),
};

const AuthRouteLayout = () => {
  return (
    <div className="flexColumn center" css={classes.root}>
      <div css={classes.logoContainer}>
        <Logo />
      </div>
      <Card className="flexCenter" css={classes.card}>
        <Outlet />
      </Card>
    </div>
  );
};

export default AuthRouteLayout;
