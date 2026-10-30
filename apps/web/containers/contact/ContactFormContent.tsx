'use client';

import { useTranslations } from 'next-intl';

import type { UseFormReturn } from 'react-hook-form';

import TextAreaField from '@/components/forms/fields/TextAreaField';
import TextField from '@/components/forms/fields/TextField';
import Form from '@/components/forms/Form';
import StatusBanner from '@/components/StatusBanner';
import { IContactInput } from '@/types/app.type';
import { cn } from '@/utils/app.utils';

export type ContactFormContentProps = {
  form: UseFormReturn<IContactInput>;
  action: (values: FormData) => void | Promise<void>;
  className?: string;
  loading?: boolean;
  error?: string;
  successMessage?: string;
  onSuccessReset?: () => void;
  /**
   * The device has no connection: a notice shows above the fields and the submit button is off
   * (the fields stay open, so the message can be written meanwhile). It wins over `error`.
   */
  offline?: boolean;
};

/**
 * The fields, the offline notice, the failure banner and the confirmation of the contact form, with
 * no server action behind: everything comes through props.
 */
const ContactFormContent = ({
  form,
  action,
  className,
  loading,
  error,
  successMessage,
  onSuccessReset,
  offline = false,
}: ContactFormContentProps) => {
  const tContact = useTranslations('Contact');
  const tCommon = useTranslations('Common');

  return (
    <Form
      action={action}
      buttonFullWidth={false}
      className={cn('flex flex-col gap-5 space-y-0', className)}
      disabled={offline}
      error={offline ? undefined : error}
      errorTitle={tContact('failTitle')}
      form={form}
      loading={loading}
      loadingText={tContact('sending')}
      onSuccessReset={onSuccessReset}
      primaryButtonText={tContact('send')}
      retryText={tCommon('tryAgain')}
      successMessage={successMessage}
      successResetText={tContact('again')}
      successTitle={tContact('successTitle')}
    >
      {offline && <StatusBanner size="sm" variant="offline">{tContact('offline')}</StatusBanner>}
      <div className="flex flex-col gap-4">
        <TextField
          required
          autoComplete="name"
          label={tContact('name')}
          name="name"
          placeholder={tContact('yourFullName')}
        />
        <TextField
          required
          autoComplete="email"
          label={tContact('email')}
          name="email"
          placeholder={tContact('emailExample')}
          type="email"
        />
        <TextAreaField
          required
          label={tContact('message')}
          maxLength={500}
          name="message"
          placeholder={tContact('writeSomething')}
          rows={5}
        />
      </div>
    </Form>
  );
};

export default ContactFormContent;
