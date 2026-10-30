/*
 * THE TYPE SCALE — six sizes carry the whole back-office, and nothing outside this block may name
 * a font size of its own. The scale is expressed as multiples of one base unit (1u = 14px), so a
 * single value rescales every size in the interface at once; the pixel value each rung resolves to
 * is written next to it.
 *
 * Below the body rung, hierarchy comes from weight and tone — never from a smaller step: two sizes
 * a pixel apart read as an accident rather than as a level, which is what the 10-to-15px spread
 * this scale replaces actually looked like.
 *
 * 12px is the floor. No label in the interface drops under it, whatever it is naming.
 *
 *   1.429u  20  600  text        h2         page title
 *   1.286u  18  600  text        h3         screen title (the h1 of a list)
 *   1.143u  16  600  text        h5         card and dialog title
 *   1u      14  600  text        h6         block title, section header
 *   1u      14  500  text        subtitle1  strong label, button, primary table cell
 *   1u      14  400  text        body1      body copy, value, field content
 *   1u      14  400  secondary   body2      secondary cell, subtitle, description
 *   0.929u  13  400  secondary   caption    field label, meta, helper text, timestamp
 *   0.857u  12  600  secondary   overline   pretitle, table head, sidebar group  (+.4px, caps)
 */
/**
 * The blue Google paints a search-result title. Used by the SEO preview, which is a mock-up of a
 * result page and is only useful as long as it looks like the page it imitates — the one colour in
 * the back-office that must not follow the back-office palette.
 */
export const GOOGLE_RESULT_LINK_COLOR = '#1a0dab';
/** The green Google prints the address of a result in, above its title. Same reasoning. */
export const GOOGLE_RESULT_URL_COLOR = '#3C7A3C';

export const FONT_SIZE_PAGE_TITLE = 20;
export const FONT_SIZE_SCREEN_TITLE = 18;
export const FONT_SIZE_CARD_TITLE = 16;
export const FONT_SIZE_BODY = 14;
export const FONT_SIZE_META = 13;
export const FONT_SIZE_OVERLINE = 12;

export const LAYOUT_CONTENT_PADDING = 24;
export const SPACING = 16;
export const RESPONSIVE_BREAKPOINT = 'lg';
// below this breakpoint the app bar switches to its compact layout (icon-only search, logo instead of breadcrumb group)
export const APPBAR_COMPACT_BREAKPOINT = 'xl';

/*
 * THE CONTENT ZONE — everything right of the sidebar and under the app bar is one column: the page
 * head, whatever the page stacks under it, and the footer closing it. The bands inside it are
 * spaced by the column's own gap rather than by margins each one carries, so a page that drops a
 * band does not leave a hole where it was. The bottom inset is deeper than the top one — the last
 * card of a page must not sit flush against the end of the scroll.
 */
export const CONTENT_PADDING_X = 28;
export const CONTENT_PADDING_TOP = 24;
export const CONTENT_PADDING_BOTTOM = 32;
export const CONTENT_GAP = 18;
/*
 * under `md` the cards inside the zone lose their own radius and run edge to edge, so the zone
 * keeps only enough inset to clear the viewport edge
 */
export const CONTENT_PADDING_X_MOBILE = 12;

/*
 * THE PAGE HEAD — the group the page belongs to, its name, the sentence saying what it holds, and
 * the actions that act on the page as a whole. The actions are pushed down onto the title's own
 * row instead of aligning to the top of the block: the pretitle above the title is a label of the
 * heading, not a line the buttons should be levelled with.
 */
export const PAGE_HEAD_GAP = 16;
export const PAGE_HEAD_PRETITLE_GAP = 2;
export const PAGE_HEAD_DESCRIPTION_GAP = 4;
/*
 * a detail page states, next to the name of what it is about, the one status that changes what
 * every block under it means. The badge stands on the title's own line rather than under it, so
 * the heading is one row of type and marks
 */
export const PAGE_HEAD_TITLE_GAP = 10;
/*
 * a glyph standing next to the title is a mark on the heading, not a control: it sits at the
 * caption size rather than at the title's own
 */
export const PAGE_HEAD_TITLE_BADGE_SIZE = 16;
export const PAGE_HEAD_ACTIONS_GAP = 8;
export const PAGE_HEAD_ACTIONS_OFFSET = 14;
// stacked under the title, the row only needs air between two blocks, not the title's own offset
export const PAGE_HEAD_ACTIONS_MOBILE_OFFSET = 10;
export const PAGE_HEAD_ACTION_ICON_SIZE = 15;
/*
 * width the placeholder of a page-head action takes while its figure is still loading — wide
 * enough that the button does not jump sideways once the number lands next to its label
 */
export const PAGE_HEAD_ACTION_SKELETON_WIDTH = 200;
/*
 * the line of figures a detail page states under its title — what the record is worth, how long it
 * has been going on. They are read as one sentence, so the middle dot between two of them sits
 * closer to either side than the facts stand from one another
 */
export const PAGE_HEAD_META_GAP = 10;

/*
 * THE PAGE FOOTER — the line closing the content column, standing on the same rail the app bar
 * draws at the other end of the page. It holds what is true of the whole back-office rather than
 * of the page in front of the reader, so it is the quietest text on screen.
 */
export const PAGE_FOOTER_PADDING_Y = 16;
export const PAGE_FOOTER_GAP = 16;

/*
 * THE PREVIEW PAGE — a detail page is one column of cards under the page head, with a summary
 * standing to its left naming what the page holds. The summary is the pill track turned upright,
 * and only the entry it marks is rendered: a detail page carries more blocks than fit on a screen,
 * and scrolling past five of them to reach the sixth is exactly what the summary replaces. The
 * column that holds the marked section is what the two-column grid this replaces used to split
 * between a wide left side and a narrow right one — a card pushed into that right rail was read as
 * secondary because of where it landed rather than because it was, and it lost half the row while
 * the section next to it kept scrolling.
 *
 * From a tablet down the summary is dropped and every section is stacked instead: the rail is a
 * fixed 200px whatever the screen, so it eats a third of a tablet's row, and the entries it names
 * are already a thumb's scroll apart there. It leaves at the same width the rest of the
 * back-office stops laying itself out as a desktop — a page that keeps a desktop rail while the
 * sidebar next to it has already collapsed reads as two different layouts on one screen.
 */
export const PREVIEW_SUMMARY_BREAKPOINT = RESPONSIVE_BREAKPOINT;
export const PREVIEW_SUMMARY_WIDTH = 200;
// the gap between the summary and the column it marks — wider than the gap inside either of them
export const PREVIEW_SUMMARY_GAP = 20;
export const PREVIEW_SUMMARY_PADDING = 8;
export const PREVIEW_SUMMARY_ITEM_GAP = 2;
export const PREVIEW_SUMMARY_ITEM_PADDING_Y = 9;
export const PREVIEW_SUMMARY_ITEM_PADDING_X = 10;
export const PREVIEW_SECTIONS_GAP = 16;
// the hint glyph belongs to the last word of the block title, not to the header row it stands on
export const PREVIEW_SECTION_TITLE_GAP = 4;
// the figure trailing a block's name, saying how many rows it holds before the block is opened
export const PREVIEW_SECTION_COUNT_GAP = 6;
/*
 * THE LAYOUT SWITCH — the pair of glyphs choosing whether the page keeps its summary rail or
 * stacks every block instead. It is the pill track at its smallest: two square slots on a recessed
 * ground, the marked one raised back onto the card surface, which is the same three signals the
 * summary underneath it already uses to say which of its entries is open.
 *
 * It carries no label. Its two glyphs are diagrams of the layouts themselves, and any word for
 * either layout names the setting far less directly than the picture of a page split one way or
 * the other does — the tooltip is there for the reader who wants the word anyway.
 */
export const PREVIEW_LAYOUT_TRACK_PADDING = 3;
export const PREVIEW_LAYOUT_TRACK_GAP = 2;
export const PREVIEW_LAYOUT_BUTTON_SIZE = 30;
export const PREVIEW_LAYOUT_ICON_SIZE = 16;
// the band the switch stands on, over the row it acts upon
export const PREVIEW_TOOLBAR_GAP = 12;
/*
 * THE FIELD LIST — the key/value block a detail page states an entity through. Each field is one
 * row: the name on the left in the secondary tone, the value on the right at twice its width and
 * one weight up, so a column of values reads down the block without the labels competing with it.
 * A light filet closes every row but the last — the rows are a list of separate facts, not a
 * paragraph, and at this density the eye needs the rule to keep a value on its own label's line.
 * The label column has a floor of its own so short names do not let their value drift left of the
 * value above it.
 */
