import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';

import type { Theme } from '@mui/material/styles';

import InputLabel from '@/components/form/InputLabel';
import {
  LIST_FILTERS_ACTIONS_GAP, LIST_FILTERS_BAND_PADDING_X, LIST_FILTERS_BAND_PADDING_Y,
  LIST_FILTERS_COLUMN_GAP, LIST_FILTERS_DRAWER_GAP, LIST_FILTERS_DRAWER_HEAD_HEIGHT,
  LIST_FILTERS_DRAWER_PADDING, LIST_FILTERS_FOOT_GAP, LIST_FILTERS_FOOT_PADDING_TOP,
  LIST_FILTERS_LABEL_GAP, LIST_FILTERS_MENU_COLUMNS, LIST_FILTERS_MENU_COLUMN_GAP,
  LIST_FILTERS_MENU_PADDING, LIST_FILTERS_MENU_ROW_GAP, LIST_FILTERS_MIN_COLUMN_WIDTH,
  LIST_FILTERS_PADDING, LIST_FILTERS_ROW_GAP,
} from '@/constants/_core/ui/list.constants';
import { FONT_SIZE_META } from '@/constants/_core/ui/ui.constants';
import { IAdvancedSearchOption, ListFiltersVariant } from '@/types/_core/app.type';
import { getListFiltersControlStyles } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

/*
 * The filter set of a list, in whichever of its three frames the viewport calls for (see
 * ListFiltersVariant). What they share is what matters: every filter the domain declares is on
 * screen at once — a filter set is scanned as a whole ("what can I narrow by?"), which a field
 * that has to be switched on before it appears makes impossible — and a foot stating what those
 * filters currently leave, beside the actions that apply or undo them.
 *
 * What differs is only the frame. The band folds out of the toolbar onto the recessed ground and
 * needs no title, since the trigger it comes out of already names it. The menu and the drawer
 * stand apart from that trigger, so they carry their own head and a way back to the list.
 */
