import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { ReplyContactInput } from '@/types/contact.type';
import { replyContactSchema } from '@/validations/email.validation';

type Props = {
  formId?: string;
  onSubmit: (values: ReplyContactInput) => void;
  onSecondaryButtonClick?: () => void;
};

const ReplyContactForm = ({
  formId, onSubmit, onSecondaryButtonClick,
}: Props) => {
  const {
    t,
  } = useTranslation();

  const form = useForm<ReplyContactInput>({
    resolver: zodResolver(replyContactSchema),
  });

  const {
    handleSubmit,
  } = form;

  const handleFormSubmit: SubmitHandler<ReplyContactInput> = (values) => {
    onSubmit(values);
  };

  return (
    <Form
      buttonDirection="row"
      buttonFullWidth={false}
      form={form}
      formId={formId}
      onSecondaryButtonClick={onSecondaryButtonClick}
      onSubmit={handleSubmit(handleFormSubmit)}
      primaryButtonText={t('user:contacts.send')}
    >
      <TextField
        fullWidth
        multiline
        name="message"
        placeholder={t('user:contacts.message')}
        rows={3}
        variant="outlined"
      />
    </Form>
  );
};

export default ReplyContactForm;
