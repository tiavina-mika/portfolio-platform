import { IconButton, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiCheck, FiChevronDown, FiChevronsLeft, FiChevronsRight, FiFileText, FiImage, FiLayers, FiSearch,
  FiSettings,
} from 'react-icons/fi';

import type { Theme } from '@mui/material/styles';

import {
  FONT_SIZE_BODY, FONT_SIZE_META, FONT_SIZE_OVERLINE,
  FORM_WORKBENCH_ACTIVE_BORDER_OPACITY, FORM_WORKBENCH_BREAKPOINT,
  FORM_WORKBENCH_RAIL_BADGE_PADDING_X, FORM_WORKBENCH_RAIL_BADGE_SIZE,
  FORM_WORKBENCH_RAIL_CHECK_SIZE, FORM_WORKBENCH_RAIL_GAUGE_HEIGHT, FORM_WORKBENCH_RAIL_ICON_SIZE,
  FORM_WORKBENCH_RAIL_ITEM_GAP, FORM_WORKBENCH_RAIL_ITEM_LABEL_GAP,
  FORM_WORKBENCH_RAIL_ITEM_PADDING_X, FORM_WORKBENCH_RAIL_ITEM_PADDING_Y,
  FORM_WORKBENCH_RAIL_PADDING, FORM_WORKBENCH_RAIL_ROW_GAP, FORM_WORKBENCH_RAIL_TOGGLE_GAP,
  FORM_WORKBENCH_RAIL_TOGGLE_HEIGHT, FORM_WORKBENCH_GAP, FORM_WORKBENCH_PROGRESS_PADDING_X,
  FORM_WORKBENCH_PHONE_BREAKPOINT, FORM_WORKBENCH_PROGRESS_PADDING_Y, FORM_WORKBENCH_RAIL_HEAD_DIVIDER_HEIGHT,
  FORM_WORKBENCH_RAIL_HEAD_GAP, FORM_WORKBENCH_RAIL_HEAD_LETTER_SPACING, FORM_WORKBENCH_RAIL_HEAD_PADDING,
  FORM_WORKBENCH_STICKY_OFFSET, RADIUS, RADIUS_LG, RADIUS_SM, TOOLBAR_HEIGHT,
} from '@/constants/_core/ui.constants';
import { useBreakpoint } from '@/hooks/_core/useBreakpoint';
import { useCmsFormSections } from '@/hooks/_core/useCmsFormSections';
import {
  CmsFormSectionEnum, ICmsFormSectionProgress, ICmsFormSections,
} from '@/types/_core/cms.type';
import { Locale } from '@/types/_core/setting.type';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';

import CmsFormProgress from './CmsFormProgress';

