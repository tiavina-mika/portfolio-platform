import { Theme } from '@mui/material';

import {
  LIST_CARD_PADDING_X, PAGINATION_ITEM_FONT_SIZE, PAGINATION_ITEM_GAP, PAGINATION_ITEM_PADDING_X,
  PAGINATION_ITEM_SIZE, TABLE_CELL_PADDING_X, TABLE_CELL_PADDING_Y, TABLE_CHECKBOX_COLUMN_WIDTH,
  TABLE_HEAD_LETTER_SPACING, TABLE_HEAD_PADDING_Y, TABLE_SORT_ICON_SIZE, TABLE_SORT_LABEL_GAP,
} from '@/constants/_core/ui/list.constants';
import {
  FONT_SIZE_BODY, FONT_SIZE_OVERLINE, RADIUS_SM, TAB_GAP, TAB_HEIGHT, TAB_ICON_GAP, TAB_ICON_SIZE,
  TAB_INDICATOR_HEIGHT, TAB_PADDING_X, TAB_SCROLL_BUTTON_WIDTH,
} from '@/constants/_core/ui/ui.constants';
import { getButtonFocusRing } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens, getSoftTintedBackground } from '@/utils/_core/theme/tokens.utils';

/*
 * the same halo, drawn inside the slot instead of around it. A tab strip clips whatever leaves its
 * own box — that is how MUI hides the native scrollbar of a scrollable strip — so an outer ring on
 * a tab, which is exactly as tall as the strip, would come back cut off at the top and the bottom.
 */
const getTabFocusRing = (color: string): string => `inset ${getButtonFocusRing(color)}`;