export const FIELD_ROW_PADDING_Y = 11;
export const FIELD_ROW_GAP = 16;
export const FIELD_LABEL_MIN_WIDTH = 120;

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
/*
 * THE PICTURES OF A RECORD — one block of a detail page holding every image the record carries,
 * split into the parts each one plays: the single illustrations filling a named field, the gallery
 * under them, and the files its editor pulled into the content.
 *
 * The illustrations are shown at a size that says what the picture is without turning the block
 * into a gallery; the two groups under them drop to thumbnails, because those come in rows of
 * unknown length and are being listed rather than looked at. Every picture sits in a frame of a
 * fixed size and is cropped into it: a row of images left at their own ratios shares no edge, and
 * reads as a pile rather than as a set.
 *
 * None of these sizes is large enough to actually read a picture at, so every frame opens the
 * viewer — which is what the block is for once the reader has found the image they wanted.
 */
export const PREVIEW_IMAGE_WIDTH = 300;
export const PREVIEW_IMAGE_HEIGHT = 170;
// under this the two illustration frames stop standing side by side and take the width one by one
export const PREVIEW_IMAGE_MIN_WIDTH = 240;
export const PREVIEW_IMAGE_GAP = 18;
export const PREVIEW_IMAGE_GROUP_GAP = 20;
export const PREVIEW_IMAGE_LABEL_GAP = 8;
export const PREVIEW_THUMBNAIL_WIDTH = 150;
export const PREVIEW_THUMBNAIL_HEIGHT = 100;
export const PREVIEW_THUMBNAILS_GAP = 10;
/*
 * a file dropped into the editor is listed smaller still, and carries the language it was uploaded
 * for under it — it is a reference of what the content pulled in, not an illustration of the record
 */
export const PREVIEW_EDITOR_FILE_WIDTH = 120;
export const PREVIEW_EDITOR_FILE_HEIGHT = 80;
export const PREVIEW_EDITOR_FILE_GAP = 6;
/*
 * the disc carrying the magnifier over a hovered frame. It is sized against the frame it covers:
 * the disc that reads as a control on the illustration would take a quarter of an editor file.
 */
export const PREVIEW_IMAGE_ZOOM_DISC_SIZE = 36;
export const PREVIEW_THUMBNAIL_ZOOM_DISC_SIZE = 32;
export const PREVIEW_EDITOR_FILE_ZOOM_DISC_SIZE = 30;
// the glyph fills half its disc, whichever of the three sizes the disc is at
export const PREVIEW_IMAGE_ZOOM_ICON_RATIO = 0.5;
/*
 * The veil a hovered frame is dimmed under, and the ground the viewer opens on. Both keep this
 * dark navy in either theme, and it is deliberate: they cover a photograph rather than a surface
 * of the interface, and a pale veil over a pale photo leaves the white disc on top of it
 * unreadable — the one place in the back-office where the palette does not follow the mode.
 */
export const PREVIEW_IMAGE_VEIL_COLOR = '#1E2633';
export const PREVIEW_IMAGE_VEIL_OPACITY = 0.32;
export const LIGHTBOX_GROUND_COLOR = '#0D131C';
export const LIGHTBOX_GROUND_OPACITY = 0.94;
/*
 * THE PICTURE VIEWER — one image filling the screen, the name of the field it came from above it,
 * and the way through to the ones beside it. Its controls are white glass rather than the ordinary
 * buttons of the interface: they stand on the dark ground and, at the edges, over the picture
 * itself, so they are drawn as the two tones that survive any photograph behind them.
 */
export const LIGHTBOX_PADDING_X = 20;
export const LIGHTBOX_HEADER_PADDING_Y = 14;
export const LIGHTBOX_HEADER_GAP = 16;
export const LIGHTBOX_ACTIONS_GAP = 8;
export const LIGHTBOX_CONTROL_SIZE = 44;
export const LIGHTBOX_CONTROL_OPACITY = 0.12;
export const LIGHTBOX_CONTROL_HOVER_OPACITY = 0.2;
export const LIGHTBOX_CONTROL_BORDER_OPACITY = 0.24;
export const LIGHTBOX_MUTED_OPACITY = 0.65;
export const LIGHTBOX_FRAME_BORDER_OPACITY = 0.18;
export const LIGHTBOX_STAGE_GAP = 14;
export const LIGHTBOX_STAGE_PADDING_BOTTOM = 8;
// the picture stops growing here rather than filling a tall screen edge to edge
export const LIGHTBOX_IMAGE_MAX_HEIGHT = 640;
export const LIGHTBOX_COUNTER_PADDING_BOTTOM = 16;
export const LIGHTBOX_ICON_SIZE = 18;
export const LIGHTBOX_ACTION_ICON_SIZE = 15;
export const LIGHTBOX_CLOSE_ICON_SIZE = 16;
/*
 * the vehicle line under the driver of a ride: a colour swatch, then the plate, year and seat
 * count as one sentence. It is a second fact about the same person, so it stands further from the
 * identity above it than the words inside it stand from one another
 */
export const RIDE_VEHICLE_LINE_GAP = 18;
export const RIDE_VEHICLE_COLOR_DOT_SIZE = 14;
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
// the two figures a driver wallet opens on: what it owes, and whether it can still pay out
export const WALLET_STAT_CARDS_COUNT = 2;
/*
 * a label and its value standing on one row inside a dialog, splitting the width in two under `sm`
 * and stacking below it
 */
export const PREVIEW_LABEL_VALUE_SPACING = 2;
export const COLORS = {
  authBackground: '#000',
  authTextFieldPlaceholder: '#fff',
};
export const SIDEBAR_WIDTH = 252;
export const SIDEBAR_RAIL_WIDTH = 64;
export const TOOLBAR_HEIGHT = 64;
export const TOOLBAR_SMALL_SCREEN_HEIGHT = 56;
export const TOOLBAR_HORIZONTAL_PADDING = 20;
// the app bar's brand mark scales by height so it always sits centered on the toolbar row
export const APPBAR_LOGO_HEIGHT = 26;
export const APPBAR_ICON_BUTTON_SIZE = 34;
export const GLOBAL_SEARCH_WIDTH = 240;
export const GLOBAL_SEARCH_RESULTS_MIN_WIDTH = 280;
export const NOTIFICATION_MENU_WIDTH = 300;
export const PROFILE_MENU_WIDTH = 280;
// toast card of the snackbar stack — fixed width so stacked toasts share one edge
export const SNACKBAR_WIDTH = 340;
export const SNACKBAR_ICON_BADGE_SIZE = 26;
/*
 * the toast badge draws its glyph one step heavier than an inline alert icon: it sits on a small
 * tinted disc where the 1.6 stroke of the alert icons reads as too faint
 */
export const SNACKBAR_ICON_STROKE_WIDTH = 1.8;
/*
 * dialog header and footer are toolbar rows, not padded headings: the close cross sits in a 32px
 * slot on the compact header and in the app bar's own 34px slot on the full-screen variant
 */
export const DIALOG_PADDING = 18;
export const DIALOG_CLOSE_BUTTON_SIZE = 32;
export const DIALOG_CLOSE_ICON_SIZE = 18;
export const DIALOG_FULLSCREEN_TOOLBAR_HEIGHT = 52;
/*
 * the full-screen header grows past its toolbar height when a pretitle stacks over the title, so
 * the height is a floor and the band keeps a small inset above and below its two lines
 */
export const DIALOG_FULLSCREEN_TOOLBAR_PADDING_Y = 8;
export const DIALOG_FULLSCREEN_TITLE_GAP = 2;
/*
 * a strip pinned under the header (a dialog's tabs) hangs off the header's own bottom edge rather
 * than standing on a band of its own — it is closer to the rule above it than to the body below
 */
export const DIALOG_SUB_HEADER_PADDING_TOP = 8;
/*
 * a header that says more than a name stacks its lines tight: the pretitle, the subject and the
 * badges qualifying it are one block being read at once, not three facts spaced apart
 */
export const DIALOG_TITLE_LINE_GAP = 6;
// the destructive confirmation draws its glyph one step above body copy so it leads the sentence
export const DIALOG_SEVERITY_ICON_SIZE = 20;
/*
 * the band naming who a dialog is about (the account a message is being written to): a recessed
 * strip carrying the avatar at a size between the list's row avatar and the profile header's, so
 * the reader recognises the face without the strip competing with the fields under it
 */
