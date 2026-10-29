import { CARD_ICON_SLOT_SIZE, CARD_PADDING_X } from '@/constants/_core/ui/page.constants';
import { RESPONSIVE_BREAKPOINT } from '@/constants/_core/ui/ui.constants';

/*
 * THE BROADCAST PAGE — the form on the left (who it goes to, what it says), the preview on a rail
 * to its right, and the announcements already sent under both. Below the responsive breakpoint the
 * rail is dropped under the form instead of beside it, so the operator reads the preview after
 * writing, as on a phone.
 */
// the form's id: its send button sits in the message card, so the form's own footer is switched off
export const BROADCAST_FORM_ID = 'broadcast-form';
export const BROADCAST_BREAKPOINT = RESPONSIVE_BREAKPOINT;
export const BROADCAST_SIDE_WIDTH = 360;
// the recipients form is a narrow column inside a wide card: a city field has no use for the width
export const BROADCAST_FIELDS_MAX_WIDTH = 520;
export const BROADCAST_FIELDS_GAP = 16;
// the check button, then the figure it produced, on one row that wraps on a narrow screen
export const BROADCAST_AUDIENCE_GAP = 12;
export const BROADCAST_MESSAGE_ROWS = 5;
/*
 * the message as a member will read it: the tinted glyph slot on the card's own scale, then the
 * title over the body. Set on the recessed ground so it reads as a quoted thing, not a second card
 */
export const BROADCAST_PREVIEW_PADDING = 14;
export const BROADCAST_PREVIEW_GAP = 12;
export const BROADCAST_PREVIEW_ICON_SLOT_SIZE = CARD_ICON_SLOT_SIZE;
export const BROADCAST_PREVIEW_ICON_SIZE = 20;
export const BROADCAST_PREVIEW_BODY_GAP = 2;
/*
 * the rows of the history: a title over who sent it and when, the audience closing the row on its
 * right. They wrap under one another on a narrow screen rather than squeezing the title
 */
export const BROADCAST_HISTORY_ROW_PADDING_Y = 12;
export const BROADCAST_HISTORY_ROW_PADDING_X = CARD_PADDING_X;
export const BROADCAST_HISTORY_ROW_GAP = 8;
export const BROADCAST_HISTORY_TEXT_GAP = 2;
export const BROADCAST_HISTORY_AUDIENCE_GAP = 8;
export const BROADCAST_HISTORY_SKELETON_ROWS = 3;
export const BROADCAST_HISTORY_SKELETON_TITLE_WIDTH = 240;
export const BROADCAST_HISTORY_SKELETON_META_WIDTH = 160;
