import {
  Box, Card, CardContent, CardHeader, Skeleton, Tooltip, Typography,
} from '@mui/material';
import {
  Fragment, ReactNode, useEffect, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronsLeft, FiChevronUp } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import type { Theme } from '@mui/material/styles';

import { PreviewFullLayoutIcon, PreviewSidebarLayoutIcon } from '@/components/icons/PreviewLayoutIcons';
import { NOTIFICATION_BADGE_MAX } from '@/constants/_core/app.constants';
import {
  CONTENT_GAP, PREVIEW_ICON_STROKE_WIDTH, PREVIEW_COMPACT_CHIP_GAP, PREVIEW_COMPACT_CHIP_PADDING_X,
  PREVIEW_COMPACT_FRAME_PADDING_Y, PREVIEW_COMPACT_GROUP_INNER_GAP,
  PREVIEW_COMPACT_HEAD_CHEVRON_SIZE, PREVIEW_COMPACT_HEAD_FRAME_PADDING_TOP,
  PREVIEW_COMPACT_HEAD_GAP, PREVIEW_COMPACT_HEAD_PADDING_LEFT, PREVIEW_COMPACT_HEAD_PADDING_RIGHT,
  PREVIEW_COMPACT_NAV_GAP, PREVIEW_COMPACT_NAV_PADDING_X,
  PREVIEW_LAYOUT_BUTTON_SIZE, PREVIEW_LAYOUT_TRACK_GAP, PREVIEW_LAYOUT_TRACK_PADDING,
  PREVIEW_SECTIONS_GAP, PREVIEW_SUMMARY_BADGE_PADDING_X, PREVIEW_SUMMARY_BADGE_RADIUS,
  PREVIEW_SUMMARY_BADGE_SIZE, PREVIEW_SUMMARY_BREAKPOINT, PREVIEW_SUMMARY_CHEVRON_SIZE,
  PREVIEW_SUMMARY_DIVIDER_MARGIN_Y,
  PREVIEW_SUMMARY_GAP, PREVIEW_SUMMARY_GROUP_GAP, PREVIEW_SUMMARY_GROUP_PADDING,
  PREVIEW_SUMMARY_GROUP_TITLE_GAP, PREVIEW_SUMMARY_GROUP_TITLE_MIN_HEIGHT,
  PREVIEW_SUMMARY_GROUP_TITLE_PADDING_X, PREVIEW_SUMMARY_GROUP_TITLE_PADDING_Y,
  PREVIEW_SUMMARY_HEAD_CARD_PADDING, PREVIEW_SUMMARY_HEAD_FONT_SIZE, PREVIEW_SUMMARY_HEAD_GAP,
  PREVIEW_SUMMARY_HEAD_HEIGHT, PREVIEW_SUMMARY_HEAD_ICON_SIZE, PREVIEW_SUMMARY_HEAD_PADDING_X,
  PREVIEW_SUMMARY_ITEM_CONTENT_GAP,
  PREVIEW_SUMMARY_ITEM_GAP, PREVIEW_SUMMARY_ITEM_ICON_SIZE, PREVIEW_SUMMARY_ITEM_MIN_HEIGHT,
  PREVIEW_SUMMARY_ITEM_PADDING_X, PREVIEW_SECTION_COUNT_GAP, PREVIEW_SECTION_TITLE_GAP,
  PREVIEW_SUMMARY_ITEM_PADDING_Y, PREVIEW_SUMMARY_MINI_BADGE_BORDER,
  PREVIEW_SUMMARY_MINI_BADGE_FONT_SIZE, PREVIEW_SUMMARY_MINI_BADGE_OFFSET_X,
  PREVIEW_SUMMARY_MINI_BADGE_OFFSET_Y, PREVIEW_SUMMARY_MINI_BADGE_PADDING_X,
  PREVIEW_SUMMARY_MINI_BADGE_RADIUS, PREVIEW_SUMMARY_MINI_BADGE_SIZE, PREVIEW_SUMMARY_PADDING,
  PREVIEW_SUMMARY_REDUCED_ITEM_PADDING_Y, PREVIEW_SUMMARY_REDUCED_WIDTH, PREVIEW_SUMMARY_WIDTH,
  PREVIEW_TOOLBAR_GAP, PREVIEW_SUMMARY_SUBITEMS_INDENT, PREVIEW_GROUP_HEADING_GAP,
  PREVIEW_SECTION_SCROLL_MARGIN_TOP, PREVIEW_SECTION_SKELETON_LINES, PREVIEW_SECTION_SKELETON_LINE_HEIGHT,
  PREVIEW_SECTION_SKELETON_LAST_LINE_WIDTH, PREVIEW_SECTION_SKELETON_GAP,
} from '@/constants/_core/ui/page.constants';
import {
  BADGE_FONT_SIZE, BUTTON_TOUCH_HEIGHT, FONT_SIZE_BODY, RADIUS, RADIUS_LG, RADIUS_SM,
} from '@/constants/_core/ui/ui.constants';
import { useBreakpoint } from '@/hooks/_core/useBreakpoint';
import {
  changeIsPreviewSummaryReducedSlice, changePreviewLayoutSlice,
  getSettingsIsPreviewSummaryReducedSelector, getSettingsPreviewLayoutSelector,
} from '@/redux/reducers/_core/settings.reducer';
import { IPreviewGroup, IPreviewSection } from '@/types/_core/app.type';
import { PreviewLayout } from '@/types/_core/setting.type';
import {
  getDesignTokens, getSoftTintedBackground, getTintedBackground,
} from '@/utils/_core/theme/tokens.utils';

import IconPopover from '../IconPopover';
import SectionLoadError from '../SectionLoadError';

