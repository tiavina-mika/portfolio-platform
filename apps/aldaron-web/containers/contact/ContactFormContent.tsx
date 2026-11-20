'use client';

import { useTranslations } from 'next-intl';
import { Controller } from 'react-hook-form';

import type { UseFormReturn } from 'react-hook-form';

import TextAreaField from '@/components/forms/fields/TextAreaField';
import TextField from '@/components/forms/fields/TextField';
import Form from '@/components/forms/Form';
import FormSubmitButton from '@/components/forms/FormSubmitButton';
import ChoiceChip from '@/components/forms/inputs/ChoiceChip';
import StatusBanner from '@/components/StatusBanner';
import { IQuoteRequestInput } from '@/types/contact.type';
import { QUOTE_BRING_KEYS, QUOTE_FIELD_MAX_LENGTHS, QUOTE_SUPPORT_KEYS } from '@/utils/contact.constants';

import ContactFiles from './ContactFiles';

export type ContactFormContentProps = {
  form: UseFormReturn<IQuoteRequestInput>;
  action: (values: FormData) => void | Promise<void>;
  /**
   * The request is being sent: the fields and the button are off
   * @default false
   */
  isLoading?: boolean;
  /**
   * The request was sent: the confirmation shows under the button and the form stays off
   * @default false
   */
  isSent?: boolean;
  /**
   * The device has no connection: a notice shows above the fields and the submit button is off. It wins
   * over `error`.
   * @default false
   */
  isOffline?: boolean;
  error?: string;
  /**
   * Shows the field that holds the estimate taken from the simulator
   * @default false
   */
  hasEstimate?: boolean;
  files: File[];
  rejectedNames: string[];
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (index: number) => void;
};

const ERROR_CLASS_NAME = 'm-0 text-sm leading-[1.4] font-medium text-destructive-text';
const LEGEND_CLASS_NAME = 'mb-2 flex items-baseline gap-1 p-0 text-sm leading-[1.3] font-medium';
const HINT_CLASS_NAME = 'text-[13px] leading-[1.45] text-muted-foreground';

/**
 * The fields, the offline notice, the failure banner and the confirmation of the quote request form, with
 * no server action behind: everything comes through props. The errors show under the fields once the
 * visitor tried to send, and go away as they are fixed.
 */
const ContactFormContent = ({
  form,
  action,
  isLoading = false,
  isSent = false,
  isOffline = false,
  error,
  hasEstimate = false,
  files,
  rejectedNames,
  onFilesAdd,
  onFileRemove,
}: ContactFormContentProps) => {
  const t = useTranslations('ContactPage');
  const tCommon = useTranslations('Common');
  const isBusy = isLoading || isSent;

  return (
    <Form
      noValidate
      action={action}
      className="grid w-full max-w-[640px] gap-5 space-y-0"
      error={isOffline ? undefined : error}
      errorTitle={t('failTitle')}
      form={form}
      retryText={tCommon('tryAgain')}
      withButton={false}
    >
      {isOffline && <StatusBanner size="sm" variant="offline">{t('offline')}</StatusBanner>}

      <TextField
        required
        autoComplete="name"
        disabled={isBusy}
        label={t('name')}
        name="name"
      />
      <TextField
        required
        autoComplete="email"
        disabled={isBusy}
        label={t('email')}
        name="email"
        type="email"
      />
      <TextAreaField
        required
        className="min-h-24"
        disabled={isBusy}
        label={t('product')}
        name="product"
        rows={3}
      />

      {/* ------------- supports ------------- */}
      <Controller
        control={form.control}
        name="supports"
        render={({ field, fieldState }) => (
          <fieldset className="m-0 grid min-w-0 gap-2 border-0 p-0">
            <legend className={LEGEND_CLASS_NAME}>
              {t('supports')}
              <span aria-hidden className="text-brand-text">*</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {QUOTE_SUPPORT_KEYS.map(key => (
                <ChoiceChip
                  checked={field.value[key]}
                  disabled={isBusy}
                  key={key}
                  label={t(`supportOptions.${key}`)}
                  name={`supports.${key}`}
                  onChange={event => field.onChange({ ...field.value, [key]: event.target.checked })}
                  type="checkbox"
                />
              ))}
            </div>
            <span className={HINT_CLASS_NAME}>{t('supportsHint')}</span>
            {fieldState.error && <p className={ERROR_CLASS_NAME} role="alert">{fieldState.error.message}</p>}
          </fieldset>
        )}
      />

      {/* ------------- what the visitor brings ------------- */}
      <Controller
        control={form.control}
        name="bring"
        render={({ field }) => (
          <fieldset className="m-0 grid min-w-0 gap-2 border-0 p-0">
            <legend className={LEGEND_CLASS_NAME}>
              {t('bring')}
              <span className="text-[13px] font-normal text-muted-foreground">
                ({tCommon('optional').toLowerCase()})
              </span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {QUOTE_BRING_KEYS.map(key => {
                const isChecked = field.value === key;

                return (
                  <ChoiceChip
                    checked={isChecked}
                    disabled={isBusy}
                    key={key}
                    label={t(`bringOptions.${key}`)}
                    name="bring"
                    // a radio cannot be unchecked: a second click on the chosen one clears the choice
                    onChange={() => field.onChange(key)}
                    onClick={() => isChecked && field.onChange('')}
                    type="radio"
                    value={key}
                  />
                );
              })}
            </div>
          </fieldset>
        )}
      />

      {hasEstimate && (
        <TextAreaField
          optional
          className="min-h-30 font-mono text-sm leading-normal font-medium"
          description={t('estimateHint')}
          disabled={isBusy}
          label={t('estimate')}
          maxLength={QUOTE_FIELD_MAX_LENGTHS.estimate}
          name="estimate"
          rows={6}
        />
      )}
      <TextAreaField
        optional
        className="min-h-24"
        description={t('needsHint')}
        disabled={isBusy}
        label={t('needs')}
        maxLength={QUOTE_FIELD_MAX_LENGTHS.needs}
        name="needs"
        rows={4}
      />

      <ContactFiles
        disabled={isBusy}
        files={files}
        onAdd={onFilesAdd}
        onRemove={onFileRemove}
        rejectedNames={rejectedNames}
      />

      {/* ------------- consent ------------- */}
      <Controller
        control={form.control}
        name="consent"
        render={({ field, fieldState }) => (
          <div className="grid gap-2">
            <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-[1.45]">
              <input
                checked={field.value}
                className="mt-0.5 size-5 flex-none accent-brand"
                disabled={isBusy}
                name={field.name}
                onChange={event => field.onChange(event.target.checked)}
                type="checkbox"
              />
              <span>
                {t('consent')}
                {' '}
                <span aria-hidden className="text-brand-text">*</span>
              </span>
            </label>
            {fieldState.error && <p className={ERROR_CLASS_NAME} role="alert">{fieldState.error.message}</p>}
          </div>
        )}
      />

      {/* ------------- send ------------- */}
      <div className="grid justify-items-start gap-3">
        <FormSubmitButton
          disabled={isOffline || isSent}
          fullWidth={false}
          loading={isLoading}
          loadingText={t('sending')}
          text={t('submit')}
          variant="brand"
        />
        <span className="max-w-[70ch] font-mono text-sm leading-normal font-medium text-muted-foreground">
          {t('note')}
        </span>
        {isSent && (
          <p
            className="m-0 rounded-md border border-success px-5 py-4 font-semibold text-success"
            role="status"
          >
            {t('sent')}
          </p>
        )}
      </div>
    </Form>
  );
};

export default ContactFormContent;
