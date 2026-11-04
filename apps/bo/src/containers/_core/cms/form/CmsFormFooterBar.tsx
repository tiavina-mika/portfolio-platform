import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FiArrowRight, FiSave } from 'react-icons/fi';

import type { Theme } from '@mui/material/styles';

import {
  FORM_WORKBENCH_BAR_GAP, FORM_WORKBENCH_BAR_Z_INDEX, FORM_WORKBENCH_BREAKPOINT,
  FORM_WORKBENCH_FOOTER_PADDING_X, FORM_WORKBENCH_FOOTER_PADDING_Y, FORM_WORKBENCH_PHONE_BREAKPOINT,
  PAGE_HEAD_ACTION_ICON_SIZE,
} from '@/constants/_core/ui.constants';
import { useCmsFormSections } from '@/hooks/_core/useCmsFormSections';
import { CmsFormSectionEnum, ICmsFormSections } from '@/types/_core/cms.type';
import { Locale } from '@/types/_core/setting.type';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

import CmsFormProgress from './CmsFormProgress';

const classes = {
  /*
   * only exists where the form is taller than the screen: under the breakpoint the three columns
   * are stacked, so saving would otherwise mean scrolling back past every section
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
      borderTop: `1px solid ${tokens.border}`,
      boxShadow: tokens.shadowPopover,
      [theme.breakpoints.up(FORM_WORKBENCH_BREAKPOINT)]: { display: 'none' },
    };
  },
  // on a phone the counter has moved up into the summary's title line, so it leaves the bar
  progress: (theme: Theme) => ({
    [theme.breakpoints.down(FORM_WORKBENCH_PHONE_BREAKPOINT)]: { display: 'none' },
  }),
  /*
   * on a phone the two actions take the whole bar, one at each end: "next" under the left thumb,
   * saving under the right one
   */
  actions: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${FORM_WORKBENCH_BAR_GAP}px`,
    flexShrink: 0,
    [theme.breakpoints.down(FORM_WORKBENCH_PHONE_BREAKPOINT)]: { flex: 1 },
  }),
};

type Props = {
  /** the sections the form is made of, and the fields each one counts */
  config: ICmsFormSections;
  activeSection: CmsFormSectionEnum;
  /** the language tab the counter is read on — a section is full in one language at a time */
  tab: Locale;
  onGoToNextSection: () => void;
  loading?: boolean;
  onSave: () => void;
};

/**
 * The line closing the stacked form: how much of it is filled, the section that comes next, and
 * the action that saves it. It is the primary action's home under the workbench breakpoint — the
 * band at the top of the screen gives it up there so the two never stand a thumb's width apart.
 */
const CmsFormFooterBar = ({
  config, activeSection, tab, onGoToNextSection, loading, onSave,
}: Props) => {
  const {
    t,
  } = useTranslation(['common', 'cms']);
  // subscribed here rather than in the form, for the same reason the summary rail subscribes itself
  const progress = useCmsFormSections(config, tab);
  const nextSection = config.sections[config.sections.indexOf(activeSection) + 1];

  return (
    <div css={classes.footer}>
      <CmsFormProgress
        css={classes.progress}
        filled={progress.filled}
        helper={t(config.requiredFieldsHelperKey)}
        total={progress.total}
      />
      <div css={classes.actions}>
        {nextSection && (
          <Button
            endIcon={<FiArrowRight size={PAGE_HEAD_ACTION_ICON_SIZE} />}
            onClick={onGoToNextSection}
          >
            {t('cms:cmsForm.nextSection', { label: t(config.labelKeys[nextSection]) })}
          </Button>
        )}
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

export default CmsFormFooterBar;
