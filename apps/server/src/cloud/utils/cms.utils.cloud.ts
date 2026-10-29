import { LOCALES } from '@/utils/constants';
import { cutMetaDescription, cutMetaTitle, slugify } from '@/utils/util';

/**
 * add default values to translated fields if not defined
 * @param translated
 * @returns
 */
export const getPageTranslatedDefaultValues = (translated: Record<string, any>) => {
  // create slug for translated title fields
  for (const local of LOCALES) {
    if (translated[local]) {
      // locale field, ex: fr, en, ...
      const translatedLocaleValues = translated[local];

      /*
       * fields inside the locale field
       * ---------- slug ---------- //
       * slug defined manually (via form) or automatically (by name field)
       */
      const slug = translatedLocaleValues.slug || translatedLocaleValues.title;
      const translatedSlug = slugify(slug);

      // title default value if not defined
      if (!translatedLocaleValues.title && translatedLocaleValues.name) {
        translatedLocaleValues.title = translatedLocaleValues.name;
      }

      // metaTitle default value if not defined
      if (!translatedLocaleValues.metaTitle) {
        const metaTitle = translatedLocaleValues.title || translatedLocaleValues.name || '';

        if (metaTitle) {
          translatedLocaleValues.metaTitle = cutMetaTitle(metaTitle);
        }
      }

      // metaDescription default value if not defined
      if (!translatedLocaleValues.metaDescription) {
        let metaDescription;

        if (translatedLocaleValues.description) {
          metaDescription = cutMetaDescription(translatedLocaleValues.description);
        }
        else {
          metaDescription = translatedLocaleValues.title || '';
        }

        translatedLocaleValues.metaDescription = metaDescription;
      }

      translated[local] = { ...translatedLocaleValues, slug: translatedSlug || '' };
    }
  }

  return translated;
};


/**
 * add default values to translated fields if not defined
 * @param translated
 * @returns
 */
export const getArticleTranslatedDefaultValues = (translated: Record<string, any>) => {
  /*
   * create slug for translated title fields
   * create slug for translated title fields
   */
  for (const local of LOCALES) {
    if (translated[local]) {
      // locale field, ex: fr, en, ...
      const translatedLocaleValues = translated[local];
      /*
       * fields inside the locale field
       * ---------- slug ---------- //
       * slug defined manually (via form) or automatically (by name field)
       */
      const slug = translatedLocaleValues.slug || translatedLocaleValues.title;
      const translatedSlug = slugify(slug);

      if (!translatedLocaleValues.metaTitle && translatedLocaleValues.title) {
        translatedLocaleValues.metaTitle = cutMetaTitle(translatedLocaleValues.title);
      }


      if (!translatedLocaleValues.metaDescription && translatedLocaleValues.title) {
        translatedLocaleValues.metaDescription = translatedLocaleValues.title;
      }

      translated[local] = { ...translatedLocaleValues, slug: translatedSlug || '' };
    }
  }

  return translated;
};
