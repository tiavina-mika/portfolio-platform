import { Stack, Theme, Typography } from '@mui/material';
import { ReactNode } from 'react';

import Logo from '@/components/Logo';
import { SIDEBAR_BG_DARK } from '@/constants/_core/theme.constants';
import {
  AUTH_BRAND_DESCRIPTION_FONT_SIZE,
  AUTH_BRAND_LOGO_HEIGHT,
  AUTH_BRAND_LOGO_MARGIN_BOTTOM,
  AUTH_BRAND_PANEL_PADDING,
  AUTH_BRAND_PANEL_PADDING_COMPACT,
  AUTH_BRAND_PANEL_WIDTH,
  AUTH_BRAND_TEXT_COLOR,
  AUTH_BRAND_TITLE_FONT_SIZE,
  AUTH_BRAND_TITLE_FONT_SIZE_MOBILE,
  AUTH_BRAND_TITLE_FONT_SIZE_TABLET,
  AUTH_FORM_MAX_WIDTH,
  AUTH_FORM_PANEL_PADDING,
  AUTH_FORM_PANEL_PADDING_MOBILE,
  AUTH_FORM_PANEL_PADDING_TABLET,
  AUTH_FORM_TITLE_FONT_SIZE,
  AUTH_FORM_TITLE_MARGIN_BOTTOM,
} from '@/constants/_core/ui/ui.constants';

const classes = {
  root: (theme: Theme) => ({
    minHeight: '100vh',
    // `.flexRow` aligns to the top and wraps: the brand panel must instead stretch to the full height
    alignItems: 'stretch',
    flexWrap: 'nowrap' as const,
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.down('lg')]: { flexDirection: 'column' as const },
  }),
  brand: (theme: Theme) => ({
    padding: AUTH_BRAND_PANEL_PADDING,
    backgroundColor: SIDEBAR_BG_DARK,
    color: theme.palette.common.white,
    [theme.breakpoints.up('lg')]: {
      flex: `0 0 ${AUTH_BRAND_PANEL_WIDTH}`,
    },
    [theme.breakpoints.between('md', 'lg')]: { padding: '40px 64px 48px' },
    [theme.breakpoints.down('md')]: { padding: AUTH_BRAND_PANEL_PADDING_COMPACT },
  }),
  brandLogo: (theme: Theme) => ({
    marginBottom: AUTH_BRAND_LOGO_MARGIN_BOTTOM,
    [theme.breakpoints.down('lg')]: { marginBottom: 48 },
    [theme.breakpoints.down('md')]: { marginBottom: 28 },
  }),
  brandTitle: (theme: Theme) => ({
    margin: 0,
    lineHeight: 1.1,
    fontWeight: 600,
    fontSize: AUTH_BRAND_TITLE_FONT_SIZE,
    textWrap: 'balance' as const,
    [theme.breakpoints.between('md', 'lg')]: {
      fontSize: AUTH_BRAND_TITLE_FONT_SIZE_TABLET,
      lineHeight: 1.15,
    },
    [theme.breakpoints.down('md')]: {
      fontSize: AUTH_BRAND_TITLE_FONT_SIZE_MOBILE,
      lineHeight: 1.15,
    },
  }),
  brandDescription: (theme: Theme) => ({
    fontSize: AUTH_BRAND_DESCRIPTION_FONT_SIZE,
    lineHeight: 1.6,
    color: AUTH_BRAND_TEXT_COLOR,
    [theme.breakpoints.between('md', 'lg')]: { fontSize: 15 },
    // the phone keeps the headline only: the sentence under it pushes the form below the fold
    [theme.breakpoints.down('md')]: { display: 'none' },
  }),
  formPanel: (theme: Theme) => ({
    flex: 1,
    minWidth: 0,
    padding: AUTH_FORM_PANEL_PADDING,
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.between('md', 'lg')]: { padding: AUTH_FORM_PANEL_PADDING_TABLET },
    [theme.breakpoints.down('md')]: { padding: AUTH_FORM_PANEL_PADDING_MOBILE },
  }),
  formContent: {
    width: '100%',
    maxWidth: AUTH_FORM_MAX_WIDTH,
    margin: '0 auto',
  },
};

type Props = {
  title: string;
  description: string;
  children: ReactNode;
  formTitle?: string;
  formDescription?: string;
};

/** Two-column split of the sign-in and sign-up pages: brand panel on the left, the form on the right. */
const AuthPageLayout = ({
  title, description, children, formTitle, formDescription,
}: Props) => {
  return (
    <div className="flexRow" css={classes.root}>
      {/* brand panel */}
      <section className="flexColumn" css={classes.brand}>
        <div css={classes.brandLogo}>
          <Logo height={AUTH_BRAND_LOGO_HEIGHT} variant="white" />
        </div>
        <Typography component="h1" css={classes.brandTitle}>
          {title}
        </Typography>
        <Typography css={classes.brandDescription} sx={{ mt: 2.5 }}>
          {description}
        </Typography>
      </section>
      {/* form panel */}
      <section css={classes.formPanel}>
        <div css={classes.formContent}>
          <Stack spacing={2.5}>
            <Typography component="h2" css={{ fontSize: AUTH_FORM_TITLE_FONT_SIZE }} variant="h5">
              {formTitle}
            </Typography>
            {formDescription && (
              <Typography>
                {formDescription}
              </Typography>
            )}
          </Stack>
          <div css={{ marginTop: AUTH_FORM_TITLE_MARGIN_BOTTOM }}>
            {children}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AuthPageLayout;