export const DIALOG_RECIPIENT_AVATAR_SIZE = 34;
export const DIALOG_RECIPIENT_PADDING_Y = 10;
export const DIALOG_RECIPIENT_PADDING_X = 12;
export const DIALOG_RECIPIENT_GAP = 10;
// the floating send action draws its glyph well above a row action's — it stands alone on the page
export const SEND_FAB_ICON_SIZE = 24;

/*
 * every action button stands on one row height whatever its variant, so a toolbar or dialog footer
 * mixing contained/outlined/text buttons lines up on a single baseline; the text variant keeps a
 * transparent 1px border so it occupies exactly the same box as the outlined one next to it
 */
export const BUTTON_HEIGHT = 36;
export const BUTTON_PADDING_X = 16;
export const BUTTON_FONT_SIZE = FONT_SIZE_BODY;
/*
 * icon-to-label gap, tighter than MUI's own 8px default: the glyph is part of the label, not a
 * second element sitting beside it
 */
export const BUTTON_ICON_GAP = 5;
/*
 * the text variant has no surface behind its label, so it keeps a tighter inset than the
 * variants that draw one — a full 16px on a transparent ground reads as a gap, not as padding
 */
export const BUTTON_TEXT_PADDING_X = 12;
// a running action dims just enough to read as busy without looking disabled
export const BUTTON_LOADING_OPACITY = 0.85;
export const BUTTON_SMALL_HEIGHT = 32;
export const BUTTON_SMALL_PADDING_X = 14;
export const BUTTON_SMALL_FONT_SIZE = FONT_SIZE_META;
export const BUTTON_LARGE_HEIGHT = 44;
export const BUTTON_LARGE_PADDING_X = 20;
export const BUTTON_LARGE_FONT_SIZE = FONT_SIZE_CARD_TITLE;
/*
 * spinner shown in place of the leading glyph while the action runs — sized under the label's cap
 * height so a button does not change height (or reflow its label) the moment it starts loading
 */
export const BUTTON_SPINNER_SIZE = 13;
// stroke weight, in the 44-unit scale CircularProgress draws in: a 1.6px ring on a 13px circle
export const BUTTON_SPINNER_THICKNESS = 5;
/*
 * a bare icon button (table row actions, card headers) is a borderless square hit slot rather than
 * a button with a shape: only its hover ground shows, so it never competes with the row it acts on.
 * It stands on the button row so a row mixing bare icons and real buttons keeps one baseline.
 */
export const ICON_BUTTON_SIZE = BUTTON_HEIGHT;
export const ICON_BUTTON_ICON_SIZE = 18;
// a glyph carrying no label of its own (the overflow dots, a chevron) sits one step smaller
export const ICON_BUTTON_SMALL_ICON_SIZE = 16;

/*
 * below `md` the back-office is driven by touch: every control the finger has to land on grows to
 * the 44px minimum target, and button labels grow with it so the taller box does not read as empty.
 * Applied by the theme through a media query — never re-declare these sizes in a component.
 */
export const BUTTON_TOUCH_HEIGHT = 44;
export const BUTTON_TOUCH_FONT_SIZE = FONT_SIZE_CARD_TITLE;
export const BUTTON_SMALL_TOUCH_HEIGHT = 40;
export const BUTTON_LARGE_TOUCH_HEIGHT = 48;
export const ICON_BUTTON_TOUCH_SIZE = 44;
export const CHECKBOX_TOUCH_SIZE = 20;

/*
 * a dropdown menu is a floating surface, not a field: it takes the large radius and pads itself so
 * its rounded item highlights clear the paper edge. The minimum width keeps a two-word action
 * from opening a panel narrower than the trigger that spawned it.
 */
export const MENU_MIN_WIDTH = 210;
export const MENU_PADDING = 6;
export const MENU_ITEM_HEIGHT = 36;
export const MENU_ITEM_FONT_SIZE = FONT_SIZE_BODY;
export const MENU_ITEM_PADDING_X = 10;
/*
 * a menu row is sized by its height rather than by its inset, so this only shows up on a row
 * whose label wraps — without it a two-line action sits flush against the highlight's edges
 */
export const MENU_ITEM_PADDING_Y = 8;
export const MENU_ITEM_ICON_GAP = 10;
// a menu row's leading glyph reads one step above its label, the way a list icon does
export const MENU_ITEM_ICON_SIZE = 18;

/*
 * monospace is reserved for values read character by character — identifiers, plates, amounts and
 * technical timestamps: a digit has the same advance width as any other, so the same field stays
 * on the same column from one table row to the next instead of drifting with its content
 */
export const FONT_FAMILY_MONO = '\'SF Mono\', Monaco, Consolas, \'Liberation Mono\', monospace';

/*
 * figures a reader compares down a column — a mileage, a ride count — are set on the proportional
 * face but with fixed-width digits, so 12 740 and 182 450 line up on their units without pulling
 * the whole cell into the monospace stack the way a plate or a reference does
 */
export const FONT_VARIANT_TABULAR_NUMS = 'tabular-nums';

export const RADIUS_SM = 4;
export const RADIUS = 6;
export const RADIUS_LG = 8;

/*
 * the TanStack Router devtools toggle mounts itself at z-index 99999 and sits in the bottom-right
 * corner — the screen-size badge has to stack above it and clear its height to stay readable
 */
export const SCREEN_SIZE_INDICATOR_Z_INDEX = 100000;
export const SCREEN_SIZE_INDICATOR_BOTTOM = 56;

/*
 * form controls share one row height and one type size across every input family (text, select,
 * date, search, dropzone trigger) so a row of mixed fields lines up on a single baseline — a
 * select that is 2px taller than the text field next to it is the most visible break in a form.
 *
 * The row has two steps, reached through MUI's own `size` prop rather than a size of our own:
 * `medium` (the default) is the form row, `small` is the denser row a field takes when it is
 * packed into a panel of filters rather than filled in as a value.
 */
export const INPUT_HEIGHT = 44;
export const INPUT_HEIGHT_SMALL = 38;
export const INPUT_FONT_SIZE = FONT_SIZE_BODY;
export const INPUT_PADDING_X = 10;
/*
 * an icon inside a field sits slightly further from the edge than the text does: it is optically
 * smaller than a glyph run, so matching the text inset exactly makes it look like it is falling out
 */
export const INPUT_ADORNMENT_INSET = 12;
export const INPUT_ADORNMENT_GAP = 10;
/*
 * the label above a control reads at the body size, in the body tone: a form is filled in by
 * reading the labels first, so shrinking them to a caption made the word naming the field quieter
 * than the value that is not there yet. Hierarchy inside the label block comes from tone alone —
 * the "(required)" suffix drops to the secondary tint at the same size.
 */
export const INPUT_LABEL_FONT_SIZE = FONT_SIZE_BODY;
export const INPUT_LABEL_HINT_FONT_SIZE = FONT_SIZE_BODY;
/*
 * the air between a label and whatever closes its row on the right — a character count, a limit.
 * Wider than the gap inside the label group (name, hint, "required"), so the two read as the two
 * ends of one row rather than as a single run of small text
 */
export const INPUT_LABEL_END_GAP = 8;
/*
 * helper and error text share the label's size — the label, the control and the line under it are
 * read as one block, and a validation message stands out by tone rather than by size
 */
export const INPUT_HELPER_FONT_SIZE = FONT_SIZE_BODY;
// eye toggle sitting inside the input row — matches the trailing glyph of the date and time fields
export const PASSWORD_TOGGLE_ICON_SIZE = 16;
/*
 * an option in an open dropdown is padded more generously than the field that opened it: the list
 * is scanned and clicked, so its rows need to be separable at a glance and comfortable to hit
 */
export const INPUT_OPTION_PADDING_Y = 10;
export const INPUT_OPTION_PADDING_X = 12;
// checkbox glyph — an 18px box keeps the tick legible next to 15px label text
export const CHECKBOX_SIZE = 18;
export const CHECKBOX_RADIUS = 4;
export const CHECKBOX_BORDER_WIDTH = 1.5;
/*
 * the radio shares the checkbox's box, so only the dot punched out of its fill is its own: it has
 * to read as a dot at 18px rather than as a small ring, which is what a larger one would become
 */
export const RADIO_DOT_SIZE = 6;
/*
 * a checkbox/switch line keeps its own minimum row so a column of them is evenly spaced whether or
 * not a given label wraps, and the gap to the label is wider than the control's own inner spacing
 */
