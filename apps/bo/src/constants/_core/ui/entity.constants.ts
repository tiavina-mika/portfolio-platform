import { FONT_SIZE_OVERLINE } from '@/constants/_core/ui/ui.constants';

/*
 * PERSON ROW — a party to the record standing on their own row inside a detail block (the driver
 * of a ride, each of its passengers). The face is larger than the one a table cell carries: the
 * row is about that person rather than merely naming them, and it holds a second line of facts
 * under the name plus the way to their account at the far end
 */
export const PERSON_ROW_AVATAR_SIZE = 42;
export const PERSON_ROW_IDENTITY_GAP = 8;
// the facts under the name are read as one sentence, so the middle dot sits close to either side
export const PERSON_ROW_FACTS_GAP = 6;
/*
 * the chip that opens the post picker stands at the end of the posts an account already holds, and
 * carries a single "+" — the glyph is set large enough to read as a control rather than as a label
 */
export const ROLE_ADD_CHIP_FONT_SIZE = 22;
// while an account's posts are read, a couple of chip-shaped placeholders stand where they will sit
export const ROLE_CHIP_SKELETON_WIDTH = 90;
export const ROLE_CHIP_SKELETON_COUNT = 2;
export const PROFILE_MENU_WIDTH = 280;
/*
 * the drop area has two drawings, not one. Empty, it is a field like any other — a solid outline on
 * the card surface, standing on a block of its own rather than on the input row, so the prompt is
 * centred in it instead of sitting against an edge. Once it holds files it becomes the frame around
 * them: a dashed edge on the recessed ground, sized by the thumbnail grid, so the picked images —
 * not the empty space under them — are what the field is made of.
 */
export const DROPZONE_EMPTY_HEIGHT = 150;
export const DROPZONE_PADDING = 20;
export const DROPZONE_PROMPT_GAP = 10;
export const DROPZONE_ICON_SIZE = 28;
export const DROPZONE_THUMBNAILS_PADDING = 12;
export const DROPZONE_THUMBNAILS_GAP = 10;
export const DROPZONE_THUMBNAIL_SIZE = 88;
export const DROPZONE_THUMBNAIL_REMOVE_SIZE = 20;

/*
 * THE TRANSLATION TABS — the language a translated field is shown in is picked from a recessed
 * track with the open slot raised back onto the surface, the same figure as the list tabs: the
 * strip switches the language of one field, it does not navigate anywhere. A slot carries the
 * locale code in mono (the language names are themselves translated, so they move around while
 * "FR"/"EN"/"MG" do not), a dot saying whether that language is translated, and a pin on the
 * default locale; the full language name and the state are spelled out in its tooltip.
 */
export const TRANSLATION_TABS_PADDING = 3;
export const TRANSLATION_TABS_GAP = 2;
export const TRANSLATION_TAB_HEIGHT = 30;
// one step taller on tablet, where the pointer may be a finger; phones take the 44px touch target
export const TRANSLATION_TAB_TABLET_HEIGHT = 34;
export const TRANSLATION_TAB_PADDING_X = 10;
export const TRANSLATION_TAB_LABEL_GAP = 5;
export const TRANSLATION_TAB_CODE_FONT_SIZE = FONT_SIZE_OVERLINE;
export const TRANSLATION_TAB_DOT_SIZE = 6;
export const TRANSLATION_TAB_PIN_ICON_SIZE = 11;
// the raised slot casts a hairline shadow only — it sits a few pixels inside the track
export const TRANSLATION_TAB_SELECTED_SHADOW = '0 1px 2px #0f172a14';
/*
 * the open slot's tone is an ink of the primary rather than the primary itself: the brand teal is
 * too light to hold 13px text on a white slot
 */
export const TRANSLATION_TAB_INK_DARKEN = 0.35;
// the state in the tooltip sits on the dark tooltip ground, so the primary is lifted to stay legible
export const TRANSLATION_TAB_TOOLTIP_STATE_LIGHTEN = 0.45;
export const TRANSLATION_TAB_TOOLTIP_GAP = 6;
export const TRANSLATION_TAB_PANEL_PADDING = 16;

