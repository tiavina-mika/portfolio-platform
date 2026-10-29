import { Card, CardHeader, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { FiChevronDown, FiChevronUp, FiPlus } from 'react-icons/fi';

import type { Theme } from '@mui/material/styles';

import {
  FONT_SIZE_BODY, FONT_SIZE_META, FONT_SIZE_OVERLINE, FORM_WORKBENCH_ACTIVE_BORDER_OPACITY,
  FORM_WORKBENCH_PHONE_BREAKPOINT, RADIUS, RADIUS_SM,
  SECTION_FORM_ACTION_ICON_SIZE, SECTION_FORM_ADD_BLOCK_BORDER_OPACITY, SECTION_FORM_ADD_BLOCK_HEIGHT,
  SECTION_FORM_ADD_BLOCK_PHONE_HEIGHT, SECTION_FORM_ITEM_DOT_SIZE, SECTION_FORM_ITEM_GAP,
  SECTION_FORM_ITEM_HEIGHT, SECTION_FORM_ITEM_NUMBER_SIZE, SECTION_FORM_ITEM_PADDING,
  SECTION_FORM_ITEM_PHONE_HEIGHT, SECTION_FORM_ITEM_TEXT_GAP, SECTION_FORM_LIST_GAP,
  SECTION_FORM_LIST_PADDING, SECTION_FORM_LIST_PHONE_GAP, SECTION_FORM_REORDER_GAP,
  SECTION_FORM_REORDER_HEIGHT, SECTION_FORM_REORDER_ICON_SIZE, SECTION_FORM_REORDER_PADDING_RIGHT,
  SECTION_FORM_REORDER_WIDTH,
} from '@/constants/_core/ui.constants';
import { useSectionBlocksProgress } from '@/hooks/_core/useSectionBlocksProgress';
import { ISectionBlockProgress } from '@/types/_core/page.type';
import { Locale } from '@/types/_core/setting.type';
import { getSectionBlockImageLabel } from '@/utils/_core/cms.utils';
import { getMissingTranslationColor } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';

const classes = {
  // the list runs flush to the card's edges: its rows carry their own padding and tinted ground
  list: (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${SECTION_FORM_LIST_GAP}px`,
    padding: SECTION_FORM_LIST_PADDING,
    [theme.breakpoints.down(FORM_WORKBENCH_PHONE_BREAKPOINT)]: { gap: `${SECTION_FORM_LIST_PHONE_GAP}px` },
  }),
  // the open block is marked with the same tint and edge as the open entry of the CMS summary rail
  item: (selected: boolean) => (theme: Theme) => ({
    display: 'flex',
    alignItems: 'stretch',
    gap: 2,
    borderRadius: RADIUS,
    ...(selected
      ? {
        backgroundColor: getTintedBackground(theme, theme.palette.primary.main),
        border: `1px solid ${alpha(theme.palette.primary.main, FORM_WORKBENCH_ACTIVE_BORDER_OPACITY)}`,
      }
      : {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
        '&:hover': { backgroundColor: getDesignTokens(theme).tabHover },
      }),
  }),
  select: (theme: Theme) => ({
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: `${SECTION_FORM_ITEM_GAP}px`,
    minHeight: SECTION_FORM_ITEM_HEIGHT,
    padding: SECTION_FORM_ITEM_PADDING,
    font: 'inherit',
    textAlign: 'left' as const,
    background: 'none',
    border: 'none',
    borderRadius: RADIUS,
    cursor: 'pointer',
    [theme.breakpoints.down(FORM_WORKBENCH_PHONE_BREAKPOINT)]: { minHeight: SECTION_FORM_ITEM_PHONE_HEIGHT },
  }),
  // the block's rank, tinted once the block holds everything the site needs to draw it
  number: (complete: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: SECTION_FORM_ITEM_NUMBER_SIZE,
      height: SECTION_FORM_ITEM_NUMBER_SIZE,
      flexShrink: 0,
      fontSize: FONT_SIZE_OVERLINE,
      fontWeight: theme.typography.fontWeightBold,
      borderRadius: RADIUS_SM,
      color: complete
        ? theme.palette.primary.dark
        : tokens.textSecondary,
      backgroundColor: complete
        ? getTintedBackground(theme, theme.palette.primary.main)
        : tokens.surfaceSecondary,
    };
  },
  texts: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: SECTION_FORM_ITEM_TEXT_GAP,
  },
  title: (selected: boolean) => (theme: Theme) => ({
    fontSize: FONT_SIZE_BODY,
    fontWeight: theme.typography.fontWeightMedium,
    color: selected
      ? theme.palette.primary.dark
      : getDesignTokens(theme).text,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  meta: (theme: Theme) => ({
    fontSize: FONT_SIZE_OVERLINE,
    color: getDesignTokens(theme).textMuted,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  /*
   * refused first, since it blocks the save; then complete; then written in the open tab but not
   * yet complete; an untouched block stays a neutral dot
   */
  dot: (block: ISectionBlockProgress) => (theme: Theme) => {
    const getColor = (): string => {
      if (block.hasErrors) return theme.palette.error.main;
      if (block.isComplete) return theme.palette.primary.main;
      if (block.isTranslated) return getMissingTranslationColor(theme);
      return getDesignTokens(theme).border;
    };

    return {
      width: SECTION_FORM_ITEM_DOT_SIZE,
      height: SECTION_FORM_ITEM_DOT_SIZE,
      borderRadius: '50%',
      flexShrink: 0,
      backgroundColor: getColor(),
    };
  },
  reorder: (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    gap: SECTION_FORM_REORDER_GAP,
    paddingRight: SECTION_FORM_REORDER_PADDING_RIGHT,
    [theme.breakpoints.down(FORM_WORKBENCH_PHONE_BREAKPOINT)]: { display: 'none' },
  }),
  reorderButton: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: SECTION_FORM_REORDER_WIDTH,
      height: SECTION_FORM_REORDER_HEIGHT,
      color: tokens.textMuted,
      background: 'none',
      border: 'none',
      borderRadius: RADIUS_SM,
      cursor: 'pointer',
      lineHeight: 0,
      '&:hover:not(:disabled)': {
        color: tokens.text,
        backgroundColor: tokens.surfaceSecondary,
      },
      '&:disabled': {
        color: tokens.textDisabled,
        cursor: 'default',
      },
    };
  },
  addArea: {
    padding: `0 ${SECTION_FORM_LIST_PADDING}px ${SECTION_FORM_LIST_PADDING}px`,
  },
  add: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SECTION_FORM_LIST_PADDING,
    width: '100%',
    height: SECTION_FORM_ADD_BLOCK_HEIGHT,
    font: 'inherit',
    fontSize: FONT_SIZE_BODY,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.primary.dark,
    background: 'none',
    border: `1px dashed ${alpha(theme.palette.primary.main, SECTION_FORM_ADD_BLOCK_BORDER_OPACITY)}`,
    borderRadius: RADIUS,
    cursor: 'pointer',
    '&:hover': { backgroundColor: getTintedBackground(theme, theme.palette.primary.main) },
    [theme.breakpoints.down(FORM_WORKBENCH_PHONE_BREAKPOINT)]: {
      height: SECTION_FORM_ADD_BLOCK_PHONE_HEIGHT,
    },
  }),
  counter: (theme: Theme) => ({
    fontSize: FONT_SIZE_META,
    color: getDesignTokens(theme).textSecondary,
    whiteSpace: 'nowrap' as const,
  }),
};

type Props = {
  /** the field array's own ids, one per block, in their order */
  blockIds: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onAdd: () => void;
  /** the language tab the titles are read in */
  tab: Locale;
};

/**
 * The blocks of a section, in the order the site will draw them: each one's rank, title and
 * picture placement, and a dot saying whether it is complete. Only the block marked here is open in
 * the editor next to it, so this is also where an editor sees what is left to write, reorders the
 * blocks and adds one.
 */
const PageSectionBlocksList = ({
  blockIds, selectedIndex, onSelect, onMove, onAdd, tab,
}: Props) => {
  const {
    t,
  } = useTranslation(['common', 'cms']);
  // subscribed here rather than in the form, so typing in the open block only re-renders this list
  const progress = useSectionBlocksProgress(tab);

  return (
    <Card>
      <CardHeader
        title={t('cms:blocks')}
        action={(
          <Typography css={classes.counter}>
            {t('cms:sectionForm.completedBlocks', { completed: progress.completed, total: progress.total })}
          </Typography>
        )}
      />
      <div css={classes.list}>
        {blockIds.map((id, index) => {
          const block = progress.blocks[index];
          const isSelected = index === selectedIndex;

          if (!block) return null;

          return (
            <div css={classes.item(isSelected)} key={id}>
              <button
                aria-current={isSelected ? 'true' : undefined}
                css={classes.select}
                onClick={() => onSelect(index)}
                type="button"
              >
                <span css={classes.number(block.isComplete)}>{index + 1}</span>
                <span css={classes.texts}>
                  <span css={classes.title(isSelected)}>
                    {block.title || t('cms:sectionForm.untitledBlock')}
                  </span>
                  <span css={classes.meta}>{getSectionBlockImageLabel(block)}</span>
                </span>
                <span css={classes.dot(block)} />
              </button>
              <span css={classes.reorder}>
                <button
                  aria-label={t('cms:sectionForm.moveBlockUp')}
                  css={classes.reorderButton}
                  disabled={index === 0}
                  onClick={() => onMove(index, index - 1)}
                  type="button"
                >
                  <FiChevronUp size={SECTION_FORM_REORDER_ICON_SIZE} />
                </button>
                <button
                  aria-label={t('cms:sectionForm.moveBlockDown')}
                  css={classes.reorderButton}
                  disabled={index === blockIds.length - 1}
                  onClick={() => onMove(index, index + 1)}
                  type="button"
                >
                  <FiChevronDown size={SECTION_FORM_REORDER_ICON_SIZE} />
                </button>
              </span>
            </div>
          );
        })}
      </div>
      <div css={classes.addArea}>
        <button css={classes.add} onClick={onAdd} type="button">
          <FiPlus size={SECTION_FORM_ACTION_ICON_SIZE} />
          {t('cms:addBlock')}
        </button>
      </div>
    </Card>
  );
};

export default PageSectionBlocksList;
