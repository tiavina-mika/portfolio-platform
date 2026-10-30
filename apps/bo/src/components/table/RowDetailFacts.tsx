import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

import {
  ROW_DETAIL_FACTS_COLUMNS, ROW_DETAIL_FACTS_GAP_X, ROW_DETAIL_FACTS_GAP_Y,
  ROW_DETAIL_FACT_LINE_GAP, TABLE_ROW_DETAIL_PADDING_X, TABLE_ROW_DETAIL_PADDING_Y,
} from '@/constants/_core/ui/list.constants';
import { RADIUS_SM } from '@/constants/_core/ui/ui.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  /*
   * the facts fill down each column and then across, so the pairs that belong together (a payer and
   * their beneficiary, a source account and its destination) are read one above the other. Laid out
   * across first, the two halves of a pair land at opposite ends of a line.
   */
  grid: (theme: Theme) => ({
    display: 'grid',
    gridAutoFlow: 'column' as const,
    gridTemplateRows: 'repeat(2, auto)',
    gap: `${ROW_DETAIL_FACTS_GAP_Y}px ${ROW_DETAIL_FACTS_GAP_X}px`,
    padding: `${TABLE_ROW_DETAIL_PADDING_Y}px ${TABLE_ROW_DETAIL_PADDING_X}px`,
    borderRadius: `${RADIUS_SM}px`,
    border: `1px solid ${getDesignTokens(theme).border}`,
    backgroundColor: getDesignTokens(theme).surface,
    /*
     * column flow only holds while the columns fit. Narrower than that, the grid falls back to a
     * plain stack: a column-flow grid that has run out of width silently reflows the pairs apart
     */
    gridTemplateColumns: `repeat(${ROW_DETAIL_FACTS_COLUMNS}, minmax(0, 1fr))`,
    [theme.breakpoints.down('md')]: {
      gridAutoFlow: 'row' as const,
      gridTemplateRows: 'auto',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  }),
  fact: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${ROW_DETAIL_FACT_LINE_GAP}px`,
    minWidth: 0,
  },
};

type FactProps = {
  label: string;
  children: ReactNode;
};

/** One named fact of an opened row: what it is called, and what it says. */
export const RowDetailFact = ({
  label, children,
}: FactProps) => (
  <Box css={classes.fact}>
    <Typography component="span" variant="caption">{label}</Typography>
    {children}
  </Box>
);

type Props = {
  children: ReactNode;
};

/**
 * The block of facts an opened list row states about itself, laid out so that each pair is read
 * vertically. It is what lets an operator decide on the row without opening a page for it — the
 * one thing a row can never show on its own line.
 */
const RowDetailFacts = ({ children }: Props) => (
  <Box css={classes.grid}>{children}</Box>
);

export default RowDetailFacts;
