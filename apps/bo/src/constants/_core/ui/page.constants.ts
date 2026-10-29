import { FONT_SIZE_META, RESPONSIVE_BREAKPOINT } from '@/constants/_core/ui/ui.constants';

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
// the pretitle can carry a control of its own, next to a reference an operator copies
export const PAGE_HEAD_PRETITLE_CONTROL_GAP = 4;
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
export const PREVIEW_SUMMARY_ITEM_MIN_HEIGHT = 36;
export const PREVIEW_SUMMARY_ITEM_PADDING_Y = 6;
export const PREVIEW_SUMMARY_ITEM_PADDING_X = 10;
// between an entry's own name and the badge trailing it — wider than the rail's own item-to-item gap
export const PREVIEW_SUMMARY_ITEM_CONTENT_GAP = 8;
export const PREVIEW_SECTIONS_GAP = 16;
/*
 * THE SUMMARY HEAD — the row that opens the rail: the rail's own name, and the control collapsing
 * it to its glyphs. It is the one row of the rail that names no block, so it is drawn a step below
 * the entries under it (the caption size, the muted tone) rather than as a first entry of its own.
 * Grouped, it stands in a card of its own above the clusters: it belongs to the whole rail, not to
 * the first cluster of it.
 */
export const PREVIEW_SUMMARY_HEAD_HEIGHT = 36;
export const PREVIEW_SUMMARY_HEAD_PADDING_X = 10;
export const PREVIEW_SUMMARY_HEAD_GAP = 10;
export const PREVIEW_SUMMARY_HEAD_FONT_SIZE = FONT_SIZE_META;
export const PREVIEW_SUMMARY_HEAD_ICON_SIZE = 16;
export const PREVIEW_SUMMARY_HEAD_CARD_PADDING = 6;
/*
 * the rule closing the head row: ungrouped, the head and the entries share one recessed track, and
 * with nothing between them the head reads as a first entry that opens no block. It is pulled out
 * to the rail's own inset so it runs from edge to edge of the track rather than stopping under the
 * word. Grouped, the head already stands in a card of its own — nothing left to separate.
 */
export const PREVIEW_SUMMARY_DIVIDER_MARGIN_Y = 4;
/*
 * THE REDUCED RAIL — the same rail with its names dropped, kept open at the width of one glyph. It
 * is what the app's own sidebar already does one column to the left, and for the same reason: a
 * reader working inside one block wants the page back, not the list of the ones they are not in.
 * The entry keeps its figure as a disc pinned over the glyph, ringed in the surface tone so it
 * reads as sitting above the icon rather than as part of it, and the name it lost comes back as a
 * tooltip. An entry with no glyph cannot be read this way at all, so the control is only offered to
 * a page whose blocks all carry one.
 */
export const PREVIEW_SUMMARY_REDUCED_WIDTH = 64;
export const PREVIEW_SUMMARY_ITEM_ICON_SIZE = 17;
/*
 * the weight every glyph of the rail is drawn at, stated here rather than trusted to the caller:
 * a page hands its icons in from `react-icons`, which ships Feather at a 2px stroke, where the
 * back-office draws 1.5 everywhere else — left alone, a rail glyph reads heavier than the sidebar
 * glyph standing one column to its left
 */
export const PREVIEW_ICON_STROKE_WIDTH = 1.5;
export const PREVIEW_SUMMARY_REDUCED_ITEM_PADDING_Y = 8;
export const PREVIEW_SUMMARY_MINI_BADGE_SIZE = 16;
export const PREVIEW_SUMMARY_MINI_BADGE_PADDING_X = 4;
export const PREVIEW_SUMMARY_MINI_BADGE_RADIUS = 8;
export const PREVIEW_SUMMARY_MINI_BADGE_FONT_SIZE = 10;
export const PREVIEW_SUMMARY_MINI_BADGE_OFFSET_X = 3;
export const PREVIEW_SUMMARY_MINI_BADGE_OFFSET_Y = 1;
export const PREVIEW_SUMMARY_MINI_BADGE_BORDER = 2;
/*
 * the pill a summary entry carries next to its name, printing the same figure as the block's own
 * `count` — a fixed circle rather than a text-height pill, since it never holds more than two or
 * three digits and a taller badge would nudge the entry's label off its own baseline
 */
