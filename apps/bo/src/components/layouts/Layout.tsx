import {
  type Theme, Typography,
} from '@mui/material';

import type { ReactNode } from 'react';

import { CONTENT_GAP } from '@/constants/_core/ui/page.constants';
import { FONT_SIZE_META, RADIUS_LG } from '@/constants/_core/ui/ui.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

import IconPopover from '../IconPopover';
import PageHeader from './PageHeader';

const classes = {
  // same surface treatment as a MuiCard (border + radius + shadow), for non-Card page content
  layoutContent: (theme: Theme) => {
    return {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      border: `1px solid ${theme.palette.divider}`,
      transition: 'box-shadow .15s',
      overflow: 'hidden',
      borderRadius: RADIUS_LG,
      boxShadow: getDesignTokens(theme).shadow,
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
};

type Props = {
  children: ReactNode;
  title?: string | ReactNode;
  /*
   * the line above the title, naming where the page sits — only needed by a page the sidebar does
   * not list (the profile, reached from the app bar), since PageHeader otherwise reads it off the
   * sidebar group the route belongs to
   */
  pretitle?: ReactNode;
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
  pretitle,
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
    <div
      className={className}
      css={{
        width: '100%',
        // the head and the card under it are two bands of the content column, spaced by its gap
        display: 'flex',
        flexDirection: 'column',
        gap: CONTENT_GAP,
      }}
    >
      {/* page level title — the head is the same block on every page, list or detail */}
      {title && (
        <PageHeader
          description={description}
          pretitle={pretitle}
          title={title}
          actions={actionsEmplacement === 'head'
            ? actions
            : undefined}
        />
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
                <Typography css={{ fontSize: FONT_SIZE_META }}>
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
