import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { getAppErrorSelector } from '@/redux/reducers/app.reducer';
import { getUserLoadingSelector } from '@/redux/reducers/user.reducer';
import { SendEmailInput, ISendEmailDefaultValues } from '@/types/user.type';
import { sendEmailSchema } from '@/validations/email.validation';

type Props = {
  formId: string;
  onSubmit: (input: SendEmailInput) => void;
  initialValues: ISendEmailDefaultValues;
};

const SendEmailForm = ({
  formId, onSubmit, initialValues,
}: Props) => {
  const {
    t,
  } = useTranslation();
  const loading = useSelector(getUserLoadingSelector);
  const appError = useSelector(getAppErrorSelector);

  const form = useForm<SendEmailInput>({
    resolver: zodResolver(sendEmailSchema),
    defaultValues: initialValues,
  });

  const {
    handleSubmit,
  } = form;

  const onSubmitHandler: SubmitHandler<SendEmailInput> = (input) => {
    onSubmit(input);
  };

  return (
    <Form
      error={appError}
      form={form}
      formId={formId}
      loading={loading}
      onSubmit={handleSubmit(onSubmitHandler)}
    >
      <TextField
        disabled
        required
        label={t('email')}
        name="email"
        type="email"
        variant="standard"
      />
      <TextField
        required
        label={t('subject')}
        name="subject"
        type="text"
        variant="standard"
      />
      <TextField
        multiline
        required
        label={t('message')}
        name="message"
        rows={4}
        type="text"
        variant="standard"
      />
    </Form>
  );
};

export default SendEmailForm;