export const PREVIEW_SUMMARY_BADGE_SIZE = 20;
export const PREVIEW_SUMMARY_BADGE_PADDING_X = 6;
export const PREVIEW_SUMMARY_BADGE_RADIUS = 10;
/*
 * THE COMPACT SUMMARY — the rail turned on its side for a tablet or a phone, where a 200px column
 * would eat a third of the row and the entries it names are already a thumb's scroll apart. Below
 * the summary's own breakpoint the rail becomes this horizontal strip instead of disappearing: the
 * same entries, in the same order, marking the same single open block, scrolled sideways rather
 * than dropped — a detail page carries too many blocks to give up naming them just because the
 * screen narrowed.
 */
export const PREVIEW_COMPACT_FRAME_PADDING_Y = 12;
export const PREVIEW_COMPACT_NAV_PADDING_X = 12;
export const PREVIEW_COMPACT_NAV_GAP = 4;
export const PREVIEW_COMPACT_CHIP_PADDING_X = 14;
export const PREVIEW_COMPACT_CHIP_GAP = 8;
/*
 * The strip gains the head the rail has on a desktop, and for a reason the desktop does not have:
 * the block underneath already takes the whole screen, and a strip standing over it costs a sixth
 * of what is left to read the block in. So the strip can be folded back to the row naming it —
 * by that row's own chevron, and on its own as soon as a chip is used, since the reader who just
 * asked for a block wants the top of it rather than the list they asked it from.
 */
export const PREVIEW_COMPACT_HEAD_FRAME_PADDING_TOP = 4;
export const PREVIEW_COMPACT_HEAD_PADDING_LEFT = 16;
export const PREVIEW_COMPACT_HEAD_PADDING_RIGHT = 4;
export const PREVIEW_COMPACT_HEAD_GAP = 8;
export const PREVIEW_COMPACT_HEAD_CHEVRON_SIZE = 18;
/*
 * THE GROUPED SUMMARY — once a page's block list has grown long enough that a flat column of
 * names stops reading as one list, the rail (or its compact strip) clusters its entries under the
 * name each one shares instead. On the vertical rail each cluster becomes its own bordered card,
 * so the marked entry's own surface-and-shadow treatment already used for an ungrouped rail would
 * double up inside it — a marked entry inside a cluster is read with a plain tint instead. On the
 * compact strip the clusters stop being a row and stack instead, each one a recessed pill opening
 * on its own name with its chips listed under it full width: a row of clusters would push all but
 * the first off-screen, and reaching the name of the next one would mean scrolling past every chip
 * of the one before it.
 *
 * On the rail the cluster's name is also the control that folds it: a page grouped into five
 * clusters still lists every block it holds, and the reader working inside one of them gets to put
 * the other four away. A folded cluster keeps a figure of how many blocks it took with it, so the
 * rail never hides a block without saying that it did.
 */
export const PREVIEW_SUMMARY_GROUP_GAP = 10;
export const PREVIEW_SUMMARY_GROUP_PADDING = 6;
export const PREVIEW_SUMMARY_GROUP_TITLE_MIN_HEIGHT = 32;
export const PREVIEW_SUMMARY_GROUP_TITLE_PADDING_Y = 2;
export const PREVIEW_SUMMARY_GROUP_TITLE_PADDING_X = 10;
export const PREVIEW_SUMMARY_GROUP_TITLE_GAP = 8;
export const PREVIEW_SUMMARY_CHEVRON_SIZE = 14;
export const PREVIEW_COMPACT_GROUP_INNER_GAP = 2;
// the hint glyph belongs to the last word of the block title, not to the header row it stands on
export const PREVIEW_SECTION_TITLE_GAP = 4;
// the figure trailing a block's name, saying how many rows it holds before the block is opened
export const PREVIEW_SECTION_COUNT_GAP = 6;
/*
 * A RECORD READ BY PAGES — the rail names clusters rather than blocks, and opening one draws every
 * block it holds. A cluster too long for one screen lists its blocks under its own name, stepped in
 * so they read as parts of it rather than as clusters of their own.
 */
