import { useWatch, useFormState, useFormContext } from 'react-hook-form';

import { locales } from '@/config/i18n';
import {
  CmsFormSectionEnum, ICmsFormSectionProgress, ICmsFormSections,
} from '@/types/_core/cms.type';
import { Locale } from '@/types/_core/setting.type';
import { isCmsFormFieldFilled } from '@/utils/_core/cms.utils';

export type CmsFormSectionsProgress = {
  bySection: Record<CmsFormSectionEnum, ICmsFormSectionProgress>;
  filled: number;
  total: number;
  errors: number;
};

/**
 * How full each section of a CMS form is, and how many of its fields the schema currently refuses
 * — what the summary rail, the progress card and the footer bar are all drawn from.
 *
 * It is deliberately a hook rather than a value computed by the form and passed down: `useWatch`
 * re-renders whatever calls it on every keystroke, and the section being filled holds a rich text
 * editor that must not be re-rendered while it is being typed into. Called from the rail and the
 * footer instead, the subscription stays in the two small components that actually display it.
 *
 * Only the open language tab is counted. An editor filling the English version wants to know what
 * is missing in English — a section reading "full" because French was done says nothing about the
 * tab in front of them. Errors are counted across every locale, since a refused field blocks the
 * save whichever language it belongs to.
 */
export const useCmsFormSections = (config: ICmsFormSections, tab: Locale): CmsFormSectionsProgress => {
  const {
    control,
  } = useFormContext();

  const getCountedNames = (section: CmsFormSectionEnum): string[] => [
    ...config.translatedFields[section].map((field) => `${tab}:${field}`),
    ...config.plainFields[section],
  ];

  const watchedNames = config.sections.flatMap(getCountedNames);

  const watchedValues = useWatch({ control, name: watchedNames });
  const {
    errors,
  } = useFormState({ control });

  const valueByName: Record<string, unknown> = Object.fromEntries(
    watchedNames.map((name, index) => [name, watchedValues[index]])
  );

  const bySection = Object.fromEntries(config.sections.map((section) => {
    const names = getCountedNames(section);
    const ownedNames = [
      ...locales.flatMap((locale) => config.translatedFields[section].map((field) => `${locale}:${field}`)),
      ...config.plainFields[section],
      ...(config.uncountedFields[section] ?? []),
    ];

    return [section, {
      filled: names.filter((name) => isCmsFormFieldFilled(valueByName[name])).length,
      total: names.length,
      errors: ownedNames.filter((name) => !!errors[name]).length,
    }];
  })) as Record<CmsFormSectionEnum, ICmsFormSectionProgress>;

  const progresses = Object.values(bySection);

  return {
    bySection,
    filled: progresses.reduce((total, progress) => total + progress.filled, 0),
    total: progresses.reduce((total, progress) => total + progress.total, 0),
    errors: progresses.reduce((total, progress) => total + progress.errors, 0),
  };
};
