/*
 * THE KPI ROW — the figures a page opens on, read as one row of cards of equal width rather than
 * as a set of blocks each sized by its own number. The row is tighter than the column it stands in
 * (CONTENT_GAP above): the cards belong to one another, where the bands of the page do not.
 *
 * It folds by halving rather than by going straight to one card per row — two figures side by side
 * still compare, a single column of figures is a list.
 */
/*
 * THE HEALTH BAND — one strip stating what a ledger is worth on the left and how each of its
 * channels is behaving on the right. Half the height of a row of four counter cards, because it
 * qualifies the list under it rather than being the page: the totals are read once on arrival,
 * the channels are what is scanned.
 */
export const HEALTH_BAND_TOTALS_WIDTH = 240;
export const HEALTH_BAND_PADDING_X = 18;
export const HEALTH_BAND_PADDING_Y = 14;
export const HEALTH_BAND_CHANNEL_GAP = 7;
export const HEALTH_BAND_TOTALS_GAP = 2;
// the segmented share of a channel's traffic — a hairline, read as a proportion and not as a chart
export const HEALTH_BAR_HEIGHT = 6;
export const HEALTH_BAR_RADIUS = 3;

export const KPI_GRID_GAP = 14;
export const KPI_GRID_COLUMNS = 4;
export const KPI_GRID_FOLDED_COLUMNS = 2;

/*
 * THE DASHBOARD — the home page is read at a glance: a row of figures, then the alerts still owed a
 * decision, then the latest activity. Each band is a heading over cards laid side by side, split
 * from the next one by a rule. Its lists are short cards rather than tables: a few rows, then the
 * way to the full list under them.
 */
export const DASHBOARD_SECTION_GAP = 20;
export const DASHBOARD_SECTION_GAP_MOBILE = 14;
export const DASHBOARD_SECTION_TITLE_GAP = 12;
export const DASHBOARD_SECTION_TITLE_ICON_GAP = 8;
export const DASHBOARD_SECTION_TITLE_ICON_SIZE = 18;
export const DASHBOARD_CARDS_GAP = 16;
// the two alert cards — failed payments and open reports — stand side by side on a wide screen
export const DASHBOARD_ALERTS_COLUMNS = 2;
// an activity column is titled from above, closer to its card than the band heading is to the columns
export const DASHBOARD_COLUMN_TITLE_GAP = 10;
export const DASHBOARD_CARD_HEADER_GAP = 10;
export const DASHBOARD_CARD_ICON_SIZE = 16;
export const DASHBOARD_CARD_FOOTER_PADDING_Y = 8;
export const DASHBOARD_CARD_FOOTER_PADDING_X = 12;
export const DASHBOARD_COUNT_PILL_HEIGHT = 20;
export const DASHBOARD_COUNT_PILL_PADDING_X = 8;
// the pill of an empty card is a wash of the secondary text tone: a zero is a value, not a state
export const DASHBOARD_COUNT_PILL_NEUTRAL_OPACITY = 0.1;
/*
 * an alert card is tinted by its tone: a hairline around the card, a wash behind its head and a
 * rule under that head. Warning is a much lighter base tone than error, so it takes stronger ratios
 * for the two cards to read as equally loud side by side
 */