export const CHECKBOX_LABEL_GAP = 10;
export const CHECKBOX_ROW_MIN_HEIGHT = 24;
/*
 * the segmented toggle stands on the input row rather than under it: it holds a value like a field
 * does, so it takes INPUT_HEIGHT and only sets its own horizontal padding
 */
export const TOGGLE_BUTTON_PADDING_X = 20;
/*
 * chips standing for a picked value inside a multi-value field (tags, multi-select) — fully
 * rounded and shorter than the row so several fit on one line without growing the control
 */
export const INPUT_CHIP_HEIGHT = 24;
export const INPUT_CHIP_RADIUS = 14;
export const INPUT_CHIP_PADDING_X = 9;
/*
 * a chip standing inside a field is the value itself, so it is read at the size the field's own
 * text would have — unlike the status chip of a table cell, which labels a row rather than holding
 * what was typed into it and therefore sits at the overline size
 */
export const INPUT_CHIP_FONT_SIZE = FONT_SIZE_BODY;
// a field holding chips pads itself rather than its text, so the chips clear the outline evenly
export const INPUT_MULTI_VALUE_PADDING = 8;
/*
 * THE TEXT-TO-CHIPS FIELD — free text where every comma turns what was typed into a chip. Its chip
 * is taller than the one a multi-select picks: 8px of padding + a 28px chip + 8px lands exactly on
 * INPUT_HEIGHT, so a field holding one line of chips is the same height as an empty one. On a
 * tablet the chip grows a step, and on a phone chip and cross both become full touch targets —
 * the cross of a 28px chip is too small to hit reliably with a finger.
 */
export const TEXT_TO_CHIPS_PADDING_Y = INPUT_MULTI_VALUE_PADDING;
export const TEXT_TO_CHIPS_PADDING_X = 10;
export const TEXT_TO_CHIPS_GAP = 6;
export const TEXT_TO_CHIPS_GAP_TOUCH = 8;
export const TEXT_TO_CHIPS_CHIP_HEIGHT = 28;
export const TEXT_TO_CHIPS_CHIP_HEIGHT_TABLET = 30;
export const TEXT_TO_CHIPS_CHIP_HEIGHT_TOUCH = 44;
// the cross hugs the chip's right edge, so the label side carries the wider inset
export const TEXT_TO_CHIPS_CHIP_PADDING_LEFT = 10;
export const TEXT_TO_CHIPS_CHIP_PADDING_LEFT_TOUCH = 14;
export const TEXT_TO_CHIPS_CHIP_PADDING_RIGHT = 4;
export const TEXT_TO_CHIPS_CHIP_PADDING_RIGHT_TOUCH = 2;
export const TEXT_TO_CHIPS_CHIP_FONT_SIZE_TOUCH = 15;
export const TEXT_TO_CHIPS_REMOVE_SIZE = 22;
export const TEXT_TO_CHIPS_REMOVE_SIZE_TABLET = 24;
export const TEXT_TO_CHIPS_REMOVE_SIZE_TOUCH = 40;
/*
 * the text box keeps enough room to type a word beside the last chip before it wraps under them;
 * on a phone it always takes its own line, so a chip never squeezes the text down to a few letters
 */
export const TEXT_TO_CHIPS_INPUT_MIN_WIDTH = 160;
export const TEXT_TO_CHIPS_INPUT_MIN_WIDTH_TABLET = 140;
export const TEXT_TO_CHIPS_INPUT_HEIGHT = TEXT_TO_CHIPS_CHIP_HEIGHT;
export const TEXT_TO_CHIPS_INPUT_HEIGHT_TABLET = TEXT_TO_CHIPS_CHIP_HEIGHT_TABLET;
export const TEXT_TO_CHIPS_INPUT_HEIGHT_TOUCH = 34;
export const RATING_ICON_SIZE = 18;
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
// the search glyph is drawn one step heavier than the other in-field icons so it reads at 16px
export const SEARCH_ICON_SIZE = 16;
export const SEARCH_ICON_STROKE_WIDTH = 1.8;

/*
 * THE TABS — one template carries every tab strip in the back-office, whatever it switches: the
 * sub-navigation of a detail page, the quick filters over a list, the languages of a translated
 * field. A tab is a 44px slot standing on a 1px rail, sized by its own label rather than by a
 * minimum width, and the strip states which one is open through three things at once — the primary
 * tone, the heavier weight and the 2px indicator that covers the rail under it.
 *
 * The rail is drawn as an inset shadow rather than as a border so the indicator, which sits inside
 * the strip's own box, lands exactly on top of it instead of stacking a third pixel below itself.
 */
export const TAB_HEIGHT = 44;
export const TAB_GAP = 4;
export const TAB_PADDING_X = 12;
/*
 * a leading glyph sits closer to its label than two tabs sit to each other — it belongs to the word
 * next to it, and at the strip's own 4px gap it would read as a separate slot
 */
export const TAB_ICON_GAP = 7;
export const TAB_ICON_SIZE = 16;
export const TAB_INDICATOR_HEIGHT = 2;
/*
 * the arrows of a scrollable strip are chrome, not tabs: they take the strip's height so the row
 * stays level, but a narrower slot than a tab so they never look like one that lost its label
 */
export const TAB_SCROLL_BUTTON_WIDTH = 34;

/*
 * THE PILL TABS — the second drawing of a tab strip, for the switches that change how a panel is
 * rendered rather than what it is about (back-office vs website settings, list vs map). They hold a
 * mode, so they are drawn as a recessed track with the picked slot raised back onto the surface,
 * instead of as an underlined strip that would read as navigation. The track adds up to the same
 * 44px as the underlined strip — 3px of padding around a 38px slot — so both can stand on one row.
 */
export const PILL_TABS_PADDING = 3;
export const PILL_TABS_GAP = 2;
export const PILL_TAB_HEIGHT = INPUT_HEIGHT_SMALL;
export const PILL_TAB_PADDING_X = 16;

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
 * THE PANEL TABS — the strip that swaps what a dialog or a card shows in its body (the report
 * itself against everything else its target has drawn). Same figure as the list strip above, one
 * step up and without a track: it stands on the surface it belongs to, so the open slot is raised
 * onto that same ground by its shadow alone rather than lifted out of a recessed rail — a track
 * here would draw a second bordered block inside a dialog that already has edges of its own.
 *
 * A slot may carry how many items its panel holds, as a small tinted pill after the label: unlike
 * the list strip's muted figure, this one is known the moment the panel opens and is what says
 * whether the other tab is worth switching to at all.
 */
export const PANEL_TABS_GAP = 2;
export const PANEL_TAB_HEIGHT = 34;
export const PANEL_TAB_PADDING_X = 14;
export const PANEL_TAB_LABEL_GAP = 6;
export const PANEL_TAB_FONT_SIZE = FONT_SIZE_META;

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
 * THE RIGHTS MATRIX — entities down, right types across. Both axes are fixed columns: the entity
 * name column must not soak up the leftover width and push the tick columns off the right edge, and
 * every right-type column takes the same width so a long translated header wraps onto a second line
 * instead of widening its own column past the others.
 */
export const RIGHTS_ENTITY_COLUMN_WIDTH = 220;
export const RIGHTS_TYPE_COLUMN_WIDTH = 110;

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
 * a chip states a status or a picked value — it is read, not clicked, so it sits well below the
 * body row height and is fully rounded so it never reads as a small button. The design draws one
 * chip size only: `size="small"` must not make a chip sit 2px off the one in the next table cell.
 */
export const CHIP_HEIGHT = 22;
export const CHIP_FONT_SIZE = FONT_SIZE_OVERLINE;
export const CHIP_PADDING_X = 8;
// a leading glyph belongs to the label rather than sitting beside it, so it hugs it tighter
export const CHIP_ICON_GAP = 4;
export const CHIP_ICON_SIZE = 13;
/*
 * a deletable chip is one step taller and its right side is trimmed: it carries a hit target
 * instead of ending on a label, and the cross needs to clear the pill edge without widening it
 */
export const CHIP_DELETABLE_HEIGHT = 24;
export const CHIP_DELETABLE_PADDING_LEFT = 9;
export const CHIP_DELETABLE_PADDING_RIGHT = 6;
export const CHIP_DELETE_GAP = 6;
export const CHIP_DELETE_BUTTON_SIZE = 20;
// the cross idles muted so a row of filter chips reads as labels first, and firms up on hover
export const CHIP_DELETE_ICON_OPACITY = 0.55;

