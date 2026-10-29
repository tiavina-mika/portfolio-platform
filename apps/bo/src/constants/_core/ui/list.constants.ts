import type { IListTabValue } from '@/types/_core/app.type';

import { FONT_SIZE_META, FONT_SIZE_OVERLINE } from '@/constants/_core/ui/ui.constants';

// the search glyph is drawn one step heavier than the other in-field icons so it reads at 16px
export const SEARCH_ICON_SIZE = 16;
export const SEARCH_ICON_STROKE_WIDTH = 1.8;

/*
 * THE LIST TABS — the strip that scopes a list rather than navigating anywhere: every row against
 * the ones sitting in the recycle bin. It is the pill track drawn one step smaller and outlined, so
 * it can stand on the band above a list card without competing with the page title over it: a 30px
 * slot inside a 3px track, and the open one raised back onto the card surface. An underlined strip
 * here would read as a second level of navigation under the sidebar entry that opened the list.
 *
 * Each slot may carry how many rows its scope holds, stated after the label as a muted figure
 * rather than as a badge — it is a detail of the tab, not a notification on it. Until the figure is
 * known the slot holds a bar of its own width, so the strip does not jump when the count lands.
 */
export const LIST_TABS_PADDING = 3;
export const LIST_TABS_GAP = 2;
export const LIST_TAB_HEIGHT = 30;
export const LIST_TAB_PADDING_X = 12;
export const LIST_TAB_GAP = 6;
export const LIST_TAB_FONT_SIZE = FONT_SIZE_META;
export const LIST_TAB_COUNT_SKELETON_WIDTH = 26;
export const LIST_TAB_COUNT_SKELETON_HEIGHT = 11;

/*
 * what a list without tabs falls back to. One array for every render: the list re-reads its default
 * filters whenever `tabs` changes identity, so a fresh `[]` per render would re-run that effect after
 * each render and never let the page settle
 */
export const NO_LIST_TABS: IListTabValue[] = [];

/*
 * THE LIST CARD — a list screen is one card, not a stack of panels: the toolbar, the selection
 * band, the table (or the card grid) and the pager are bands inside a single surface, separated by
 * the light border and sharing one horizontal inset. Every band pads itself on that inset, which
 * is what makes the search field, the first table column and the pager info read as one column.
 */
export const LIST_CARD_PADDING_X = 16;
export const LIST_TOOLBAR_PADDING_Y = 12;
// the toolbar packs controls tighter than a form row: they are chrome around the list, not fields
export const LIST_TOOLBAR_GAP = 8;
export const LIST_TOOLBAR_GROUP_GAP = 12;
export const LIST_SEARCH_WIDTH = 260;
/*
 * the toolbar has its own control row, one step under the form field row: a search box and a sort
 * slot are chrome around the list, not values to fill in, so they must not stand as tall as the
 * fields of the form the list links to. Pointer devices only — under `md` the controls go back to
 * their touch targets, where a 34px slot is too small to land a finger on.
 */
export const LIST_TOOLBAR_CONTROL_HEIGHT = 34;
/*
 * both menus are wider than the MENU_MIN_WIDTH an action menu takes: their rows carry a second
 * piece of information after the label (the direction a column is read in, what a format writes),
 * which a menu sized by its longest word would push onto a second line
 */
export const SORT_MENU_WIDTH = 300;
// the direction the picked column is read in, stated beside the arrow that draws it
export const SORT_MENU_DIRECTION_GAP = 4;
export const SORT_MENU_ARROW_SIZE = 12;

/*
 * THE FILTER PANEL — the advanced filters are a band of the list card, not a dialog over it: the
 * reader narrows the list while still seeing the list, and the panel folds away once applied. It
 * sits on the recessed ground so it reads as a drawer pulled out of the toolbar above it, and its
 * controls stand on the toolbar's own control row rather than the taller form row — the panel is a
 * dense grid of narrow columns, where a 48px field leaves each cell mostly empty.
 *
 * The columns are auto-fit rather than a fixed count: a filter set is between four and fifteen
 * fields depending on the domain, so the grid packs as many as the card width holds and reflows
 * instead of stretching four fields across a wide screen.
 */
