import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { pageLinkLocationOptions } from '@/constants/_core/cms.constants';
import CmsFormSummary from '@/containers/_core/cms/form/CmsFormSummary';
import { ISelectOption } from '@/types/_core/app.type';
import { PageStatusEnum } from '@/types/_core/page.type';
import { getTranslatedPageStatusLabel } from '@/utils/_core/cms.utils';

/**
 * What the category and settings sections of the page form add up to, restated as four facts:
 * whether the page is on the site, where it sits in the category tree, which navigation links to
 * it, and the code the apps look it up by.
 */
const PageFormSummary = () => {
  const {
    t,
  } = useTranslation(['common', 'cms']);
  const {
    control,
  } = useFormContext();

  /*
   * `categories` is the field actually saved on the page, and the category section keeps it in
   * sync with the deepest level picked in its cascade — so the summary reads it rather than the
   * three choice rows, whose values are ids the labels would have to be looked up from again
   */
  const [active, code, linkLocations, categories] = useWatch({
    control,
    name: ['active', 'code', 'linkLocations', 'categories'],
  });

  const status = active
    ? PageStatusEnum.PUBLISHED
    : PageStatusEnum.UNPUBLISHED;

  const selectedLinkLocations = ((linkLocations ?? []) as (string | ISelectOption)[])
    .map((location) => {
      const value = typeof location === 'string'
        ? location
        : location.value;

      return pageLinkLocationOptions.find((option) => option.value === value)?.label ?? String(value);
    });

  const selectedCategory = ((categories ?? []) as ISelectOption[])[0];

  return (
    <CmsFormSummary
      rows={[
        {
          label: t('common:status'),
          value: getTranslatedPageStatusLabel(status),
        },
        {
          label: t('cms:category.category'),
          value: selectedCategory?.label || t('cms:category.noCategory'),
        },
        {
          label: t('cms:linkLocation'),
          value: selectedLinkLocations.length
            ? selectedLinkLocations.join(' · ')
            : t('cms:pageForm.linkedNowhere'),
        },
        {
          label: t('cms:technicalCode'),
          value: (code as string) || '—',
          isCode: true,
        },
      ]}
    />
  );
};

export default PageFormSummary;