/*
 * gap between chips standing side by side (active filters, role lists). The reference sheet spaces
 * its samples at 16px to keep them readable as separate specimens; a working strip of filter chips
 * is scanned as one group, so it sits at half that.
 */
export const CHIP_ROW_GAP = 8;

/*
 * a choice chip is the opposite of a chip: it is clicked, not read. It takes a button's height so it
 * is a real hit target, stays a pill so a row of them reads as one set of alternatives, and carries
 * a round mark on its leading edge that fills when the choice is made — the same shape as a radio,
 * and kept round when the row lets several pills be held, so both kinds of row read as one family
 */
export const CHOICE_CHIP_PADDING_X = 14;
export const CHOICE_CHIP_GAP = 6;
export const CHOICE_CHIP_RADIUS = 22;
export const CHOICE_CHIP_MARK_SIZE = 16;
export const CHOICE_CHIP_MARK_BORDER_WIDTH = 1.5;
export const CHOICE_CHIP_MARK_GLYPH_SIZE = 10;
// the focus ring is fainter than an input's: the chip is already outlined, the ring only has to say "here"
export const CHOICE_CHIP_FOCUS_RING_OPACITY = 0.2;
export const CHOICE_CHIP_SKELETON_WIDTH = 96;
export const CHOICE_CHIP_SKELETON_COUNT = 3;
/*
 * a set of choices that is a tree (a category and its subcategories) is stacked one pill per line,
 * each child pushed right by the width of its parent's mark and gap, so the nesting reads at a glance
 */
export const CHOICE_CHIP_STACKED_GAP = 6;
export const CHOICE_CHIP_DEPTH_INDENT = 26;
// a chip carrying a hint under its label grows past the button height, so it needs room above and below
export const CHOICE_CHIP_HINT_PADDING_Y = 6;
export const CHOICE_CHIP_HINT_GAP = 2;

/*
 * status dot — the chip's counterpart for dense tables, where a row of pills turns the column into
 * a wall of color. Only the dot is tinted; the label keeps the cell's own text tone.
 */
export const STATUS_DOT_SIZE = 6;
export const STATUS_DOT_GAP = 4;

/*
 * count badge — a compact rounded rectangle rather than a pill, so a two-digit counter pinned to
 * an icon corner stays inside the icon's own footprint
 */
export const BADGE_HEIGHT = 18;
export const BADGE_PADDING_X = 6;
export const BADGE_FONT_SIZE = FONT_SIZE_OVERLINE;

/*
 * THE CARD — a bordered surface split into three bands: a header that is a toolbar row rather
 * than a padded heading (hence a minimum height instead of a vertical inset), a body, and a foot
 * of actions. Header and foot are separated from the body by the light border, and all three
 * share one horizontal inset so the title, the content and the buttons under it read as one
 * column. The header's leading slot is a tinted rounded square, one step tighter than MUI's own
 * avatar gap: the glyph names the block, it is not an avatar standing beside it.
 */
export const CARD_HEADER_MIN_HEIGHT = 44;
export const CARD_PADDING_X = 16;
export const CARD_HEADER_PADDING_Y = 12;
export const CARD_HEADER_ICON_GAP = 12;
export const CARD_CONTENT_PADDING = 16;
export const CARD_ICON_SLOT_SIZE = 36;
export const CARD_ICON_GLYPH_SIZE = 16;
/*
 * the foot sits on a tighter row than the header: it holds buttons, which carry their own height,
 * where the header holds two lines of type that have to be padded away from the border
 */
export const CARD_ACTIONS_PADDING_Y = 10;
export const CARD_ACTIONS_GAP = 6;

/*
 * THE STAT CARD — the card's headerless form: a label, the figure it names and an optional
 * caption, read as one block, with a round tinted slot on the left. The slot is a circle and one
 * step wider than the header's rounded square — it is the only thing standing next to the figure,
 * so it has to hold its own against it. The three text lines are separated by a hairline gap so
 * they read as one figure rather than as three stacked values; anything the caller slots under
 * them (a chip, a trend) gets real air instead.
 */
export const CARD_STAT_GAP = 14;
export const CARD_STAT_TEXT_GAP = 2;
export const CARD_STAT_EXTRA_GAP = 8;
export const CARD_STAT_ICON_SLOT_SIZE = 44;
export const CARD_STAT_ICON_GLYPH_SIZE = 20;
export const CARD_STAT_VALUE_LINE_HEIGHT = 1.1;
// the placeholder stands in for the figure's own box, so the grid does not jump when data lands
export const CARD_STAT_SKELETON_VALUE_HEIGHT = 32;

/*
 * THE AUDIENCE METER — the bar drawn under an article's audience figures, showing how far its
 * views are along their goal. It is read, never touched: a hairline band the width of the card,
 * thin enough that the figure above it stays the thing the eye lands on first.
 */
export const AUDIENCE_METER_HEIGHT = 6;
export const AUDIENCE_METER_RADIUS = 3;

/*
 * THE STATUS STAT CARD — the summary form of the card above, sized to stand five to a row over a
 * list rather than four to a row at the top of a page. It drops the icon slot: what the figure
 * counts is a state, and the state is already named by the tinted dot in front of its label. The
 * caption sits on the figure's own baseline instead of under it, so the card stays two lines tall
 * whatever it holds.
 */
export const CARD_STATUS_STAT_PADDING_X = 14;
export const CARD_STATUS_STAT_PADDING_Y = 12;
export const CARD_STATUS_STAT_GAP = 6;
export const CARD_STATUS_STAT_VALUE_GAP = 6;
// the label is the one place a state's own tint is carried by text rather than by a dot alone
export const CARD_STATUS_STAT_LABEL_WEIGHT = 500;

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
 * THE TOOLBAR'S ICON TRIGGERS — sort and export act on the list as a whole, so unlike the bare
 * slots a table row carries they are drawn as real controls: a bordered square on the card surface,
 * standing on the toolbar's control row (LIST_TOOLBAR_CONTROL_HEIGHT above). A trigger holding a
 * value rather than firing an action marks it by turning primary and pinning a counter to its
 * corner — a small round disc, not the rounded rectangle a notification badge uses, because it sits
 * half outside a 34px square and has to stay legible there.
 */
export const TOOLBAR_ICON_BUTTON_GLYPH_SIZE = 16;
export const TOOLBAR_ICON_BADGE_SIZE = 16;
export const TOOLBAR_ICON_BADGE_OFFSET = -5;
export const TOOLBAR_ICON_BADGE_PADDING_X = 4;
export const TOOLBAR_ICON_BADGE_FONT_SIZE = FONT_SIZE_OVERLINE;
// the active trigger outlines itself in a fraction of the primary, the way a tinted chip does
export const TOOLBAR_ICON_BUTTON_ACTIVE_BORDER_OPACITY = 0.4;

/*
 * a menu offering a set of related options rather than a list of actions names that set in a band
 * of its own: an overline caption on the paper's own edge, above the items it heads, plus an
 * optional foot stating what the picked option applies to. The bands run edge to edge and pad
 * themselves on the item inset, so caption and items still read as one column.
 */
export const MENU_BAND_PADDING_Y = 9;
export const MENU_BAND_PADDING_X = 12;
export const MENU_BAND_GAP = 8;
/*
 * both menus are wider than the MENU_MIN_WIDTH an action menu takes: their rows carry a second
 * piece of information after the label (the direction a column is read in, what a format writes),
 * which a menu sized by its longest word would push onto a second line
 */
export const SORT_MENU_WIDTH = 300;
export const EXPORT_MENU_WIDTH = 320;
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
 * the accent down the leading edge of a row nobody has opened yet, next to a soft tint of the same
 * colour (see getUnseenRowStyles). Narrow on purpose: it has to be readable at a glance down a
 * column of forty rows without becoming a border the eye reads as a table rule.
 */
export const UNSEEN_ROW_ACCENT_WIDTH = 3;
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
 * LOADING SKELETONS — the placeholder draws the shape of the row it is standing in for (a title
 * line over a meta line, an avatar, a progress bar), not a single grey band per cell: the layout
 * must not jump the moment the data lands.
 */
export const SKELETON_ROW_COUNT = 5;
export const SKELETON_CARD_COUNT = 6;
export const SKELETON_LINE_HEIGHT = 11;
export const SKELETON_SUB_LINE_HEIGHT = 9;
export const SKELETON_LINE_GAP = 7;
export const SKELETON_PRIMARY_LINE_WIDTH = '70%';
export const SKELETON_SUB_LINE_WIDTH = '45%';
/*
 * a placeholder standing in for a whole entry of a stacked list inside a dialog (a past report,
 * a timeline item): one band the height of the entry rather than a line per value it holds
 */
