import { BoxIncludeEnum, WebsiteEnum } from '@shared/types';
import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import {
  BOX_DURATION_DAYS_MAX, BOX_DURATION_DAYS_MIN, BOX_PRICE_MAX, BOX_PRICE_MIN,
} from '@/constants/_core/cms.constants';
import { ISelectOption } from '@/types/_core/app.type';
import { IWebsiteAttributes } from '@/types/_core/website.type';

/**
 * Which websites a content is written for — the portfolio, the box, or both. A content for the box
 * alone belongs to the Aldaron website; as soon as the box is one of the websites, what the box
 * includes, what it costs and how long it takes are asked for.
 */
const CmsWebsiteFields = () => {
  const {
    t,
  } = useTranslation(['common', 'cms']);
  const {
    control,
  } = useFormContext<IWebsiteAttributes>();
  const websites = useWatch({ control, name: 'websites' });

  const websiteOptions: ISelectOption[] = useMemo(() => [
    { label: t('cms:website.portfolio'), value: WebsiteEnum.PORTFOLIO },
    { label: t('cms:website.box'), value: WebsiteEnum.BOX },
  ], [t]);

  const boxIncludeOptions: ISelectOption[] = useMemo(() => [
    { label: t('cms:website.include.staticWebsite'), value: BoxIncludeEnum.STATIC_WEBSITE },
    { label: t('cms:website.include.mobile'), value: BoxIncludeEnum.MOBILE },
    { label: t('cms:website.include.backOffice'), value: BoxIncludeEnum.BACK_OFFICE },
    { label: t('cms:website.include.webApp'), value: BoxIncludeEnum.WEB_APP },
  ], [t]);

  const isBox = !!websites?.includes(WebsiteEnum.BOX);
  const isBoxOnly = isBox && websites?.length === 1;

  return (
    <>
      <SelectField
        isMulti
        helperText={isBoxOnly ? t('cms:website.boxOnlyHelper') : t('cms:website.websitesHelper')}
        label={t('cms:website.websites')}
        name="websites"
        options={websiteOptions}
        variant="outlined"
      />

      {isBox && (
        <>
          <SelectField
            isClearable
            isMulti
            helperText={t('cms:website.boxIncludesHelper')}
            label={t('cms:website.boxIncludes')}
            name="boxIncludes"
            options={boxIncludeOptions}
            variant="outlined"
          />
          <TextField
            fixedLabel
            fullWidth
            label={t('cms:website.boxPrice')}
            name="boxPrice"
            slotProps={{ htmlInput: { min: BOX_PRICE_MIN, max: BOX_PRICE_MAX } }}
            type="number"
            variant="outlined"
          />
          <TextField
            fixedLabel
            fullWidth
            label={t('cms:website.boxDurationDays')}
            name="boxDurationDays"
            slotProps={{ htmlInput: { min: BOX_DURATION_DAYS_MIN, max: BOX_DURATION_DAYS_MAX } }}
            type="number"
            variant="outlined"
          />
        </>
      )}
    </>
  );
};

export default CmsWebsiteFields;
