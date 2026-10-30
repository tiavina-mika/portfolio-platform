import {
  Box, Card, CardHeader, Typography, type Theme,
} from '@mui/material';

import type { ReactNode } from 'react';

import {
  ABOUT_CARD_HEAD_GAP, ABOUT_CARD_ICON_SLOT_SIZE, ABOUT_ROW_MIN_HEIGHT_TOUCH, ABOUT_ROW_STACK_GAP,
} from '@/constants/_core/ui/page.constants';
import { FONT_FAMILY_MONO, FONT_SIZE_META, RADIUS } from '@/constants/_core/ui/ui.constants';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';

export type AboutInfoRow = {
  label: string;
  value: ReactNode;
  // a reference read character by character (a version, a host, a number) is set in the mono face
  isMono?: boolean;
  // the label sits over its value instead of beside it: the value is a link the reader acts on
  isStacked?: boolean;
};

const classes = {
  // the rules between the rows are drawn by the card: a row does not know whether it is the last
  rows: (theme: Theme) => ({
    '& > *:not(:last-child)': { borderBottom: `1px solid ${getDesignTokens(theme).borderLight}` },
  }),
  iconSlot: (theme: Theme) => ({
    width: ABOUT_CARD_ICON_SLOT_SIZE,
    height: ABOUT_CARD_ICON_SLOT_SIZE,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: `${RADIUS}px`,
    color: theme.palette.primary.dark,
    backgroundColor: getTintedBackground(theme, theme.palette.primary.main),
  }),
  row: (isStacked: boolean) => (theme: Theme) => ({
    display: 'flex',
    alignItems: isStacked
      ? 'flex-start'
      : 'center',
    flexDirection: isStacked
      ? 'column' as const
      : 'row' as const,
    justifyContent: 'space-between',
    gap: isStacked
      ? `${ABOUT_ROW_STACK_GAP}px`
      : theme.spacing(2),
    padding: theme.spacing(1.5, 2),
    // a thumb needs more height than a pointer to land on a row
    [theme.breakpoints.down('sm')]: { minHeight: ABOUT_ROW_MIN_HEIGHT_TOUCH },
  }),
  value: (isMono: boolean, isStacked: boolean) => ({
    fontWeight: 500,
    minWidth: 0,
    overflowWrap: 'anywhere' as const,
    textAlign: isStacked
      ? 'start' as const
      : 'end' as const,
    ...(isMono && { fontFamily: FONT_FAMILY_MONO, fontSize: FONT_SIZE_META }),
  }),
};

type Props = {
  title: string;
  icon: ReactNode;
  rows: AboutInfoRow[];
};

/**
 * One card of the about page: a glyph and a title, then facts about the application as rows of a
 * label and its value.
 */
const AboutInfoCard = ({
  title, icon, rows,
}: Props) => (
  <Card>
    <CardHeader
      avatar={<span css={classes.iconSlot}>{icon}</span>}
      slotProps={{ root: { sx: { gap: `${ABOUT_CARD_HEAD_GAP}px` } } }}
      title={title}
    />
    <Box css={classes.rows}>
      {rows.map(({
        label, value, isMono = false, isStacked = false,
      }) => (
        <Box css={classes.row(isStacked)} key={label}>
          <Typography sx={{ color: 'text.secondary' }} variant="body2">{label}</Typography>
          <Typography component="div" css={classes.value(isMono, isStacked)} variant="body2">
            {value}
          </Typography>
        </Box>
      ))}
    </Box>
  </Card>
);

export default AboutInfoCard;
