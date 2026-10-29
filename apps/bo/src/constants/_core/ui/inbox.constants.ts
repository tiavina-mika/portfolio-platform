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
 * THE INBOX — the contacts page is not a table of tickets, it is one conversation with the queue
 * beside it and what is known about the person on the other side: three columns read left to
 * right as "which ticket", "what was said", "who is saying it". The two side columns are fixed so
 * the thread — the only column whose content is prose — takes every pixel the screen adds.
 *
 * Nothing here scrolls the page: each column scrolls inside itself, so the composer stays put
 * while the thread above it moves, and the queue stays put while the thread is read.
 */
export const INBOX_QUEUE_WIDTH = 308;
export const INBOX_CONTEXT_WIDTH = 292;
export const INBOX_COLUMN_GAP = 14;
/*
 * the columns are as tall as what is left of the viewport under the page head, not as tall as
 * their contents: a queue of two hundred tickets must not stretch the page, and the thread must
 * end where the composer starts
 */
export const INBOX_MIN_HEIGHT = 560;
export const INBOX_VIEWPORT_OFFSET = 232;

/*
 * a row of the queue states four things at once — who wrote, how urgent it is, when it last moved
 * and what it says — so it is a two-line block rather than a list item, and the open one is marked
 * by a rail on its leading edge instead of by a fill that would fight the status pill it holds
 */
export const INBOX_ITEM_PADDING = 12;
export const INBOX_ITEM_GAP = 5;
export const INBOX_ITEM_RAIL_WIDTH = 3;
export const INBOX_ITEM_HEAD_GAP = 8;
export const INBOX_AVATAR_SIZE = 32;
export const INBOX_AVATAR_FONT_SIZE = FONT_SIZE_OVERLINE;
// the priority of a queued ticket is a dot, not a pill: the row already carries one pill for status
export const INBOX_PRIORITY_DOT_SIZE = 7;

/*
 * where a ticket was written from is a fact of the row, not a status: in the queue it is a glyph
 * beside the name (a globe for the public website, a handset for the app), and only the open
 * ticket's header spells it out as a chip. A second pill per row would compete with the one that
 * says where the ticket stands, which is what the reader is actually scanning for.
 */
export const INBOX_SOURCE_ICON_SIZE = 13;
export const INBOX_SOURCE_CHIP_HEIGHT = 24;
export const INBOX_SOURCE_CHIP_GAP = 5;

/*
 * the banner warning that the reply leaves as a one-way email. It is a note on the ground of the
 * card rather than an alert: nothing has gone wrong, the agent simply has to know the answer they
 * are about to write cannot be answered back before they write it — so it sits directly above the
 * field, not at the top of the page where it would be read once and forgotten.
 */
export const INBOX_ONE_WAY_PADDING_Y = 10;
export const INBOX_ONE_WAY_PADDING_X = 12;
export const INBOX_ONE_WAY_GAP = 8;
export const INBOX_ONE_WAY_ICON_SIZE = 15;

export const INBOX_SEARCH_PADDING = 12;
export const INBOX_SCOPES_PADDING_Y = 8;
export const INBOX_SCOPES_GAP = 2;
export const INBOX_SCOPE_HEIGHT = 28;
export const INBOX_SCOPE_PADDING_X = 10;
export const INBOX_SCOPE_GAP = 5;
export const INBOX_SCOPE_RADIUS = 14;
// the filter button stands beside the search field, the two sharing the band above the scopes
export const INBOX_SEARCH_GAP = 8;

/*
 * the filters open as a panel hanging under the search band, as wide as it: three groups of chips
 * (date added, priority, channel), each a line of choices under its label, closed by a footer that
 * states how many tickets the choices leave. A pick applies at once — the footer button only puts
 * the panel away — so the queue under it is always the answer to what is currently picked.
 */
