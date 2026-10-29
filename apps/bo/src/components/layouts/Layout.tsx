import {
  Box, Stack, type Theme, Typography,
} from '@mui/material';

import type { ReactNode } from 'react';

import IconPopover from '../IconPopover';

const classes = {
  layoutContent: (theme: Theme) => {
    return {
      backgroundColor: theme.palette.mode === 'light'
        ? 'rgb(255, 255, 255)'
        : theme.palette.background.paper,
      color: 'rgba(0, 0, 0, 0.87)',
      transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
      overflow: 'hidden',
      borderRadius: 4,
      boxShadow: theme.palette.mode === 'light'
        ? 'rgb(90 114 123 / 11%) 0px 7px 30px 0px'
        : 'none',
      padding: '18px 24px',
      [theme.breakpoints.down('sm')]: { padding: 0 },
      [theme.breakpoints.between('sm', 'md')]: { padding: 12 },
      [theme.breakpoints.between('md', 'lg')]: { padding: 16 },
      [theme.breakpoints.down('md')]: {
        borderRadius: 0,
        boxShadow: 'none',
      },
    };
  },
  titleContainer: (theme: Theme) => ({
    [theme.breakpoints.up('xl')]: { maxWidth: 800 },
    [theme.breakpoints.between('lg', 'xl')]: { maxWidth: 600 },
  }),
  title: (theme: Theme) => ({
    [theme.breakpoints.up('xl')]: { fontSize: 32 },
    [theme.breakpoints.down('xl')]: {
      fontSize: 22,
      margin: 0,
    },
  }),
};

type Props = {
  children: ReactNode;
  title?: string | ReactNode;
  cardTitle?: string;
  isCard?: boolean;
  actions?: ReactNode;
  actionsEmplacement?: 'head' | 'content';
  description?: string | ReactNode;
  cardDescription?: string;
  helperText?: string;
  className?: string;
  rightActions?: ReactNode;
};

const Layout = ({
  title,
  children,
  cardTitle,
  actions,
  description,
  cardDescription,
  helperText,
  className,
  isCard = true,
  actionsEmplacement = 'head',
  rightActions,
}: Props) => {
  return (
    <div className={className} css={{ width: '100%' }}>
      {/* page level title */}
      {title && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: { xs: 2, lg: 2 } }}>
          <Stack css={classes.titleContainer} spacing={0} sx={{ justifyContent: 'center' }}>
            <Typography gutterBottom css={classes.title} variant="h2">
              {title}
            </Typography>
            {description && (
              <Typography gutterBottom variant="h6">
                {description}
              </Typography>
            )}
          </Stack>
          {actions && actionsEmplacement === 'head' && <Box className="flexRow">{actions}</Box>}
        </Box>
      )}
      {/* if card */}
      <div css={isCard
        ? classes.layoutContent
        : null}
      >
        {/* title */}
        <div className="flexRow spaceBetween" css={{ marginBottom: 6 }}>
          {(cardTitle || cardDescription) && (
            <div className="flexColumn stretchSelf flex1" css={{ gap: 2 }}>
              {cardTitle && (
                <div className="flexRow center spaceBetween stretchSelf">
                  <Typography className="flexRow center" sx={{ fontWeight: 600, gap: 0.5 }} variant="h6">
                    {cardTitle}
                    {helperText && (
                      <IconPopover message={helperText} />
                    )}
                  </Typography>
                  {rightActions}
                </div>
              )}
              {cardDescription && (
                <Typography css={{ fontSize: 12 }}>
                  {cardDescription}
                </Typography>
              )}
            </div>
          )}

          {/* content */}
          {isCard && actionsEmplacement === 'content' && actions && <div className="flexRow">{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  );
};

export default Layout;
