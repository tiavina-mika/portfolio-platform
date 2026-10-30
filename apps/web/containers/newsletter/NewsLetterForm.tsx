'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import Button from '@/components/buttons/Button';
import TextField from '@/components/forms/fields/TextField';
import Form from '@/components/forms/Form';
import StatusBanner from '@/components/StatusBanner';
import { useIsOnline } from '@/hooks/useIsOnline';
import { useServerAction } from '@/hooks/useServerAction';
import { Locale } from '@/i18n/config';
import { createNewsletter } from '@/server/mutations/newsletter.mutation';
import { INewsletterInput } from '@/types/app.type';
import { createNewsletterEmailSchema } from '@/validations/app.validations';

type Props = {
  locale: Locale;
};

/**
 * The newsletter subscription form, wired to its server action (with reCAPTCHA). An invalid address
 * never leaves the browser: its error shows under the field, which gets the focus.
 */
const NewsletterForm = ({ locale }: Props) => {
  const t = useTranslations('Newsletter');
  const tCommon = useTranslations('Common');
  const isOnline = useIsOnline();

  const schema = useMemo(
    () => createNewsletterEmailSchema({ required: t('emailRequired'), invalid: t('emailInvalid') }),
    [t]
  );

  const {
    form,
    onSubmit,
    sentSuccessMessage,
    error,
    loading,
  } = useServerAction<INewsletterInput, typeof schema, typeof createNewsletter, Locale[]>({
    schema,
    action: createNewsletter,
    initialValue: { email: '' },
    sentMessage: t('subscribeWithSuccess'),
    failedMessage: t('failText'),
    translationKey: 'Newsletter',
    bind: [locale],
    recaptchaActionName: 'newsletterForm',
  });

  const handleAction = async (values: FormData) => {
    if (!isOnline) return;

    const isValid = await form.trigger();

    if (!isValid) {
      form.setFocus('email');
      return;
    }

    await onSubmit(values);
  };

  // CASE success: nothing left to fill in, the confirmation takes the place of the form
  if (sentSuccessMessage) {
    return <p className="text-base font-semibold" role="status">{sentSuccessMessage}</p>;
  }

  return (
    <Form
      noValidate
      action={handleAction}
      className="flex flex-col gap-3 space-y-0"
      error={error}
      errorTitle={t('failTitle')}
      form={form}
      retryText={tCommon('tryAgain')}
      withButton={false}
    >
      {!isOnline && (
        <StatusBanner size="sm" variant="offline">
          {t('offlineText')}
        </StatusBanner>
      )}
      <div className={`
        flex flex-col gap-3
        md:flex-row md:items-start
      `}
      >
        <TextField
          autoComplete="email"
          disabled={loading}
          label={t('emailLabel')}
          name="email"
          placeholder={t('emailPlaceholder')}
          rootClassName="min-w-0 flex-1"
          type="email"
        />
        <Button
          aria-busy={loading}
          disabled={!isOnline}
          fullWidth={false}
          type="submit"
          className={`
            w-full flex-none px-6 py-4
            md:mt-7 md:w-auto
          `}
        >
          {loading ? t('sending') : t('submit')}
        </Button>
      </div>
    </Form>
  );
};

export default NewsletterForm;
