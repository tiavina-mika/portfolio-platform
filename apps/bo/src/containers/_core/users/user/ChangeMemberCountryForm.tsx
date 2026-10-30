import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { getAppErrorSelector } from '@/redux/reducers/_core/app.reducer';
import { getUserLoadingSelector } from '@/redux/reducers/_core/user.reducer';
import { ChangeMemberCountryFormInput } from '@/types/_core/user.type';
import { getCountryOptions } from '@/utils/_core/country.utils';
import { changeMemberCountryFormSchema } from '@/validations/_core/user.validations';

type Props = {
  formId: string;
  /** the country the account belongs to now: the form starts on it */
  currentCountry?: string;
  onSubmit: (input: ChangeMemberCountryFormInput) => void;
};

/**
 * What support picks to move a member's account to another country, and the reason that is kept in
 * the member's history. The country sets the currency, the SMS provider and the languages the
 * account is served with, so it is only ever moved by hand.
 */
const ChangeMemberCountryForm = ({ formId, currentCountry = '', onSubmit }: Props) => {
  const { t } = useTranslation(['user']);
  const loading = useSelector(getUserLoadingSelector);
  const appError = useSelector(getAppErrorSelector);

  const form = useForm<ChangeMemberCountryFormInput>({
    resolver: zodResolver(changeMemberCountryFormSchema),
    defaultValues: { country: currentCountry, reason: '' },
  });

  return (
    <Form
      error={appError}
      form={form}
      formId={formId}
      loading={loading}
      onSubmit={onSubmit}
    >
      <SelectField
        label={t('user:detail.accountHelp.changeCountry.country')}
        name="country"
        options={getCountryOptions()}
      />

      <TextField
        multiline
        required
        helperText={t('user:detail.accountHelp.reasonHelper')}
        label={t('user:detail.accountHelp.reason')}
        name="reason"
        placeholder={t('user:detail.accountHelp.reasonPlaceholder')}
        rows={3}
        type="text"
      />
    </Form>
  );
};

export default ChangeMemberCountryForm;