export const LIST_FILTERS_PADDING = 16;
export const LIST_FILTERS_MIN_COLUMN_WIDTH = 220;
export const LIST_FILTERS_ROW_GAP = 14;
export const LIST_FILTERS_COLUMN_GAP = 16;
// the label names the control right under it, so it sits closer to it than the rows are to each other
export const LIST_FILTERS_LABEL_GAP = 5;
export const LIST_FILTERS_FOOT_GAP = 16;
export const LIST_FILTERS_FOOT_PADDING_TOP = 14;
export const LIST_FILTERS_ACTIONS_GAP = 8;
/*
 * a segmented group inside a filter cell holds as many options as the domain has statuses, in a
 * column a quarter of the card wide: it drops to the label inset so five segments fit on one row,
 * and wraps onto a second one rather than pushing the grid out of the card
 */
export const LIST_FILTERS_TOGGLE_PADDING_X = 10;
/*
 * an action drawn inside a filter field (the clear cross of a search/autocomplete cell) is a slot
 * on the row, not a button standing next to it: at the standalone icon-slot size it is taller than
 * the compressed row and pushes the field back above it
 */
export const LIST_FILTERS_INPUT_ACTION_SIZE = 24;

/*
 * THE THREE PRESENTATIONS OF THAT PANEL. The fields it holds are the same in all three; only what
 * carries them changes with how much room the viewport gives, and how the reader is pointing at it.
 *
 *  - pointer, wide screen: a menu hanging off the "filters" trigger. The list stays on screen
 *    behind it, which is what a reader narrowing a result set needs to see — the fields are read
 *    against the rows they are about to cut down, not instead of them.
 *  - pointer, narrow screen: the band folded under the toolbar. A 620px menu no longer clears the
 *    card, so the panel goes back to being a band of it.
 *  - touch: the whole card, covered. There is no room to show the list behind a filter set on a
 *    phone, so the fields take the frame and the foot says how many rows they leave — the reader
 *    reads the count rather than the rows, and lands back on the list when they accept it.
 */
export const LIST_FILTERS_MENU_WIDTH = 620;
/*
 * two columns rather than the band's auto-fit: the menu sets its own width, so the grid can be
 * counted out instead of packed into whatever the card leaves
 */
export const LIST_FILTERS_MENU_COLUMNS = 2;
export const LIST_FILTERS_MENU_PADDING = 14;
export const LIST_FILTERS_MENU_ROW_GAP = 12;
export const LIST_FILTERS_MENU_COLUMN_GAP = 14;
export const LIST_FILTERS_MENU_OFFSET = 6;
/*
 * head and foot of the menu and of the drawer: the same band the option menus draw (MENU_BAND_*),
 * on the slightly wider inset these two take because their body is a grid of fields rather than a
 * column of rows
 */
export const LIST_FILTERS_BAND_PADDING_Y = 10;
export const LIST_FILTERS_BAND_PADDING_X = 14;
// the head of the drawer stands on the touch row, the way an app bar does
export const LIST_FILTERS_DRAWER_HEAD_HEIGHT = 56;
export const LIST_FILTERS_DRAWER_PADDING = 16;
export const LIST_FILTERS_DRAWER_GAP = 16;
/*
 * the drawer covers the list card it belongs to rather than the page: the toolbar that opened it,
 * the tabs above it and the rest of the screen stay where they are, so it reads as the card being
 * turned over rather than as a new screen
 */
export const LIST_FILTERS_DRAWER_Z_INDEX = 3;


/*
 * the count pinned to the "filters" trigger — a small tinted pill reading as part of the label,
 * which is why it is rounder and quieter than the badge a notification icon carries
 */