/*
 * REPEATABLE FIELDS — each entry of a list-valued field (the stops of a ride, a set of phone
 * numbers) is a bordered row on the card surface holding its inputs and the control that removes
 * it. The column is capped well under the card width: an entry is one short value, and a delete
 * button parked at the far edge of a wide screen no longer reads as belonging to the row it acts on.
 */
export const FIELDS_ARRAY_MAX_WIDTH = 620;
export const FIELDS_ARRAY_GAP = 10;
export const FIELDS_ARRAY_ROW_PADDING = 12;
export const FIELDS_ARRAY_ROW_GAP = 8;
// the row's own delete slot: a bare glyph on the input row, not a button standing beside the field
export const FIELDS_ARRAY_REMOVE_BUTTON_WIDTH = 34;

/*
 * THE IDENTITY CELL — a person inside a table row: their face, their name, the score qualifying it
 * underneath, and the ways to reach them revealed on hover.
 *
 * The two lines sit tighter than an ordinary two-line cell's: a name and its score are one
 * identity read as a block, where a value and the fact qualifying it are two things that have to
 * stay told apart.
 */
export const IDENTITY_TEXT_GAP = 1;
/*
 * the contact card hanging under the name. It hangs a few pixels left of the avatar so its own
 * padding lands the phone number on the same vertical line as the name above it, rather than
 * lining the card's edge up with the avatar and pushing its content right of everything.
 */
export const IDENTITY_CONTACT_GAP = 7;
export const IDENTITY_CONTACT_PADDING_Y = 11;
export const IDENTITY_CONTACT_PADDING_X = 13;
export const IDENTITY_CONTACT_OFFSET_X = -4;
export const IDENTITY_CONTACT_OFFSET_Y = 7;
export const IDENTITY_CONTACT_ICON_SIZE = 14;
export const IDENTITY_CONTACT_ICON_GAP = 7;

/*
 * THE PROFILE COMPLETENESS BAR — how much of a user's profile is filled in, given as a percentage
 * and drawn as the same percentage. Wider and slightly thicker than the occupancy bar because it
 * carries a label on either end above it rather than one short phrase, and fixed for the same
 * reason: bars of different lengths in one column cannot be compared to one another.
 */
export const PROFILE_COMPLETENESS_BAR_WIDTH = 170;
export const PROFILE_COMPLETENESS_BAR_HEIGHT = 5;
export const PROFILE_COMPLETENESS_BAR_RADIUS = 3;
export const PROFILE_COMPLETENESS_GAP = 4;

/*
 * THE SETTINGS PAGE — a page that holds several unrelated groups of settings is read as a list of
 * sections and one open section, not as a stack of every panel at once: the rail on the left names
 * the sections under the surface they belong to (the back-office itself, the public website) and
 * the column beside it draws only the open one.
 *
 * Inside a panel every setting is one row: what it is on the left, the control that changes it on
 * the right, and a rule between two rows. The label column is fixed so every control in the panel
 * starts on the same edge whatever the label lengths are, and the rows close on the right so a
 * narrow control (a select, a pair of buttons) still lands under the one above it.
 */
export const SETTINGS_RAIL_WIDTH = 250;
export const SETTINGS_RAIL_PADDING = 8;
export const SETTINGS_RAIL_GAP = 2;
export const SETTINGS_RAIL_ITEM_HEIGHT = 40;
export const SETTINGS_RAIL_ITEM_PADDING_X = 10;
export const SETTINGS_RAIL_ITEM_GAP = 10;
export const SETTINGS_RAIL_ICON_SIZE = 16;
/*
 * a group name is the head of the block under it: it sits closer to its own first item than to the
 * last item of the group above, which is what separates the two groups without drawing a rule
 */
export const SETTINGS_RAIL_GROUP_PADDING_X = 10;
export const SETTINGS_RAIL_GROUP_PADDING_TOP = 12;
export const SETTINGS_RAIL_GROUP_PADDING_BOTTOM = 4;