const classes = {
  /*
   * the band above and the row under it are two bands of the content column, spaced by its own
   * gap: the page drops them both into `Layout`, which only spaces what it holds directly
   */
  page: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${CONTENT_GAP}px`,
  },
  row: {
    display: 'flex',
    // the summary stands at the top of the row, it does not stretch to the height of the section
    alignItems: 'flex-start',
    gap: `${PREVIEW_SUMMARY_GAP}px`,
    width: '100%',
  },
  /*
   * the band above the row: whatever lens the page states itself through on the left, and the
   * switch choosing how it is laid out pinned to the far end — the switch acts on the whole page
   * rather than on the band, so it stands apart from it rather than next to it
   */
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: `${PREVIEW_TOOLBAR_GAP}px`,
    width: '100%',
  },
  // the header keeps the width it had before the switch was put beside it, minus the switch itself
  toolbarHeader: {
    flex: 1,
    minWidth: 0,
  },
  layoutTrack: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      flexShrink: 0,
      display: 'inline-flex',
      gap: `${PREVIEW_LAYOUT_TRACK_GAP}px`,
      padding: PREVIEW_LAYOUT_TRACK_PADDING,
      backgroundColor: tokens.surfaceSecondary,
      border: `1px solid ${tokens.border}`,
      borderRadius: RADIUS_LG,
    };
  },
  // the same three signals the summary entries use, on a slot holding a glyph instead of a name
  layoutButton: (active: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: PREVIEW_LAYOUT_BUTTON_SIZE,
      height: PREVIEW_LAYOUT_BUTTON_SIZE,
      padding: 0,
      border: 'none',
      borderRadius: RADIUS_SM,
      cursor: 'pointer',
      ...(active
        ? {
          color: theme.palette.primary.dark,
          backgroundColor: tokens.surface,
          boxShadow: tokens.shadow,
        }
        : {
          color: tokens.textMuted,
          backgroundColor: 'transparent',
          '&:hover': { backgroundColor: tokens.tabHover },
        }),
    };
  },
  // the pill track turned upright: a recessed rail holding the names of what the page carries
  summary: (reduced: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      width: reduced
        ? PREVIEW_SUMMARY_REDUCED_WIDTH
        : PREVIEW_SUMMARY_WIDTH,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'stretch',
      gap: `${PREVIEW_SUMMARY_ITEM_GAP}px`,
      padding: PREVIEW_SUMMARY_PADDING,
      backgroundColor: tokens.surfaceSecondary,
      border: `1px solid ${tokens.border}`,
      borderRadius: RADIUS,
    };
  },
  // the same rail, its single recessed track replaced by a stack of the clusters it groups into
  summaryGrouped: (reduced: boolean) => ({
    width: reduced
      ? PREVIEW_SUMMARY_REDUCED_WIDTH
      : PREVIEW_SUMMARY_WIDTH,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${PREVIEW_SUMMARY_GROUP_GAP}px`,
  }),
  /*
   * the row opening the rail: its name, and at the far end the glyph putting the names away. It is
   * drawn a step below the entries it stands over — the caption size, the muted tone — because it
   * is the one row of the rail that opens no block. Grouped, it gets a card of its own: it acts on
   * the whole rail, not on the first cluster of it.
   */
  summaryHead: (reduced: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: reduced
        ? 'center'
        : 'flex-start',
      gap: `${PREVIEW_SUMMARY_HEAD_GAP}px`,
      width: '100%',
      height: PREVIEW_SUMMARY_HEAD_HEIGHT,
      padding: reduced
        ? 0
        : `0 ${PREVIEW_SUMMARY_HEAD_PADDING_X}px`,
      font: 'inherit',
      fontSize: PREVIEW_SUMMARY_HEAD_FONT_SIZE,
      fontWeight: theme.typography.fontWeightMedium,
      textAlign: 'left' as const,
      color: tokens.textSecondary,
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: RADIUS,
      cursor: 'pointer',
      '&:hover': { color: tokens.text, backgroundColor: tokens.surfaceSecondary },
    };
  },
  summaryHeadCard: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      padding: PREVIEW_SUMMARY_HEAD_CARD_PADDING,
      backgroundColor: tokens.surface,
      border: `1px solid ${tokens.border}`,
      borderRadius: RADIUS_LG,
      boxShadow: tokens.shadow,
    };
  },
  /*
   * the filet closing the head row: it names the rail, the entries under it are what the rail
   * holds, and without a rule between the two the head reads as a first entry that opens nothing.
   * It is pulled back out to the rail's own inset so it runs from edge to edge of the recessed
   * column rather than stopping under the word. Grouped, the head already stands in a card of its
   * own and the clusters under it in theirs — there is nothing left for a rule to separate.
   */
  summaryDivider: (theme: Theme) => ({
    height: 1,
    margin: `${PREVIEW_SUMMARY_DIVIDER_MARGIN_Y}px -${PREVIEW_SUMMARY_PADDING}px`,
    backgroundColor: getDesignTokens(theme).border,
  }),
  /*
   * the head's own glyph: a double chevron closing the row rather than a menu mark opening it —
   * it points at the edge the rail is about to fold against, and turns over once it has. Reduced,
   * there is no name left for it to be pushed away from, so it stops being pinned to the end and
   * takes the middle of the row the entries under it take.
   */
  summaryHeadChevron: (reduced: boolean) => (theme: Theme) => ({
    display: 'inline-flex',
    flexShrink: 0,
    marginLeft: reduced
      ? 0
      : 'auto',
    transform: reduced
      ? 'rotate(180deg)'
      : 'none',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
    '& svg': {
      width: PREVIEW_SUMMARY_HEAD_ICON_SIZE,
      height: PREVIEW_SUMMARY_HEAD_ICON_SIZE,
      strokeWidth: PREVIEW_ICON_STROKE_WIDTH,
    },
  }),
  /*
   * one cluster: a card of its own, so it reads as a bordered block among the others rather than
   * as a run-on of the rail — the marked entry inside it is toned down for exactly that reason
   */
  summaryGroup: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: `${PREVIEW_SUMMARY_ITEM_GAP}px`,
      padding: PREVIEW_SUMMARY_GROUP_PADDING,
      backgroundColor: tokens.surface,
      border: `1px solid ${tokens.border}`,
      borderRadius: RADIUS_LG,
      boxShadow: tokens.shadow,
    };
  },
  /*
   * the cluster's name is also what folds it away, so it is a control rather than a heading: it
   * takes the hover ground every other row of the rail takes, and carries the chevron at its end
   */
  summaryGroupTitle: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'flex',
      alignItems: 'center',
      gap: `${PREVIEW_SUMMARY_GROUP_TITLE_GAP}px`,
      width: '100%',
      minHeight: PREVIEW_SUMMARY_GROUP_TITLE_MIN_HEIGHT,
      padding: `${PREVIEW_SUMMARY_GROUP_TITLE_PADDING_Y}px ${PREVIEW_SUMMARY_GROUP_TITLE_PADDING_X}px`,
      font: 'inherit',
      fontSize: BADGE_FONT_SIZE,
      fontWeight: 600,
      letterSpacing: 0.4,
      textTransform: 'uppercase' as const,
      textAlign: 'left' as const,
      color: tokens.text,
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: RADIUS_SM,
      cursor: 'pointer',
      '&:hover': { backgroundColor: tokens.surfaceSecondary },
    };
  },
  // the disc the reduced rail pins over a glyph needs a box to be pinned inside of
  summaryItemWrap: {
    position: 'relative' as const,
  },
  /*
   * the marked entry is raised back onto the card surface — the same three signals the pill tabs
   * use to say which slot is open: the primary tone, one weight up, and the surface under it. A
   * cluster of the grouped rail already stands on that same surface, with its own shadow, so its
   * own marked entry only needs the primary tone, at a soft tint instead of a second white layer.
   */
  summaryItem: (active: boolean, grouped: boolean, reduced: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: reduced
        ? 'center'
        : 'flex-start',
      gap: `${PREVIEW_SUMMARY_ITEM_CONTENT_GAP}px`,
      width: '100%',
      minHeight: PREVIEW_SUMMARY_ITEM_MIN_HEIGHT,
      padding: reduced
        ? `${PREVIEW_SUMMARY_REDUCED_ITEM_PADDING_Y}px 0`
        : `${PREVIEW_SUMMARY_ITEM_PADDING_Y}px ${PREVIEW_SUMMARY_ITEM_PADDING_X}px`,
      font: 'inherit',
      fontSize: FONT_SIZE_BODY,
      textAlign: 'left' as const,
      border: 'none',
      borderRadius: RADIUS_SM,
      cursor: 'pointer',
      ...(active
        ? {
          fontWeight: theme.typography.fontWeightMedium,
          color: theme.palette.primary.dark,
          backgroundColor: grouped
            ? getSoftTintedBackground(theme, theme.palette.primary.main)
            : tokens.surface,
          boxShadow: grouped
            ? 'none'
            : tokens.shadow,
        }
        : {
          color: tokens.textSecondary,
          backgroundColor: 'transparent',
          '&:hover': { backgroundColor: tokens.tabHover },
        }),
    };
  },
  /*
   * the page hands its own glyphs in, from whichever set it already draws from, so the rail states
   * the one size and the one stroke the design draws them all at rather than trusting the caller
   */
  summaryItemIcon: {
    display: 'inline-flex',
    flexShrink: 0,
    '& svg': {
      width: PREVIEW_SUMMARY_ITEM_ICON_SIZE,
      height: PREVIEW_SUMMARY_ITEM_ICON_SIZE,
      strokeWidth: PREVIEW_ICON_STROKE_WIDTH,
    },
  },
  // the name takes whatever the badge after it leaves, and is cut rather than wrapped onto a line
  summaryItemLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  /*
   * the same figure the block's own header prints, read again where the block is still closed —
   * a small solid circle rather than a tinted pill, so it survives at 20px however loud the tone
   * of the surface underneath is (the marked entry's own primary tint among them). It closes the
   * row it sits in, except on a cluster's name, where the chevron is what closes the row instead.
   */
  summaryBadge: (alert: boolean, atEnd: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'inline-flex',
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: PREVIEW_SUMMARY_BADGE_SIZE,
      height: PREVIEW_SUMMARY_BADGE_SIZE,
      marginLeft: atEnd
        ? 'auto'
        : 0,
      padding: `0 ${PREVIEW_SUMMARY_BADGE_PADDING_X}px`,
      fontSize: BADGE_FONT_SIZE,
      fontWeight: theme.typography.fontWeightBold,
      lineHeight: 1,
      borderRadius: PREVIEW_SUMMARY_BADGE_RADIUS,
      ...(alert
        ? { color: theme.palette.error.contrastText, backgroundColor: theme.palette.error.main }
        : { color: tokens.textSecondary, backgroundColor: tokens.border }),
    };
  },
  // the open cluster whose blocks are listed under it: the tone says the reader is inside it
  summaryParentActive: (theme: Theme) => ({
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.primary.dark,
  }),
  summaryBadgeSkeleton: {
    flexShrink: 0,
    width: PREVIEW_SUMMARY_BADGE_SIZE,
    height: PREVIEW_SUMMARY_BADGE_SIZE,
    marginLeft: 'auto',
  },
  /*
   * the figure an entry keeps once its name is gone: a disc pinned over the glyph, ringed in the
   * rail's own ground so it reads as sitting above the icon rather than as a part of it drawn in
   */
  miniBadge: (alert: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'inline-flex',
      position: 'absolute' as const,
      left: `calc(50% + ${PREVIEW_SUMMARY_MINI_BADGE_OFFSET_X}px)`,
      top: PREVIEW_SUMMARY_MINI_BADGE_OFFSET_Y,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: PREVIEW_SUMMARY_MINI_BADGE_SIZE,
      height: PREVIEW_SUMMARY_MINI_BADGE_SIZE,
      padding: `0 ${PREVIEW_SUMMARY_MINI_BADGE_PADDING_X}px`,
      fontSize: PREVIEW_SUMMARY_MINI_BADGE_FONT_SIZE,
      fontWeight: theme.typography.fontWeightBold,
      lineHeight: 1,
      borderRadius: PREVIEW_SUMMARY_MINI_BADGE_RADIUS,
      border: `${PREVIEW_SUMMARY_MINI_BADGE_BORDER}px solid ${tokens.surfaceSecondary}`,
      // the disc sits over the control, not in front of it: the click belongs to the entry under it
      pointerEvents: 'none' as const,
      ...(alert
        ? { color: theme.palette.error.contrastText, backgroundColor: theme.palette.error.main }
        : { color: tokens.textSecondary, backgroundColor: tokens.border }),
    };
  },
  // one glyph for both disclosures: open points up, and folding it away turns it over
  chevron: (folded: boolean, size: number) => (theme: Theme) => ({
    display: 'inline-flex',
    flexShrink: 0,
    marginLeft: 'auto',
    color: getDesignTokens(theme).textSecondary,
    transform: folded
      ? 'rotate(180deg)'
      : 'none',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
    '& svg': { width: size, height: size, strokeWidth: PREVIEW_ICON_STROKE_WIDTH },
  }),
  /*
   * the rail turned on its side below the summary's own breakpoint: a bordered frame standing where
   * the vertical rail would, holding a row of chips that scrolls sideways instead of a column that
   * scrolls down — the frame carries the border and the vertical inset, the nav inside it the
   * horizontal one and the scroll, so the chips' own touch target reaches the frame's edge
   */
  compactFrame: (folded: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);
    // the frame opens on its own head, which carries less air above it than a row of chips does
    const paddingBottom = folded
      ? PREVIEW_COMPACT_HEAD_FRAME_PADDING_TOP
      : PREVIEW_COMPACT_FRAME_PADDING_Y;

    return {
      width: '100%',
      padding: `${PREVIEW_COMPACT_HEAD_FRAME_PADDING_TOP}px 0 ${paddingBottom}px`,
      backgroundColor: tokens.surface,
      border: `1px solid ${tokens.border}`,
      borderRadius: RADIUS_LG,
    };
  },
  // the row the strip opens on: what the strip is, and the control folding it out of the way
  compactHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${PREVIEW_COMPACT_HEAD_GAP}px`,
    padding:
      `0 ${PREVIEW_COMPACT_HEAD_PADDING_RIGHT}px 0 ` +
      `${PREVIEW_COMPACT_HEAD_PADDING_LEFT}px`,
  },
  compactHeadTitle: (theme: Theme) => ({
    fontSize: BADGE_FONT_SIZE,
    fontWeight: 600,
    letterSpacing: 0.4,
    textTransform: 'uppercase' as const,
    whiteSpace: 'nowrap' as const,
    color: getDesignTokens(theme).textSecondary,
  }),
  compactHeadToggle: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'inline-flex',
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
      width: BUTTON_TOUCH_HEIGHT,
      height: BUTTON_TOUCH_HEIGHT,
      padding: 0,
      color: tokens.textSecondary,
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: RADIUS,
      cursor: 'pointer',
      '&:hover': { color: tokens.text, backgroundColor: tokens.surfaceSecondary },
    };
  },
  /*
   * ungrouped, the strip is the row of chips it looks like and scrolls sideways; grouped, a row of
   * clusters would put every cluster but the first off-screen and make the reader scroll past the
   * chips of one to reach the name of the next — so the clusters stack instead, each one opening
   * on its own name with its chips listed under it, and nothing is left hidden sideways
   */
  compactNav: (grouped: boolean) => ({
    display: 'flex',
    ...(grouped
      ? {
        flexDirection: 'column' as const,
        alignItems: 'stretch',
        gap: `${PREVIEW_SUMMARY_GROUP_GAP}px`,
        overflowX: 'visible' as const,
      }
      : {
        alignItems: 'center',
        gap: `${PREVIEW_COMPACT_NAV_GAP}px`,
        overflowX: 'auto' as const,
        scrollbarWidth: 'none' as const,
        '&::-webkit-scrollbar': { display: 'none' },
      }),
    padding: `0 ${PREVIEW_COMPACT_NAV_PADDING_X}px`,
  }),
  // the rail's own cluster card, recessed rather than raised: the frame around it already is one
  compactGroup: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'stretch',
      gap: `${PREVIEW_COMPACT_GROUP_INNER_GAP}px`,
      flexShrink: 0,
      padding: PREVIEW_SUMMARY_GROUP_PADDING,
      backgroundColor: tokens.surfaceSecondary,
      border: `1px solid ${tokens.border}`,
      borderRadius: RADIUS_LG,
    };
  },
  // the cluster's name stands on a row of its own, sized like the rail's own group title
  compactGroupTitle: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    minHeight: PREVIEW_SUMMARY_GROUP_TITLE_MIN_HEIGHT,
    padding: `0 ${PREVIEW_SUMMARY_GROUP_TITLE_PADDING_X}px`,
    fontSize: BADGE_FONT_SIZE,
    fontWeight: 600,
    letterSpacing: 0.4,
    whiteSpace: 'nowrap' as const,
    textTransform: 'uppercase' as const,
    color: getDesignTokens(theme).text,
  }),
  // stacked in a cluster the chip is a rail entry: its name starts the row, its figure ends it
  compactChip: (active: boolean, grouped: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: grouped
        ? 'flex-start'
        : 'center',
      gap: `${PREVIEW_COMPACT_CHIP_GAP}px`,
      flexShrink: 0,
      minHeight: BUTTON_TOUCH_HEIGHT,
      padding: `0 ${grouped ? PREVIEW_SUMMARY_ITEM_PADDING_X : PREVIEW_COMPACT_CHIP_PADDING_X}px`,
      font: 'inherit',
      fontSize: FONT_SIZE_BODY,
      whiteSpace: 'nowrap' as const,
      border: 'none',
      borderRadius: RADIUS,
      cursor: 'pointer',
      ...(active
        ? {
          fontWeight: theme.typography.fontWeightMedium,
          color: theme.palette.primary.dark,
          backgroundColor: getTintedBackground(theme, theme.palette.primary.main),
        }
        : { color: tokens.textSecondary, backgroundColor: 'transparent' }),
    };
  },
  /*
   * the hint sits on the title's own line, after the words it explains — the header is a toolbar
   * row, so a block dropped into it would push the title off its baseline
   */
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: `${PREVIEW_SECTION_TITLE_GAP}px`,
  },
  /*
   * the row count trails the name in the muted tone and one weight down: it qualifies the block
   * rather than being part of what it is called
   */
  cardCount: (theme: Theme) => ({
    marginLeft: `${PREVIEW_SECTION_COUNT_GAP - PREVIEW_SECTION_TITLE_GAP}px`,
    fontWeight: theme.typography.fontWeightRegular,
    color: getDesignTokens(theme).textMuted,
  }),
  // the fact trailing the name: read with it, one weight down, in the muted tone
  cardSubtitle: (theme: Theme) => ({
    marginLeft: `${PREVIEW_SECTION_COUNT_GAP - PREVIEW_SECTION_TITLE_GAP}px`,
    fontWeight: theme.typography.fontWeightRegular,
    color: getDesignTokens(theme).textMuted,
  }),
  // a block the rail jumps to lands a little under the top of the page rather than flush against it
  sectionAnchor: {
    scrollMarginTop: PREVIEW_SECTION_SCROLL_MARGIN_TOP,
  },
  skeleton: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${PREVIEW_SECTION_SKELETON_GAP}px`,
  },
  /*
   * the blocks of a cluster that lists them hang under its name, stepped in: they are the parts of
   * the entry above them, not entries of the rail in their own right
   */
  summarySubItems: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${PREVIEW_SUMMARY_ITEM_GAP}px`,
    paddingLeft: PREVIEW_SUMMARY_SUBITEMS_INDENT,
  },
  // the whole record stacked: each cluster opens on its own name, over the blocks it holds
  groupPage: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${PREVIEW_SECTIONS_GAP}px`,
  },
  groupHeading: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    gap: `${PREVIEW_GROUP_HEADING_GAP}px`,
    color: getDesignTokens(theme).textSecondary,
    '& svg': {
      width: PREVIEW_SUMMARY_ITEM_ICON_SIZE,
      height: PREVIEW_SUMMARY_ITEM_ICON_SIZE,
      strokeWidth: PREVIEW_ICON_STROKE_WIDTH,
    },
  }),
  sections: {
    flex: 1,
    // without it a wide table inside a section pushes the summary off the row instead of scrolling
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${PREVIEW_SECTIONS_GAP}px`,
  },
};

// what a summary pill is drawn from, on a block's entry or on a cluster's
type BadgeSource = Pick<IPreviewSection, 'count' | 'alertBadge' | 'countLoading'>;

// one cluster of a record read by pages, with the blocks it holds for this record
type PreviewPage = IPreviewGroup & { sections: IPreviewSection[] };

type Props = {
  sections: IPreviewSection[];
  /*
   * the band standing above the summary: the strip switching which lens the page is read through
   * (the languages of a translated entity, the sub-pages of an account), or a banner stating
   * something true of the whole entity before any of its blocks are read
   */
  header?: ReactNode;
  /*
   * a block standing between the toolbar and the row, whatever the layout and whichever section is
   * open: it tells something about the whole entity (the course a ride followed) that the summary
   * is not there to navigate to, so it is not one of the sections
   */
  overview?: ReactNode;
  className?: string;
  /*
   * reads the record by pages rather than by blocks: the rail names these clusters (each section
   * joining the one its `group` names by key), opening one draws every block it holds, and the
   * whole record stacked opens each cluster on its own name
   */
  groups?: IPreviewGroup[];
};

/**
 * The body of a detail page: the blocks it holds, and the summary naming them. Only the marked
 * block is rendered — unless the page holds a single block, where the summary would name a column
 * of one and it is shown on its own instead.
 *
 * At desktop width the reader also gets to say whether they want the summary at all: the pair of
 * glyphs at the end of the header band drops the rail and stacks every block instead, for reading
 * a record end to end rather than going after one fact in it. The choice is a kept preference, so
 * it holds across pages and across sessions. Under the summary's own breakpoint that choice isn't
 * offered — the rail becomes a horizontal strip of chips instead of a column, and stays the way to
 * reach any block that isn't the one currently open rather than disappearing into a long stack.
 * That strip opens on a head of its own, folding back to it once a chip has been used: the block
 * underneath already takes the whole screen, and the strip that led to it is in the way of its top.
 *
 * A page whose block list has grown long enough that a flat column of names stops reading as one
 * list can set `group` on its sections: the rail (or its compact strip) then clusters them under
 * the name each one shares instead of listing them flat, and each cluster can be folded away by
 * the name that heads it.
 *
 * The rail itself folds too, down to the column of glyphs the app's own sidebar collapses to — the
 * reader working inside one block gets the width back without losing the way out of it. That also
 * is a kept preference. It is only offered to a page whose blocks all carry an `icon`: with no
 * glyph there is nothing left to tell one entry from another once the names are gone.
 *
 * A record with a few dozen blocks is read by pages instead (`groups`): the rail names the clusters,
 * and opening one draws every block it holds rather than one of them. A cluster too long for a screen
 * also lists its blocks under its name, and picking one of those scrolls to it inside its page.
 *
 * Each block can also be on its way or have failed on its own (`status`) — the page stays readable
 * while one list of it is still loading or is read again after a failure.
 */
const PreviewSections = ({
  sections, header, overview, className, groups,
}: Props) => {
  const {
    t,
  } = useTranslation();
  const dispatch = useDispatch();
  const isSmallScreen = useBreakpoint(PREVIEW_SUMMARY_BREAKPOINT);
  const layout = useSelector(getSettingsPreviewLayoutSelector);
  const isReduced = useSelector(getSettingsIsPreviewSummaryReducedSelector);
  const [activeId, setActiveId] = useState<string>('');
  /*
   * which clusters the reader has put away, and whether the compact strip is folded: both are
   * about the page in front of them rather than about how they read every record, so neither is
   * kept the way the rail's own width is
   */
  const [foldedGroups, setFoldedGroups] = useState<Record<string, boolean>>({});
  const [isCompactFolded, setIsCompactFolded] = useState(false);
  /*
   * the block a listed entry of a cluster asked for: it is only on screen once its cluster is drawn,
   * so the scroll waits for the render that draws it
   */
  const [scrollTargetId, setScrollTargetId] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!scrollTargetId) return;

    sectionRefs.current[scrollTargetId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setScrollTargetId(null);
  }, [scrollTargetId]);

  const visibleSections = sections.filter((section) => !section.hide);

  if (!visibleSections.length) return null;

  const hasMultipleSections = visibleSections.length > 1;
  /*
   * offered wherever the summary could stand, not only where it currently does: a switch that
   * disappeared the moment it was used to hide the rail would leave no way back to it
   */
  const canChooseLayout = !isSmallScreen && hasMultipleSections;
  const hasSidebarSummary = canChooseLayout && layout === 'sidebar';
  // below the breakpoint the rail is never dropped — it turns into the compact strip instead
  const hasCompactSummary = isSmallScreen && hasMultipleSections;
  const hasSummary = hasSidebarSummary || hasCompactSummary;
  /*
   * derived rather than kept in sync: a section can disappear between two renders (a block that
   * only exists while an entity is deleted), and the summary then has to fall back to its first
   * entry instead of marking one the page no longer draws
   */
  const activeSection = visibleSections.find((section) => section.id === activeId) ??
    visibleSections[0];

  const hasGroups = visibleSections.some((section) => section.group);
  /*
   * clustered in the order each group's name first appears, not alphabetically: the page states
   * its sections in the order it wants them read, and the groups have to keep that order too. A
   * section without a `group` still gets one of these buckets, keyed by an empty name, so a page
   * that only groups part of its list doesn't lose the rest of it.
   */
  const groupedSections = hasGroups
    ? visibleSections.reduce<{ key: string; sections: IPreviewSection[] }[]>((clusters, section) => {
      const key = section.group ?? '';
      const group = clusters.find((g) => g.key === key);

      if (group) group.sections.push(section);
      else clusters.push({ key, sections: [section] });

      return clusters;
    }, [])
    : [];

  /*
   * read by pages: the clusters in the order the page states them, each holding its visible blocks —
   * a cluster left with none (every block of it hidden for this record) is not named at all
   */
  const pages: PreviewPage[] = (groups ?? [])
    .map((group) => ({
      ...group,
      sections: visibleSections.filter((section) => section.group === group.key),
    }))
    .filter((page) => page.sections.length > 0);
  const activePage = pages.find((page) => page.sections.some((section) => section.id === activeSection.id)) ??
    pages[0];

  /*
   * a rail with one nameless entry in it is not a rail — so the width is only given up by a page
   * that named every one of its entries (its blocks, or its clusters) with a glyph as well as a word
   */
  const canReduce = groups
    ? pages.every((page) => !!page.icon)
    : visibleSections.every((section) => !!section.icon);
  const isRailReduced = hasSidebarSummary && canReduce && isReduced;

  const renderSectionBody = (section: IPreviewSection): ReactNode => {
    if (section.status === 'loading') {
      return (
        <div aria-busy="true" css={classes.skeleton}>
          {Array.from({ length: PREVIEW_SECTION_SKELETON_LINES }).map((_, index) => (
            <Skeleton
              height={PREVIEW_SECTION_SKELETON_LINE_HEIGHT}
              key={index}
              variant="rounded"
              width={index === PREVIEW_SECTION_SKELETON_LINES - 1
                ? PREVIEW_SECTION_SKELETON_LAST_LINE_WIDTH
                : '100%'}
            />
          ))}
        </div>
      );
    }

    if (section.status === 'error') return <SectionLoadError onRetry={section.onRetry} />;

    return section.content;
  };

  const renderSection = (section: IPreviewSection) => {
    // the figure and the actions only mean something once the rows they are about are in
    const isSettled = !section.status;
    const setRef = (element: HTMLDivElement | null) => {
      sectionRefs.current[section.id] = element;
    };

    if (section.disableCard) {
      return (
        <div css={classes.sectionAnchor} key={section.id} ref={setRef}>
          {renderSectionBody(section)}
        </div>
      );
    }

    return (
      <Card css={classes.sectionAnchor} key={section.id} ref={setRef}>
        <CardHeader
          action={isSettled ? section.rightActions : undefined}
          title={(
            <span css={classes.cardTitle}>
              {section.label}
              {isSettled && section.count !== undefined && (
                <span css={classes.cardCount}>{section.count}</span>
              )}
              {isSettled && section.subtitle && (
                <Typography component="span" css={classes.cardSubtitle} variant="body2">
                  {section.subtitle}
                </Typography>
              )}
              {section.helperText && <IconPopover message={section.helperText} />}
            </span>
          )}
        />
        <CardContent>{renderSectionBody(section)}</CardContent>
      </Card>
    );
  };

  // a wide figure pushes the label it sits next to out of line, and reads no better
  const getBadgeValue = (count: number) => (count > NOTIFICATION_BADGE_MAX
    ? `${NOTIFICATION_BADGE_MAX}+`
    : count);

  // a figure still on its way keeps its place as a blank disc rather than popping in beside the name
  const renderBadge = (source: BadgeSource) => {
    if (source.countLoading) {
      return <Skeleton aria-hidden="true" css={classes.summaryBadgeSkeleton} variant="circular" />;
    }

    if (source.count === undefined) return null;

    return (
      <Box component="span" css={classes.summaryBadge(!!source.alertBadge, true)}>
        {getBadgeValue(source.count)}
      </Box>
    );
  };

  const renderMiniBadge = (source: BadgeSource) => {
    if (source.countLoading || source.count === undefined) return null;

    return (
      <Box component="span" css={classes.miniBadge(!!source.alertBadge)}>
        {getBadgeValue(source.count)}
      </Box>
    );
  };

  const renderSummaryItem = (
    section: IPreviewSection,
    grouped: boolean,
    onSelect: (section: IPreviewSection) => void = (selected) => setActiveId(selected.id)
  ) => {
    const isActive = section.id === activeSection.id;
    const label = section.summaryLabel ?? section.label;

    return (
      <div css={classes.summaryItemWrap} key={section.id}>
        {/* the name comes back as a tooltip for exactly as long as the rail is not drawing it */}
        <Tooltip placement="right" title={isRailReduced ? label : ''}>
          <button
            aria-label={label}
            css={classes.summaryItem(isActive, grouped, isRailReduced)}
            onClick={() => onSelect(section)}
            type="button"
            aria-current={isActive
              ? 'true'
              : undefined}
          >
            {isRailReduced
              ? <Box component="span" css={classes.summaryItemIcon}>{section.icon}</Box>
              : (
                <>
                  <span css={classes.summaryItemLabel}>{label}</span>
                  {renderBadge(section)}
                </>
              )}
          </button>
        </Tooltip>
        {isRailReduced && renderMiniBadge(section)}
      </div>
    );
  };

  const renderSummaryHead = () => {
    const label = isRailReduced
      ? t('previewSummary.expand')
      : t('previewSummary.reduce');

    return (
      <Tooltip placement="right" title={isRailReduced ? label : ''}>
        <button
          aria-expanded={!isRailReduced}
          aria-label={label}
          css={classes.summaryHead(isRailReduced)}
          onClick={() => dispatch(changeIsPreviewSummaryReducedSlice(!isReduced))}
          type="button"
        >
          {!isRailReduced && <span>{t('previewSummary.title')}</span>}
          <Box component="span" css={classes.summaryHeadChevron(isRailReduced)}>
            <FiChevronsLeft />
          </Box>
        </button>
      </Tooltip>
    );
  };

  const renderSummaryGroup = (group: { key: string; sections: IPreviewSection[] }) => {
    /*
     * never folded while the rail is reduced: the name that folds a cluster isn't drawn there, so
     * a cluster folded before the names were put away would have no way back open
     */
    const isFolded = !isRailReduced && !!foldedGroups[group.key];
    const toggleGroup = () => setFoldedGroups((folded) => ({
      ...folded,
      [group.key]: !folded[group.key],
    }));

    return (
      <div css={classes.summaryGroup} key={group.key || 'ungrouped'}>
        {!!group.key && !isRailReduced && (
          <button
            aria-expanded={!isFolded}
            css={classes.summaryGroupTitle}
            onClick={toggleGroup}
            type="button"
            aria-label={isFolded
              ? t('previewSummary.unfoldGroup', { group: group.key })
              : t('previewSummary.foldGroup', { group: group.key })}
          >
            <span>{group.key}</span>
            {/* folded, the cluster still states how many blocks went away with it */}
            {isFolded && (
              <Box component="span" css={classes.summaryBadge(false, false)}>
                {group.sections.length}
              </Box>
            )}
            <Box component="span" css={classes.chevron(isFolded, PREVIEW_SUMMARY_CHEVRON_SIZE)}>
              <FiChevronUp />
            </Box>
          </button>
        )}
        {!isFolded && group.sections.map((section) => renderSummaryItem(section, true))}
      </div>
    );
  };

  /*
   * picking a chip also folds the strip: the reader asked for a block, and on a screen this narrow
   * the strip they asked it from stands between them and the top of it until they put it away
   */
  const handleCompactChipClick = (section: IPreviewSection) => {
    setActiveId(section.id);
    setIsCompactFolded(true);
  };

  const renderCompactChip = (section: IPreviewSection, grouped: boolean) => (
    <button
      css={classes.compactChip(section.id === activeSection.id, grouped)}
      key={section.id}
      onClick={() => handleCompactChipClick(section)}
      type="button"
      aria-current={section.id === activeSection.id
        ? 'true'
        : undefined}
    >
      <span>{section.summaryLabel ?? section.label}</span>
      {renderBadge(section)}
    </button>
  );

  const layoutOptions: { value: PreviewLayout; icon: ReactNode }[] = [
    { value: 'sidebar', icon: <PreviewSidebarLayoutIcon /> },
    { value: 'full', icon: <PreviewFullLayoutIcon /> },
  ];

  const renderToolbar = () => (header || canChooseLayout) && (
    <div css={classes.toolbar}>
      <div css={classes.toolbarHeader}>{header}</div>
      {canChooseLayout && (
        <div aria-label={t('previewLayout.label')} css={classes.layoutTrack} role="group">
          {layoutOptions.map((option) => (
            <Tooltip key={option.value} title={t(`previewLayout.${option.value}`)}>
              <button
                aria-label={t(`previewLayout.${option.value}`)}
                css={classes.layoutButton(option.value === layout)}
                onClick={() => dispatch(changePreviewLayoutSlice(option.value))}
                type="button"
                aria-pressed={option.value === layout
                  ? 'true'
                  : 'false'}
              >
                {option.icon}
              </button>
            </Tooltip>
          ))}
        </div>
      )}
    </div>
  );

  const renderCompactFrame = (nav: ReactNode) => (
    <div css={classes.compactFrame(isCompactFolded)}>
      <div css={classes.compactHead}>
        <span css={classes.compactHeadTitle}>{t('previewSummary.title')}</span>
        <button
          aria-expanded={!isCompactFolded}
          css={classes.compactHeadToggle}
          onClick={() => setIsCompactFolded((folded) => !folded)}
          type="button"
          aria-label={isCompactFolded
            ? t('previewSummary.expand')
            : t('previewSummary.reduce')}
        >
          <Box
            component="span"
            css={classes.chevron(isCompactFolded, PREVIEW_COMPACT_HEAD_CHEVRON_SIZE)}
          >
            <FiChevronUp />
          </Box>
        </button>
      </div>
      {!isCompactFolded && nav}
    </div>
  );

  /*
   * --------------------------------------------------------------------------------------------- //
   * ---------------------------------- the record read by pages --------------------------------- //
   * --------------------------------------------------------------------------------------------- //
   */
  // a cluster opens on its first block; the strip it was picked from folds out of the way
  const openPage = (page: PreviewPage) => {
    setActiveId(page.sections[0].id);
    setIsCompactFolded(true);
  };

  // a block listed under its cluster opens that cluster and brings the block itself into view
  const openPageSection = (section: IPreviewSection) => {
    setActiveId(section.id);
    setScrollTargetId(section.id);
    setIsCompactFolded(true);
  };

  const renderPageEntry = (page: PreviewPage) => {
    const isActive = page.key === activePage.key;
    const hasSubItems = !!page.listSections && !isRailReduced;

    return (
      <Fragment key={page.key}>
        <div css={classes.summaryItemWrap}>
          <Tooltip placement="right" title={isRailReduced ? page.label : ''}>
            <button
              aria-label={page.label}
              onClick={() => openPage(page)}
              type="button"
              aria-current={isActive
                ? 'true'
                : undefined}
              /*
               * a cluster listing its blocks leaves the marked ground to the block that is open, and
               * only keeps the primary tone saying the reader stands inside it
               */
              css={[
                classes.summaryItem(isActive && !hasSubItems, false, isRailReduced),
                isActive && hasSubItems && classes.summaryParentActive,
              ]}
            >
              {isRailReduced
                ? <Box component="span" css={classes.summaryItemIcon}>{page.icon}</Box>
                : (
                  <>
                    <span css={classes.summaryItemLabel}>{page.label}</span>
                    {renderBadge(page)}
                  </>
                )}
            </button>
          </Tooltip>
          {isRailReduced && renderMiniBadge(page)}
        </div>
        {hasSubItems && (
          <div css={classes.summarySubItems}>
            {page.sections.map((section) => renderSummaryItem(section, false, openPageSection))}
          </div>
        )}
      </Fragment>
    );
  };

  const renderCompactPageChip = (page: PreviewPage) => (
    <button
      css={classes.compactChip(page.key === activePage.key && !page.listSections, true)}
      key={page.key}
      onClick={() => openPage(page)}
      type="button"
      aria-current={page.key === activePage.key
        ? 'true'
        : undefined}
    >
      <span>{page.label}</span>
      {renderBadge(page)}
    </button>
  );

  const renderCompactPageSectionChip = (section: IPreviewSection) => (
    <button
      css={classes.compactChip(section.id === activeSection.id, true)}
      key={section.id}
      onClick={() => openPageSection(section)}
      type="button"
      aria-current={section.id === activeSection.id
        ? 'true'
        : undefined}
    >
      <span>{section.summaryLabel ?? section.label}</span>
      {renderBadge(section)}
    </button>
  );

  const renderGroupPages = () => (
    <div className={className} css={classes.page}>
      {renderToolbar()}
      {overview}
      {hasCompactSummary && renderCompactFrame(
        <nav aria-label={t('pageSections')} css={classes.compactNav(true)}>
          {pages.map((page) => (page.listSections
            ? (
              <div css={classes.compactGroup} key={page.key}>
                {renderCompactPageChip(page)}
                <div css={classes.summarySubItems}>
                  {page.sections.map(renderCompactPageSectionChip)}
                </div>
              </div>
            )
            : renderCompactPageChip(page)))}
        </nav>
      )}
      <div css={classes.row}>
        {hasSidebarSummary && (
          <nav aria-label={t('pageSections')} css={classes.summary(isRailReduced)}>
            {canReduce && (
              <>
                {renderSummaryHead()}
                <div css={classes.summaryDivider} />
              </>
            )}
            {pages.map(renderPageEntry)}
          </nav>
        )}
        <div css={classes.sections}>
          {hasSummary
            ? activePage.sections.map(renderSection)
            : pages.map((page) => (
              <section css={classes.groupPage} key={page.key}>
                <Typography component="h2" css={classes.groupHeading} variant="h6">
                  {page.icon}
                  {page.label}
                </Typography>
                {page.sections.map(renderSection)}
              </section>
            ))}
        </div>
      </div>
    </div>
  );

  if (groups) return renderGroupPages();

  return (
    <div className={className} css={classes.page}>
      {renderToolbar()}
      {overview}
      {hasCompactSummary && renderCompactFrame(
        <nav aria-label={t('pageSections')} css={classes.compactNav(hasGroups)}>
          {hasGroups
            ? groupedSections.map((group) => (
              <div css={classes.compactGroup} key={group.key || 'ungrouped'}>
                {!!group.key && <span css={classes.compactGroupTitle}>{group.key}</span>}
                {group.sections.map((section) => renderCompactChip(section, true))}
              </div>
            ))
            : visibleSections.map((section) => renderCompactChip(section, false))}
        </nav>
      )}
      <div css={classes.row}>
        {hasSidebarSummary && (
          <nav
            aria-label={t('pageSections')}
            css={hasGroups
              ? classes.summaryGrouped(isRailReduced)
              : classes.summary(isRailReduced)}
          >
            {hasGroups
              ? (
                <>
                  {canReduce && <div css={classes.summaryHeadCard}>{renderSummaryHead()}</div>}
                  {groupedSections.map(renderSummaryGroup)}
                </>
              )
              : (
                <>
                  {canReduce && (
                    <>
                      {renderSummaryHead()}
                      <div css={classes.summaryDivider} />
                    </>
                  )}
                  {visibleSections.map((section) => renderSummaryItem(section, false))}
                </>
              )}
          </nav>
        )}
        <div css={classes.sections}>
          {hasSummary
            ? renderSection(activeSection)
            : visibleSections.map(renderSection)}
        </div>
      </div>
    </div>
  );
};

export default PreviewSections;