export const FILTER_COUNT_BADGE_PADDING_X = 6;
export const FILTER_COUNT_BADGE_RADIUS = 9;
export const FILTER_COUNT_BADGE_FONT_SIZE = FONT_SIZE_OVERLINE;
// the trigger turns primary while the panel is open, so the pill inverts to sit on that fill
export const FILTER_COUNT_BADGE_ACTIVE_OPACITY = 0.2;

/*
 * the band listing what is currently filtering the list, between the panel and the rows: it is a
 * strip of chips, read at a glance and clicked to undo one, so it is tighter than the toolbar and
 * spaces its chips the way the selection band spaces its actions
 */
export const LIST_CHIPBAR_PADDING_Y = 10;
export const LIST_CHIPBAR_GAP = 6;
/*
 * the band naming the current selection sits on the faintest tint the design draws (see
 * getSoftTintedBackground) and on a tighter row than the toolbar — it appears and disappears as
 * rows are ticked, so it must not shift the table down by a full toolbar height when it does
 */
export const LIST_SELECTION_BAR_PADDING_Y = 8;
export const LIST_SELECTION_BAR_GAP = 6;
/*
 * its bulk actions stand a step under the toolbar's control row: the band opens and closes between
 * two others as rows are ticked, so a button at the toolbar height would shift the whole table down
 * on every tick — it stands on the same row as the table's own per-row actions below it.
 */
export const LIST_SELECTION_BAR_BUTTON_HEIGHT = 30;
export const LIST_PAGER_PADDING_Y = 12;

/*
 * THE TABLE — a dense grid, so the row inset is half the card's: a cell is separated from the next
 * by its content, not by air. Only the outer columns take the card inset, so the grid starts and
 * ends on the same vertical line as the toolbar above it.
 */
export const TABLE_CELL_PADDING_X = 10;
export const TABLE_CELL_PADDING_Y = 11;
/*
 * the same grid with more air between its lines, offered from the toolbar's view switcher. Density
 * is a reading preference, not a second table, so only the vertical inset of a body cell moves —
 * the head row and every column inset stay put, or switching density would shift each column edge.
 */
export const TABLE_CELL_PADDING_Y_COMFORTABLE = 17;
// a head cell is an overline on a tighter row than the cells under it
export const TABLE_HEAD_PADDING_Y = 9;
export const TABLE_HEAD_LETTER_SPACING = 0.3;
export const TABLE_CHECKBOX_COLUMN_WIDTH = 44;
/*
 * THE ROW THAT OPENS — a list whose rows carry more than a row can show, and whose reader has to
 * decide on one without leaving the list (a payment ledger: the failure message, the attempts, the
 * two accounts the money moved between, then the actions). The caret takes a gutter of its own
 * rather than sitting inside the first cell: the head row leaves the same gutter empty, so every
 * column label stays over its own column whether a row is open or not.
 */
export const TABLE_ROW_DETAIL_TOGGLE_WIDTH = 36;
export const TABLE_ROW_DETAIL_ICON_SIZE = 16;
/*
 * the band a row opens onto, inset past the caret gutter so it reads as belonging to the row above
 * rather than as a row of its own
 */
export const TABLE_ROW_DETAIL_PADDING_X = 16;
export const TABLE_ROW_DETAIL_PADDING_Y = 14;
export const TABLE_ROW_DETAIL_GAP = 12;
/*
 * the facts a row states once open, laid out four to a line and read in pairs down each column.
 * Two rows of four: any more per line and a pair stops reading as a pair.
 */
export const ROW_DETAIL_FACTS_COLUMNS = 4;
export const ROW_DETAIL_FACTS_GAP_X = 20;
export const ROW_DETAIL_FACTS_GAP_Y = 12;
export const ROW_DETAIL_FACT_LINE_GAP = 2;
export const ROW_DETAIL_NOTICE_GAP = 9;
export const ROW_DETAIL_NOTICE_PADDING_X = 12;
export const ROW_DETAIL_NOTICE_PADDING_Y = 9;
/*
 * the sort arrow belongs to the column label rather than sitting beside it, and it is drawn under
 * the label's cap height, so an active column never stands a pixel taller than the ones beside it
 */