export const SKELETON_ENTRY_HEIGHT = 56;
export const SKELETON_ENTRY_COUNT = 3;

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
export const INBOX_CONTEXT_ACTIONS_GAP = 6;

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
 * THE ACCESS-REFUSED PAGE — a session that signed in perfectly well and has nothing it may open.
 * It is not an error screen: the account exists, it simply carries no role yet, so the page is
 * built like the public auth pages (the brand mark over one centred card, closed by the copyright
 * line) rather than like the 404. The card states what is missing, who the sentence is about, and
 * the two things the reader can actually do about it — write to an administrator, or sign out.
 */
export const UNAUTHORIZED_PAGE_PADDING = 40;
export const UNAUTHORIZED_PAGE_PADDING_MOBILE = 24;
export const UNAUTHORIZED_PAGE_GAP = 26;
export const UNAUTHORIZED_LOGO_HEIGHT = 38;
export const UNAUTHORIZED_CARD_WIDTH = 560;
export const UNAUTHORIZED_CARD_PADDING_Y = 44;
export const UNAUTHORIZED_CARD_PADDING_X = 48;
export const UNAUTHORIZED_CARD_PADDING_MOBILE = 24;
export const UNAUTHORIZED_CARD_GAP = 26;
/*
 * the glyph leading the card is a disc of the warning tone, not a bare icon: at the top of a page
 * holding a single sentence it is the only thing carrying the severity of what the sentence says
 */
export const UNAUTHORIZED_ICON_BADGE_SIZE = 64;
export const UNAUTHORIZED_ICON_SIZE = 30;
/*
 * the padlock is drawn at the design's own weight — Feather ships these paths at a 2px stroke,
 * which at 30px inside a tinted disc reads as a filled shape rather than as an outline
 */
export const UNAUTHORIZED_ICON_STROKE_WIDTH = 1.5;
export const UNAUTHORIZED_ICON_BADGE_BORDER_OPACITY = 0.24;
export const UNAUTHORIZED_TEXT_GAP = 12;
/*
 * the line naming the account the message is about — the same shape as a dialog's recipient row:
 * an avatar, the name over the address, on the recessed ground so it reads as a quoted fact rather
 * than as a second message
 */
export const UNAUTHORIZED_ACCOUNT_PADDING_Y = 10;
export const UNAUTHORIZED_ACCOUNT_PADDING_X = 14;
export const UNAUTHORIZED_ACCOUNT_GAP = 10;
export const UNAUTHORIZED_ACCOUNT_AVATAR_SIZE = 30;
export const UNAUTHORIZED_ACTIONS_GAP = 10;
export const UNAUTHORIZED_ACTION_ICON_SIZE = 15;

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
// the state of the paper on show, standing in the header beside the way out of the panel
export const DIALOG_HEAD_RIGHT_GAP = 10;

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

/*
 * THE NO-SHOW THREAD — a booking's no-show report read as the exchange it was: the passenger's
 * account on the left, the answers to it (the driver's reply, then support's ruling) closing on the
 * right. The bubble keeps one squared corner on the side of its author, which is what ties a bubble
 * to the avatar beside it once several of them stack.
 */
export const NO_SHOW_THREAD_GAP = 16;
// the report's status chip stands beside the block title the way the page status stands beside its own
export const NO_SHOW_TITLE_GAP = PAGE_HEAD_TITLE_GAP;
export const NO_SHOW_MESSAGE_MAX_WIDTH = '78%';
export const NO_SHOW_MESSAGE_GAP = 10;
export const NO_SHOW_MESSAGE_BODY_GAP = 5;
export const NO_SHOW_AVATAR_SIZE = 32;
export const NO_SHOW_AVATAR_FONT_SIZE = 12;
export const NO_SHOW_AUTHOR_GAP = 8;
// the author's role is a tag, not a status: square-cornered and neutral, so it never reads as one
export const NO_SHOW_ROLE_TAG_HEIGHT = 18;
export const NO_SHOW_ROLE_TAG_PADDING_X = 6;
export const NO_SHOW_ROLE_TAG_FONT_SIZE = 11;
export const NO_SHOW_ROLE_TAG_LETTER_SPACING = '.3px';
export const NO_SHOW_ROLE_TAG_RADIUS = 3;
export const NO_SHOW_BUBBLE_PADDING_Y = 11;
export const NO_SHOW_BUBBLE_PADDING_X = 14;
export const NO_SHOW_BUBBLE_RADIUS = 8;
export const NO_SHOW_BUBBLE_TAIL_RADIUS = 3;
export const NO_SHOW_BUBBLE_TITLE_GAP = 4;
// what the ruling did to the ride, set under the reason by a rule rather than as a second bubble
export const NO_SHOW_BUBBLE_FOOTNOTE_GAP = 6;
/*
 * the two parties who are not the passenger get solid discs rather than the accent gradient: the
 * driver a slate one, support the navy of the sidebar it works from — so the three voices of the
 * thread can be told apart before any name is read
 */
export const NO_SHOW_DRIVER_AVATAR_COLOR = '#3A4759';
export const NO_SHOW_SUPPORT_AVATAR_COLOR = '#1A2332';
// the arrow between the two points of a booking's route, sized to the chip's caption, not to an icon slot
export const REQUEST_ROUTE_CHIP_GAP = 6;
export const REQUEST_ROUTE_CHIP_ARROW_SIZE = 13;

/*
 * THE FORM WORKBENCH — the layout a long editorial form is written in: the summary rail naming its
 * sections on the left, the section being filled in the middle, and what the reader will get out of
 * it on the right. It replaces a wizard whose three steps had to be walked in order — a page is
 * rarely written front to back, and coming back to fix one meta description should not mean
 * stepping past the content to reach it.
 *
 * Each entry of the rail carries how many of its fields are filled and a gauge drawing the same
 * ratio, so what is left to do is legible without opening a single section. The rail folds to its
 * icons on a wide screen when the form itself needs the room; under `lg` it stops being a rail at
 * all and becomes a row of entries above the form, the preview column is dropped, and the primary
 * action moves into a footer bar — the form is several screens tall there, and an editor should
 * not have to scroll back up to save.
 */
export const FORM_WORKBENCH_BREAKPOINT = RESPONSIVE_BREAKPOINT;
/*
 * on a phone the summary stops being a row: five entries cannot share 390px, and a row scrolling
 * sideways hides the very sections it is there to show. It stacks instead, under a title line that
 * carries the whole-form counter (moved up from the footer bar) and folds the list away
 */
export const FORM_WORKBENCH_PHONE_BREAKPOINT = 'sm';
export const FORM_WORKBENCH_RAIL_HEAD_PADDING = '0 4px 4px 12px';
export const FORM_WORKBENCH_RAIL_HEAD_GAP = 10;
export const FORM_WORKBENCH_RAIL_HEAD_DIVIDER_HEIGHT = 14;
export const FORM_WORKBENCH_RAIL_HEAD_LETTER_SPACING = '0.4px';
/*
 * the CMS forms are read as one column of blocks, so they are capped rather than stretched across
 * a wide screen. The page form is the exception: it is three columns, and at the ordinary cap its
 * middle one would be narrower than the fields it holds
 */
export const CMS_FORM_MAX_WIDTH = 1000;
export const CMS_FORM_WIDE_MAX_WIDTH = 1400;
export const FORM_WORKBENCH_GAP = 18;
export const FORM_WORKBENCH_RAIL_WIDTH = 250;
/*
 * folded, an entry keeps its icon and the number of fields already filled — the label and the
 * gauge go, and the name comes back as a tooltip. Anything narrower than this cannot hold a
 * two-digit count next to a 17px glyph.
 */
export const FORM_WORKBENCH_RAIL_COLLAPSED_WIDTH = 64;
export const FORM_WORKBENCH_PREVIEW_WIDTH = 380;
/*
 * the summary is pinned under the app bar: the form runs well past one screen, and a summary that
 * scrolled away with it would stop being the thing that says where you are and what is left to do.
 * It keeps the same air under the bar as the statistics rail, and scrolls inside itself on a short
 * viewport rather than running past the bottom of the window.
 */
