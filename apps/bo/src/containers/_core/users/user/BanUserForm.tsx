import { zodResolver } from '@hookform/resolvers/zod';
import { BanReasonEnum, BanTypeEnum } from '@shared/types';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';


import DatePickerField from '@/components/form/fields/DatePickerField';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { getAppErrorSelector } from '@/redux/reducers/_core/app.reducer';
import { getUserLoadingSelector } from '@/redux/reducers/_core/user.reducer';
import { ISelectOption } from '@/types/_core/app.type';
import { BanUserInput } from '@/types/_core/user.type';
import { banUserFormSchema } from '@/validations/_core/user.validations';

type Props = {
  formId: string;
  onSubmit: (input: BanUserInput) => void;
};

const BanUserForm = ({ formId, onSubmit }: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const loading = useSelector(getUserLoadingSelector);
  const appError = useSelector(getAppErrorSelector);

  const form = useForm<BanUserInput>({
    resolver: zodResolver(banUserFormSchema),
    defaultValues: { type: BanTypeEnum.TEMPORARY, reason: BanReasonEnum.OTHER },
  });

  const { watch } = form;

  const type = watch('type');

  const typeOptions: ISelectOption[] = [
    { label: t('user:bans.types.temporary'), value: BanTypeEnum.TEMPORARY },
    { label: t('user:bans.types.permanent'), value: BanTypeEnum.PERMANENT },
  ];

  const reasonOptions: ISelectOption[] = [
    { label: t(`user:bans.reasons.${BanReasonEnum.FRAUD}`), value: BanReasonEnum.FRAUD },
    { label: t(`user:bans.reasons.${BanReasonEnum.HARASSMENT}`), value: BanReasonEnum.HARASSMENT },
    {
      label: t(`user:bans.reasons.${BanReasonEnum.NO_SHOW_REPEATED}`),
      value: BanReasonEnum.NO_SHOW_REPEATED,
    },
    { label: t(`user:bans.reasons.${BanReasonEnum.FAKE_PROFILE}`), value: BanReasonEnum.FAKE_PROFILE },
    {
      label: t(`user:bans.reasons.${BanReasonEnum.SAFETY_VIOLATION}`),
      value: BanReasonEnum.SAFETY_VIOLATION,
    },
    { label: t(`user:bans.reasons.${BanReasonEnum.OTHER}`), value: BanReasonEnum.OTHER },
  ];

  return (
    <Form
      error={appError}
      form={form}
      formId={formId}
      loading={loading}
      onSubmit={onSubmit}
    >
      <SelectField
        required
        label={t('user:bans.type')}
        name="type"
        options={typeOptions}
      />
      <SelectField
        required
        label={t('user:bans.reason')}
        name="reason"
        options={reasonOptions}
      />
      {type === BanTypeEnum.TEMPORARY && (
        <DatePickerField
          withHour
          disableFuture={false}
          helperText={t('user:bans.untilHelper')}
          label={t('user:bans.until')}
          name="until"
        />
      )}
      <TextField
        multiline
        label={t('user:bans.reasonDetails')}
        name="reasonDetails"
        rows={3}
        type="text"
      />
    </Form>
  );
};

export default BanUserForm;
