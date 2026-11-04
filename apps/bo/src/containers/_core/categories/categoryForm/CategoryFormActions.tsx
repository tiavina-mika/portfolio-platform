import { Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FiCheck } from 'react-icons/fi';

import type { Theme } from '@mui/material/styles';

import {
  CATEGORY_FORM_ACTION_ICON_SIZE, CATEGORY_FORM_ACTIONS_GAP, FORM_WORKBENCH_BAR_PADDING_X,
  FORM_WORKBENCH_BAR_PADDING_Y, FORM_WORKBENCH_BREAKPOINT,
} from '@/constants/_core/ui.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

type Placement = 'header' | 'footer';

const classes = {
  /*
   * the same actions live in two places and only one is ever shown: in the header while the screen
   * is wide enough to hold them next to the title, in a bar pinned at the bottom below that. In the
   * header they share the free width with the title, which keeps the language strip between them
   * centred
   */
  root: (placement: Placement) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    if (placement === 'header') {
      return {
        display: 'flex',
        flex: 1,
        minWidth: 0,
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: `${CATEGORY_FORM_ACTIONS_GAP}px`,
        [theme.breakpoints.down(FORM_WORKBENCH_BREAKPOINT)]: { display: 'none' },
      };
    }

    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: `${CATEGORY_FORM_ACTIONS_GAP}px`,
      padding: `${FORM_WORKBENCH_BAR_PADDING_Y}px ${FORM_WORKBENCH_BAR_PADDING_X}px`,
      backgroundColor: tokens.surface,
      borderTop: `1px solid ${tokens.border}`,
      boxShadow: tokens.shadowPopover,
      [theme.breakpoints.up(FORM_WORKBENCH_BREAKPOINT)]: { display: 'none' },
    };
  },
  path: (theme: Theme) => ({
    minWidth: 0,
    color: getDesignTokens(theme).textSecondary,
  }),
  buttons: {
    display: 'flex',
    alignItems: 'center',
    gap: `${CATEGORY_FORM_ACTIONS_GAP}px`,
    flexShrink: 0,
  },
};

type Props = {
  placement: Placement;
  /** the id of the form the save button submits — the button stands outside of it */
  formId: string;
  /** where the category will sit once saved, restated in the bottom bar next to the save action */
  path: string;
  onCancel: () => void;
};

/**
 * The way out of the category form: cancelling and saving — and, in the bottom bar, the path the
 * category is being filed under, which the header leaves to the filing card beside the form.
 */
const CategoryFormActions = ({
  placement, formId, path, onCancel,
}: Props) => {
  const {
    t,
  } = useTranslation(['common']);

  return (
    <div css={classes.root(placement)}>
      {placement === 'footer' && (
        <Typography noWrap css={classes.path} variant="body2">
          {path}
        </Typography>
      )}
      <div css={classes.buttons}>
        <Button color="inherit" onClick={onCancel} variant="outlined">
          {t('common:cancel')}
        </Button>
        <Button
          form={formId}
          startIcon={<FiCheck size={CATEGORY_FORM_ACTION_ICON_SIZE} />}
          type="submit"
          variant="contained"
        >
          {t('common:save')}
        </Button>
      </div>
    </div>
  );
};

export default CategoryFormActions;
