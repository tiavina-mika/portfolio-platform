import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import TextField from '@/components/form/fields/TextField';
import { Locale } from '@/types/setting.type';
import { getServerUrl, slugify } from '@/utils/utils';

type Props = {
  locale: string;
  tab: Locale;
};

const TranslatedSlugField = ({
  locale, tab,
}: Props) => {
  const {
    t,
  } = useTranslation();
  const {
    watch,
  } = useFormContext();

  // helper text below slug input
  const transformSlugPreview = useCallback(
    (value: string): string => {
      let text = '../../'; // default value
      const translatedFieldValue = watch(tab + ':name'); // field to watch and get the change

      if (value) {
        text = slugify(value);
      }
      else if (translatedFieldValue) {
        text = slugify(translatedFieldValue);
      }

      return text;
    },
    [watch, tab]
  );

  return (
    <TextField
      fixedLabel
      fullWidth
      label="Slug"
      name={locale + ':slug'}
      preview={getServerUrl() + '/'}
      tooltip={t('common:uniqueUrl', { theEntity: t('cms:category.theCategory') })}
      transformValuePreview={transformSlugPreview}
      type="text"
      variant="outlined"
    />
  );
};

export default TranslatedSlugField;
