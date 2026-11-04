import {
  Box, Card, CardActionArea, CardContent, Skeleton, Theme, Typography,
} from '@mui/material';
import { ReactNode } from 'react';

import {
  CARD_STAT_EXTRA_GAP, CARD_STAT_GAP, CARD_STAT_ICON_SLOT_SIZE, CARD_STAT_SKELETON_VALUE_HEIGHT,
  CARD_STAT_TEXT_GAP, CARD_STAT_VALUE_LINE_HEIGHT,
} from '@/constants/_core/ui/page.constants';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';

const classes = {
  // border, radius and resting shadow come from the theme's MuiCard override — only hover lives here
  card: (theme: Theme) => ({
    transition: theme.transitions.create(['box-shadow'], {
      duration: theme.transitions.duration.shortest,
    }),
    '&:hover': {
      boxShadow: getDesignTokens(theme).shadowPopover,
    },
  }),
  content: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: `${CARD_STAT_GAP}px`,
  },
  // outer column: the figure block, then whatever extra content the caller slots under it
  textBlock: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${CARD_STAT_EXTRA_GAP}px`,
    alignItems: 'flex-start',
    flex: 1,
  },
  text: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${CARD_STAT_TEXT_GAP}px`,
    alignSelf: 'stretch',
  },
  value: {
    fontWeight: 700,
    lineHeight: CARD_STAT_VALUE_LINE_HEIGHT,
  },
  icon: (theme: Theme) => ({
    width: CARD_STAT_ICON_SLOT_SIZE,
    height: CARD_STAT_ICON_SLOT_SIZE,
    borderRadius: '50%',
    backgroundColor: getTintedBackground(theme, theme.palette.primary.main),
    color: theme.palette.primary.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }),
};

type Props = {
  label: string;
  value: number | string;
  icon?: ReactNode;
  // short caption under the value (e.g. "+312 this week")
  sub?: string;
  // extra content rendered under the caption — a chip, a trend indicator…
  children?: ReactNode;
  onClick?: () => void;
};

/*
 * single-figure card: a label, the figure itself and an optional caption, with an optional round
 * icon slot on the left. The whole card becomes clickable as soon as onClick is provided.
 */
const StatCard = ({
  label, value, icon, sub, children, onClick,
}: Props) => {
  const content = (
    <CardContent css={classes.content}>
      {icon && <Box css={classes.icon}>{icon}</Box>}
      <Box css={classes.textBlock}>
        <Box css={classes.text}>
          <Typography variant="body2">{label}</Typography>
          <Typography component="p" css={classes.value} variant="h2">{value}</Typography>
          {sub && <Typography variant="caption">{sub}</Typography>}
        </Box>
        {children}
      </Box>
    </CardContent>
  );

  if (!onClick) return <Card>{content}</Card>;

  return (
    <Card css={classes.card}>
      <CardActionArea onClick={onClick}>
        {content}
      </CardActionArea>
    </Card>
  );
};

type SkeletonProps = {
  withIcon?: boolean;
};

export const StatCardSkeleton = ({ withIcon }: SkeletonProps) => (
  <Card>
    <CardContent css={classes.content}>
      {withIcon && (
        <Skeleton
          height={CARD_STAT_ICON_SLOT_SIZE}
          variant="circular"
          width={CARD_STAT_ICON_SLOT_SIZE}
        />
      )}
      <Box css={[classes.text, { flex: 1 }]}>
        <Skeleton width="60%" />
        <Skeleton height={CARD_STAT_SKELETON_VALUE_HEIGHT} width="40%" />
        <Skeleton width="50%" />
      </Box>
    </CardContent>
  </Card>
);

export default StatCard;
