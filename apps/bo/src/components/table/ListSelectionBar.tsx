import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import {
  LIST_CARD_PADDING_X, LIST_SELECTION_BAR_BUTTON_HEIGHT, LIST_SELECTION_BAR_GAP,
  LIST_SELECTION_BAR_PADDING_Y,
} from '@/constants/_core/ui/list.constants';
import { IListSelectionAction } from '@/types/_core/app.type';
import { getDesignTokens, getSoftTintedBackground } from '@/utils/_core/theme/tokens.utils';
import { wait } from '@/utils/_core/utils';

/*
 * the band naming the current selection appears between the toolbar and the grid, on the faintest
 * tint the design draws: it comes and goes as rows are ticked, so it has to stay a thin strip —
 * anything taller would push the table down by a full row every time a checkbox is clicked
 */
const classes = {
  bar: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: LIST_SELECTION_BAR_GAP,
    padding: `${LIST_SELECTION_BAR_PADDING_Y}px ${LIST_CARD_PADDING_X}px`,
    backgroundColor: getSoftTintedBackground(theme, theme.palette.primary.main),
    borderBottom: `1px solid ${getDesignTokens(theme).borderLight}`,
    /*
     * on a phone the count and its actions no longer share a row: the actions are touch-sized, so
     * two of them beside a "12 selected" would each be left too narrow to read the verb they carry
     */
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      alignItems: 'stretch' as const,
    },
  }),
  /*
   * the band's own control row, one step under the toolbar's: it is a strip that opens between two
   * bands of the card, so a full-height button would make ticking a checkbox shift the whole table.
   * Pointer devices only — under `md` the buttons go back to the theme's touch target.
   */
  actions: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    gap: LIST_SELECTION_BAR_GAP,
    [theme.breakpoints.up('md')]: {
      '& .MuiButton-root': {
        height: LIST_SELECTION_BAR_BUTTON_HEIGHT,
        minHeight: LIST_SELECTION_BAR_BUTTON_HEIGHT,
      },
    },
    // stacked under the count, the actions share the row rather than huddling at one end of it
    [theme.breakpoints.down('sm')]: { '& .MuiButton-root': { flex: 1 } },
  }),
};

type Props = {
  selectedIds: string[];
  selectionActions: IListSelectionAction[];
  resetSelectedIds: () => void;
};

const ListSelectionBar = ({
  selectedIds, resetSelectedIds, selectionActions = [],
}: Props) => {
  const numSelected = selectedIds.length;
  /*
   * guards against a double-click firing the same bulk action's onClick twice before the
   * debounce `wait()` below resolves and resetSelectedIds() runs
   */
  const [processingActionIndexes, setProcessingActionIndexes] = useState<Set<number>>(new Set());

  const {
    t,
  } = useTranslation();

  if (numSelected <= 0) {
    return null;
  }

  const handleActionClick = (action: IListSelectionAction, index: number) => async (): Promise<void> => {
    if (processingActionIndexes.has(index)) return;
    setProcessingActionIndexes((prev) => new Set(prev).add(index));

    try {
      action.onClick?.(selectedIds);

      /*
       * a renderActionComponent (ex: a confirm dialog) is responsible for its own reset once the
       * action actually completes — do not reset the selection right away
       */
      if (action.renderActionComponent) return;

      await wait();
      resetSelectedIds();
    }
    finally {
      setProcessingActionIndexes((prev) => {
        const next = new Set(prev);

        next.delete(index);
        return next;
      });
    }
  };

  return (
    <Box css={classes.bar}>
      <Typography variant="subtitle1">
        {t('selectedCount', { count: numSelected })}
      </Typography>
      <Box css={classes.actions}>
        {selectionActions.map((action, index) => (
          action.display && (
            <Fragment key={action.label}>
              <Button
                disabled={processingActionIndexes.has(index)}
                onClick={handleActionClick(action, index)}
                size="small"
                variant="outlined"
                color={action.destructive
                  ? 'error'
                  : 'primary'}
              >
                {action.label}
              </Button>
              {action.renderActionComponent?.(selectedIds, resetSelectedIds)}
            </Fragment>
          )
        ))}
      </Box>
    </Box>
  );
};

export default ListSelectionBar;
