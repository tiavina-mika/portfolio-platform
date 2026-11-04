import { zodResolver } from '@hookform/resolvers/zod';
import { ContactChangeTypeEnum } from '@shared/types';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import ToggleButtonsField from '@/components/form/inputs/ToggleButtonsField';
import { getAppErrorSelector } from '@/redux/reducers/_core/app.reducer';
import { getUserLoadingSelector } from '@/redux/reducers/_core/user.reducer';
import { ISelectOption } from '@/types/_core/app.type';
import { ChangeMemberContactFormInput } from '@/types/_core/user.type';
import { changeMemberContactFormSchema } from '@/validations/_core/user.validations';

type Props = {
  formId: string;
  onSubmit: (input: ChangeMemberContactFormInput) => void;
};

/**
 * What support replaces on a member's account after checking who they are: the phone number or the
 * email, whichever the member lost, and the reason. The new contact needs no code — nobody can
 * receive one on a contact they do not have yet — so the reason is what stands in for the proof.
 */
const ChangeMemberContactForm = ({ formId, onSubmit }: Props) => {
  const { t } = useTranslation(['user']);
  const loading = useSelector(getUserLoadingSelector);
  const appError = useSelector(getAppErrorSelector);

  const form = useForm<ChangeMemberContactFormInput>({
    resolver: zodResolver(changeMemberContactFormSchema),
    defaultValues: {
      type: ContactChangeTypeEnum.PHONE, phone: '', email: '', reason: '',
    },
  });

  const isPhone = form.watch('type') === ContactChangeTypeEnum.PHONE;

  const typeOptions: ISelectOption<ContactChangeTypeEnum>[] = [
    {
      label: t('user:detail.accountHelp.changeContact.types.phone'),
      value: ContactChangeTypeEnum.PHONE,
    },
    {
      label: t('user:detail.accountHelp.changeContact.types.email'),
      value: ContactChangeTypeEnum.EMAIL,
    },
  ];

  return (
    <Form
      error={appError}
      form={form}
      formId={formId}
      loading={loading}
      onSubmit={onSubmit}
    >
      <ToggleButtonsField
        disableDeselect
        label={t('user:detail.accountHelp.changeContact.type')}
        name="type"
        options={typeOptions}
        size="small"
      />

      {/* the field follows the type: one value at a time, so the other one never reaches the server */}
      {isPhone
        ? (
          <TextField
            fixedLabel
            fullWidth
            required
            label={t('user:detail.accountHelp.changeContact.phone')}
            name="phone"
            placeholder={t('user:detail.accountHelp.changeContact.phonePlaceholder')}
            type="tel"
          />
        )
        : (
          <TextField
            fixedLabel
            fullWidth
            required
            label={t('user:detail.accountHelp.changeContact.email')}
            name="email"
            placeholder={t('user:detail.accountHelp.changeContact.emailPlaceholder')}
            type="email"
          />
        )}

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

export default ChangeMemberContactForm;
