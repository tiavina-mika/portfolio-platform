import { Typography } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import CardFormBlock from '@/components/form/CardFormBlock';
import TextField from '@/components/form/fields/TextField';
import { DEFAULT_LOCALE } from '@/constants/_core/app.constants';
import { PAGE_SECTION_TRANSLATED_FIELDS } from '@/constants/_core/cms.constants';
import { useTranslatedFormMissingLocales } from '@/hooks/_core/useTranslatedFormMissingLocales';
import { Locale } from '@/types/_core/setting.type';
import { getMissingTranslationColor } from '@/utils/_core/theme/styles.utils';

const classes = {
  missing: (theme: Theme) => ({ color: getMissingTranslationColor(theme) }),
};

type Props = {
  /** the language tab the fields are shown in */
  tab: Locale;
};

/**
 * The section's own fields — its title and description in the open language — and, under them,
 * the languages the section still has no title in. The language tabs flag those too, but they sit
 * at the top of the screen; the line here stands next to the field that fills them.
 */
const PageSectionDetailsCard = ({ tab }: Props) => {
  const {
    t,
  } = useTranslation(['common', 'cms']);
  const {
    control,
  } = useFormContext();
  /*
   * subscribed here rather than in the form: it watches every value, and the block editor next to
   * this card holds a rich text editor that must not re-render on every keystroke
   */
  const missingLocales = useTranslatedFormMissingLocales(control, PAGE_SECTION_TRANSLATED_FIELDS);

  return (
    <CardFormBlock title={t('cms:section')}>
      {/* keyed by the tab so switching language mounts the fields of that language */}
      <TextField
        fixedLabel
        fullWidth
        key={`${tab}:title`}
        label={t('common:title')}
        name={`${tab}:title`}
        placeholder={t('cms:sectionForm.sectionTitlePlaceholder')}
        required={tab === DEFAULT_LOCALE}
        type="text"
        variant="outlined"
      />
      <TextField
        fixedLabel
        fullWidth
        multiline
        key={`${tab}:description`}
        label={t('common:description')}
        name={`${tab}:description`}
        placeholder={t('cms:sectionForm.sectionDescriptionPlaceholder')}
        rows={3}
        type="text"
        variant="outlined"
      />
      {!!missingLocales.length && (
        <Typography css={classes.missing} variant="body2">
          {t('cms:sectionForm.missingTranslations', {
            value: missingLocales.map((locale) => locale.toUpperCase()).join(', '),
          })}
        </Typography>
      )}
    </CardFormBlock>
  );
};

export default PageSectionDetailsCard;
