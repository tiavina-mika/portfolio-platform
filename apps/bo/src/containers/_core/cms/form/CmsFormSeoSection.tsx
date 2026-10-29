import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { ReactNode } from 'react';

import CardFormBlock from '@/components/form/CardFormBlock';
import MetaTextField from '@/components/form/fields/MetaTextField';
import TextToChipsField from '@/components/form/fields/TextToChipsField';
import TranslatedSlugField from '@/containers/_core/cms/TranslatedSlugField';
import { Locale } from '@/types/_core/setting.type';

type Props = {
  /** the language tab currently open — the section only ever shows one locale's fields */
  locale: Locale;
  /** the translated field the slug is previewed from while it is empty, ex: `name` or `title` */
  slugSourceField: string;
  /** path of the public page between the locale and the slug, ex: '/blog/' for an article, '/' for a page */
  basePath: string;
  /** the record the slug identifies, ex: "the article" */
  theEntity: string;
  /** what the slug is kept in sync with, under the field — defaults to the article/page title wording */
  slugHelperText?: string;
  /** fields a record adds to its own SEO, ex: the page's social share picture */
  children?: ReactNode;
};

/**
 * How the record is found and how it shows up elsewhere: its slug, its tags, and the title and
 * description search engines print. What all of that produces is drawn live in the preview column
 * next to the section.
 */
const CmsFormSeoSection = ({
  locale, slugSourceField, basePath, theEntity, slugHelperText, children,
}: Props) => {
  const {
    t,
  } = useTranslation(['common', 'cms']);

  return (
    <CardFormBlock description={t('cms:seoDescription')} title={t('cms:seo')}>
      <Stack spacing={2}>
        <TranslatedSlugField
          basePath={basePath}
          helperText={slugHelperText ?? t('cms:cmsForm.slugHelper')}
          locale={locale}
          sourceField={slugSourceField}
          tab={locale}
          theEntity={theEntity}
        />

        <TextToChipsField
          label="Tags"
          name={locale + ':tags'}
          placeholder={t('common:infoMessages.separateTagsWithComma')}
          tooltip={t('common:infoMessages.tagsHelper')}
        />

        <MetaTextField
          fixedLabel
          fullWidth
          name={locale + ':metaTitle'}
          type="metaTitle"
        />
        <MetaTextField
          fixedLabel
          fullWidth
          name={locale + ':metaDescription'}
          type="metaDescription"
        />
        {children}
      </Stack>
    </CardFormBlock>
  );
};

export default CmsFormSeoSection;