export const INBOX_FILTERS_OFFSET_Y = 6;
export const INBOX_FILTERS_PADDING = 12;
export const INBOX_FILTERS_GROUP_GAP = 12;
export const INBOX_FILTERS_LABEL_GAP = 6;
export const INBOX_FILTERS_OPTIONS_GAP = 6;
export const INBOX_FILTERS_FOOTER_GAP = 10;
export const INBOX_FILTERS_ACTIONS_GAP = 8;

/*
 * THE THREAD — bubbles on the recessed ground, the agent's own answers closing on the right. A
 * system line is neither side's speech: it is centred and outlined rather than filled, so it reads
 * as something that happened to the ticket rather than as something someone said.
 */
export const INBOX_THREAD_PADDING_Y = 18;
export const INBOX_THREAD_PADDING_X = 16;
export const INBOX_THREAD_GAP = 12;
export const INBOX_BUBBLE_MAX_WIDTH = '74%';
export const INBOX_BUBBLE_PADDING_Y = 11;
export const INBOX_BUBBLE_PADDING_X = 14;
export const INBOX_BUBBLE_RADIUS = 10;
export const INBOX_BUBBLE_META_GAP = 4;
export const INBOX_SYSTEM_BUBBLE_PADDING_Y = 8;
export const INBOX_SYSTEM_BUBBLE_PADDING_X = 12;
export const INBOX_SYSTEM_BUBBLE_RADIUS = 14;
export const INBOX_ATTACHMENT_SIZE = 72;

/*
 * THE COMPOSER — one field with a switch above it, not two forms: replying and noting are the same
 * gesture aimed at two different readers, and the switch is what says which. The note keeps the
 * warning tone of the badge it writes, so the agent can see at a glance that what they are about
 * to send is not going out.
 */
export const INBOX_COMPOSER_PADDING_Y = 12;
export const INBOX_COMPOSER_PADDING_X = 16;
export const INBOX_COMPOSER_GAP = 10;
export const INBOX_COMPOSER_MIN_HEIGHT = 46;
export const INBOX_COMPOSER_ROWS = 2;
export const INBOX_QUICK_REPLY_GAP = 6;
export const INBOX_QUICK_REPLY_HEIGHT = 26;
export const INBOX_QUICK_REPLY_PADDING_X = 9;
export const INBOX_QUICK_REPLY_RADIUS = 13;

/*
 * THE CONTEXT COLUMN — three small cards saying who this is, what they have already asked, and who
 * owes them an answer. Each is a block title over a key/value list, closed by a rule per row: the
 * figures are read down the right edge, so they line up whatever the labels say.
 */
export const INBOX_CONTEXT_GAP = 12;
export const INBOX_CONTEXT_CARD_PADDING = 14;
export const INBOX_CONTEXT_TITLE_GAP = 10;
export const INBOX_CONTEXT_ROW_PADDING_Y = 7;
export const INBOX_CONTEXT_ROW_GAP = 10;

/*
 * THE SOS BLOCK — an alert is not one more card of the context column, it is what the agent acts
 * on first: a red-outlined card at the head of the column on a wide screen, and a band pinned
 * under the thread header below it, folded to one line so the thread stays readable. Its two
 * actions — the map and the call — are 44px targets: they are reached for under pressure, often
 * on a tablet held in one hand.
 */