export const SETTINGS_ROW_LABEL_WIDTH = 300;
export const SETTINGS_ROW_GAP = 24;
export const SETTINGS_ROW_PADDING_X = 20;
export const SETTINGS_ROW_PADDING_Y = 16;
export const SETTINGS_ROW_LABEL_GAP = 2;
// a band naming what the panel's rows are scoped to (the language its translated fields are in)
export const SETTINGS_PANEL_BAND_PADDING_Y = 12;
// a select carries one value and stops there — full width it would read as a field of the page
export const SETTINGS_CONTROL_WIDTH = 280;
export const SETTINGS_CONTROLS_GAP = 10;

/*
 * a colour is picked from the tone itself rather than from its name, so the swatch is the tone and
 * the ring around it is what says which one is on — the ring stands off the dot so the picked
 * swatch grows a halo instead of a thicker edge
 */
export const SETTINGS_SWATCH_SIZE = 40;
export const SETTINGS_SWATCH_DOT_SIZE = 30;
export const SETTINGS_SWATCH_BORDER_WIDTH = 2;
export const SETTINGS_SWATCH_ICON_SIZE = 14;

/*
 * the sidebar styles are picked from a drawing of the sidebar, not from a colour chip: each card
 * holds a miniature of the nav — the ground it would take and two bars standing for its items — so
 * the choice is made on what the menu will look like rather than on the name of a shade
 */
export const SETTINGS_SIDEBAR_CARD_MIN_WIDTH = 96;
export const SETTINGS_SIDEBAR_CARD_PADDING = 10;
export const SETTINGS_SIDEBAR_CARD_GAP = 8;
export const SETTINGS_SIDEBAR_PREVIEW_HEIGHT = 44;
export const SETTINGS_SIDEBAR_PREVIEW_PADDING_Y = 8;
export const SETTINGS_SIDEBAR_PREVIEW_PADDING_X = 7;
export const SETTINGS_SIDEBAR_PREVIEW_GAP = 5;
export const SETTINGS_SIDEBAR_PREVIEW_BAR_HEIGHT = 5;
export const SETTINGS_SIDEBAR_PREVIEW_BAR_WIDTH = 22;
export const SETTINGS_SIDEBAR_PREVIEW_BAR_SHORT_WIDTH = 16;
export const SETTINGS_SIDEBAR_PREVIEW_BAR_RADIUS = 2;

// the two mode images are one setting stated twice, so they stand side by side rather than stacked
export const SETTINGS_IMAGES_MIN_COLUMN_WIDTH = 220;
export const SETTINGS_IMAGES_GAP = 12;

/*
 * MY PROFILE — the page reads as what the account holds, not as a form: one column of cards saying
 * what is recorded about the reader and what protects their account, and a narrower column beside
 * it holding who they are — their picture, their name, and the roles granted to them.
 *
 * A field of the details card is a row of three: what it is named, what it currently says, and the
 * pair of actions that appear only while it is being rewritten. The name column is fixed so every
 * value in the card starts on the same edge, and the value itself is the target — clicking it opens
 * the field in place, which is the shortest path to correcting a single word.
 */
export const PROFILE_ASIDE_WIDTH = 340;
/*
 * the two columns stop well before a wide screen's right edge: a row of text stretched over the
 * whole zone is read by moving the head, and the identity column would drift away from the card it
 * belongs to
 */
export const PROFILE_MAX_WIDTH = 1160;
export const PROFILE_FIELD_LABEL_WIDTH = 200;
export const PROFILE_FIELD_GAP = 20;
export const PROFILE_FIELD_PADDING_Y = 13;
export const PROFILE_FIELD_ACTIONS_GAP = 8;
/*
 * the value in its resting state is padded like the input that replaces it and pulled back out by
 * the same amount, so opening the field grows a box around the text instead of moving it
 */
export const PROFILE_FIELD_VALUE_PADDING_Y = 8;
export const PROFILE_FIELD_VALUE_PADDING_X = 10;

/*
 * the identity block is the one place the reader is looked at rather than read: the picture stands
 * alone above the name, with the button that replaces it pinned to its edge
 */
