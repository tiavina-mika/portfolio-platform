import { useMemo } from 'react';
import {
  type Control, type FieldValues, useWatch,
} from 'react-hook-form';

import { locales } from '@/config/i18n';
import { DEFAULT_LOCALE } from '@/constants/_core/app.constants';
import { getTranslatedFormMissingLocales } from '@/utils/_core/utils';

/**
 * locales still missing a translation in a translated form, kept live while the editor types so the
 * translation tabs can flag them as they fill in
 */
export const useTranslatedFormMissingLocales = <T extends FieldValues>(
  control: Control<T>,
  translatedFields: string[] | Set<string>
): string[] => {
  const values = useWatch({ control });

  return useMemo(
    () => getTranslatedFormMissingLocales(
      values as Record<string, unknown>,
      translatedFields,
      locales,
      DEFAULT_LOCALE
    ),
    [values, translatedFields]
  );
};
