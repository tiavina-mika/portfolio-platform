import { useTranslation } from 'react-i18next';

import DateRangeField from '@/components/form/fields/DateRangeField';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import ToggleButtonsField from '@/components/form/inputs/ToggleButtonsField';
import AdvancedSearchForm from '@/components/search/AdvancedSearchForm';
import {
  REPORT_AGE_FILTER_OPTIONS, REPORT_REASON_OPTIONS, REPORT_STATUS_OPTIONS,
  REPORT_TARGET_TYPE_OPTIONS,
} from '@/constants/_core/report.constants';
import { useAllowedCountryOptions } from '@/hooks/_core/useAllowedCountryOptions';
import { ReportFiltersInput } from '@/types/_core/report.type';
import { reportFilterSchema } from '@/validations/_core/report.validations';

type Props = {
  onSubmit: (values: ReportFiltersInput) => void;
};

/**
 * The eight questions an operator asks of the report queue. They are ordered the way a case is
 * narrowed down: where the report stands, what kind of thing it is about, why it was filed, who
 * or what it names, which country it comes from, and only then when it arrived and how long it has
 * been waiting.
 */
const ReportAdvancedFilterForm = ({ onSubmit }: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const countryOptions = useAllowedCountryOptions();

  return (
    <AdvancedSearchForm<ReportFiltersInput>
      onSubmit={onSubmit}
      schema={reportFilterSchema}
      fields={[
        {
          label: t('user:reports.status'),
          name: 'statuses',
          component: <ToggleButtonsField isMulti name="statuses" options={REPORT_STATUS_OPTIONS} />,
        },
        {
          label: t('user:reports.targetType'),
          name: 'targetTypes',
          component: (
            <ToggleButtonsField isMulti name="targetTypes" options={REPORT_TARGET_TYPE_OPTIONS} />
          ),
        },
        {
          label: t('user:reports.reason'),
          name: 'reasons',
          component: <ToggleButtonsField isMulti name="reasons" options={REPORT_REASON_OPTIONS} />,
        },
        {
          label: t('user:reports.target'),
          name: 'target',
          component: (
            <TextField fullWidth name="target" placeholder={t('user:reports.targetPlaceholder')} />
          ),
        },
        {
          label: t('user:reports.reportedBy'),
          name: 'reportedBy',
          component: (
            <TextField fullWidth name="reportedBy" placeholder={t('user:nameEmailOrPhone')} />
          ),
        },
        {
          label: t('common:country'),
          name: 'countries',
          component: (
            <SelectField
              isClearable
              isMulti
              label={t('common:country')}
              name="countries"
              options={countryOptions}
            />
          ),
        },
        {
          label: t('common:createdAt'),
          name: 'createdAt',
          component: <DateRangeField endDefaultsToToday name="createdAt" />,
        },
        {
          label: t('user:reports.age'),
          name: 'minAgeDays',
          component: <ToggleButtonsField name="minAgeDays" options={REPORT_AGE_FILTER_OPTIONS} />,
        },
      ]}
    />
  );
};

export default ReportAdvancedFilterForm;