export const INBOX_SOS_BADGE_HEIGHT = 20;
export const INBOX_SOS_BADGE_PADDING_X = 7;
export const INBOX_SOS_CHIP_HEIGHT = 24;
export const INBOX_SOS_CHIP_PADDING_X = 9;
export const INBOX_SOS_BADGE_LETTER_SPACING = '.5px';
export const INBOX_SOS_HEAD_PADDING_Y = 12;
export const INBOX_SOS_HEAD_PADDING_X = 14;
export const INBOX_SOS_HEAD_GAP = 8;
export const INBOX_SOS_META_GAP = 4;
export const INBOX_SOS_SECTION_PADDING_Y = 10;
export const INBOX_SOS_LABEL_GAP = 6;
export const INBOX_SOS_ROW_PADDING_Y = 6;
export const INBOX_SOS_ROW_GAP = 10;
export const INBOX_SOS_LABEL_LETTER_SPACING = '.3px';
export const INBOX_SOS_PLATE_LETTER_SPACING = '.4px';
export const INBOX_SOS_ACTION_HEIGHT = 44;
export const INBOX_SOS_ACTION_PADDING_X = 12;
export const INBOX_SOS_ACTION_GAP = 8;
export const INBOX_SOS_ACTION_ICON_SIZE = 16;
// the map link darkens its tint on hover rather than changing colour — it stays the same action
export const INBOX_SOS_ACTION_HOVER_OPACITY = 0.15;
// the call is pressed, not clicked through: it dims a touch instead of taking an underline
export const INBOX_SOS_CALL_HOVER_BRIGHTNESS = 0.97;
export const INBOX_SOS_BAR_HEIGHT = 52;
export const INBOX_SOS_BAR_PADDING_Y = 8;
export const INBOX_SOS_BAR_PADDING_X = 12;
export const INBOX_SOS_BAR_BODY_PADDING_Y = 10;
export const INBOX_SOS_BAR_CHEVRON_SIZE = 18;

/*
 * who wrote the ticket is read from the thread header rather than from a card of the context
 * column: the name in the header opens it as a panel hung under it, so the column keeps the two
 * things an agent works from (previous tickets, handling) and the thread gains the width
 */
export const INBOX_REQUESTER_POPOVER_WIDTH = 340;
export const INBOX_REQUESTER_POPOVER_OFFSET_Y = 6;
export const INBOX_REQUESTER_POPOVER_PADDING_X = 14;
export const INBOX_REQUESTER_POPOVER_PADDING_Y = 12;
// the name is a button without looking like one: a light rule under it says it opens something
export const INBOX_REQUESTER_TRIGGER_PADDING_Y = 5;
export const INBOX_REQUESTER_TRIGGER_PADDING_X = 7;
export const INBOX_REQUESTER_TRIGGER_UNDERLINE_OFFSET = 3;
export const INBOX_REQUESTER_TRIGGER_UNDERLINE_OPACITY = 0.4;

/*
 * THE REPORT FILE — the dialog one report is read and ruled on in. Its body is not a form of
 * labelled fields but a quoted block: what was reported, why, in the reporter's own words and
 * signed with their name, drawn on the recessed ground inside its own edge so the complaint reads
 * as the thing being judged rather than as the dialog's own copy.
 *
 * The other reports the same target has drawn repeat that block one step tighter and one step
 * quieter — they are context for the decision, not the case being decided.
 */
export const REPORT_FILE_CARD_PADDING = 14;
// chips standing side by side name one thing between them — the reason and what was done about it
export const REPORT_FILE_CHIP_GAP = 6;
export const REPORT_FILE_CARD_GAP = 10;
export const REPORT_FILE_HISTORY_GAP = 8;
export const REPORT_FILE_HISTORY_PADDING_Y = 10;
export const REPORT_FILE_HISTORY_PADDING_X = 12;
export const REPORT_FILE_HISTORY_LINE_GAP = 5;
/*
 * the decision row: the two ways out of a report share the footer evenly, since neither is the
 * expected one — a report is closed by ruling on it, not by confirming a default
 */
export const REPORT_FILE_ACTIONS_GAP = 8;

/*
 * THE REPORT FILE AS A SIDE SHEET — the same file, read where the queue is, so that working through
 * it never leaves the list. It is a column rather than a dialog because the operator moves from one
 * report to the next, and the list they are working through has to stay in view behind it.
 *
 * The header carries the way through the queue (previous, position, next) at touch size: it is the
 * control used most, so it is the one that must not be missed on a tablet.
 */