export const PREVIEW_SUMMARY_SUBITEMS_INDENT = 12;
// the name of each cluster standing over its blocks once the whole record is stacked
export const PREVIEW_GROUP_HEADING_GAP = 12;
// the blocks of the open cluster stand under the top of the page once one of them is jumped to
export const PREVIEW_SECTION_SCROLL_MARGIN_TOP = 16;
// the placeholder lines of a block still on its way, and the width the last one stops at
export const PREVIEW_SECTION_SKELETON_LINES = 4;
export const PREVIEW_SECTION_SKELETON_LINE_HEIGHT = 20;
export const PREVIEW_SECTION_SKELETON_LAST_LINE_WIDTH = '60%';
export const PREVIEW_SECTION_SKELETON_GAP = 10;
// the failure of one block: the sentence, and the way to read that block again under it
export const PREVIEW_SECTION_ERROR_GAP = 12;
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
 * a label and its value standing on one row inside a dialog, splitting the width in two under `sm`
 * and stacking below it
 */
export const PREVIEW_LABEL_VALUE_SPACING = 2;

/*
 * the TanStack Router devtools toggle mounts itself at z-index 99999 and sits in the bottom-right
 * corner — the screen-size badge has to stack above it and clear its height to stay readable
 */
export const SCREEN_SIZE_INDICATOR_Z_INDEX = 100000;
export const SCREEN_SIZE_INDICATOR_BOTTOM = 56;

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

// page placeholder drawn while a page's chunk or the dashboard guard is on its way
export const PAGE_SKELETON_PRETITLE_WIDTH = 90;
export const PAGE_SKELETON_PRETITLE_HEIGHT = 10;
export const PAGE_SKELETON_TITLE_WIDTH = 240;
export const PAGE_SKELETON_TITLE_HEIGHT = 28;

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
 * THE STATUS PAGE (404, error) — the brand mark over one centred card holding the code, the sentence and the
 * way back home, closed by the copyright line. From a tablet down the card drops its surface and
 * border and the text stands directly on the page ground; on a phone the action fills the row.
 */
export const STATUS_PAGE_PADDING = 40;
export const STATUS_PAGE_PADDING_TABLET = 32;
export const STATUS_PAGE_PADDING_MOBILE = '24px 20px';
export const STATUS_PAGE_GAP = 26;
export const STATUS_PAGE_LOGO_HEIGHT = 38;
export const STATUS_PAGE_CARD_WIDTH = 460;
export const STATUS_PAGE_CARD_GAP = 22;
export const STATUS_PAGE_CARD_PADDING_Y = 40;
export const STATUS_PAGE_CARD_PADDING_X = 44;
export const STATUS_PAGE_CODE_FONT_SIZE = 72;
export const STATUS_PAGE_CODE_FONT_SIZE_MOBILE = 60;
// a word (the error label) is set smaller than the three digits of a 404, so it keeps the same width
export const STATUS_PAGE_WORD_FONT_SIZE = 56;
export const STATUS_PAGE_WORD_FONT_SIZE_MOBILE = 46;
export const STATUS_PAGE_TITLE_FONT_SIZE = 22;
export const STATUS_PAGE_TITLE_FONT_SIZE_MOBILE = 19;
export const STATUS_PAGE_ACTION_ICON_SIZE = 15;
export const STATUS_PAGE_ACTION_HEIGHT = 44;
export const STATUS_PAGE_ACTION_HEIGHT_MOBILE = 48;

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
// the photos joined to a message or a report: large enough to tell a meeting point at a glance
export const IMAGE_ATTACHMENT_SIZE = 72;
export const IMAGE_ATTACHMENT_GAP = 8;
export const IMAGE_ATTACHMENT_RADIUS = 6;
/*
 * the two parties who are not the passenger get solid discs rather than the accent gradient: the
 * driver a slate one, support the navy of the sidebar it works from — so the three voices of the
 * thread can be told apart before any name is read
 */
