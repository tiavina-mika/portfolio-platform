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

export const FONT_SIZE_PAGE_TITLE = 20;
export const FONT_SIZE_SCREEN_TITLE = 18;
export const FONT_SIZE_CARD_TITLE = 16;
export const FONT_SIZE_BODY = 14;
export const FONT_SIZE_META = 13;
export const FONT_SIZE_OVERLINE = 12;

export const LAYOUT_CONTENT_PADDING = 24;
export const SPACING = 16;
export const RESPONSIVE_BREAKPOINT = 'lg';
/*
 * MUI's default breakpoints plus the extra `2xl` — written out so building the theme does not need
 * a throwaway `createTheme()` call just to read the defaults
 */
export const THEME_BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
  '2xl': 1920,
} as const;
// below this breakpoint the app bar switches to its compact layout (icon-only search, logo instead of breadcrumb group)
export const APPBAR_COMPACT_BREAKPOINT = 'xl';
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
 * the vehicle line under the driver of a ride: a colour swatch, then the plate, year and seat
 * count as one sentence. It is a second fact about the same person, so it stands further from the
 * identity above it than the words inside it stand from one another
 */
export const RIDE_VEHICLE_LINE_GAP = 18;
export const RIDE_VEHICLE_COLOR_DOT_SIZE = 14;
// the two figures a driver wallet opens on: what it owes, and whether it can still pay out
export const WALLET_STAT_CARDS_COUNT = 2;
// what the driver wallet list opens on: the debt owed, how many drivers are suspended, how many owe
export const DRIVER_WALLETS_TOTALS_COUNT = 3;
// room for the phone column next to the name, the penalty and the status without squeezing them
export const DRIVER_WALLETS_TABLE_MIN_WIDTH = 1180;
// the "until <date>" line standing under a driver's suspended chip
export const DRIVER_WALLET_STATUS_GAP = 3;
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
 * THE RIGHTS PANEL — the entities listed on the left, the six rights of the chosen one on the right.
 * The list is a fixed column so a long translated detail never squeezes it, and it scrolls on its
 * own past this height instead of stretching the whole form.
 */
export const RIGHTS_LIST_WIDTH = 320;
export const RIGHTS_LIST_MAX_HEIGHT = 460;
export const RIGHTS_ROW_MIN_HEIGHT = 44;
export const RIGHTS_ACTIVE_BAR_WIDTH = 3;
export const RIGHTS_FILTER_WIDTH = 340;

/*
 * THE RIGHTS MATRIX — on a desktop the same rights are read as a grid: one row per resource, one
 * column per right. The resource column keeps its width so the six right columns share the rest,
 * and the grid scrolls sideways under its minimum instead of crushing the column headings.
 */
export const RIGHTS_MATRIX_RESOURCE_COLUMN_WIDTH = 260;
export const RIGHTS_MATRIX_RIGHT_COLUMN_MIN_WIDTH = 88;
export const RIGHTS_MATRIX_MIN_WIDTH = 760;
export const RIGHTS_MATRIX_ROW_INDENT = 40;
export const RIGHTS_MATRIX_CHECKBOX_SIZE = 18;
export const RIGHTS_MATRIX_LOCK_ICON_SIZE = 10;

// the sections summary of the role form: a fixed column beside the section being filled
export const ROLE_FORM_NAV_WIDTH = 300;

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
 * THE AUDIENCE METER — the bar drawn under an article's audience figures, showing how far its
 * views are along their goal. It is read, never touched: a hairline band the width of the card,
 * thin enough that the figure above it stays the thing the eye lands on first.
 */
export const AUDIENCE_METER_HEIGHT = 6;
export const AUDIENCE_METER_RADIUS = 3;

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
export const EXPORT_MENU_WIDTH = 320;

/*
 * the accent down the leading edge of a row nobody has opened yet, next to a soft tint of the same
 * colour (see getUnseenRowStyles). Narrow on purpose: it has to be readable at a glance down a
 * column of forty rows without becoming a border the eye reads as a table rule.
 */
export const UNSEEN_ROW_ACCENT_WIDTH = 3;

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
 * a placeholder standing in for a whole block a business domain registers on a core page (stats
 * card, activity charts, related records) while its lazily-loaded chunk arrives
 */
export const SKELETON_SECTION_HEIGHT = 240;
/*
 * the sidebar group titles, suffixed with the group's index: each group's list points at its own
 * title so a screen reader names the group before reading the rows under it
 */
export const SIDEBAR_GROUP_TITLE_ID = 'sidebar-group-title';
/*
 * the sidebar placeholder follows the shape of the real menu: a first run of entries, then one
 * titled group after another. A title is drawn as a short bar of the width a real one takes.
 */
export const SIDEBAR_SKELETON_SECTIONS: readonly { titleWidth?: number; itemCount: number }[] = [
  { itemCount: 3 },
  { titleWidth: 84, itemCount: 3 },
  { titleWidth: 72, itemCount: 1 },
  { titleWidth: 70, itemCount: 1 },
  { titleWidth: 96, itemCount: 1 },
];
export const SIDEBAR_SKELETON_TITLE_HEIGHT = 8;
export const SIDEBAR_SKELETON_TITLE_MARGIN_TOP = 12;
export const SIDEBAR_SKELETON_TITLE_MARGIN_BOTTOM = 2;
export const SIDEBAR_SKELETON_TITLE_INDENT = 6;
export const SIDEBAR_SKELETON_ITEM_HEIGHT = 32;
export const SIDEBAR_SKELETON_LOGO_WIDTH = 110;
export const SIDEBAR_SKELETON_LOGO_HEIGHT = 24;

