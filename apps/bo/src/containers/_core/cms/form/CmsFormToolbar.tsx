import { Button, Typography } from '@mui/material';
import { useFormContext, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FiSave } from 'react-icons/fi';

import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

import TranslationTabs from '@/components/form/translated/TranslationTabs';
import { TRANSLATED_CMS_FIELDS } from '@/constants/_core/cms.constants';
import {
  FORM_WORKBENCH_BAR_GAP, FORM_WORKBENCH_BAR_PADDING_X, FORM_WORKBENCH_BAR_PADDING_Y,
  FORM_WORKBENCH_BAR_Z_INDEX, FORM_WORKBENCH_BREAKPOINT, PAGE_HEAD_ACTION_ICON_SIZE, RADIUS_LG,
} from '@/constants/_core/ui.constants';
import { useTranslatedFormMissingLocales } from '@/hooks/_core/useTranslatedFormMissingLocales';
import { Locale } from '@/types/_core/setting.type';
import { fromNow } from '@/utils/_core/date.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';
import { getTranslatedFormTabErrors } from '@/utils/_core/utils';

const classes = {
  /*
   * pinned only where the form is several screens tall: on a desktop the three columns hold the
   * whole form in view, and a band stuck over them would take height the preview needs
   */
  bar: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap' as const,
      gap: `${FORM_WORKBENCH_BAR_GAP}px`,
      padding: `${FORM_WORKBENCH_BAR_PADDING_Y}px ${FORM_WORKBENCH_BAR_PADDING_X}px`,
      backgroundColor: tokens.surface,
      border: `1px solid ${tokens.border}`,
      borderRadius: RADIUS_LG,
      boxShadow: tokens.shadow,
      [theme.breakpoints.down(FORM_WORKBENCH_BREAKPOINT)]: {
        position: 'sticky' as const,
        top: 0,
        zIndex: FORM_WORKBENCH_BAR_Z_INDEX,
        boxShadow: tokens.shadowPopover,
      },
    };
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: `${FORM_WORKBENCH_BAR_GAP}px`,
    flexShrink: 0,
  },
  /*
   * the primary action lives in the footer bar once there is one, so the band does not offer two
   * "Save" buttons a thumb's distance apart
   */
  save: (theme: Theme) => ({
    [theme.breakpoints.down(FORM_WORKBENCH_BREAKPOINT)]: { display: 'none' },
  }),
  savedAt: (theme: Theme) => ({
    [theme.breakpoints.down(FORM_WORKBENCH_BREAKPOINT)]: { display: 'none' },
  }),
};

type Props = {
  tab: Locale;
  onTabChange: (value: Locale) => void;
  /** when the record was last written, absent while it has never been saved */
  savedAt?: string;
  /** the wording of the saved/never-saved line, for a record that is not a CMS page or article */
  savedLabels?: { savedAt: string; neverSaved: string };
  /** keeps Save in the band under the breakpoint, for a form that has no footer bar to carry it */
  isSaveKept?: boolean;
  loading?: boolean;
  /** refuses the save, for a record the signed-in admin may read but not write */
  isSaveDisabled?: boolean;
  onSave: () => void;
  /**
   * what stands next to Save, ex: the JSON import/template pair offered on creation, or the preview
   * of a section — passed in to keep this props-only
   */
  actions?: ReactNode;
  /** the translated fields the language tabs judge a missing or refused translation by */
  translatedFields?: string[];
};

/**
 * The band over a CMS form: the language the fields are shown in, when the record was last
 * written, and the action that writes it. Under the workbench breakpoint it is pinned to the top
 * of the scroll — the form is several screens tall there, and the language being edited is the one
 * thing an editor must never lose sight of.
 */
const CmsFormToolbar = ({
  tab, onTabChange, savedAt, savedLabels, isSaveKept = false, loading, isSaveDisabled = false, onSave,
  actions, translatedFields = TRANSLATED_CMS_FIELDS,
}: Props) => {
  const {
    t,
  } = useTranslation(['common', 'cms']);
  /*
   * which languages are still empty and which ones are refused is read here rather than handed
   * down: both subscribe to every value of the form, and keeping the subscription inside the band
   * that displays them is what keeps the rich text editor from re-rendering on every keystroke
   */
  const {
    control,
  } = useFormContext();
  const missingLocales = useTranslatedFormMissingLocales(control, translatedFields);
  const {
    errors,
  } = useFormState({ control });

  return (
    <div css={classes.bar}>
      <TranslationTabs
        errors={getTranslatedFormTabErrors(errors, translatedFields)}
        missingLocales={missingLocales}
        onTabChange={onTabChange}
        tab={tab}
      />
      <div css={classes.actions}>
        <Typography noWrap css={classes.savedAt} variant="body2">
          {savedAt
            ? (savedLabels?.savedAt ?? t('cms:cmsForm.savedAt', { date: fromNow(savedAt) }))
            : (savedLabels?.neverSaved ?? t('cms:cmsForm.neverSaved'))}
        </Typography>
        {actions}
        <Button
          css={isSaveKept ? undefined : classes.save}
          disabled={isSaveDisabled}
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

export default CmsFormToolbar;
