'use client';

import { useTranslations } from 'next-intl';

import TextAreaField from '@/components/forms/fields/TextAreaField';
import TextField from '@/components/forms/fields/TextField';
import Form from '@/components/forms/Form';
import { useServerAction } from '@/hooks/useServerAction';
import { Locale } from '@/i18n/config';
import { createContact } from '@/server/mutations/app.mutation';
import { IContactInput } from '@/types/app.type';
import { cn } from '@/utils/app.utils';
import { ContactSchema } from '@/validations/app.validations';

export type ContactFormProps = {
  className?: string;
  withLabel?: boolean;
  locale?: Locale;
};
const ContactForm = ({
  className,
  locale,
  withLabel = false,
}: ContactFormProps) => {
  const tContact = useTranslations('Contact');

  const {
    form,
    onSubmit,
    sentSuccessMessage,
    error,
    loading,
  } = useServerAction<IContactInput, typeof ContactSchema, typeof createContact, Locale[]>({
    schema: ContactSchema,
    action: createContact,
    bind: [locale!],
    sentMessage: tContact('messageSent'),
    translationKey: 'Contact',
    recaptchaActionName: 'contactForm',
    initialValue: { email: '', name: '', message: '' },
  });

  return (
    <Form
      action={onSubmit}
      className={cn('space-y-5', className)}
      error={error}
      form={form}
      loading={loading}
      primaryButtonText={tContact('send')}
      successMessage={sentSuccessMessage}
    >
      <TextField
        required
        label={withLabel ? tContact('email') : ''}
        name="email"
        placeholder={!withLabel ? tContact('email') : ''}
        type="email"
      />
      <TextField
        required
        label={withLabel ? tContact('name') : ''}
        name="name"
        placeholder={!withLabel ? tContact('name') : ''}
      />
      <TextAreaField
        required
        label={withLabel ? tContact('message') : ''}
        name="message"
        placeholder={!withLabel ? tContact('message') : ''}
        rows={5}
      />
    </Form>
  );
};

export default ContactForm;