export const PROFILE_IDENTITY_PADDING_Y = 28;
export const PROFILE_IDENTITY_GAP = 14;
export const PROFILE_AVATAR_SIZE = 96;
export const PROFILE_AVATAR_FONT_SIZE = 30;
export const PROFILE_PHOTO_BUTTON_SIZE = 32;
export const PROFILE_PHOTO_BUTTON_ICON_SIZE = 15;

/*
 * a row of the activity card is a fact about the account, read and never edited: the name sits on a
 * fixed column so every value starts on the same edge. The column and the insets tighten on a
 * smaller screen
 */
export const PROFILE_INFO_LABEL_WIDTH = 140;
export const PROFILE_INFO_LABEL_WIDTH_COMPACT = 120;
export const PROFILE_INFO_GAP = 16;
export const PROFILE_INFO_PADDING_Y = 12;
export const PROFILE_INFO_PADDING_X = 20;
export const PROFILE_INFO_PADDING_X_TABLET = 16;
export const PROFILE_INFO_PADDING_X_COMPACT = 12;
// stands in for a fact the account has no record of (no phone, no sign-in tracked yet)
export const PROFILE_INFO_EMPTY_VALUE = '—';

/*
 * a row of the account card names a thing that protects the account and closes on the one action
 * that changes it. Under `md` there is no room for a button beside the sentence explaining it, so
 * the whole row becomes the target and ends on a chevron instead.
 */
export const PROFILE_ACCOUNT_ROW_GAP = 24;
export const PROFILE_ACCOUNT_ROW_MIN_HEIGHT = 56;
export const PROFILE_ACCOUNT_ROW_LABEL_GAP = 10;
export const PROFILE_ACCOUNT_ROW_CHEVRON_SIZE = 18;
// the sentence under a setting's name is a line of prose, not a column of the row: it wraps early
export const PROFILE_ACCOUNT_ROW_DESCRIPTION_MAX_WIDTH = 460;
// the password has no history to state, so the row says what the field holds rather than when
export const PROFILE_PASSWORD_MASK = '••••••••';

/*
 * the backup codes are read off the screen and written down, so they are drawn as a block of even
 * tiles rather than as a list: two columns of monospaced text, each code loose enough to be
 * transcribed character by character without losing the place
 */
export const PROFILE_BACKUP_CODES_COLUMNS = 2;
export const PROFILE_BACKUP_CODES_GAP = 8;
export const PROFILE_BACKUP_CODE_PADDING_Y = 9;
export const PROFILE_BACKUP_CODE_PADDING_X = 12;
export const PROFILE_BACKUP_CODE_LETTER_SPACING = 1;

/*
 * THE VEHICLE PAPERS — the three markers a vehicle row carries for its registration, insurance and
 * technical inspection, and the panel one of them opens.
 *
 * Each marker is a two-or-three letter tile rather than a labelled chip: the cell states which of
 * the three papers is missing, and three full names side by side would be the widest column of the
 * list for a fact read at a glance. They sit tight together so the trio reads as one status, not
 * as three separate values.
 */
export const VEHICLE_DOCUMENT_BADGE_HEIGHT = 20;
export const VEHICLE_DOCUMENT_BADGE_MIN_WIDTH = 30;
export const VEHICLE_DOCUMENT_BADGE_RADIUS = 5;
export const VEHICLE_DOCUMENT_BADGE_FONT_SIZE = FONT_SIZE_OVERLINE;
export const VEHICLE_DOCUMENT_BADGE_GAP = 4;
// the tint a marker takes from its own status, faint enough for the letters to stay the loud part
export const VEHICLE_DOCUMENT_BADGE_BORDER_OPACITY = 0.4;
/*
 * the review panel: the paper on the left at the size a plate number can be read off it, the facts
 * and the two decisions on the right
 */
