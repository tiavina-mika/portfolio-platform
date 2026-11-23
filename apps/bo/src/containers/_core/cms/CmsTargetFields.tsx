import { OfferIncludeEnum, TargetEnum } from '@shared/types';
import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import {
  OFFER_DURATION_DAYS_MAX, OFFER_DURATION_DAYS_MIN, OFFER_PRICE_MAX, OFFER_PRICE_MIN,
} from '@/constants/_core/cms.constants';
import { ISelectOption } from '@/types/_core/app.type';
import { ITargetAttributes } from '@/types/_core/target.type';

/**
 * Where a content is published — the portfolio, Aldaron, or both. A content for Aldaron alone
 * belongs to the Aldaron website; as soon as Aldaron is one of the targets, what the offer
 * includes, what it costs and how long it takes are asked for.
 */
const CmsTargetFields = () => {
  const {
    t,
  } = useTranslation(['common', 'cms']);
  const {
    control,
  } = useFormContext<ITargetAttributes>();
  const targets = useWatch({ control, name: 'targets' });

  const targetOptions: ISelectOption[] = useMemo(() => [
    { label: t('cms:target.portfolio'), value: TargetEnum.PORTFOLIO },
    { label: t('cms:target.agency'), value: TargetEnum.AGENCY },
  ], [t]);

  const offerIncludeOptions: ISelectOption[] = useMemo(() => [
    { label: t('cms:target.include.staticWebsite'), value: OfferIncludeEnum.STATIC_WEBSITE },
    { label: t('cms:target.include.mobile'), value: OfferIncludeEnum.MOBILE },
    { label: t('cms:target.include.backOffice'), value: OfferIncludeEnum.BACK_OFFICE },
    { label: t('cms:target.include.webApp'), value: OfferIncludeEnum.WEB_APP },
  ], [t]);

  const isAgency = !!targets?.includes(TargetEnum.AGENCY);
  const isAgencyOnly = isAgency && targets?.length === 1;

  return (
    <>
      <SelectField
        isMulti
        helperText={isAgencyOnly ? t('cms:target.agencyOnlyHelper') : t('cms:target.targetsHelper')}
        label={t('cms:target.targets')}
        name="targets"
        options={targetOptions}
        variant="outlined"
      />

      {isAgency && (
        <>
          <SelectField
            isClearable
            isMulti
            helperText={t('cms:target.offerIncludesHelper')}
            label={t('cms:target.offerIncludes')}
            name="offerIncludes"
            options={offerIncludeOptions}
            variant="outlined"
          />
          <TextField
            fixedLabel
            fullWidth
            label={t('cms:target.offerPrice')}
            name="offerPrice"
            slotProps={{ htmlInput: { min: OFFER_PRICE_MIN, max: OFFER_PRICE_MAX } }}
            type="number"
            variant="outlined"
          />
          <TextField
            fixedLabel
            fullWidth
            label={t('cms:target.offerDurationDays')}
            name="offerDurationDays"
            slotProps={{ htmlInput: { min: OFFER_DURATION_DAYS_MIN, max: OFFER_DURATION_DAYS_MAX } }}
            type="number"
            variant="outlined"
          />
        </>
      )}
    </>
  );
};

export default CmsTargetFields;
