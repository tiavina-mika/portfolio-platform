import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import DateRangeField from '@/components/form/fields/DateRangeField';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import ToggleButtonsField from '@/components/form/inputs/ToggleButtonsField';
import AdvancedSearchForm from '@/components/search/AdvancedSearchForm';
import {
  paymentServiceOptions, paymentStatusOptions, paymentTypeOptions,
} from '@/constants/_core/payment.constants';
import { useAllowedCountryOptions } from '@/hooks/_core/useAllowedCountryOptions';
import { getPaymentLedgerSummarySelector } from '@/redux/reducers/_core/payment.reducer';
import { IAdvancedSearchOption, ISelectOption } from '@/types/_core/app.type';
import { PaymentFiltersInput } from '@/types/_core/payment.type';
import { paymentFilterSchema } from '@/validations/_core/payment.validations';

type Props = {
  onSubmit: (values: PaymentFiltersInput) => void;
};

const PaymentAdvancedFilterForm = ({
  onSubmit,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const countryOptions = useAllowedCountryOptions();
  const ledgerSummary = useSelector(getPaymentLedgerSummarySelector);

  /*
   * the messages the gateway has actually produced, read back off the ledger rather than listed
   * here: an operator rewords its own errors, and a hardcoded list goes stale without anything
   * saying so — the filter would simply stop matching
   */
  const failureReasonOptions: ISelectOption[] = (ledgerSummary?.failureReasons ?? []).map(
    (reason: string) => ({ label: reason, value: reason })
  );

  const fields: IAdvancedSearchOption[] = [
    {
      label: t('common:status'),
      name: 'status',
      component: (
        <ToggleButtonsField isMulti name="status" options={paymentStatusOptions} />
      ),
    },
    {
      label: t('user:payments.operator'),
      name: 'service',
      component: (
        <ToggleButtonsField isMulti name="service" options={paymentServiceOptions} />
      ),
    },
    {
      label: t('user:payments.type'),
      name: 'type',
      component: (
        <ToggleButtonsField isMulti name="type" options={paymentTypeOptions} />
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
      label: t('user:payments.minAmount'),
      name: 'minAmount',
      component: (
        <TextField
          fullWidth
          name="minAmount"
          slotProps={{ inputLabel: { shrink: true } }}
          type="number"
        />
      ),
    },
    {
      label: t('user:payments.maxAmount'),
      name: 'maxAmount',
      component: (
        <TextField
          fullWidth
          name="maxAmount"
          slotProps={{ inputLabel: { shrink: true } }}
          type="number"
        />
      ),
    },
    {
      label: t('common:createdAt'),
      name: 'createdAt',
      component: <DateRangeField endDefaultsToToday name="createdAt" />,
    },
    {
      label: t('user:payments.payer'),
      name: 'payer',
      component: (
        <TextField
          fullWidth
          name="payer"
          placeholder={t('user:nameEmailOrPhone')}
        />
      ),
    },
    {
      label: t('user:payments.receiver'),
      name: 'receiver',
      component: (
        <TextField
          fullWidth
          name="receiver"
          placeholder={t('user:nameEmailOrPhone')}
        />
      ),
    },
  ];

  /*
   * offered only once there is something to pick from — an empty select says the ledger holds no
   * failure to filter by, which is not the same thing as a filter that has not loaded yet
   */
  if (failureReasonOptions.length > 0) {
    fields.push({
      label: t('user:payments.failureReason'),
      name: 'failureReason',
      component: (
        <SelectField
          isClearable
          name="failureReason"
          options={failureReasonOptions}
          placeholder={t('user:payments.allFailureReasons')}
        />
      ),
    });
  }

  return (
    <AdvancedSearchForm<PaymentFiltersInput>
      fields={fields}
      onSubmit={onSubmit}
      schema={paymentFilterSchema}
    />
  );
};

export default PaymentAdvancedFilterForm;