/*
 * THE DOCUMENT REVIEW PANEL — one of a vehicle's papers opened for a decision. It is built as two
 * panes rather than as a stack: the moderator rules by comparing the dates written beside the scan
 * against the scan itself, and a layout that put one under the other would have them scrolling
 * between the two halves of a single comparison.
 *
 * The paper's pane is recessed and the facts stand on the dialog's own surface, so the picture
 * reads as the thing being examined and the column beside it as what is known about it.
 */
export const VEHICLE_DOCUMENT_REVIEW_GAP = 12;
export const VEHICLE_DOCUMENT_REVIEW_PANE_PADDING = 16;
export const VEHICLE_DOCUMENT_REVIEW_PREVIEW_GAP = 10;
export const VEHICLE_DOCUMENT_REVIEW_PREVIEW_HEIGHT = 240;
export const VEHICLE_DOCUMENT_REVIEW_META_WIDTH = 248;
export const VEHICLE_DOCUMENT_REVIEW_FIELDS_GAP = 9;
export const VEHICLE_DOCUMENT_REVIEW_FIELD_GAP = 2;
export const VEHICLE_DOCUMENT_REVIEW_ACTIONS_GAP = 6;
/*
 * the empty frame is hatched rather than left flat: an empty grey rectangle where a scan should be
 * reads as a picture that failed to load, where the diagonal banding says there is nothing to load
 */
export const VEHICLE_DOCUMENT_REVIEW_HATCH_BAND = 10;
export const VEHICLE_DOCUMENT_REVIEW_EMPTY_GAP = 8;
export const VEHICLE_DOCUMENT_REVIEW_EMPTY_ICON_SIZE = 34;
export const VEHICLE_DOCUMENT_REVIEW_ACTION_ICON_SIZE = 15;
// the state of each paper, carried on its own tab so the queue is read without opening all three
export const VEHICLE_DOCUMENT_REVIEW_TAB_DOT_SIZE = 7;

/*
 * THE DOCKED REVIEW PANEL — the same three-paper review as the dialog above, docked inside the
 * vehicle page's own "Vérification" section instead of a modal, with a thumbnail rail replacing
 * the tab strip and a zoom control replacing rotate — a picture already at the size the moderator
 * chose does not need enlarging into a lightbox.
 */
export const VEHICLE_DOCUMENT_PANEL_GAP = 16;
export const VEHICLE_DOCUMENT_PANEL_THUMB_RAIL_WIDTH = 132;
export const VEHICLE_DOCUMENT_PANEL_THUMB_HEIGHT = 56;
export const VEHICLE_DOCUMENT_PANEL_THUMB_GAP = 12;
export const VEHICLE_DOCUMENT_PANEL_META_WIDTH = 262;
export const VEHICLE_DOCUMENT_PANEL_PREVIEW_HEIGHT = 340;
export const VEHICLE_DOCUMENT_PANEL_HATCH_BAND = 10;
export const VEHICLE_DOCUMENT_PANEL_STATUS_DOT_SIZE = 8;
// the scale a moderator can read a scan at — a plate or a signature is checked well past 100%
export const VEHICLE_DOCUMENT_PANEL_ZOOM_MIN = 50;
export const VEHICLE_DOCUMENT_PANEL_ZOOM_MAX = 200;
export const VEHICLE_DOCUMENT_PANEL_ZOOM_STEP = 25;
export const VEHICLE_DOCUMENT_PANEL_ZOOM_DEFAULT = 100;
export const VEHICLE_DOCUMENT_PANEL_ZOOM_BUTTON_SIZE = 28;
export const VEHICLE_DOCUMENT_PANEL_ZOOM_ICON_SIZE = 15;

/*
 * THE PHOTOS GRID — the pictures a driver uploaded of the vehicle itself (not a document), shown as
 * a responsive grid of thumbnails that open in the shared lightbox.
 */
export const VEHICLE_PHOTO_MIN_WIDTH = 200;
export const VEHICLE_PHOTO_GRID_GAP = 14;
export const VEHICLE_PHOTO_THUMB_HEIGHT = 132;
export const VEHICLE_PHOTO_CAPTION_PADDING = 10;
export const VEHICLE_PHOTO_CAPTION_GAP = 2;
export const VEHICLE_PHOTO_ZOOM_ICON_SIZE = 18;
export const VEHICLE_PHOTO_ZOOM_SCRIM_OPACITY = 0.32;
export const VEHICLE_PHOTO_ZOOM_GLYPH_OPACITY = 0.92;

