import Typography from '@mui/material/Typography';

import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

import {
  KEY_INDICATOR_COLUMNS, KEY_INDICATOR_COLUMNS_MOBILE, KEY_INDICATOR_GRID_GAP,
  KEY_INDICATOR_TILE_GAP, KEY_INDICATOR_TILE_PADDING_X, KEY_INDICATOR_TILE_PADDING_Y,
  KEY_INDICATOR_VALUE_FONT_SIZE,
} from '@/constants/_core/ui/chart.constants';
import { FONT_SIZE_OVERLINE, RADIUS } from '@/constants/_core/ui/ui.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

export type KeyIndicator = {
  key: string;
  label: string;
  // the figure as written, with its unit
  value: string;
  // how it moved against the previous period — a comparison chip
  change?: ReactNode;
};

const classes = {
  list: (theme: Theme) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${KEY_INDICATOR_COLUMNS}, minmax(0, 1fr))`,
    gap: KEY_INDICATOR_GRID_GAP,
    margin: 0,
    padding: 0,
    listStyle: 'none',
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: `repeat(${KEY_INDICATOR_COLUMNS_MOBILE}, minmax(0, 1fr))`,
    },
  }),
  tile: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-start',
      gap: KEY_INDICATOR_TILE_GAP,
      minWidth: 0,
      padding: `${KEY_INDICATOR_TILE_PADDING_Y}px ${KEY_INDICATOR_TILE_PADDING_X}px`,
      backgroundColor: tokens.surfaceSecondary,
      border: `1px solid ${tokens.border}`,
      borderRadius: RADIUS,
    };
  },
  label: (theme: Theme) => ({
    fontSize: FONT_SIZE_OVERLINE,
    color: getDesignTokens(theme).textMuted,
  }),
  value: (theme: Theme) => ({
    fontSize: KEY_INDICATOR_VALUE_FONT_SIZE,
    fontWeight: theme.typography.fontWeightMedium,
    whiteSpace: 'nowrap' as const,
    color: theme.palette.text.primary,
  }),
};

type Props = {
  indicators: KeyIndicator[];
};

/** The few figures read first, each with its move against the previous period, above the charts. */
const KeyIndicatorList = ({ indicators }: Props) => (
  <ul css={classes.list}>
    {indicators.map((indicator) => (
      <li css={classes.tile} key={indicator.key}>
        <Typography component="span" css={classes.label}>{indicator.label}</Typography>
        <Typography component="strong" css={classes.value}>{indicator.value}</Typography>
        {indicator.change}
      </li>
    ))}
  </ul>
);

export default KeyIndicatorList;
