import { Stack, type Theme, Typography } from '@mui/material';
import { type ReactNode } from 'react';

import Head from '@/components/Head';


const classes = {
  cardContainer: (theme: Theme) => ({
    [theme.breakpoints.up('sm')]: {
      padding: 24,
      paddingBottom: 0,
    },
  }),
};

type Props = {
  children: ReactNode;
  title: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
};

const PublicFormPageLayout = ({
  children,
  title,
  description,
  metaTitle,
  metaDescription,
}: Props) => {
  return (
    <>
      <Head description={metaDescription} title={metaTitle || title} />
      <Stack css={classes.cardContainer} spacing={3}>
        <Stack>
          <Typography gutterBottom align="center" variant="h2">
            {title}
          </Typography>
          {description && (
            <Typography align="center" variant="body1">
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
