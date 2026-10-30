import Typography from '@mui/material/Typography';

import type { Theme } from '@mui/material/styles';

import {
  BAR_LIST_EXTRA_WIDTH, BAR_LIST_EXTRA_WIDTH_MOBILE, BAR_LIST_LABEL_WIDTH,
  BAR_LIST_LABEL_WIDTH_MOBILE, BAR_LIST_ROW_GAP, BAR_LIST_TRACK_HEIGHT, BAR_LIST_TRACK_RADIUS,
  BAR_LIST_VALUE_WIDTH, BAR_LIST_VALUE_WIDTH_MOBILE,
} from '@/constants/_core/ui/chart.constants';
import { FONT_SIZE_BODY, FONT_SIZE_META } from '@/constants/_core/ui/ui.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

export type HorizontalBarListRow = {
  key: string;
  label: string;
  value: number;
  // the figure as written at the end of the bar, when the raw number is not how it reads
  valueLabel?: string;
  // a second figure qualifying the first, in the secondary tone (an amount next to a count)
  extra?: string;
};

const PERCENT = 100;

const classes = {
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: BAR_LIST_ROW_GAP,
    minWidth: 0,
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: BAR_LIST_ROW_GAP,
  },
  label: (theme: Theme) => ({
    width: BAR_LIST_LABEL_WIDTH,
    flexShrink: 0,
    fontSize: FONT_SIZE_BODY,
    color: theme.palette.text.primary,
    [theme.breakpoints.down('sm')]: { width: BAR_LIST_LABEL_WIDTH_MOBILE, fontSize: FONT_SIZE_META },
  }),
  track: (theme: Theme) => ({
    flex: 1,
    minWidth: 0,
    height: BAR_LIST_TRACK_HEIGHT,
    borderRadius: BAR_LIST_TRACK_RADIUS,
    overflow: 'hidden',
    backgroundColor: getDesignTokens(theme).surfaceSecondary,
  }),
  fill: (theme: Theme, share: number) => ({
    width: `${share}%`,
    height: '100%',
    borderRadius: BAR_LIST_TRACK_RADIUS,
    backgroundColor: theme.palette.primary.main,
  }),
  value: (theme: Theme) => ({
    width: BAR_LIST_VALUE_WIDTH,
    flexShrink: 0,
    textAlign: 'right' as const,
    fontSize: FONT_SIZE_BODY,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
    whiteSpace: 'nowrap' as const,
    [theme.breakpoints.down('sm')]: { width: BAR_LIST_VALUE_WIDTH_MOBILE },
  }),
  extra: (theme: Theme) => ({
    width: BAR_LIST_EXTRA_WIDTH,
    flexShrink: 0,
    textAlign: 'right' as const,
    fontSize: FONT_SIZE_META,
    whiteSpace: 'nowrap' as const,
    [theme.breakpoints.down('sm')]: { width: BAR_LIST_EXTRA_WIDTH_MOBILE },
  }),
};

type Props = {
  rows: HorizontalBarListRow[];
  // the figure a full bar stands for — the largest row's value when omitted
  max?: number;
};

/**
 * A ranking: one row per item, its name, a bar measuring it against the largest one, and its
 * figure. The names and figures keep fixed columns so a ranking is read down, the way a table is,
 * and only the bar in between takes whatever width is left.
 */
const HorizontalBarList = ({ rows, max }: Props) => {
  const scale = max ?? Math.max(1, ...rows.map((row) => row.value));

  return (
    <ul css={classes.list}>
      {rows.map((row) => (
        <li css={classes.row} key={row.key}>
          <Typography noWrap css={classes.label} title={row.label}>{row.label}</Typography>
          <div css={classes.track}>
            <div
              css={(theme: Theme) => classes.fill(theme, Math.min(PERCENT, (row.value / scale) * PERCENT))}
            />
          </div>
          <Typography component="span" css={classes.value}>{row.valueLabel ?? row.value}</Typography>
          {row.extra !== undefined && (
            <Typography component="span" css={classes.extra} variant="body2">{row.extra}</Typography>
          )}
        </li>
      ))}
    </ul>
  );
};

export default HorizontalBarList;