export const dataComponentOverrides = {
  MuiTableCell: {
    styleOverrides: {
      /*
       * a dense grid: the row inset is half the card's, and only the outer columns take the card
       * inset back, so the table starts and ends on the same vertical line as the toolbar above
       * it while the columns in between stay tight against each other
       */
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        padding: `${TABLE_CELL_PADDING_Y}px ${TABLE_CELL_PADDING_X}px`,
        fontSize: FONT_SIZE_BODY,
        verticalAlign: 'middle',
        borderBottom: `1px solid ${getDesignTokens(theme).borderLight}`,
        '&:first-of-type': { paddingLeft: LIST_CARD_PADDING_X },
        '&:last-of-type': { paddingRight: LIST_CARD_PADDING_X },
      }),
      head: ({
        theme,
      }: {
        theme: Theme;
      }) => {
        const tokens = getDesignTokens(theme);

        return {
          // a head cell is an overline, and sits on a tighter row than the cells under it
          padding: `${TABLE_HEAD_PADDING_Y}px ${TABLE_CELL_PADDING_X}px`,
          fontSize: FONT_SIZE_OVERLINE,
          fontWeight: theme.typography.fontWeightBold,
          textTransform: 'uppercase',
          letterSpacing: TABLE_HEAD_LETTER_SPACING,
          /*
           * the column names are the quietest text on the card: they are read once to locate a
           * column and then skipped, so they sit a step under the cells they label
           */
          color: tokens.textMuted,
          backgroundColor: tokens.surfaceSecondary,
          borderBottom: `1px solid ${tokens.border}`,
          // a wrapped two-word column name would make the whole head row two lines tall
          whiteSpace: 'nowrap',
        };
      },
      body: ({
        theme,
      }: {
        theme: Theme;
      }) => ({ color: getDesignTokens(theme).textSecondary }),
      /*
       * the tick column is a fixed gutter rather than a column that grows with its content: it
       * carries the card inset on the left so the checkboxes line up under the toolbar's own edge
       */
      paddingCheckbox: {
        width: TABLE_CHECKBOX_COLUMN_WIDTH,
        padding: `0 ${LIST_CARD_PADDING_X}px`,
        '&:last-of-type': { padding: `0 ${LIST_CARD_PADDING_X}px` },
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => {
        const tokens = getDesignTokens(theme);
        // the row a list is previewing, and every ticked row, share the faintest tint
        const selectedBackground = getSoftTintedBackground(theme, theme.palette.primary.main);

        return {
          transition: 'background 80ms',
          'tbody &:hover': { backgroundColor: tokens.surfaceSecondary },
          '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: selectedBackground },
          // the card's own edge closes the grid — a last border under it would draw a double line
          '&:last-child .MuiTableCell-body': { borderBottom: 'none' },
        };
      },
    },
  },
  MuiTableSortLabel: {
    styleOverrides: {
      /*
       * a sortable column name is still an overline: it must not turn into a link the moment it
       * becomes clickable. Only its tone moves — muted at rest, body on hover, primary once the
       * table is actually sorted by it.
       */
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => {
        const tokens = getDesignTokens(theme);

        return {
          gap: TABLE_SORT_LABEL_GAP,
          color: 'inherit',
          '&:hover': { color: tokens.text },
          '&.Mui-active': {
            color: theme.palette.primary.main,
            '& .MuiTableSortLabel-icon': { color: 'inherit' },
          },
        };
      },
      // the arrow is spaced by the label's own gap, never by a margin of its own
      icon: { margin: 0, fontSize: TABLE_SORT_ICON_SIZE },
    },
  },
  MuiPagination: {
    styleOverrides: {
      ul: { gap: PAGINATION_ITEM_GAP },
    },
  },
  MuiPaginationItem: {
    styleOverrides: {
      /*
       * a page button is the button family's smallest step, drawn as an outlined slot rather than
       * MUI's borderless round one: the pager mirrors the toolbar at the other end of the card,
       * so its controls have to belong to the same family as the ones up there
       */
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => {
        const tokens = getDesignTokens(theme);

        return {
          minWidth: PAGINATION_ITEM_SIZE,
          height: PAGINATION_ITEM_SIZE,
          margin: 0,
          padding: `0 ${PAGINATION_ITEM_PADDING_X}px`,
          fontSize: PAGINATION_ITEM_FONT_SIZE,
          fontWeight: theme.typography.fontWeightMedium,
          color: tokens.textSecondary,
          backgroundColor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          borderRadius: RADIUS_SM,
          '&:hover': { backgroundColor: tokens.surfaceSecondary, color: tokens.text },
          '&.Mui-selected, &.Mui-selected:hover': {
            color: theme.palette.primary.contrastText,
            backgroundColor: theme.palette.primary.main,
            borderColor: theme.palette.primary.dark,
          },
          '&.Mui-focusVisible': { boxShadow: getButtonFocusRing(theme.palette.primary.main) },
          '&.Mui-disabled': { color: tokens.textDisabled, opacity: 1 },
          // the ellipsis is a separator, not a slot: it carries no surface of its own
          '&.MuiPaginationItem-ellipsis': {
            backgroundColor: 'transparent',
            border: 'none',
            color: tokens.textMuted,
          },
        };
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      /*
       * the rail every strip stands on is an inset shadow rather than a border: the indicator is
       * a child of the strip's own box, so a real border-bottom would push it one pixel up and
       * leave a grey line showing under the tab that is open. A strip that draws a ground of its
       * own instead (the pill track, the head of a translated block) clears it.
       */
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => {
        const tokens = getDesignTokens(theme);

        return {
          minHeight: TAB_HEIGHT,
          boxShadow: `inset 0 -1px 0 ${tokens.border}`,
          '& .MuiTabs-list': { gap: TAB_GAP },
          // a vertical strip turns the rail onto its side and stacks its tabs flush
          '&.MuiTabs-vertical': {
            boxShadow: `inset -1px 0 0 ${tokens.border}`,
            '& .MuiTabs-list': { gap: 0 },
          },
        };
      },
      indicator: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        height: TAB_INDICATOR_HEIGHT,
        backgroundColor: theme.palette.primary.main,
      }),
      /*
       * an arrow is disabled at both ends of the run rather than hidden, so the strip keeps its
       * width and the reader learns there is nothing further that way instead of watching a
       * control disappear from under the pointer
       */
      scrollButtons: ({
        theme,
      }: {
        theme: Theme;
      }) => {
        const tokens = getDesignTokens(theme);

        return {
          width: TAB_SCROLL_BUTTON_WIDTH,
          color: tokens.textSecondary,
          '&:hover': { color: tokens.text },
          '&.Mui-disabled': { color: tokens.textDisabled, opacity: 1 },
        };
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => {
        const tokens = getDesignTokens(theme);

        return {
          minHeight: TAB_HEIGHT,
          /*
           * a tab is as wide as what it names: MUI's 90px floor pads short labels out into
           * evenly-sized slots, which turns a strip of four filters into something that reads as
           * a segmented control rather than as navigation
           */
          minWidth: 'auto',
          padding: `0 ${TAB_PADDING_X}px`,
          gap: TAB_ICON_GAP,
          fontSize: FONT_SIZE_BODY,
          fontWeight: theme.typography.fontWeightMedium,
          textTransform: 'none' as const,
          color: tokens.textSecondary,
          '&:hover': { color: tokens.text },
          // the open tab is stated three times over — tone, weight, and the indicator under it
          '&.Mui-selected': {
            color: theme.palette.primary.main,
            fontWeight: theme.typography.fontWeightBold,
          },
          // an unavailable tab keeps its slot and loses only its tone: it says what is not there
          '&.Mui-disabled': { color: tokens.textDisabled, opacity: 1 },
          '&.Mui-focusVisible': {
            boxShadow: getTabFocusRing(theme.palette.primary.main),
            borderRadius: `${RADIUS_SM}px ${RADIUS_SM}px 0 0`,
          },
        };
      },
      /*
       * MUI stacks a tab that carries both a glyph and a label into a 72px slot of its own — the
       * strip has one height whatever a given tab holds, and the glyph is spaced by the row's gap
       */
      labelIcon: {
        minHeight: TAB_HEIGHT,
        padding: `0 ${TAB_PADDING_X}px`,
        '& > .MuiTab-icon': { margin: 0, fontSize: TAB_ICON_SIZE },
      },
    },
  },
  MuiListSubheader: {
    styleOverrides: {
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        color: getDesignTokens(theme).textSecondary,
        backgroundColor: 'transparent',
      }),
    },
  },
  /*
   * MUI renders both subtitle variants as `h6`, and nothing in the back-office uses a subtitle as a
   * document heading: they are field labels, table cell titles and card captions. Left as headings
   * they land under the page title as an `h6` with no `h2`…`h5` above, which is read as a jump in
   * the outline. The size and weight of the variants stay exactly as they are.
   */
  MuiTypography: {
    defaultProps: { variantMapping: { subtitle1: 'p', subtitle2: 'p' } },
  },
  MuiSkeleton: { styleOverrides: { root: { borderRadius: RADIUS_SM } } },
  MuiLinearProgress: {
    styleOverrides: {
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        height: 5,
        borderRadius: 3,
        backgroundColor: getDesignTokens(theme).surfaceSecondary,
      }),
      bar: { borderRadius: 3 },
    },
  },
};
