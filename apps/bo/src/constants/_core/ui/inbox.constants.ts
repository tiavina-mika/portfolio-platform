import { FONT_SIZE_META, FONT_SIZE_OVERLINE } from '@/constants/_core/ui/ui.constants';

/*
 * THE HISTORY TIMELINE — what happened to a record, newest first, on a rail of dots. It is a
 * timeline rather than a table because the reader is looking for one event and its date, not
 * comparing three columns across rows; the rail is what lets the eye run down the dates without
 * reading a single label. The rail stops at the first and the last dot — a line running past the
 * oldest event would say the history continues below it. Each dot is punched out of the rail by a
 * ring of the card's own surface, so the line passes behind the events instead of through them.
 */
export const HISTORY_RAIL_INSET = 24;
export const HISTORY_EVENT_GAP = 18;
export const HISTORY_DOT_SIZE = 11;
export const HISTORY_DOT_RING = 2;
export const HISTORY_HEAD_GAP = 10;
export const HISTORY_AUTHOR_GAP = 8;
export const HISTORY_AUTHOR_OFFSET = 4;
export const HISTORY_AUTHOR_AVATAR_SIZE = 20;
/*
 * the initials inside that disc. It is the one figure in the interface allowed under the 12px
 * floor: the floor protects labels, and this is a glyph filling a mark rather than a word being
 * read — at the scale's own smallest step two letters would not fit inside the circle at all
 */
export const HISTORY_AUTHOR_INITIALS_FONT_SIZE = 9;
export const NOTIFICATION_MENU_WIDTH = 300;

/*
 * THE CONTACTS PAGE — a list of the received messages beside the one being read: two columns read
 * left to right as "which message", "what it says". The list column is fixed so the message takes
 * every pixel the screen adds.
 *
 * Nothing here scrolls the page: each column scrolls inside itself.
 */
export const INBOX_QUEUE_WIDTH = 308;
export const INBOX_COLUMN_GAP = 14;
/*
 * the columns are as tall as what is left of the viewport under the page head, not as tall as
 * their contents: a list of two hundred messages must not stretch the page
 */
export const INBOX_MIN_HEIGHT = 560;
export const INBOX_VIEWPORT_OFFSET = 232;

// a row of the list is a two-line block, the open one being marked by a rail on its leading edge
export const INBOX_ITEM_PADDING = 12;
export const INBOX_ITEM_GAP = 5;
export const INBOX_ITEM_RAIL_WIDTH = 3;
export const INBOX_ITEM_HEAD_GAP = 8;
export const INBOX_AVATAR_SIZE = 32;
export const INBOX_AVATAR_FONT_SIZE = FONT_SIZE_OVERLINE;

export const INBOX_SEARCH_PADDING = 12;
export const INBOX_SCOPES_PADDING_Y = 8;
export const INBOX_SCOPES_GAP = 2;
export const INBOX_SCOPE_HEIGHT = 28;
export const INBOX_SCOPE_PADDING_X = 10;
export const INBOX_SCOPE_GAP = 5;
export const INBOX_SCOPE_RADIUS = 14;

// the message being read
export const INBOX_THREAD_PADDING_Y = 18;
export const INBOX_THREAD_PADDING_X = 16;

// the facts under the message, each a row closed by a rule
export const INBOX_CONTEXT_CARD_PADDING = 14;
export const INBOX_CONTEXT_TITLE_GAP = 10;
export const INBOX_CONTEXT_ROW_PADDING_Y = 7;
export const INBOX_CONTEXT_ROW_GAP = 10;

/*
 * NOTIFICATION DELIVERY — a send's channels shown as one tinted slot per channel, each carrying a
 * corner mark for what happened on it. A slot rather than a chip per channel: three chips side by
 * side would be the widest column in the table for a fact that is read as a glance, and the glyph
 * says which channel it is without a word being spent on it down every row.
 */
export const NOTIFICATION_CHANNEL_PILL_SIZE = 32;
export const NOTIFICATION_CHANNEL_PILL_GAP = 14;
export const NOTIFICATION_CHANNEL_GLYPH_SIZE = 18;
/*
 * the outcome, pinned to the bottom-right corner of the slot — it qualifies the channel it sits
 * on, so it overlaps it rather than following it
 */