export const FORM_WORKBENCH_STICKY_OFFSET = 12;
export const FORM_WORKBENCH_RAIL_PADDING = 8;
export const FORM_WORKBENCH_RAIL_ROW_GAP = 6;
export const FORM_WORKBENCH_RAIL_ITEM_GAP = 6;
export const FORM_WORKBENCH_RAIL_ITEM_PADDING_Y = 10;
export const FORM_WORKBENCH_RAIL_ITEM_PADDING_X = 12;
export const FORM_WORKBENCH_RAIL_ITEM_LABEL_GAP = 10;
export const FORM_WORKBENCH_RAIL_ICON_SIZE = 17;
export const FORM_WORKBENCH_RAIL_TOGGLE_HEIGHT = 36;
export const FORM_WORKBENCH_RAIL_TOGGLE_GAP = 6;
export const FORM_WORKBENCH_RAIL_GAUGE_HEIGHT = 3;
export const FORM_WORKBENCH_RAIL_BADGE_SIZE = 18;
export const FORM_WORKBENCH_RAIL_BADGE_PADDING_X = 5;
export const FORM_WORKBENCH_RAIL_CHECK_SIZE = 14;
// the tint and the edge the open entry is marked with — the same pair the pill tabs use
export const FORM_WORKBENCH_ACTIVE_BORDER_OPACITY = 0.2;
/*
 * THE WORKBENCH BARS — the band over the form and, under `lg`, the one closing it. Both are pinned:
 * the top one so the language tabs and the state of the record stay in sight, the bottom one so
 * saving is always one tap away. They stand above the cards scrolling under them and below the app
 * bar and its menus, which is the same layer the statistics bands use.
 */
export const FORM_WORKBENCH_BAR_Z_INDEX = 5;
export const FORM_WORKBENCH_BAR_PADDING_Y = 12;
export const FORM_WORKBENCH_BAR_PADDING_X = 16;
export const FORM_WORKBENCH_BAR_GAP = 12;
export const FORM_WORKBENCH_FOOTER_PADDING_Y = 10;
export const FORM_WORKBENCH_FOOTER_PADDING_X = 16;
/*
 * the card under the rail counting the whole form, and the popover saying the sections can be
 * filled in any order — the one sentence that keeps an editor from reading the rail as a wizard
 */
export const FORM_WORKBENCH_PROGRESS_PADDING_Y = 14;
export const FORM_WORKBENCH_PROGRESS_PADDING_X = 16;
export const FORM_WORKBENCH_PROGRESS_GAP = 6;
export const FORM_WORKBENCH_PROGRESS_POPOVER_WIDTH = 260;
/*
 * THE PREVIEW COLUMN — what the section being filled produces, drawn next to it: the search result
 * and the social card for the SEO section, the page as the site will render it for the content and
 * the pictures, the record's own summary for the settings. The history of the page shares the
 * column as its second tab — it is the same question asked of the past.
 */
export const FORM_WORKBENCH_PREVIEW_PADDING = 18;
export const FORM_WORKBENCH_PREVIEW_GAP = 18;
// the pair of slots at the head of the column, each taking half of it
export const FORM_WORKBENCH_PREVIEW_TABS_PADDING = 8;
export const FORM_WORKBENCH_PREVIEW_TABS_GAP = 2;
export const FORM_WORKBENCH_PREVIEW_TAB_PADDING_X = 12;
// a step taller than a button: the pair spans the column's head and is its only control
export const FORM_WORKBENCH_PREVIEW_TAB_HEIGHT = 38;
/*
 * the line naming what is drawn under it ("Résultat de recherche Google", "Rendu sur le site").
 * It is the overline of the column rather than a heading of the page, so it takes the scale's
 * `overline` rung as it stands — only the air under it belongs to the column
 */
export const FORM_WORKBENCH_PREVIEW_LABEL_GAP = 10;
/*
 * the two mock-ups that are one block rather than two (the rendered page, the summary) sit a step
 * further from their overline: nothing follows them inside the block, so the line has to read as
 * the head of the whole drawing and not as the caption of its first row
 */
export const FORM_WORKBENCH_PREVIEW_BLOCK_GAP = 12;
/*
 * the overline heading a mock-up is fainter and tighter than the scale's own: it names a drawing,
 * and must not compete with the drawing's own title right under it
 */
export const FORM_WORKBENCH_PREVIEW_OVERLINE_LETTER_SPACING = '0.3px';
/*
 * THE LOADING STATE — while the record is read into the form, the section card and the preview
 * column hold the shape of what is coming instead of an empty form that would then jump. The rail
 * and the band above stay: they do not depend on the record's values to be drawn.
 */
export const FORM_WORKBENCH_SKELETON_TITLE_WIDTH = 132;
export const FORM_WORKBENCH_SKELETON_TITLE_HEIGHT = 15;
export const FORM_WORKBENCH_SKELETON_SPINNER_SIZE = 14;
export const FORM_WORKBENCH_SKELETON_SPINNER_GAP = 8;
export const FORM_WORKBENCH_SKELETON_FIELDS_GAP = 22;
export const FORM_WORKBENCH_SKELETON_FIELD_GAP = 8;
export const FORM_WORKBENCH_SKELETON_LABEL_HEIGHT = 13;
export const FORM_WORKBENCH_SKELETON_HELPER_HEIGHT = 11;
// four fields of the widths and heights a section actually holds: two lines, a short text, the editor
export const FORM_WORKBENCH_SKELETON_FIELDS = [
  { labelWidth: 96, fieldHeight: 46, helperWidth: '72%' },
  { labelWidth: 124, fieldHeight: 46, helperWidth: '58%' },
  { labelWidth: 84, fieldHeight: 92, helperWidth: '66%' },
  { labelWidth: 110, fieldHeight: 180, helperWidth: '44%' },
] as const;
// the preview column's own placeholder: its overline, a picture, a title and three lines of text
export const FORM_WORKBENCH_SKELETON_PREVIEW_OVERLINE_WIDTH = 108;
export const FORM_WORKBENCH_SKELETON_PREVIEW_IMAGE_HEIGHT = 120;
export const FORM_WORKBENCH_SKELETON_PREVIEW_TITLE_WIDTH = '70%';
export const FORM_WORKBENCH_SKELETON_PREVIEW_LINE_WIDTHS = ['100%', '88%', '54%'] as const;

/*
 * THE PREVIEW MOCK-UPS — inside the preview column, three drawings of what the page will look like
 * somewhere that is not the back-office: a search result, a social card, and the page itself.
 *
 * Their type sizes and tones are their own, not the back-office scale, for the same reason
 * `GOOGLE_RESULT_LINK_COLOR` is not a palette token: each of these is only useful insofar as it
 * looks like the thing it imitates, and a mock-up redrawn in the back-office's own type would lie
 * about what the visitor is going to see. Everything around them — the column, its slots, its
 * overlines — follows the ordinary scale.
 */
export const SEO_PREVIEW_URL_FONT_SIZE = 13;
export const SEO_PREVIEW_URL_GAP = 2;
export const SEO_PREVIEW_TITLE_FONT_SIZE = 18;
export const SEO_PREVIEW_TITLE_LINE_HEIGHT = 1.3;
export const SEO_PREVIEW_TITLE_GAP = 4;
export const SEO_PREVIEW_DESCRIPTION_FONT_SIZE = 13;
export const SEO_PREVIEW_DESCRIPTION_LINE_HEIGHT = 1.55;
// the card Facebook and LinkedIn build from the page's meta tags
export const SOCIAL_CARD_IMAGE_HEIGHT = 170;
export const SOCIAL_CARD_PADDING_Y = 12;
export const SOCIAL_CARD_PADDING_X = 14;
export const SOCIAL_CARD_DOMAIN_FONT_SIZE = 11;
export const SOCIAL_CARD_DOMAIN_LETTER_SPACING = '.4px';
export const SOCIAL_CARD_DOMAIN_GAP = 4;
export const SOCIAL_CARD_TITLE_FONT_SIZE = 15;
export const SOCIAL_CARD_TITLE_GAP = 2;
export const SOCIAL_CARD_DESCRIPTION_FONT_SIZE = 13;
export const SOCIAL_CARD_DESCRIPTION_LINE_HEIGHT = 1.5;
/*
 * the page as the site will render it. The banner is drawn at the column's width, the gallery two
 * thumbnails to a row — enough to say which picture is where without turning the column into a
 * gallery of its own
 */
