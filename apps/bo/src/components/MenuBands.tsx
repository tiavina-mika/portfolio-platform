import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ReactNode } from 'react';

import type { Theme } from '@mui/material/styles';

import {
  FONT_SIZE_META, MENU_BAND_GAP, MENU_BAND_PADDING_X, MENU_BAND_PADDING_Y, MENU_PADDING,
} from '@/constants/_core/ui/ui.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

/*
 * The bands of a menu that offers a set of related options rather than a list of actions: a caption
 * over each group saying what its rows are (a format, a scope, a sort criterion), and a foot stating
 * what the picked options will do and holding the action that carries it out. Without them a menu
 * mixing two groups of rows is one undifferentiated list the reader has to infer the structure of.
 *
 * All three run edge to edge on the paper — hence the negative inset undoing the menu list's own
 * padding, which the items between them keep so their rounded highlight still clears the paper edge
 * — and take that inset back as their own so their text lines up with the item labels.
 */
const bandInset = `${-MENU_PADDING}px`;

const classes = {
  band: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: MENU_BAND_GAP,
    padding: `${MENU_BAND_PADDING_Y}px ${MENU_BAND_PADDING_X}px`,
    borderColor: getDesignTokens(theme).borderLight,
    borderStyle: 'solid',
    borderWidth: 0,
  }),
  head: {
    margin: `${bandInset} ${bandInset} ${MENU_PADDING}px`,
    borderBottomWidth: 1,
  },
  /*
   * a caption opening a second group inside the same menu sits on the recessed ground and is closed
   * on both sides: it has rows above it as well as below, so a single edge would read as belonging
   * to whichever group the eye reached it from
   */
  subhead: (theme: Theme) => ({
    margin: `${MENU_PADDING}px ${bandInset}`,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    backgroundColor: getDesignTokens(theme).surfaceSecondary,
  }),
  foot: (theme: Theme) => ({
    margin: `${MENU_PADDING}px ${bandInset} ${bandInset}`,
    borderTopWidth: 1,
    backgroundColor: getDesignTokens(theme).surfaceSecondary,
  }),
  // with nothing to state on its left, the action keeps the end of the row rather than drifting to it
  footWithoutNote: { justifyContent: 'flex-end' },
  // what the foot states is a note about the action next to it, not a second thing to read
  footText: (theme: Theme) => ({
    fontSize: FONT_SIZE_META,
    color: getDesignTokens(theme).textMuted,
  }),
};

type HeadProps = {
  title: string;
  /*
   * the single action acting on the whole set of options under the caption (going back to the
   * default order, clearing a choice); anything acting on one option belongs in that option's row
   */
  action?: ReactNode;
};

export const MenuHead = ({
  title, action,
}: HeadProps) => (
  /*
   * role="presentation": these bands sit inside the menu paper, and a menu may only hold menu
   * items — a title band announced as one would be a row nobody can choose
   */
  <Box css={[classes.band, classes.head]} role="presentation">
    <Typography variant="overline">{title}</Typography>
    {action}
  </Box>
);

export const MenuSubhead = ({
  title,
}: {
  title: string;
}) => (
  <Box css={[classes.band, classes.subhead]} role="presentation">
    <Typography variant="overline">{title}</Typography>
  </Box>
);

type FootProps = {
  // what the picked options amount to, stated where the action that applies them is
  note?: string;
  children: ReactNode;
};

export const MenuFoot = ({
  note, children,
}: FootProps) => (
  <Box css={[classes.band, classes.foot, !note && classes.footWithoutNote]} role="presentation">
    {note && <Typography css={classes.footText}>{note}</Typography>}
    {children}
  </Box>
);