export const NO_SHOW_DRIVER_AVATAR_COLOR = '#3A4759';
export const NO_SHOW_SUPPORT_AVATAR_COLOR = '#1A2332';

/*
 * THE PAYMENT PAGE — the two sides of a movement of money, and the chain it belongs to (passenger →
 * platform → driver). The steps of the chain share one row on a wide screen and are stacked on a
 * phone, so their padding stays small enough for three of them to sit side by side in the content
 * column.
 */
export const PAYMENT_PARTY_GAP = 12;
export const PAYMENT_PARTY_AVATAR_SIZE = 40;
export const PAYMENT_CYCLE_GAP = 12;
export const PAYMENT_CYCLE_STEP_GAP = 4;
export const PAYMENT_CYCLE_STEP_PADDING_Y = 12;
export const PAYMENT_CYCLE_STEP_PADDING_X = 14;
export const PAYMENT_CYCLE_ARROW_SIZE = 18;
export const PAYMENT_CYCLE_NOTE_GAP = 8;
export const PAYMENT_CYCLE_NOTE_ICON_SIZE = 15;

/*
 * THE DASHBOARD PLACEHOLDER — the content zone of the shell drawn before the guard has loaded the
 * admin: the page head with its action, a row of figure cards and a table card. On a phone only
 * two of the four figure cards stay, and the action leaves the head.
 */
export const DASHBOARD_SKELETON_KPI_COUNT = 4;
export const DASHBOARD_SKELETON_KPI_COUNT_MOBILE = 2;
export const DASHBOARD_SKELETON_KPI_GAP = 12;
export const DASHBOARD_SKELETON_KPI_GAP_WIDE = 16;
export const DASHBOARD_SKELETON_CARD_PADDING = 16;
export const DASHBOARD_SKELETON_CARD_GAP = 12;
export const DASHBOARD_SKELETON_TABLE_GAP = 14;
export const DASHBOARD_SKELETON_TABLE_ROW_COUNT = 5;
export const DASHBOARD_SKELETON_TABLE_ROW_COUNT_NARROW = 4;
export const DASHBOARD_SKELETON_ACTION_WIDTH = 130;
export const DASHBOARD_SKELETON_ACTION_HEIGHT = 44;
export const DASHBOARD_SKELETON_KPI_LABEL_HEIGHT = 10;
export const DASHBOARD_SKELETON_KPI_VALUE_HEIGHT = 26;
export const DASHBOARD_SKELETON_TABLE_TITLE_WIDTH = 160;
export const DASHBOARD_SKELETON_TABLE_TITLE_HEIGHT = 14;
export const DASHBOARD_SKELETON_TABLE_ROW_HEIGHT = 12;

/*
 * THE ABOUT PAGE
 * three short cards of label/value rows: past this width a label and its value drift so far apart
 * that the eye loses the row it is following
 */
export const ABOUT_MAX_WIDTH = 720;
// the round slot holding a card's glyph, and the glyph inside it
export const ABOUT_CARD_ICON_SLOT_SIZE = 36;
export const ABOUT_CARD_ICON_SIZE = 18;
export const ABOUT_CARD_HEAD_GAP = 12;
// a label stacked over its value (touch screens) keeps the two close enough to read as one row
export const ABOUT_ROW_STACK_GAP = 2;
export const ABOUT_ROW_MIN_HEIGHT_TOUCH = 48;
export const ABOUT_WEBSITE_BUTTON_ICON_SIZE = 16;
