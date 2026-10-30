import { LOCALES } from '@/constants/_core/constants';
import { cutMetaDescription, cutMetaTitle, slugify } from '@/utils/_core/utils';

/**
 * Fills the search-engine fields of every translated version of a project when they were left empty:
 * the slug falls back to the title, the meta title to the title and the meta description to the
 * description (or the title when there is none).
 * @param translated the project's `translated` field, one entry per locale
 * @returns the same object with the slug of each locale normalized
 */
export const getProjectTranslatedDefaultValues = (translated: Record<string, any>): Record<string, any> => {
  for (const locale of LOCALES) {
    const values = translated[locale];

    if (!values) continue;

    // slug defined manually (via the form) or automatically (from the title)
    const slug = slugify(values.slug || values.title || '');

    if (!values.metaTitle && values.title) {
      values.metaTitle = cutMetaTitle(values.title);
    }

    const metaDescription = values.description || values.title || '';

    if (!values.metaDescription && metaDescription) {
      values.metaDescription = cutMetaDescription(metaDescription);
    }

    translated[locale] = { ...values, slug };
  }

  return translated;
};