const classes = {
  /*
   * the band and the rows under it are two recessed bands in a row, so the hairline that separates
   * every other band of the card left them reading as one block: it closes on the full border and
   * casts over what follows, which is what states the panel is in front of the list rather than the
   * top of it. Both need the stacking slot — a shadow cast by an earlier sibling is painted under
   * the next one's own background.
   */
  panel: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      position: 'relative' as const,
      zIndex: 1,
      padding: LIST_FILTERS_PADDING,
      backgroundColor: tokens.surfaceSecondary,
      borderBottom: `1px solid ${tokens.border}`,
      boxShadow: tokens.shadowBand,
      ...getListFiltersControlStyles(theme),
    };
  },
  menu: (theme: Theme) => getListFiltersControlStyles(theme),
  // head and foot stay put while the fields between them scroll under the reader's thumb
  drawer: (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    backgroundColor: theme.palette.background.paper,
    ...getListFiltersControlStyles(theme),
  }),

  /*
   * as many columns as the card holds rather than a fixed count: filter sets run from four fields
   * to fifteen depending on the domain, so the band packs and reflows instead of stretching a
   * handful of fields across a wide screen. The menu sets its own width, so it can count its
   * columns out; the drawer gives each field the full row, the way a form on a phone does.
   */
  grid: {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${LIST_FILTERS_MIN_COLUMN_WIDTH}px, 1fr))`,
    gap: `${LIST_FILTERS_ROW_GAP}px ${LIST_FILTERS_COLUMN_GAP}px`,
    alignItems: 'end' as const,
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: `repeat(${LIST_FILTERS_MENU_COLUMNS}, 1fr)`,
    gap: `${LIST_FILTERS_MENU_ROW_GAP}px ${LIST_FILTERS_MENU_COLUMN_GAP}px`,
    alignItems: 'end' as const,
    padding: LIST_FILTERS_MENU_PADDING,
  },
  drawerGrid: {
    flex: 1,
    // without it the scroll container grows to its content instead of scrolling inside the frame
    minHeight: 0,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: LIST_FILTERS_DRAWER_GAP,
    padding: LIST_FILTERS_DRAWER_PADDING,
  },

  head: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: LIST_FILTERS_ACTIONS_GAP,
    padding: `${LIST_FILTERS_BAND_PADDING_Y}px ${LIST_FILTERS_BAND_PADDING_X}px`,
    borderBottom: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  // the drawer's head stands on the touch row, the way an app bar does
  drawerHead: {
    minHeight: LIST_FILTERS_DRAWER_HEAD_HEIGHT,
    flexShrink: 0,
  },

  foot: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: LIST_FILTERS_ACTIONS_GAP,
    marginTop: LIST_FILTERS_FOOT_GAP,
    paddingTop: LIST_FILTERS_FOOT_PADDING_TOP,
    borderTop: `1px solid ${getDesignTokens(theme).border}`,
  }),
  // in a frame of its own the foot is a band on the recessed ground, not a rule under the last row
  bandFoot: (theme: Theme) => ({
    margin: 0,
    padding: `${LIST_FILTERS_BAND_PADDING_Y}px ${LIST_FILTERS_BAND_PADDING_X}px`,
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
    backgroundColor: getDesignTokens(theme).surfaceSecondary,
    flexShrink: 0,
  }),
  // what the panel currently does to the list, stated where the actions that change it are
  summary: (theme: Theme) => ({
    fontSize: FONT_SIZE_META,
    color: getDesignTokens(theme).textMuted,
  }),
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: LIST_FILTERS_ACTIONS_GAP,
  },
  /*
   * on touch the two actions are the whole foot: there is no room beside them for the sentence the
   * other two frames state, so the count moves into the accept button — which is what the reader is
   * waiting for while narrowing — and each action takes a share of the row wide enough for a thumb
   */
  touchActions: {
    width: '100%',
    '& .MuiButton-root': { flex: 1 },
    '& .MuiButton-containedPrimary': { flex: 2 },
  },
  label: { mb: `${LIST_FILTERS_LABEL_GAP}px` },
};

type Props = {
  fields: IAdvancedSearchOption[];
  // how many of them currently hold a value
  activeCount: number;
  // how many rows the list is left with once they are applied
  resultCount: number;
  // the form the panel's fields belong to — its Apply button sits in the foot, outside the fields
  formId: string;
  variant: ListFiltersVariant;
  onReset: () => void;
  // the way back to the list, for the two frames that stand apart from the trigger that opened them
  onClose: () => void;
};

const ListFiltersPanel = ({
  fields, activeCount, resultCount, formId, variant, onReset, onClose,
}: Props) => {
  const {
    t,
  } = useTranslation();

  const isDrawer = variant === 'drawer';
  const isBand = variant === 'panel';

  const fieldset = fields.map((field) => (
    <div key={field.name}>
      <InputLabel label={field.label} sx={classes.label} />
      {field.component}
    </div>
  ));

  const foot = (
    <Box css={[classes.foot, !isBand && classes.bandFoot]}>
      {!isDrawer && (
        <Typography css={classes.summary}>
          {t('activeFiltersSummary', { count: activeCount, resultCount })}
        </Typography>
      )}
      <Box css={[classes.actions, isDrawer && classes.touchActions]}>
        <Button
          onClick={onReset}
          variant={isDrawer
            ? 'outlined'
            : 'text'}
        >
          {t('reset')}
        </Button>
        <Button form={formId} type="submit" variant="contained">
          {isDrawer
            ? t('showResults', { count: resultCount })
            : t('apply')}
        </Button>
      </Box>
    </Box>
  );

  if (isBand) {
    return (
      <Box css={classes.panel}>
        <Box css={classes.grid}>{fieldset}</Box>
        {foot}
      </Box>
    );
  }

  return (
    <Box css={isDrawer
      ? classes.drawer
      : classes.menu}
    >
      <Box css={[classes.head, isDrawer && classes.drawerHead]}>
        <Typography variant={isDrawer
          ? 'h5'
          : 'overline'}
        >
          {t('filters')}
        </Typography>
        <IconButton aria-label={t('close')} onClick={onClose}>
          <MdClose />
        </IconButton>
      </Box>
      <Box css={isDrawer
        ? classes.drawerGrid
        : classes.menuGrid}
      >
        {fieldset}
      </Box>
      {foot}
    </Box>
  );
};

export default ListFiltersPanel;
