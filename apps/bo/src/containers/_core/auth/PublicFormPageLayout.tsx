import { Stack, Theme, Typography } from '@mui/material';
import { ReactNode } from 'react';

import Head from '@/components/Head';
import {
  AUTH_CARD_BODY_PADDING,
  AUTH_HEADING_DESCRIPTION_FONT_SIZE,
  AUTH_HEADING_FONT_SIZE,
  AUTH_HEADING_FONT_SIZE_MOBILE,
} from '@/constants/_core/ui/ui.constants';


const classes = {
  cardContainer: (theme: Theme) => ({
    // the auth card centers its children, so the form only fills it when it claims the width itself
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      padding: AUTH_CARD_BODY_PADDING,
      paddingBottom: 0,
    },
  }),
  title: (theme: Theme) => ({
    fontSize: AUTH_HEADING_FONT_SIZE,
    fontWeight: 600,
    [theme.breakpoints.down('sm')]: { fontSize: AUTH_HEADING_FONT_SIZE_MOBILE },
  }),
  description: {
    fontSize: AUTH_HEADING_DESCRIPTION_FONT_SIZE,
    lineHeight: 1.5,
  },
};

type Props = {
  children: ReactNode;
  title: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  // strip drawn above the heading (the steps of the password reset)
  header?: ReactNode;
};

const PublicFormPageLayout = ({
  children,
  title,
  description,
  metaTitle,
  metaDescription,
  header,
}: Props) => {
  return (
    <>
      <Head description={metaDescription} title={metaTitle || title} />
      <Stack css={classes.cardContainer} spacing={3}>
        {header}
        <Stack spacing={1}>
          <Typography
            align="center"
            component="h1"
            css={classes.title}
            variant="h2"
          >
            {title}
          </Typography>
          {description && (
            <Typography align="center" css={classes.description} variant="body1">
              {description}
            </Typography>
          )}
        </Stack>
        <Stack spacing={2}>
          {children}
        </Stack>
      </Stack>
    </>
  );
};

export default PublicFormPageLayout;
