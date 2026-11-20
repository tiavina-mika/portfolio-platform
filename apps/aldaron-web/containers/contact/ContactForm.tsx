'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { useIsOnline } from '@/hooks/useIsOnline';
import { useServerAction } from '@/hooks/useServerAction';
import { Locale } from '@/i18n/config';
import { createQuoteRequest } from '@/server/mutations/app.mutation';
import { IQuoteRequestInput } from '@/types/contact.type';
import {
  QUOTE_BRING_KEYS,
  QUOTE_FORM_RECAPTCHA_ACTION,
  QUOTE_SUPPORT_KEYS,
} from '@/utils/contact.constants';
import { addQuoteFiles } from '@/utils/contact.utils';
import { clearStoredEstimate, readStoredEstimate } from '@/utils/estimate.utils';
import { createQuoteRequestSchema } from '@/validations/contact.validation';

import ContactFormContent from './ContactFormContent';

export type ContactFormProps = {
  locale: Locale;
};

const EMPTY_SUPPORTS = { web: false, app: false, mobile: false, bo: false };

const INITIAL_VALUES: IQuoteRequestInput = {
  name: '',
  email: '',
  product: '',
  supports: EMPTY_SUPPORTS,
  bring: '',
  needs: '',
  estimate: '',
  fileNames: [],
  consent: false,
};

/**
 * The quote request form, wired to its server action (with reCAPTCHA). It starts from the estimate the
 * simulator left in the browser, if any, and forgets that estimate once the request is sent. An invalid
 * request never leaves the browser: its errors show under the fields and the first one gets the focus.
 */
const ContactForm = ({ locale }: ContactFormProps) => {
  const t = useTranslations('ContactPage');
  const isOnline = useIsOnline();
  const [files, setFiles] = useState<File[]>([]);
  const [rejectedNames, setRejectedNames] = useState<string[]>([]);
  const [hasStoredEstimate, setHasStoredEstimate] = useState(false);

  const schema = useMemo(
    () => createQuoteRequestSchema({
      name: t('errors.name'),
      email: t('errors.email'),
      product: t('errors.product'),
      supports: t('errors.supports'),
      consent: t('errors.consent'),
    }),
    [t]
  );

  const {
    form, onSubmit, sentSuccessMessage, error, loading,
  } = useServerAction<IQuoteRequestInput, typeof schema, typeof createQuoteRequest, Locale[]>({
    schema,
    action: createQuoteRequest,
    initialValue: INITIAL_VALUES,
    sentMessage: t('sent'),
    failedMessage: t('failText'),
    translationKey: 'ContactPage',
    bind: [locale],
    recaptchaActionName: QUOTE_FORM_RECAPTCHA_ACTION,
  });

  // the form starts from the estimate of the simulator
  useEffect(() => {
    const estimate = readStoredEstimate();

    if (!estimate) return;

    form.setValue('estimate', estimate.text);
    form.setValue(
      'supports',
      Object.fromEntries(QUOTE_SUPPORT_KEYS.map(key => [key, estimate.sup[key]])) as
        IQuoteRequestInput['supports']
    );
    form.setValue(
      'bring',
      QUOTE_BRING_KEYS.find(key => key === estimate.bring) ?? ''
    );
    setHasStoredEstimate(estimate.text !== '');
  }, [form]);

  // the estimate went with the request: it is not offered again
  useEffect(() => {
    if (sentSuccessMessage) clearStoredEstimate();
  }, [sentSuccessMessage]);

  const handleAction = async () => {
    if (!isOnline || loading) return;

    const isValid = await form.trigger();

    if (!isValid) {
      const [firstInvalidField] = Object.keys(form.formState.errors) as (keyof IQuoteRequestInput)[];

      if (firstInvalidField) form.setFocus(firstInvalidField);
      return;
    }

    await onSubmit({ ...form.getValues(), fileNames: files.map(({ name }) => name) });
  };

  const handleFilesAdd = (incoming: File[]) => {
    const result = addQuoteFiles(files, incoming);

    setFiles(result.files);
    setRejectedNames(result.rejectedNames);
  };

  const handleFileRemove = (index: number) => {
    setFiles(previous => previous.filter((_file, fileIndex) => fileIndex !== index));
    setRejectedNames([]);
  };

  return (
    <ContactFormContent
      action={handleAction}
      error={error}
      files={files}
      form={form}
      hasEstimate={hasStoredEstimate && !sentSuccessMessage}
      isLoading={loading}
      isOffline={!isOnline}
      isSent={!!sentSuccessMessage}
      onFileRemove={handleFileRemove}
      onFilesAdd={handleFilesAdd}
      rejectedNames={rejectedNames}
    />
  );
};

export default ContactForm;
