
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
export const DASHBOARD_CARDS_GAP = 16;
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
