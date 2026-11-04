import { Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FiSave } from 'react-icons/fi';

import type { Theme } from '@mui/material/styles';

import CheckboxField from '@/components/form/fields/CheckboxField';
import {
  FORM_WORKBENCH_BAR_GAP, FORM_WORKBENCH_BAR_Z_INDEX, FORM_WORKBENCH_FOOTER_PADDING_X,
  FORM_WORKBENCH_FOOTER_PADDING_Y, FORM_WORKBENCH_PHONE_BREAKPOINT, PAGE_HEAD_ACTION_ICON_SIZE,
  RADIUS_LG,
} from '@/constants/_core/ui.constants';
import { useSectionBlocksProgress } from '@/hooks/_core/useSectionBlocksProgress';
import { Locale } from '@/types/_core/setting.type';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  /*
   * pinned at every width, not only where the form is stacked: a section with a few blocks is
   * several screens tall even on a desktop, and whether it is live is decided here, next to saving
   */
  footer: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      position: 'sticky' as const,
      bottom: 0,
      zIndex: FORM_WORKBENCH_BAR_Z_INDEX,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: `${FORM_WORKBENCH_BAR_GAP}px`,
      padding: `${FORM_WORKBENCH_FOOTER_PADDING_Y}px ${FORM_WORKBENCH_FOOTER_PADDING_X}px`,
      backgroundColor: tokens.surface,
      border: `1px solid ${tokens.border}`,
      borderRadius: RADIUS_LG,
      boxShadow: tokens.shadowPopover,
      [theme.breakpoints.down(FORM_WORKBENCH_PHONE_BREAKPOINT)]: { flexWrap: 'wrap' as const },
    };
  },
  active: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
  },
  activeText: { minWidth: 0 },
  // on a phone the two actions take a line of their own and share it
  actions: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: `${FORM_WORKBENCH_BAR_GAP}px`,
    flexShrink: 0,
    [theme.breakpoints.down(FORM_WORKBENCH_PHONE_BREAKPOINT)]: {
      flex: '1 0 100%',
      '& > .MuiButton-root': { flex: 1 },
    },
  }),
  // the list of blocks already says it right above on a phone
  counter: (theme: Theme) => ({
    color: getDesignTokens(theme).textSecondary,
    whiteSpace: 'nowrap' as const,
    [theme.breakpoints.down(FORM_WORKBENCH_PHONE_BREAKPOINT)]: { display: 'none' },
  }),
};

type Props = {
  /** the language tab the progress is read on */
  tab: Locale;
  loading?: boolean;
  onCancel: () => void;
  onSave: () => void;
};

/**
 * The line closing the section form: whether the section is live on the site, how many of its
 * blocks are complete, and the actions leaving the form — with or without saving it.
 */
const PageSectionFormFooterBar = ({
  tab, loading, onCancel, onSave,
}: Props) => {
  const {
    t,
  } = useTranslation(['common', 'cms']);
  // subscribed here rather than in the form, for the same reason the list of blocks subscribes itself
  const progress = useSectionBlocksProgress(tab);

  return (
    <div css={classes.footer}>
      <div css={classes.active}>
        <CheckboxField isSwitch name="active" />
        <div css={classes.activeText}>
          <Typography variant="h6">{t('common:active')}</Typography>
          <Typography variant="body2">{t('cms:activePageVisible')}</Typography>
        </div>
      </div>
      <div css={classes.actions}>
        <Typography css={classes.counter} variant="body2">
          {t('cms:sectionForm.completedBlocks', { completed: progress.completed, total: progress.total })}
        </Typography>
        <Button disabled={loading} onClick={onCancel} variant="outlined">
          {t('common:cancel')}
        </Button>
        <Button
          loading={loading}
          onClick={onSave}
          startIcon={<FiSave size={PAGE_HEAD_ACTION_ICON_SIZE} />}
          variant="contained"
        >
          {t('common:save')}
        </Button>
      </div>
    </div>
  );
};

export default PageSectionFormFooterBar;
