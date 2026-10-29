'use client';

import { useTranslations } from 'next-intl';

import TextField from '@/components/forms/fields/TextField';
import Form from '@/components/forms/Form';
import { useServerAction } from '@/hooks/useServerAction';
import { Locale } from '@/i18n/config';
import { createNewsletter } from '@/server/mutations/newsletter.mutation';
import { INewsletterInput } from '@/types/app.type';
import { NewsletterSchema } from '@/validations/app.validations';

type Props = {
  locale: Locale;
};
const NewsletterForm = ({ locale }: Props) => {
  const tContact = useTranslations('Contact');

  const {
    form,
    onSubmit,
    sentSuccessMessage,
    error,
    loading,
  } = useServerAction<
    INewsletterInput,
    typeof NewsletterSchema,
    typeof createNewsletter,
    Locale[]
  >({
    schema: NewsletterSchema,
    action: createNewsletter,
    sentMessage: tContact('subscribeWithSuccess'),
    translationKey: 'Contact',
    bind: [locale],
    recaptchaActionName: 'newsletterForm',
  });

  return (
    <Form
      action={onSubmit}
      className="flex flex-row items-center space-y-0 space-x-6"
      error={error}
      form={form}
      loading={loading}
      primaryButtonText={tContact('subscribe')}
      successMessage={sentSuccessMessage}
    >
      <div className="flex-1">
        <TextField
          required
          name="email"
          placeholder={tContact('email')}
          type="email"
          className={`
            bg-white
            dark:bg-dark-500
          `}
        />
      </div>
    </Form>
  );
};

export default NewsletterForm;