const classes = {
  /*
   * the grid cell the rail sits in. It stretches to the height of the row so the column inside it
   * has something to travel against — a sticky element inside a cell only as tall as itself has
   * nowhere to stick to
   */
  area: { alignSelf: 'stretch' },
  // the rail column: the entries, and the card counting the whole form under them
  column: (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${FORM_WORKBENCH_GAP - 4}px`,
    position: 'sticky' as const,
    top: TOOLBAR_HEIGHT + FORM_WORKBENCH_STICKY_OFFSET,
    // on a short window the summary scrolls inside itself instead of running past the viewport
    maxHeight: `calc(100vh - ${TOOLBAR_HEIGHT + (FORM_WORKBENCH_STICKY_OFFSET * 2)}px)`,
    overflowY: 'auto' as const,
    /*
     * under the breakpoint the rail is a row above the form, and the band carrying the language
     * tabs is already pinned there — a second pinned band would take a third of a phone screen
     */
    [theme.breakpoints.down(FORM_WORKBENCH_BREAKPOINT)]: {
      position: 'static' as const,
      maxHeight: 'none',
      overflowY: 'visible' as const,
    },
  }),
  /*
   * the whole-form counter only stands under the rail where the rail has a column of its own —
   * under the breakpoint it moves into the footer bar, next to the action it qualifies
   */
  progressCard: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      padding: `${FORM_WORKBENCH_PROGRESS_PADDING_Y}px ${FORM_WORKBENCH_PROGRESS_PADDING_X}px`,
      backgroundColor: tokens.surface,
      border: `1px solid ${tokens.border}`,
      borderRadius: RADIUS_LG,
      boxShadow: tokens.shadow,
      [theme.breakpoints.down(FORM_WORKBENCH_BREAKPOINT)]: { display: 'none' },
    };
  },
  rail: (isRow: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'flex',
      flexDirection: isRow
        ? ('row' as const)
        : ('column' as const),
      gap: isRow
        ? `${FORM_WORKBENCH_RAIL_ROW_GAP}px`
        : 0,
      // should a tablet ever be too narrow for the row, it scrolls rather than wrapping onto two
      overflowX: isRow
        ? ('auto' as const)
        : ('visible' as const),
      padding: FORM_WORKBENCH_RAIL_PADDING,
      backgroundColor: tokens.surface,
      border: `1px solid ${tokens.border}`,
      borderRadius: RADIUS_LG,
      boxShadow: tokens.shadow,
    };
  },
  /*
   * folding the rail is a desktop-only affordance: under the breakpoint it is already a row, and
   * there is nothing left to reclaim by folding it
   */
  toggle: (collapsed: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: collapsed
        ? ('center' as const)
        : ('space-between' as const),
      gap: `${FORM_WORKBENCH_RAIL_TOGGLE_GAP}px`,
      width: '100%',
      height: FORM_WORKBENCH_RAIL_TOGGLE_HEIGHT,
      padding: `0 ${FORM_WORKBENCH_RAIL_ITEM_PADDING_X - 2}px`,
      marginBottom: FORM_WORKBENCH_RAIL_ROW_GAP,
      font: 'inherit',
      fontSize: FONT_SIZE_META,
      fontWeight: theme.typography.fontWeightMedium,
      color: tokens.textSecondary,
      background: 'none',
      border: 'none',
      borderRadius: RADIUS_SM,
      cursor: 'pointer',
      '&:hover': { backgroundColor: tokens.tabHover },
      [theme.breakpoints.down(FORM_WORKBENCH_BREAKPOINT)]: { display: 'none' },
    };
  },
  item: (active: boolean, collapsed: boolean, isRow: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: `${FORM_WORKBENCH_RAIL_ITEM_GAP}px`,
      width: '100%',
      // on a tablet the five entries share the row rather than hugging its left edge
      flex: isRow
        ? '1 0 auto'
        : 'none',
      padding: collapsed
        ? `${FORM_WORKBENCH_RAIL_ITEM_PADDING_Y}px 0`
        : `${FORM_WORKBENCH_RAIL_ITEM_PADDING_Y}px ${FORM_WORKBENCH_RAIL_ITEM_PADDING_X}px`,
      font: 'inherit',
      fontSize: FONT_SIZE_BODY,
      textAlign: 'left' as const,
      borderRadius: RADIUS_SM,
      cursor: 'pointer',
      ...(active
        ? {
          color: theme.palette.primary.dark,
          fontWeight: theme.typography.fontWeightMedium,
          backgroundColor: getTintedBackground(theme, theme.palette.primary.main),
          border: `1px solid ${alpha(theme.palette.primary.main, FORM_WORKBENCH_ACTIVE_BORDER_OPACITY)}`,
        }
        : {
          color: tokens.text,
          backgroundColor: 'transparent',
          border: '1px solid transparent',
          '&:hover': { backgroundColor: tokens.tabHover },
        }),
    };
  },
  itemHead: (collapsed: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed
      ? ('center' as const)
      : ('space-between' as const),
    gap: `${FORM_WORKBENCH_RAIL_ITEM_LABEL_GAP}px`,
    width: '100%',
  }),
  itemName: {
    display: 'flex',
    alignItems: 'center',
    gap: `${FORM_WORKBENCH_RAIL_ITEM_LABEL_GAP}px`,
    minWidth: 0,
  },
  itemMarks: {
    display: 'flex',
    alignItems: 'center',
    gap: `${FORM_WORKBENCH_RAIL_ITEM_GAP}px`,
    flexShrink: 0,
  },
  // the figure trailing a section's name: how many of its fields already carry a value
  counter: (hasErrors: boolean) => (theme: Theme) => ({
    fontSize: FONT_SIZE_META,
    fontWeight: theme.typography.fontWeightRegular,
    color: hasErrors
      ? theme.palette.error.main
      : getDesignTokens(theme).textSecondary,
    whiteSpace: 'nowrap' as const,
  }),
  /*
   * folded, the badge takes the counter's place rather than standing next to it — 64px cannot hold
   * both, and "two fields refused" is the more urgent of the two facts
   */
  badge: (theme: Theme) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: FORM_WORKBENCH_RAIL_BADGE_SIZE,
    height: FORM_WORKBENCH_RAIL_BADGE_SIZE,
    padding: `0 ${FORM_WORKBENCH_RAIL_BADGE_PADDING_X}px`,
    fontSize: FONT_SIZE_OVERLINE,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.error.contrastText,
    backgroundColor: theme.palette.error.main,
    borderRadius: RADIUS,
    flexShrink: 0,
  }),
  /*
   * the phone-only title line of the stacked summary: its name, the whole-form counter the footer
   * bar gives up on a phone, and the chevron folding the list down to this line
   */
  phoneHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${FORM_WORKBENCH_RAIL_ROW_GAP}px`,
    padding: FORM_WORKBENCH_RAIL_HEAD_PADDING,
  },
  phoneHeadText: {
    display: 'flex',
    alignItems: 'center',
    gap: `${FORM_WORKBENCH_RAIL_HEAD_GAP}px`,
    minWidth: 0,
  },
  phoneHeadTitle: (theme: Theme) => ({
    fontSize: FONT_SIZE_OVERLINE,
    fontWeight: theme.typography.fontWeightBold,
    letterSpacing: FORM_WORKBENCH_RAIL_HEAD_LETTER_SPACING,
    textTransform: 'uppercase' as const,
    color: getDesignTokens(theme).textSecondary,
    whiteSpace: 'nowrap' as const,
  }),
  phoneHeadDivider: (theme: Theme) => ({
    width: 1,
    height: FORM_WORKBENCH_RAIL_HEAD_DIVIDER_HEIGHT,
    flexShrink: 0,
    backgroundColor: getDesignTokens(theme).border,
  }),
  phoneHeadProgress: (theme: Theme) => ({
    color: getDesignTokens(theme).textSecondary,
  }),
  foldChevron: (folded: boolean) => ({
    display: 'inline-flex',
    transform: folded
      ? 'rotate(180deg)'
      : 'none',
  }),
  check: (theme: Theme) => ({
    display: 'inline-flex',
    color: theme.palette.primary.main,
  }),
  gauge: (theme: Theme) => ({
    width: '100%',
    height: FORM_WORKBENCH_RAIL_GAUGE_HEIGHT,
    borderRadius: FORM_WORKBENCH_RAIL_GAUGE_HEIGHT,
    backgroundColor: getDesignTokens(theme).border,
    overflow: 'hidden',
  }),
  gaugeFill: (progress: ICmsFormSectionProgress) => (theme: Theme) => {
    const isComplete = progress.filled === progress.total && !progress.errors;

    return {
      display: 'block',
      height: '100%',
      borderRadius: FORM_WORKBENCH_RAIL_GAUGE_HEIGHT,
      width: `${Math.round((progress.filled / progress.total) * 100)}%`,
      backgroundColor: progress.errors
        ? theme.palette.error.main
        : isComplete
          ? theme.palette.primary.main
          : theme.palette.warning.main,
    };
  },
};