export const TABLE_SORT_LABEL_GAP = 5;
export const TABLE_SORT_ICON_SIZE = 14;
/*
 * the actions repeated on every row of a list — in a table cell and in the foot of a card. They
 * take the toolbar's own bordered slot one step smaller: at the full button size, a ten-row table
 * reads as two columns of buttons with a table behind them. Pointer devices only, like the
 * toolbar row.
 */
export const ROW_ACTIONS_BUTTON_SIZE = 30;

/*
 * THE TWO-LINE CELL — a table cell holding a value and what qualifies it (a route and its length,
 * a departure and how far off it is, a price and the share of it the driver keeps). The two lines
 * are separated by a hairline so they read as one cell rather than as two stacked values, and the
 * pieces standing side by side on the first line share the wider inline gap.
 */
export const TABLE_CELL_LINE_GAP = 3;
export const TABLE_CELL_INLINE_GAP = 6;
// a glyph joining two words inside a cell (the route arrow), sized under the text it sits between
export const TABLE_CELL_GLYPH_SIZE = 12;
/*
 * the warning a row carries about itself (an open report): one step larger than the inline glyph
 * above, since it has to be caught while scanning the column rather than read inside a phrase
 */
export const TABLE_CELL_ALERT_GLYPH_SIZE = 15;
// smaller than the list's own avatar: it stands inside a row, next to a name, not on its own line
export const TABLE_CELL_AVATAR_SIZE = 28;
export const TABLE_CELL_AVATAR_GAP = 8;
// initials inside a row-sized avatar, which is far under the size MUI scales its own glyph for
export const TABLE_CELL_AVATAR_FONT_SIZE = 12;
export const TABLE_CELL_AVATAR_FONT_WEIGHT = 600;

/*
 * how many lines of free text a row may spend on one cell before it is cut off. Two: enough for a
 * complaint's first sentence to be read from the list, and few enough that a page of rows keeps a
 * uniform height — the full text is one click away in the row's own file.
 */
export const TABLE_CELL_TEXT_CLAMP_LINES = 2;
export const TABLE_CELL_TEXT_MAX_WIDTH = 340;

/*
 * THE ROW METER — a ratio drawn under the figures that state it, inside a table row: how full a
 * ride is, how far an article's views are along their goal. The bar is what makes a column of them
 * comparable at a glance, so it is a fixed width rather than one sized by the cell it stands in —
 * bars of different lengths cannot be compared to one another.
 */
export const ROW_METER_WIDTH = 78;
export const ROW_METER_HEIGHT = 4;
export const ROW_METER_RADIUS = 2;
export const ROW_METER_GAP = 4;

/*
 * THE INLINE RATING — a person's score standing next to their name inside a table row: a star and
 * one decimal, nothing more. It is a fact about the person, not the subject of the cell, so it is
 * drawn at the meta rung under the name rather than as a row of five stars — a five-star widget
 * repeated twice per row is the widest thing on the list for a value read as a single number.
 */
export const INLINE_RATING_GLYPH_SIZE = 11;
export const INLINE_RATING_GAP = 3;
/*
 * under this score the rating stops being background and becomes something the operator has to
 * take into account before acting on the row, so it is tinted and weighted rather than muted
 */
export const INLINE_RATING_LOW_THRESHOLD = 4;
export const INLINE_RATING_LOW_FONT_WEIGHT = 600;

/*
 * COUNT PILL — a figure standing alone in a table cell (the bookings a ride still owes an answer
 * for). It is wider and taller than the badge pinned to an icon corner: nothing else in the cell
 * says what it counts, so it has to hold the column on its own.
 */
