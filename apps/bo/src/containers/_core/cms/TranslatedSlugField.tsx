import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import TextField from '@/components/form/fields/TextField';
import { Locale } from '@/types/_core/setting.type';
import { getServerUrl, getWebsiteUrl, slugify } from '@/utils/_core/utils';

type Props = {
  locale: string;
  tab: Locale;
  /** the translated field the slug is previewed from while it is empty — a page's name, an article's title */
  sourceField?: string;
  /**
   * path of the public page on the website, between the locale and the slug, ex: '/blog/' for an
   * article — when given, the preview under the field is the address the visitor will open
   */
  basePath?: string;
  /** the record the slug identifies, as the tooltip names it, ex: "the article" */
  theEntity?: string;
  helperText?: string;
};

const TranslatedSlugField = ({
  locale, tab, sourceField = 'name', basePath, theEntity, helperText,
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
      const translatedFieldValue = watch(tab + ':' + sourceField); // field to watch and get the change

      if (value) {
        text = slugify(value);
      }
      else if (translatedFieldValue) {
        text = slugify(translatedFieldValue);
      }

      return text;
    },
    [watch, tab, sourceField]
  );

  return (
    <TextField
      fixedLabel
      fullWidth
      helperText={helperText}
      label="Slug"
      name={locale + ':slug'}
      tooltip={t('common:uniqueUrl', { theEntity: theEntity ?? t('cms:category.theCategory') })}
      transformValuePreview={transformSlugPreview}
      type="text"
      variant="outlined"
      preview={basePath
        ? `${getWebsiteUrl()}/${locale}${basePath}`
        : getServerUrl() + '/'}
    />
  );
};

export default TranslatedSlugField;