const SECTION_ICONS: Record<CmsFormSectionEnum, ReactNode> = {
  [CmsFormSectionEnum.CONTENT]: <FiFileText size={FORM_WORKBENCH_RAIL_ICON_SIZE} />,
  [CmsFormSectionEnum.SEO]: <FiSearch size={FORM_WORKBENCH_RAIL_ICON_SIZE} />,
  [CmsFormSectionEnum.IMAGES]: <FiImage size={FORM_WORKBENCH_RAIL_ICON_SIZE} />,
  [CmsFormSectionEnum.CATEGORY]: <FiLayers size={FORM_WORKBENCH_RAIL_ICON_SIZE} />,
  [CmsFormSectionEnum.SETTINGS]: <FiSettings size={FORM_WORKBENCH_RAIL_ICON_SIZE} />,
};

type Props = {
  /** the sections the form is made of, and the fields each one counts */
  config: ICmsFormSections;
  activeSection: CmsFormSectionEnum;
  onSectionChange: (section: CmsFormSectionEnum) => void;
  /** the language tab the counters are read on — a section is full in one language at a time */
  tab: Locale;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

/**
 * The summary of a CMS form: its five sections, how full each one is, and which of them still
 * holds a field the schema refuses. Only the marked section is rendered next to it, so this is
 * also the only place an editor can see what is left to do without opening anything.
 *
 * Folded, an entry keeps its glyph and the number of fields already filled, and gives its name
 * back through a tooltip. Under the breakpoint it stops being a rail and becomes the row of
 * entries above the form — a 250px column takes a third of a tablet. On a phone the entries stack
 * again under a title line carrying the whole-form counter, and the list folds down to that line.
 */
const CmsFormSectionsRail = ({
  config, activeSection, onSectionChange, tab, collapsed, onToggleCollapsed,
}: Props) => {
  const {
    t,
  } = useTranslation(['common', 'cms']);
  const getLabel = (section: CmsFormSectionEnum): string => t(config.labelKeys[section]);
  const isSmallScreen = useBreakpoint(FORM_WORKBENCH_BREAKPOINT);
  const isPhone = useBreakpoint(FORM_WORKBENCH_PHONE_BREAKPOINT);
  // a tablet lays the entries out as a row; a phone stacks them again, under a title line
  const isRow = isSmallScreen && !isPhone;
  const [isFoldedOnPhone, setIsFoldedOnPhone] = useState(false);
  /*
   * subscribed here rather than in the form: every value of the form is watched to count the
   * filled fields, and the section being filled holds a rich text editor that must not re-render
   * while it is being typed into
   */
  const progress = useCmsFormSections(config, tab);

  // the rail only folds where it is a rail: under the breakpoint it is already a row of entries
  const isCollapsed = collapsed && !isSmallScreen;

  return (
    <div css={classes.area}>
      <div css={classes.column}>
        <nav aria-label={t('cms:cmsForm.sections')} css={classes.rail(isRow)}>
          {isPhone && (
            <div css={classes.phoneHead}>
              <div css={classes.phoneHeadText}>
                <span css={classes.phoneHeadTitle}>{t('cms:cmsForm.sections')}</span>
                <span css={classes.phoneHeadDivider} />
                <CmsFormProgress
                  css={classes.phoneHeadProgress}
                  filled={progress.filled}
                  helper={t(config.requiredFieldsHelperKey)}
                  total={progress.total}
                />
              </div>
              <IconButton
                aria-expanded={!isFoldedOnPhone}
                aria-label={t('cms:cmsForm.toggleSections')}
                onClick={() => setIsFoldedOnPhone((previous) => !previous)}
              >
                <span css={classes.foldChevron(isFoldedOnPhone)}>
                  <FiChevronDown size={FORM_WORKBENCH_RAIL_ICON_SIZE} />
                </span>
              </IconButton>
            </div>
          )}
          <button
            aria-label={t('cms:cmsForm.toggleSections')}
            css={classes.toggle(isCollapsed)}
            onClick={onToggleCollapsed}
            type="button"
          >
            {!isCollapsed && <span>{t('cms:cmsForm.sections')}</span>}
            {isCollapsed
              ? <FiChevronsRight size={FORM_WORKBENCH_RAIL_ICON_SIZE} />
              : <FiChevronsLeft size={FORM_WORKBENCH_RAIL_ICON_SIZE} />}
          </button>

          {!(isPhone && isFoldedOnPhone) && config.sections.map((section) => {
            const sectionProgress = progress.bySection[section];
            const isComplete = sectionProgress.filled === sectionProgress.total && !sectionProgress.errors;
            const ratio = `${sectionProgress.filled}/${sectionProgress.total}`;
            const counter = isCollapsed
              ? String(sectionProgress.filled)
              : ratio;

            return (
              <Tooltip
                key={section}
                placement="right"
                title={isCollapsed
                  ? [
                    getLabel(section),
                    ratio,
                    // the badge replaces the counter once folded, so the tooltip is where both are read
                    sectionProgress.errors && t('cms:cmsForm.errorsCount', { count: sectionProgress.errors }),
                  ].filter(Boolean).join(' · ')
                  : ''}
              >
                <button
                  css={classes.item(section === activeSection, isCollapsed, isRow)}
                  onClick={() => onSectionChange(section)}
                  type="button"
                  aria-current={section === activeSection
                    ? 'true'
                    : undefined}
                >
                  <span css={classes.itemHead(isCollapsed)}>
                    <span css={classes.itemName}>
                      {isCollapsed && SECTION_ICONS[section]}
                      {!isCollapsed && <span>{getLabel(section)}</span>}
                    </span>
                    <span css={classes.itemMarks}>
                      {!!sectionProgress.errors && (
                        <span css={classes.badge}>{sectionProgress.errors}</span>
                      )}
                      {!(isCollapsed && sectionProgress.errors) && (
                        <span css={classes.counter(!!sectionProgress.errors)}>{counter}</span>
                      )}
                      {isComplete && !isCollapsed && (
                        <span css={classes.check}>
                          <FiCheck size={FORM_WORKBENCH_RAIL_CHECK_SIZE} />
                        </span>
                      )}
                    </span>
                  </span>
                  {!isCollapsed && (
                    <span css={classes.gauge}>
                      <span css={classes.gaugeFill(sectionProgress)} />
                    </span>
                  )}
                </button>
              </Tooltip>
            );
          })}
        </nav>
        {!collapsed && (
          <div css={classes.progressCard}>
            <CmsFormProgress
              filled={progress.filled}
              helper={t(config.requiredFieldsHelperKey)}
              total={progress.total}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CmsFormSectionsRail;
