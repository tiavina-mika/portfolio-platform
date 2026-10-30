import { useFormState } from 'react-hook-form';

import type { Theme } from '@mui/material/styles';
import type { Control } from 'react-hook-form';

import TranslationTabs from '@/components/form/translated/TranslationTabs';
import { TRANSLATED_CMS_FIELDS } from '@/constants/_core/cms.constants';
import {
  CATEGORY_FORM_TABS_BAR_PADDING_X, CATEGORY_FORM_TABS_BAR_PADDING_Y, FORM_WORKBENCH_PHONE_BREAKPOINT,
} from '@/constants/_core/ui.constants';
import { useTranslatedFormMissingLocales } from '@/hooks/_core/useTranslatedFormMissingLocales';
import { ICategoryInput } from '@/types/_core/category.type';
import { Locale } from '@/types/_core/setting.type';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';
import { getTranslatedFormTabErrors } from '@/utils/_core/utils';

type Placement = 'header' | 'band';

const classes = {
  /*
   * the strip lives in two places and only one is ever shown: in the header, between the title and
   * the actions, while it fits there — in a band pinned under the header on a phone, where its slots
   * share the full width
   */
  root: (placement: Placement) => (theme: Theme) => {
    if (placement === 'header') {
      return {
        flexShrink: 0,
        [theme.breakpoints.down(FORM_WORKBENCH_PHONE_BREAKPOINT)]: { display: 'none' },
      };
    }

    const tokens = getDesignTokens(theme);

    return {
      padding: `${CATEGORY_FORM_TABS_BAR_PADDING_Y}px ${CATEGORY_FORM_TABS_BAR_PADDING_X}px`,
      backgroundColor: tokens.surface,
      borderBottom: `1px solid ${tokens.borderLight}`,
      [theme.breakpoints.up(FORM_WORKBENCH_PHONE_BREAKPOINT)]: { display: 'none' },
    };
  },
};

type Props = {
  placement: Placement;
  /** the strip stands outside of the form, in the dialog's header, so it is handed the form's control */
  control: Control<ICategoryInput>;
  tab: Locale;
  onTabChange: (value: Locale) => void;
};

/**
 * The language the category form is being filled in: every translated field of the form — name,
 * slug, tags, meta title and description — follows the tab picked here. Each tab shows whether its
 * translation is filled in and turns red when one of its fields was refused.
 */
const CategoryFormTranslationTabs = ({
  placement, control, tab, onTabChange,
}: Props) => {
  const missingLocales = useTranslatedFormMissingLocales(control, TRANSLATED_CMS_FIELDS);
  const {
    errors,
  } = useFormState({ control });

  return (
    <div css={classes.root(placement)}>
      <TranslationTabs
        errors={getTranslatedFormTabErrors(errors, TRANSLATED_CMS_FIELDS)}
        missingLocales={missingLocales}
        onTabChange={onTabChange}
        tab={tab}
      />
    </div>
  );
};

export default CategoryFormTranslationTabs;