export const COUNT_PILL_MIN_WIDTH = 26;
export const COUNT_PILL_HEIGHT = 24;
export const COUNT_PILL_PADDING_X = 7;
export const COUNT_PILL_RADIUS = 12;
export const ROW_ACTIONS_ICON_SIZE = 15;
export const ROW_ACTIONS_GAP = 4;

/*
 * the view switcher is a recessed track holding three icon slots, not a row of outlined segments:
 * it swaps a rendering mode rather than holding a value, so it stays visually below the controls
 * that filter the list. The picked slot is the one raised onto the card surface. Two of the slots
 * are the same table at two densities — the reader picks how many rows fit on screen from the same
 * control that swaps the table for the card grid, since all three answer one question.
 */
export const LIST_VIEW_TOGGLE_PADDING = 3;
export const LIST_VIEW_TOGGLE_GAP = 2;
export const LIST_VIEW_TOGGLE_BUTTON_SIZE = 28;
export const LIST_VIEW_TOGGLE_ICON_SIZE = 15;

/*
 * pager buttons are numbered slots on the button row's smallest step — the pager is read once per
 * page change, so it sits quieter than the toolbar it mirrors at the other end of the card
 */
export const PAGINATION_ITEM_SIZE = 30;
export const PAGINATION_ITEM_PADDING_X = 9;
export const PAGINATION_ITEM_GAP = 4;
export const PAGINATION_ITEM_FONT_SIZE = FONT_SIZE_META;

/*
 * EMPTY AND ERROR STATES — a full band inside the card rather than a message in a row: the list
 * has nothing to show, so the space the rows would have taken is what carries the explanation and
 * the way out of it. The text column is capped so the sentence breaks into two readable lines
 * instead of running the whole width of a wide table.
 */
export const LIST_STATE_PADDING_Y = 56;
export const LIST_STATE_PADDING_X = 24;
export const LIST_STATE_GAP = 10;
export const LIST_STATE_ICON_SIZE = 40;
export const LIST_STATE_TEXT_MAX_WIDTH = 320;
export const LIST_STATE_ACTIONS_GAP = 8;

/*
 * THE CARD GRID — the list's other rendering. The grid sits on the recessed ground so the cards
 * read as items inside the list card rather than as a second set of panels floating on it, and a
 * card states its values as a two-column key/value block: the label column is fixed so every card
 * in the row aligns its values on the same edge whatever the label lengths are.
 */
export const LIST_CARDS_PADDING = 16;
export const LIST_CARDS_GAP = 16;
export const LIST_CARD_HEAD_PADDING_Y = 12;
export const LIST_CARD_ITEM_PADDING_X = 14;
export const LIST_CARD_ROW_GAP = 12;
export const LIST_CARD_KEY_COLUMN_WIDTH = 140;
export const LIST_CARD_FOOT_PADDING_Y = 10;
/*
 * on a phone the grid is one column, so the side inset would only narrow cards that are already as
 * wide as the screen: the band drops it and the cards run edge to edge, closed by a rule top and
 * bottom rather than by a border of their own — the same shape a native list has
 */
export const LIST_CARDS_TOUCH_PADDING_Y = 10;
export const LIST_CARDS_TOUCH_GAP = 10;

/*
 * a pager for a list standing in a narrow column: the two arrows at the ends and the range between
 * them, on one line. A column 300px wide has no room for a row of page numbers, and a queue is
 * turned one page at a time anyway.
 */
export const COMPACT_PAGER_HEIGHT = 44;
export const COMPACT_PAGER_PADDING_X = 10;
export const COMPACT_PAGER_GAP = 8;
export const COMPACT_PAGER_BUTTON_SIZE = 30;
export const COMPACT_PAGER_ICON_SIZE = 15;

// the chevron column of a short list whose rows unfold what they hold (a ticket's thread)
export const COMPACT_TABLE_EXPAND_CELL_WIDTH = 48;
// the band closing a block of a detail page: a note on the left, the way to the full list on the right
export const SECTION_FOOTER_GAP = 12;
export const SECTION_FOOTER_PADDING_TOP = 12;