/*
 * THE CORRECTED EXPIRY — the end of validity is the driver's own reading of the paper, and nothing
 * upstream checks it beyond "not already past". So it is the one fact of the panel the moderator
 * can rewrite, and it is rewritten in place, on the line that states it, with the scan open beside
 * it — not in a form under the decisions, which would read as a setting of the approval rather
 * than as a correction of what was declared.
 */
export const VEHICLE_DOCUMENT_EXPIRY_BLOCK_GAP = 5;
export const VEHICLE_DOCUMENT_EXPIRY_LINE_GAP = 8;
export const VEHICLE_DOCUMENT_EXPIRY_VALUE_GAP = 7;
export const VEHICLE_DOCUMENT_EXPIRY_EDIT_SIZE = 30;
export const VEHICLE_DOCUMENT_EXPIRY_EDIT_GLYPH_SIZE = 15;
export const VEHICLE_DOCUMENT_EXPIRY_HINT_FONT_SIZE = FONT_SIZE_OVERLINE;
/*
 * the badge saying this date is no longer the one the driver typed. It is a word and not just a
 * mark: the line it sits on already carries a date, and a lone glyph next to one would read as
 * decoration of that date rather than as a statement that it was overwritten
 */
export const VEHICLE_DOCUMENT_EXPIRY_TAG_GAP = 4;
export const VEHICLE_DOCUMENT_EXPIRY_TAG_FONT_SIZE = 11;
export const VEHICLE_DOCUMENT_EXPIRY_TAG_GLYPH_SIZE = 11;
export const VEHICLE_DOCUMENT_EXPIRY_TAG_PADDING_Y = 1;
// the glyph leads, so the badge is trimmed a little tighter on that side than after the word
export const VEHICLE_DOCUMENT_EXPIRY_TAG_PADDING_LEFT = 5;
export const VEHICLE_DOCUMENT_EXPIRY_TAG_PADDING_RIGHT = 7;
export const VEHICLE_DOCUMENT_EXPIRY_TAG_RADIUS = 99;
/*
 * the tinted slot deepens under the pointer where the toolbar's own tinted slot darkens its edge
 * instead: this one is a lone square at the end of a line of text, with no neighbours for a change
 * of edge to read against
 */
export const VEHICLE_DOCUMENT_EXPIRY_EDIT_HOVER_OPACITY = 0.15;

/*
 * the sessions block of a user file: the device name sits over a smaller line naming the system
 * and the app version, and the block closes on a band holding the audit note and "sign out all"
 */
export const USER_SESSION_DEVICE_LINE_GAP = 2;
export const USER_SESSION_FOOTER_GAP = 12;
export const USER_SESSION_FOOTER_PADDING_TOP = 12;
export const USER_SESSION_ERROR_GAP = 8;

/*
 * THE USER RECORD HEAD — the member's picture and name, the chips stating what changes how the
 * record is read (verified, suspended, deleted, back-office), and the line of facts under it.
 */
export const USER_PAGE_AVATAR_SIZE = 40;
export const USER_PAGE_TITLE_GAP = 10;
export const USER_PAGE_FACTS_GAP = 14;
// the banner stating why the account is kept out of the platform: one line per active cause
export const USER_SUSPENSION_BANNER_GAP = 4;
// a value read with a qualifier after it ("Female · changed once, on 03/02/2025")
export const USER_DETAIL_VALUE_GAP = 6;
// a ticket's thread unfolded under its row: one bubble per message, stepped in from the row
export const USER_TICKET_THREAD_GAP = 10;
export const USER_TICKET_THREAD_PADDING_Y = 12;
export const USER_TICKET_THREAD_PADDING_X = 16;
export const USER_TICKET_MESSAGE_PADDING = 10;
// the role filter over the rides block
export const USER_RIDES_FILTER_GAP = 12;