export const DASHBOARD_ALERT_TONE_OPACITY = {
  error: { border: 0.25, headerBackground: 0.04, headerBorder: 0.15 },
  warning: { border: 0.35, headerBackground: 0.08, headerBorder: 0.2 },
} as const;
export const DASHBOARD_ALERT_BODY_PADDING_TOP = 4;
export const DASHBOARD_ALERT_BODY_PADDING_BOTTOM = 8;
export const DASHBOARD_ALERT_ROW_PADDING_Y = 11;
export const DASHBOARD_ALERT_ROW_GAP = 10;
// a gateway failure message is free text — it is cut rather than allowed to push the amount out
export const DASHBOARD_ALERT_CHIP_MAX_WIDTH = 200;
export const DASHBOARD_ACTIVITY_BODY_PADDING_Y = 8;
export const DASHBOARD_ACTIVITY_BODY_PADDING_X = 12;
export const DASHBOARD_ACTIVITY_ROW_PADDING_Y = 8;
export const DASHBOARD_ACTIVITY_ROW_GAP = 8;
// an empty card is a short card, not a list screen: its empty band is shallower than the one of a table
export const DASHBOARD_EMPTY_PADDING_Y = 36;
export const DASHBOARD_EMPTY_PADDING_X = 20;
export const DASHBOARD_ERROR_PADDING_Y = 20;
export const DASHBOARD_ERROR_PADDING_X = 16;
export const DASHBOARD_ERROR_GAP = 14;
// the card of an account whose post gives no dashboard data: a message, then the pages it may open
export const DASHBOARD_NO_ACCESS_PADDING_TOP = 40;
export const DASHBOARD_NO_ACCESS_PADDING = 24;
export const DASHBOARD_NO_ACCESS_GAP = 6;
export const DASHBOARD_NO_ACCESS_TEXT_MAX_WIDTH = 460;
export const DASHBOARD_NO_ACCESS_LINKS_MAX_WIDTH = 520;
export const DASHBOARD_NO_ACCESS_LINK_MIN_HEIGHT = 56;
export const DASHBOARD_NO_ACCESS_LINK_ICON_SIZE = 14;
export const DASHBOARD_PARTIAL_NOTICE_PADDING_TOP = 12;
export const DASHBOARD_ALERT_SKELETON_ROWS = 3;
export const DASHBOARD_ACTIVITY_SKELETON_ROWS = 4;
export const DASHBOARD_SKELETON_TITLE_WIDTH = 170;
export const DASHBOARD_SKELETON_TITLE_HEIGHT = 14;
export const DASHBOARD_SKELETON_BODY_PADDING_TOP = 6;
export const DASHBOARD_SKELETON_BODY_PADDING_BOTTOM = 12;
export const DASHBOARD_SKELETON_ROW_PADDING_Y = 12;
export const DASHBOARD_SKELETON_ROW_GAP = 12;
export const DASHBOARD_SKELETON_LINES_GAP = 7;
export const DASHBOARD_SKELETON_LINE_HEIGHT = 12;
export const DASHBOARD_SKELETON_META_HEIGHT = 10;
export const DASHBOARD_SKELETON_TRAILING_WIDTH = 70;

/*
 * THE STATISTICS PAGE — one screen for every analytics view: a navigation rail on the left, then a
 * bar naming the open view with its period switch, then a column of chart cards. Under `lg` the rail
 * becomes a row of tabs above the content, since a rail would take a third of a tablet. On a wide
 * screen the rail and the bar stay pinned under the app bar while the cards scroll, so the view and
 * its period stay in sight on a page a dozen charts long. On a phone the cards run edge to edge.
 */
