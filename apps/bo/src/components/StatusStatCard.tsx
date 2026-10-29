import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import type { Theme } from '@mui/material/styles';

import StatusDot, { StatusDotColor } from '@/components/StatusDot';
import {
  CARD_STATUS_STAT_GAP, CARD_STATUS_STAT_LABEL_WEIGHT, CARD_STATUS_STAT_PADDING_X,
  CARD_STATUS_STAT_PADDING_Y, CARD_STATUS_STAT_VALUE_GAP, CARD_STAT_SKELETON_VALUE_HEIGHT,
  CARD_STAT_VALUE_LINE_HEIGHT,
} from '@/constants/_core/ui/page.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${CARD_STATUS_STAT_GAP}px`,
    // the summary row is denser than the page-opening figures: it qualifies a list, it is not the page
    padding: `${CARD_STATUS_STAT_PADDING_Y}px ${CARD_STATUS_STAT_PADDING_X}px`,
    '&:last-child': { paddingBottom: `${CARD_STATUS_STAT_PADDING_Y}px` },
  },
  label: {
    fontWeight: CARD_STATUS_STAT_LABEL_WEIGHT,
  },
  /*
   * the caption shares the figure's baseline instead of sitting under it: the card then stays two
   * lines tall whether or not it has one, and a row of them keeps a single grid
   */
  figure: {
    display: 'flex',
    alignItems: 'baseline',
    gap: `${CARD_STATUS_STAT_VALUE_GAP}px`,
  },
  value: {
    lineHeight: CARD_STAT_VALUE_LINE_HEIGHT,
  },
  card: (theme: Theme) => ({
    transition: theme.transitions.create(['box-shadow'], {
      duration: theme.transitions.duration.shortest,
    }),
    '&:hover': { boxShadow: getDesignTokens(theme).shadowPopover },
  }),
};

type Props = {
  label: string;
  value: number | string;
  /*
   * the state this figure counts — it tints the dot and the label together, which is what lets the
   * row be read as a breakdown rather than as five unrelated numbers
   */
  color?: StatusDotColor;
  // what qualifies the figure, on its own baseline: a period, a share, a trend
  sub?: string;
  onClick?: () => void;
};

/**
 * A figure counting one state of a collection, sized to stand in a row above the list it
 * summarises. It is the stat card without its icon slot: what the number counts is a state, and
 * the state is already named by the tinted dot in front of the label.
 */
const StatusStatCard = ({
  label, value, color = 'default', sub, onClick,
}: Props) => {
  const theme = useTheme();

  /*
   * warning's `main` is a bright amber that washes out as a text tone — the dot beside it already
   * falls back the same way, so the label follows it rather than diverging from its own dot
   */
  const labelColor = color === 'default'
    ? getDesignTokens(theme).textSecondary
    : theme.palette[color][color === 'warning'
      ? 'dark'
      : 'main'];

  const content = (
    <CardContent css={classes.content}>
      <Typography
        component="p"
        css={classes.label}
        sx={{ color: labelColor }}
        variant="caption"
      >
        <StatusDot color={color} label={label} />
      </Typography>
      <Box css={classes.figure}>
        <Typography component="p" css={classes.value} variant="h2">{value}</Typography>
        {sub && <Typography variant="caption">{sub}</Typography>}
      </Box>
    </CardContent>
  );

  if (!onClick) return <Card>{content}</Card>;

  return (
    <Card css={classes.card}>
      <CardActionArea onClick={onClick}>{content}</CardActionArea>
    </Card>
  );
};

export const StatusStatCardSkeleton = () => (
  <Card>
    <CardContent css={classes.content}>
      <Skeleton variant="text" width="55%" />
      <Skeleton height={CARD_STAT_SKELETON_VALUE_HEIGHT} variant="text" width="40%" />
    </CardContent>
  </Card>
);

export default StatusStatCard;
