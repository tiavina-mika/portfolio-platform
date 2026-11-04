import { useRef } from 'react';
import { useFormContext } from 'react-hook-form';

/**
 * Keeps a translated slug in step with the field it is generated from (a page's name, an
 * article's title) while the admin has not customized it — otherwise every keystroke would
 * overwrite their own slug. Returns the handler to give that source field's `onFieldChange`.
 *
 * The slug's current value can't be compared to empty/falsy to detect a manual edit (that check
 * blocks sync as soon as the first auto-filled character lands, since the field is then
 * non-empty). Instead, it is compared to the last value *we* wrote for this locale: if it still
 * matches, the field is still in auto-sync mode; if it diverges, the admin edited it directly (or
 * it was preloaded from an existing record) and auto-sync must stop.
 */
export const useSlugAutoSync = (locale: string) => {
  const {
    getValues, setValue,
  } = useFormContext();

  // remembers, per locale, the last slug value we auto-generated from the source field
  const lastAutoSlugByLocale = useRef<Record<string, string>>({});

  return (value: string | number) => {
    const slugFieldName = `${locale}:slug`;
    const currentSlug = getValues(slugFieldName);

    if (currentSlug && currentSlug !== lastAutoSlugByLocale.current[locale]) return;

    lastAutoSlugByLocale.current[locale] = String(value);
    setValue(slugFieldName, value, { shouldValidate: true });
  };
};
