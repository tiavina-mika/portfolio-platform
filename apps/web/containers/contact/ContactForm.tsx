'use client';

import { useTranslations } from 'next-intl';

import { useIsOnline } from '@/hooks/useIsOnline';
import { useServerAction } from '@/hooks/useServerAction';
import { Locale } from '@/i18n/config';
import { createContact } from '@/server/mutations/app.mutation';
import { IContactInput } from '@/types/app.type';
import { ContactSchema } from '@/validations/app.validations';

import ContactFormContent from './ContactFormContent';

export type ContactFormProps = {
  className?: string;
  locale?: Locale;
};

const ContactForm = ({
  className,
  locale,
}: ContactFormProps) => {
  const tContact = useTranslations('Contact');
  const isOnline = useIsOnline();

  const {
    form,
    onSubmit,
    reset,
    sentSuccessMessage,
    error,
    loading,
  } = useServerAction<IContactInput, typeof ContactSchema, typeof createContact, Locale[]>({
    schema: ContactSchema,
    action: createContact,
    bind: [locale!],
    sentMessage: tContact('messageSent'),
    failedMessage: tContact('failedMessage'),
    translationKey: 'Contact',
    recaptchaActionName: 'contactForm',
    initialValue: { email: '', name: '', message: '' },
  });

  return (
    <ContactFormContent
      action={onSubmit}
      className={className}
      error={error}
      form={form}
      loading={loading}
      offline={!isOnline}
      onSuccessReset={reset}
      successMessage={sentSuccessMessage}
    />
  );
};

export default ContactForm;