export const REPORT_FILE_DRAWER_WIDTH = 480;
export const REPORT_FILE_DRAWER_PADDING_X = 18;
export const REPORT_FILE_DRAWER_HEADER_PADDING_Y = 12;
export const REPORT_FILE_DRAWER_HEADER_PADDING_RIGHT = 9;
export const REPORT_FILE_DRAWER_BODY_PADDING_Y = 16;
export const REPORT_FILE_DRAWER_SECTION_GAP = 18;
export const REPORT_FILE_DRAWER_FOOTER_PADDING_Y = 14;
export const REPORT_FILE_NAV_BUTTON_SIZE = 44;
export const REPORT_FILE_NAV_ICON_SIZE = 16;

/*
 * THE REPORT PAGE — the same file given a page of its own, for the cases the side sheet is too
 * narrow for: a long history, or a case being worked on for a while. The complaint and its history
 * take the wide column, what the decision turns on (the target and the ruling) the narrow one that
 * stays at a readable width whatever the screen.
 */
export const REPORT_PAGE_SIDE_COLUMN_WIDTH = 400;
export const REPORT_PAGE_GAP = 20;
export const REPORT_PAGE_CARD_BODY_GAP = 12;
export const REPORT_PAGE_RESOLUTION_ROWS = 5;
export const REPORT_FILE_RESOLUTION_ROWS = 3;

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

/*
 * the cards a sender and a recipient list open into. Wide enough for a full name and the state
 * beside it on one line — a name that wraps turns a two-line card into a four-line one.
 */
export const NOTIFICATION_SENDER_CARD_WIDTH = 264;
export const NOTIFICATION_RECIPIENTS_CARD_WIDTH = 300;
export const NOTIFICATION_CARD_ROW_PADDING_Y = 8;
export const NOTIFICATION_CARD_ROW_GAP = 10;
/* the panel a failed cell opens, wide enough to explain the refusal before offering to retry it */
export const NOTIFICATION_RETRY_POPOVER_WIDTH = 250;
export const NOTIFICATION_RETRY_POPOVER_GAP = 8;

/* the day-by-day list of the fallback SMS card scrolls inside itself past a month of rows, never the page */
export const NOTIFICATION_SMS_DAYS_LIST_MAX_HEIGHT = 320;

/*
 * THE RATING FILE — the side sheet a review is read and ruled on in. Same family as the report
 * file, but it is a stack of bordered sections rather than a card and a history: the text, the
 * answer, the two people, the complaints and the notes each get their own band, so the one the
 * decision turns on is found by its heading rather than by scrolling a single column.
 */
export const RATING_FILE_SECTION_PADDING_X = 20;
export const RATING_FILE_SECTION_PADDING_Y = 16;
export const RATING_FILE_SECTION_GAP = 8;
export const RATING_FILE_HEAD_PADDING_TOP = 18;
// the review's own words are the thing being judged, so they are set a step larger than the body
export const RATING_FILE_QUOTE_FONT_SIZE = 16;
export const RATING_FILE_QUOTE_LINE_HEIGHT = 1.6;
export const RATING_FILE_META_LINE_GAP = 2;
export const RATING_FILE_PEOPLE_PADDING_Y = 4;
export const RATING_FILE_PERSON_ROW_GAP = 12;
export const RATING_FILE_PERSON_ROW_PADDING_Y = 10;
export const RATING_FILE_PERSON_LABEL_WIDTH = 40;
export const RATING_FILE_AVATAR_SIZE = 32;
export const RATING_FILE_NOTE_EDGE_WIDTH = 2;
export const RATING_FILE_NOTE_PADDING_LEFT = 10;
export const RATING_FILE_NOTE_ROWS = 2;
export const RATING_FILE_STARS_SIZE = 'medium';
export const RATING_FILE_FOOTER_PADDING_Y = 12;
export const RATING_FILE_FOOTER_GAP = 8;
export const RATING_FILE_ALERT_MARGIN_BOTTOM = 12;
export const RATING_FILE_REPLY_GAP = 10;