/*
 * the dashboard shell placeholder only shows once the guard has taken longer than this, and then
 * stays at least the min time — a fast navigation never flashes it, a slow one never flickers it
 */
export const ROUTE_PENDING_MS = 150;
export const ROUTE_PENDING_MIN_MS = 300;
// the state of the paper on show, standing in the header beside the way out of the panel
export const DIALOG_HEAD_RIGHT_GAP = 10;
// the arrow between the two points of a booking's route, sized to the chip's caption, not to an icon slot
export const REQUEST_ROUTE_CHIP_GAP = 6;
export const REQUEST_ROUTE_CHIP_ARROW_SIZE = 13;
/*
 * THE AUTH SCREENS — the sign-in and sign-up pages are a two-column split (a navy brand panel and
 * the form on the surface), every other public page is a logo above a 500px card. The brand panel
 * stays navy in both themes: it is the one place the product states its identity, so it does not
 * follow the light/dark switch, and the text on it is white-on-navy whatever the mode.
 */
export const AUTH_BRAND_TEXT_COLOR = '#d5dbe5';
// share of the viewport the brand panel takes next to the form (760 of the 1440 reference frame)
export const AUTH_BRAND_PANEL_WIDTH = '52.8%';
export const AUTH_BRAND_PANEL_PADDING = '64px 96px';
export const AUTH_BRAND_PANEL_PADDING_COMPACT = '24px 24px 28px';
export const AUTH_BRAND_LOGO_HEIGHT = 40;
export const AUTH_BRAND_LOGO_MARGIN_BOTTOM = 120;
export const AUTH_BRAND_TITLE_FONT_SIZE = 60;
export const AUTH_BRAND_TITLE_FONT_SIZE_TABLET = 40;
export const AUTH_BRAND_TITLE_FONT_SIZE_MOBILE = 28;
export const AUTH_BRAND_DESCRIPTION_FONT_SIZE = 18;
export const AUTH_FORM_PANEL_PADDING = '224px 96px 50px';
export const AUTH_FORM_PANEL_PADDING_TABLET = '48px 117px';
export const AUTH_FORM_PANEL_PADDING_MOBILE = '28px 24px 40px';
export const AUTH_FORM_MAX_WIDTH = 440;
export const AUTH_FORM_TITLE_FONT_SIZE = 28;
export const AUTH_FORM_TITLE_MARGIN_BOTTOM = 32;
// the card pages: logo above, a fixed-width card, the heading centred inside it
export const AUTH_CARD_WIDTH = 500;
export const AUTH_CARD_LOGO_HEIGHT = 40;
export const AUTH_CARD_LOGO_MARGIN_BOTTOM = 40;
export const AUTH_CARD_TOP_PADDING = 72;
export const AUTH_CARD_BODY_PADDING = 24;
export const AUTH_HEADING_FONT_SIZE = 28;
export const AUTH_HEADING_FONT_SIZE_MOBILE = 24;
export const AUTH_HEADING_DESCRIPTION_FONT_SIZE = 15;
// the one-time-code cells
export const AUTH_OTP_CELL_SIZE = 52;
export const AUTH_OTP_CELL_SIZE_MOBILE = 44;
export const AUTH_OTP_CELL_GAP = 12;
export const AUTH_OTP_CELL_GAP_MOBILE = 8;
export const AUTH_OTP_CELL_FONT_SIZE = 20;
// the three-step strip of the password reset (email, code, new password)
export const AUTH_STEP_DOT_SIZE = 24;
export const AUTH_STEP_LINE_HEIGHT = 2;
export const AUTH_STEP_LINE_MIN_WIDTH = 8;
export const AUTH_SUCCESS_ICON_SIZE = 40;
export const AUTH_SUCCESS_TITLE_FONT_SIZE = 20;
export const AUTH_SUCCESS_TEXT_FONT_SIZE = 16;

/*
 * the app bar placeholder: the same slots the real bar fills (menu button, brand on narrow
 * screens, breadcrumb and search on wide ones, an extra action, the avatar)
 */
export const APP_BAR_SKELETON_GAP = 16;
export const APP_BAR_SKELETON_PADDING_X = 20;
export const APP_BAR_SKELETON_PADDING_X_MOBILE = 12;
export const APP_BAR_SKELETON_ICON_WIDTH = 34;
export const APP_BAR_SKELETON_ICON_HEIGHT = 36;
export const APP_BAR_SKELETON_AVATAR_SIZE = 32;
export const APP_BAR_SKELETON_BRAND_WIDTH = 96;
export const APP_BAR_SKELETON_BRAND_WIDTH_MOBILE = 84;
export const APP_BAR_SKELETON_BRAND_HEIGHT = 24;
export const APP_BAR_SKELETON_CRUMB_WIDTH = 150;
export const APP_BAR_SKELETON_CRUMB_HEIGHT = 12;
export const APP_BAR_SKELETON_SEARCH_WIDTH = 240;
export const APP_BAR_SKELETON_SEARCH_HEIGHT = 44;