export const NOTIFICATION_CHANNEL_BADGE_SIZE = 15;
export const NOTIFICATION_CHANNEL_BADGE_OFFSET = -4;
export const NOTIFICATION_CHANNEL_BADGE_GLYPH_SIZE = 9;
/*
 * how many recipients a channel was rejected for, pinned to the opposite corner: a count is a
 * different kind of statement from an outcome, and the two must not be mistaken for one another
 */
export const NOTIFICATION_CHANNEL_FAIL_BADGE_SIZE = 18;
export const NOTIFICATION_CHANNEL_FAIL_BADGE_OFFSET = -7;
export const NOTIFICATION_CHANNEL_FAIL_BADGE_PADDING_X = 4;
export const NOTIFICATION_CHANNEL_FAIL_BADGE_RADIUS = 9;

/*
 * THE DELIVERY GRID — recipients down, channels across. Every column is the same fixed width so a
 * channel can be read straight down the grid; a column sized by its contents would drift row by
 * row and stop lining up with its heading.
 */
export const NOTIFICATION_DELIVERY_COLUMN_WIDTH = 84;
export const NOTIFICATION_DELIVERY_CELL_SIZE = 28;
export const NOTIFICATION_DELIVERY_CELL_GLYPH_SIZE = 14;
/*
 * the key under the grid: one slot per outcome followed by its name, set on the secondary surface
 * so it reads as a footnote to the table rather than as another row
 */
export const NOTIFICATION_DELIVERY_LEGEND_GAP = 16;
export const NOTIFICATION_DELIVERY_LEGEND_ITEM_GAP = 7;
export const NOTIFICATION_DELIVERY_LEGEND_PADDING_Y = 12;
export const NOTIFICATION_DELIVERY_LEGEND_PADDING_X = 16;
/* a channel's slot and its name, side by side in the first column of the per-channel table */
export const NOTIFICATION_CHANNEL_LABEL_GAP = 10;
/* what stands on a section header of a send's page: the read count, the refusals, the retry */
export const NOTIFICATION_SECTION_ACTIONS_GAP = 10;

/*
 * the stack of faces standing for a send's recipients. They overlap so that the stack says "these
 * people" as one object rather than reading as a row of separate cells, and each face carries a
 * ring in the surface colour so the one behind it stays legible where they meet.
 */
export const NOTIFICATION_RECIPIENT_AVATAR_SIZE = 26;
export const NOTIFICATION_RECIPIENT_AVATAR_OVERLAP = -8;
export const NOTIFICATION_RECIPIENT_AVATAR_RING = 2;
export const NOTIFICATION_RECIPIENT_AVATAR_FONT_SIZE = 11;
/*
 * the name standing beside the stack, and the count standing beside it when there is more than one
 * of them. It is what qualifies the faces rather than a value of its own, so it sits a step under
 * the row's own text — the same step a table's secondary line takes everywhere else.
 */
export const NOTIFICATION_RECIPIENT_LABEL_FONT_SIZE = FONT_SIZE_META;

/*
 * THE MESSAGE CELL — what the recipient read, with the raw status code set under it.
 *
 * The two lines are led tighter than running text: at the leading MUI gives a subtitle, a sentence
 * and the code qualifying it stand far enough apart to read as two separate cells rather than as
 * one. The code is set smaller still — it is quoted into a bug report, not read down the column.
 */
export const NOTIFICATION_MESSAGE_LINE_GAP = 2;
export const NOTIFICATION_MESSAGE_LINE_HEIGHT = 1.35;
export const NOTIFICATION_MESSAGE_CODE_FONT_SIZE = 11;
export const NOTIFICATION_MESSAGE_CODE_LETTER_SPACING = 0.2;

export const NOTIFICATION_RECIPIENTS_CARD_WIDTH = 300;
export const NOTIFICATION_CARD_ROW_GAP = 10;
/* the panel a failed cell opens, wide enough to explain the refusal before offering to retry it */
export const NOTIFICATION_RETRY_POPOVER_WIDTH = 250;
export const NOTIFICATION_RETRY_POPOVER_GAP = 8;

/* the day-by-day list of the fallback SMS card scrolls inside itself past a month of rows, never the page */
export const NOTIFICATION_SMS_DAYS_LIST_MAX_HEIGHT = 320;