export const STATISTICS_RAIL_WIDTH = 232;
export const STATISTICS_LAYOUT_GAP = 20;
export const STATISTICS_LAYOUT_GAP_COMPACT = 14;
export const STATISTICS_CONTENT_GAP = 16;
export const STATISTICS_CONTENT_GAP_MOBILE = 12;
// the air a pinned band keeps under the app bar
export const STATISTICS_STICKY_OFFSET = 12;
// above the cards scrolling under the bar, far below the app bar and its menus
export const STATISTICS_STICKY_Z_INDEX = 5;
export const STATISTICS_RAIL_PADDING = 8;
export const STATISTICS_RAIL_GAP = 2;
export const STATISTICS_RAIL_TITLE_PADDING_TOP = 8;
export const STATISTICS_RAIL_TITLE_PADDING_X = 10;
export const STATISTICS_RAIL_TITLE_PADDING_BOTTOM = 6;
export const STATISTICS_RAIL_ITEM_MIN_HEIGHT = 38;
export const STATISTICS_RAIL_ITEM_PADDING_X = 12;
export const STATISTICS_TAB_HEIGHT = 40;
export const STATISTICS_TAB_PADDING_X = 14;
export const STATISTICS_TABS_GAP = 6;
export const STATISTICS_TOOLBAR_PADDING_X = 16;
export const STATISTICS_TOOLBAR_PADDING_Y = 12;
export const STATISTICS_TOOLBAR_PADDING_X_COMPACT = 14;
export const STATISTICS_TOOLBAR_PADDING_Y_COMPACT = 10;
export const STATISTICS_TOOLBAR_GAP = 16;
export const STATISTICS_TOOLBAR_GAP_MOBILE = 10;
export const STATISTICS_BLOCK_PADDING_TOP = 16;
export const STATISTICS_BLOCK_PADDING_X = 18;
export const STATISTICS_BLOCK_PADDING_BOTTOM = 18;
export const STATISTICS_BLOCK_PADDING_TOP_COMPACT = 14;
export const STATISTICS_BLOCK_PADDING_X_COMPACT = 16;
export const STATISTICS_BLOCK_PADDING_BOTTOM_COMPACT = 16;
export const STATISTICS_BLOCK_PADDING_X_MOBILE = 12;
export const STATISTICS_BLOCK_GAP = 12;
export const STATISTICS_BLOCK_GAP_COMPACT = 10;
export const STATISTICS_BLOCK_HEADER_GAP = 10;
export const STATISTICS_BLOCK_HEADER_GAP_MOBILE = 8;
// the CSV action is a footnote of its card, a step under the button row — it grows back to a touch target on a phone
export const STATISTICS_CSV_BUTTON_HEIGHT = 28;
export const STATISTICS_CSV_BUTTON_HEIGHT_COMPACT = 30;
export const STATISTICS_CSV_BUTTON_HEIGHT_MOBILE = 36;
export const STATISTICS_CSV_BUTTON_PADDING_X = 9;
export const STATISTICS_CSV_BUTTON_GAP = 5;
export const STATISTICS_CSV_ICON_SIZE = 13;
export const STATISTICS_CSV_BUTTON_HOVER_BORDER_OPACITY = 0.4;
export const STATISTICS_SKELETON_BLOCKS = 3;
export const STATISTICS_SKELETON_TITLE_WIDTH = 220;
export const STATISTICS_SKELETON_TITLE_HEIGHT = 16;
// a table wider than a phone scrolls inside its card rather than squeezing four columns into 360px
export const STATISTICS_TABLE_MIN_WIDTH_MOBILE = 520;

/*
 * THE SEGMENTED SWITCH — a handful of mutually exclusive values (a period) read as one control: a
 * recessed track holding its options, the picked one tinted rather than raised. On a phone the
 * track takes the width and its options share it, each a full touch target.
 */
export const SEGMENTED_CONTROL_PADDING = 3;
export const SEGMENTED_CONTROL_GAP = 2;
export const SEGMENTED_CONTROL_ITEM_HEIGHT = 28;
export const SEGMENTED_CONTROL_ITEM_PADDING_X = 11;
export const SEGMENTED_CONTROL_SELECTED_OPACITY = 0.12;

/*
 * THE DELTA CHIP — the change of a figure against the previous period, tinted by whether that change
 * is good news rather than by its sign: a falling failure rate is drawn in the brand tone.
 */
export const DELTA_CHIP_HEIGHT = 22;
export const DELTA_CHIP_PADDING_X = 9;
export const DELTA_CHIP_BORDER_OPACITY = 0.2;

/*
 * THE CHARTS — every plot is drawn at one height so the cards of a view line up, with its y-axis in
 * a fixed gutter the legend under the plot is aligned to, and three horizontal grid lines faint
 * enough to stay behind the series.
 */