export const RENDERED_PAGE_BANNER_HEIGHT = 96;
export const RENDERED_PAGE_PADDING = 16;
export const RENDERED_PAGE_TITLE_FONT_SIZE = 19;
export const RENDERED_PAGE_TITLE_LINE_HEIGHT = 1.3;
export const RENDERED_PAGE_DESCRIPTION_FONT_SIZE = 13;
export const RENDERED_PAGE_DESCRIPTION_LINE_HEIGHT = 1.6;
export const RENDERED_PAGE_DESCRIPTION_GAP = 6;
export const RENDERED_PAGE_RULE_MARGIN_Y = 14;
export const RENDERED_PAGE_CONTENT_FONT_SIZE = 13.5;
export const RENDERED_PAGE_CONTENT_LINE_HEIGHT = 1.75;
export const RENDERED_PAGE_PARAGRAPH_GAP = 12;
// headings written in the editor, scaled down with the rest of the drawing
export const RENDERED_PAGE_HEADING_FONT_SIZE = 15;
export const RENDERED_PAGE_SUBHEADING_FONT_SIZE = 14;
export const RENDERED_PAGE_LIST_INDENT = 20;
export const RENDERED_PAGE_IMAGES_GAP = 16;
export const RENDERED_PAGE_IMAGES_COLUMNS = 2;
export const RENDERED_PAGE_IMAGE_HEIGHT = 84;
export const RENDERED_PAGE_IMAGE_GAP = 12;
export const RENDERED_PAGE_IMAGE_CAPTION_GAP = 5;
/*
 * a picture that has not been uploaded yet is drawn as a hatched frame naming the field and the
 * size it expects — an empty box says nothing about what belongs in it, and the two figures are
 * the whole reason the frame is there
 */
export const IMAGE_PLACEHOLDER_HATCH_SIZE = 10;
export const IMAGE_PLACEHOLDER_FONT_SIZE = 11;
export const IMAGE_PLACEHOLDER_BANNER_RATIO = '1920×480';
export const IMAGE_PLACEHOLDER_PREVIEW_RATIO = '1200×630';
// the file names and dimensions under the gallery thumbnails, read character by character
export const RENDERED_PAGE_IMAGE_CAPTION_FONT_SIZE = 11;

/*
 * THE FORM SUMMARY — the settings section restated as four facts, at the foot of the preview
 * column. The rows carry no rule between them: they are four short lines, not a table, and at this
 * length a filet under each one would be the loudest thing in the column.
 */
export const FORM_SUMMARY_ROW_GAP = 12;
export const FORM_SUMMARY_CODE_FONT_SIZE = 12;

/*
 * THE VERSION LIST — the past states of a content, newest first, with what it would take to put
 * one back. The rows run edge to edge and are separated by a filet, so the list reads as a
 * sequence rather than as a stack of cards, and the action stays a word rather than a button.
 */
export const VERSION_LIST_PADDING_Y = 8;
export const VERSION_LIST_ROW_PADDING_Y = 12;
export const VERSION_LIST_ROW_PADDING_X = 18;
export const VERSION_LIST_ROW_GAP = 10;
export const VERSION_LIST_DATE_GAP = 2;
export const VERSION_LIST_ACTION_PADDING_X = 12;

/*
 * THE SECTION FORM — a section of a page and the blocks it is made of, edited side by side: the
 * section's own fields and the list of its blocks in a narrow column, the one block being written
 * in the wide one. It replaces a single column where every block was a full card stacked under the
 * previous one — past three blocks the one being written was screens away from the list that says
 * how many there are, and reordering meant deleting and retyping.
 *
 * The list narrows on a tablet and, on a phone, sits above the block it opens.
 */
export const SECTION_FORM_GAP = 14;
export const SECTION_FORM_COLUMN_GAP = 12;
export const SECTION_FORM_LIST_WIDTH = 320;
export const SECTION_FORM_LIST_TABLET_WIDTH = 280;
export const SECTION_FORM_LIST_PADDING = 8;
export const SECTION_FORM_LIST_GAP = 4;
// a phone gets taller rows a thumb can hit, spaced a step further apart
export const SECTION_FORM_LIST_PHONE_GAP = 6;
export const SECTION_FORM_ITEM_HEIGHT = 44;
export const SECTION_FORM_ITEM_PHONE_HEIGHT = 56;
export const SECTION_FORM_ITEM_PADDING = 10;
export const SECTION_FORM_ITEM_GAP = 10;
export const SECTION_FORM_ITEM_TEXT_GAP = 2;
// the block's position in the section, in a square slot tinted once the block is complete
export const SECTION_FORM_ITEM_NUMBER_SIZE = 24;
export const SECTION_FORM_ITEM_DOT_SIZE = 8;
/*
 * the pair of arrows moving a block up or down the list. They are dropped on a phone: two 22px
 * targets stacked in a 56px row cannot be hit with a thumb, and a phone is not where a section is
 * restructured
 */
export const SECTION_FORM_REORDER_WIDTH = 24;
export const SECTION_FORM_REORDER_HEIGHT = 22;
export const SECTION_FORM_REORDER_ICON_SIZE = 12;
export const SECTION_FORM_REORDER_GAP = 1;
export const SECTION_FORM_REORDER_PADDING_RIGHT = 6;
export const SECTION_FORM_ADD_BLOCK_HEIGHT = 44;
export const SECTION_FORM_ADD_BLOCK_PHONE_HEIGHT = 48;
// the dashed edge of "add a block": the brand color, halfway faded, so it reads as a slot to fill
export const SECTION_FORM_ADD_BLOCK_BORDER_OPACITY = 0.5;
export const SECTION_FORM_ACTION_ICON_SIZE = 16;
export const SECTION_FORM_EDITOR_GAP = 18;
// the section as the site will lay it out, in the width of the site's own content column
export const SECTION_FORM_PREVIEW_MAX_WIDTH = 760;
export const SECTION_FORM_PREVIEW_GAP = 26;
export const SECTION_FORM_PREVIEW_DESCRIPTION_GAP = 8;

/*
 * THE CATEGORY FORM — a full-screen dialog: what the category is called in each language, its SEO
 * and its picture in the wide column, where it is filed (entity, parent, resulting path, code,
 * status) and how it shows up on Google and when shared in a fixed side column. The language
 * strip stands in the header, between the title and the actions; on a phone it drops into a band
 * pinned under the header. Under the workbench breakpoint the side column stacks under the other
 * one and the actions leave the header for a bar pinned at the bottom, next to the path being built.
 */
export const CATEGORY_FORM_SIDE_COLUMN_WIDTH = 400;
export const CATEGORY_FORM_GAP = 16;
export const CATEGORY_FORM_COLUMN_GAP = 14;
export const CATEGORY_FORM_PADDING = 20;
export const CATEGORY_FORM_TABLET_PADDING = 16;
export const CATEGORY_FORM_PHONE_PADDING = 12;
export const CATEGORY_FORM_TABS_BAR_PADDING_Y = 8;
export const CATEGORY_FORM_TABS_BAR_PADDING_X = 12;
export const CATEGORY_FORM_ACTIONS_GAP = 10;
export const CATEGORY_FORM_PATH_BOX_PADDING_Y = 12;
export const CATEGORY_FORM_PATH_BOX_PADDING_X = 14;
export const CATEGORY_FORM_PATH_BOX_GAP = 4;
export const CATEGORY_FORM_ACTION_ICON_SIZE = 15;

/*
 * The finance pages are dashboards — a row of figures, then a chart, then a table — so they are
 * capped and centred rather than stretched across a wide screen, where the eye has to travel
 * between a figure and the label under it. Shared by the pages rather than written on each: two
 * dashboards of the platform's own money reading at different widths looks like a mistake.
 */
export const FINANCE_PAGE_MAX_WIDTH = 1400;
/*
 * The overview reads in two columns — the figures and their chart, then the payments someone has
 * to chase — so the chase list stays in view next to the figures instead of under a long chart.
 * The side column keeps one width whatever the screen, which is what lets a row fit its payer, its
 * type, its amount and its button; under the breakpoint it would be squeezed, so it stacks.
 */
export const FINANCE_OVERVIEW_SIDE_WIDTH = 440;
export const FINANCE_OVERVIEW_GAP = 20;
export const FINANCE_OVERVIEW_KPI_COLUMNS = 2;
export const FINANCE_CHART_HEIGHT = 220;
export const FINANCE_CHART_CARD_GAP = 12;
export const FINANCE_CHART_CARD_PADDING_TOP = 16;
export const FINANCE_CHART_CARD_PADDING_X = 18;
export const FINANCE_CHART_CARD_PADDING_BOTTOM = 18;
export const FINANCE_QUEUE_SKELETON_ROWS = 3;
export const FINANCE_QUEUE_ROW_SIDE_GAP = 4;
export const FINANCE_QUEUE_ROW_TITLE_GAP = 8;
