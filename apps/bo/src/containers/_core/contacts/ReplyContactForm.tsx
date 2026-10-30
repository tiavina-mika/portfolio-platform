import { zodResolver } from '@hookform/resolvers/zod';
import { TICKET_ATTACHMENT_MAX_COUNT } from '@shared/constants';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import DropzoneField from '@/components/form/dropzone/DropzoneField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { TICKET_ATTACHMENT_ACCEPT } from '@/constants/_core/file.constants';
import { SendTicketMessageInput } from '@/types/_core/ticket-message.type';
import { sendTicketMessageSchema } from '@/validations/_core/ticket-message.validations';

type Props = {
  formId?: string;
  onSubmit: (values: SendTicketMessageInput) => void;
  onSecondaryButtonClick?: () => void;
};

const ReplyContactForm = ({
  formId, onSubmit, onSecondaryButtonClick,
}: Props) => {
  const {
    t,
  } = useTranslation();

  const form = useForm<SendTicketMessageInput>({
    resolver: zodResolver(sendTicketMessageSchema),
  });

  const handleSubmit = (values: SendTicketMessageInput) => {
    onSubmit(values);
    form.reset();
  };

  return (
    <Form
      buttonDirection="row"
      buttonFullWidth={false}
      form={form}
      formId={formId}
      onSecondaryButtonClick={onSecondaryButtonClick}
      onSubmit={handleSubmit}
      primaryButtonText={t('user:contacts:send')}
    >
      <TextField
        fullWidth
        multiline
        name="message"
        placeholder={t('user:contacts.replyPlaceholder')}
        rows={3}
        variant="outlined"
      />
      <DropzoneField
        multiple
        accept={TICKET_ATTACHMENT_ACCEPT}
        inputLabel={t('user:contacts.addAttachment')}
        maxFiles={TICKET_ATTACHMENT_MAX_COUNT}
        name="attachments"
      />
    </Form>
  );
};

export default ReplyContactForm;