export const CHART_HEIGHT = 220;
export const CHART_Y_AXIS_WIDTH = 52;
export const CHART_Y_TICK_COUNT = 3;
export const CHART_MARGIN_TOP = 8;
export const CHART_MARGIN_RIGHT = 8;
export const CHART_GAP = 8;
export const CHART_LEGEND_GAP_X = 16;
export const CHART_LEGEND_GAP_Y = 6;
export const CHART_LEGEND_ITEM_GAP = 6;
export const CHART_LEGEND_SWATCH_SIZE = 10;
export const CHART_LEGEND_SWATCH_RADIUS = 2;
export const CHART_BAR_RADIUS = 2;
export const CHART_REFERENCE_LINE_DASH = '6 5';
// the previous period drawn behind a trend line: dashed and fainter, so it reads as a ghost of the series
export const CHART_PREVIOUS_LINE_DASH = '3 4';
export const CHART_PREVIOUS_LINE_WIDTH = 1.5;
export const CHART_PREVIOUS_LINE_OPACITY = 0.6;
export const CHART_PREVIOUS_SERIES_ID_PREFIX = 'previous-';
export const COMPARE_BUTTON_GAP = 8;
export const COMPARE_BUTTON_PADDING_X = 12;
export const COMPARE_BUTTON_ICON_WIDTH = 16;
export const COMPARE_BUTTON_ICON_HEIGHT = 8;
export const COMPARE_BUTTON_SELECTED_OPACITY = 0.08;
export const COMPARE_BUTTON_SELECTED_BORDER_OPACITY = 0.4;
export const DONUT_CHART_SIZE = 190;
export const DONUT_CHART_INNER_RADIUS = '59%';
export const DONUT_CHART_OUTER_RADIUS = '92%';
export const DONUT_CHART_GAP = 28;
export const DONUT_CHART_LEGEND_MIN_WIDTH = 180;
export const DONUT_CHART_LEGEND_GAP = 10;
export const HEATMAP_CELL_HEIGHT = 22;
export const HEATMAP_CELL_RADIUS = 3;
export const HEATMAP_GAP = 6;
export const HEATMAP_DAY_LABEL_WIDTH = 46;
// an empty slot keeps the recessed ground; the faintest filled one still has to read as filled
export const HEATMAP_MIN_OPACITY = 0.18;
export const BAR_LIST_ROW_GAP = 10;
export const BAR_LIST_LABEL_WIDTH = 220;
export const BAR_LIST_LABEL_WIDTH_MOBILE = 132;
export const BAR_LIST_VALUE_WIDTH = 64;
export const BAR_LIST_VALUE_WIDTH_MOBILE = 52;
export const BAR_LIST_EXTRA_WIDTH = 104;
export const BAR_LIST_EXTRA_WIDTH_MOBILE = 78;
export const BAR_LIST_TRACK_HEIGHT = 22;
export const BAR_LIST_TRACK_RADIUS = 3;
// a stack is one bar per bucket and takes half its slot; two bars side by side need the room between buckets
export const CHART_BAR_CATEGORY_GAP_RATIO_STACKED = 0.48;
export const CHART_BAR_CATEGORY_GAP_RATIO_GROUPED = 0.3;
export const CHART_BAR_GAP_RATIO = 0.1;
// the room a horizontally scrolling row of tabs keeps for the scrollbar under it
export const STATISTICS_TABS_SCROLL_PADDING = 2;
// the action a table row carries: a step under the button row, it sits on a 44px row
export const STATISTICS_ROW_BUTTON_HEIGHT = 30;
export const STATISTICS_ROW_BUTTON_PADDING_X = 12;
export const STATISTICS_ROW_BUTTON_BORDER_OPACITY = 0.2;
export const STATISTICS_ROW_ACTIONS_GAP = 8;

// key indicators: a row of four tiles, two per row on a phone
export const KEY_INDICATOR_GRID_GAP = 12;
export const KEY_INDICATOR_TILE_GAP = 6;
export const KEY_INDICATOR_TILE_PADDING_X = 14;
export const KEY_INDICATOR_TILE_PADDING_Y = 12;
export const KEY_INDICATOR_VALUE_FONT_SIZE = 24;
export const KEY_INDICATOR_COLUMNS = 4;
export const KEY_INDICATOR_COLUMNS_MOBILE = 2;
