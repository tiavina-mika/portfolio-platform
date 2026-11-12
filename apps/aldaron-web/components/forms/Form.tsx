'use client';

import { CircleAlert } from 'lucide-react';
import { useRef } from 'react';
import { FormProvider } from 'react-hook-form';

import type { FormEvent, ReactNode } from 'react';
import type { Schema } from 'zod';

import { cn } from '@/utils/app.utils';

import Alert from '../Alert';
import FormSubmitButton from './FormSubmitButton';
import Button from '../buttons/Button';

type Props = {
  formId?: string;
  onSubmit?: (() => void) | ((event: FormEvent<HTMLFormElement>) => void);
  action?: any;
  form?: any;
  children?: ReactNode;
  primaryButtonText?: string;
  buttonClassName?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  schema?: Schema<any, any>;
  // use form data (from form action) instead of form.getValues()
  useFormData?: boolean;
  buttonFullWidth?: boolean;
  /**
   * Text of the submit button while the form is being sent
   */
  loadingText?: string;
  /**
   * Text of the confirmation (or of the alert above the form when there is no `successTitle`)
   */
  successMessage?: string;
  /**
   * With `successMessage`, replaces the form by a confirmation panel with this title
   */
  successTitle?: string;
  /**
   * Label and action of the button of the confirmation panel (e.g. "Send another message")
   */
  successResetText?: string;
  onSuccessReset?: () => void;
  error?: string;
  /**
   * With `error`, shows a banner (title, text, retry action) inside the form instead of the alert
   * above it. The retry action submits the form again, with the values already typed.
   */
  errorTitle?: string;
  retryText?: string;
  withButton?: boolean;
  /**
   * Turns off the browser's own validation bubbles, for a form that shows its errors under its fields
   * @default false
   */
  noValidate?: boolean;
};

/**
 * use dual onSubmit and action to handle form submission
 * when the form is valid, the action will be called, else the onSubmit will be called
 * validate the form when submitting the form (with form.trigger() or schema.safeParse())
 * @issue: https://github.com/react-hook-form/react-hook-form/issues/10391
 * @param param0
 * @returns
 */
const getOtherProps = ({
  form,
  action,
  schema,
  onSubmit,
  useFormData,
}: Pick<Props, 'form' | 'action' | 'schema' | 'onSubmit' | 'useFormData'>) => {
  if (useFormData && action) return { action };

  // once the form is valid, return the action (server action)
  if (form.formState.isValid) {
    return {
      // @see: https://github.com/TheEdoRan/next-safe-action/issues/29
      action: () => action(schema?.parse(form.getValues())),
    };
  }

  // client side submit
  return {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onSubmit: onSubmit || form.handleSubmit(() => {}),
  };
};

const Form = ({
  formId,
  onSubmit,
  action,
  form,
  children,
  primaryButtonText,
  className,
  buttonClassName,
  loading,
  schema,
  useFormData = true,
  disabled = false,
  buttonFullWidth = true,
  withButton = true,
  loadingText,
  successMessage,
  successTitle,
  successResetText,
  onSuccessReset,
  error,
  errorTitle,
  retryText,
  noValidate = false,
}: Props) => {
  const formRef = useRef<HTMLFormElement>(null);

  // CASE success: the form is replaced by a confirmation, there is nothing left to fill in
  if (successMessage && successTitle) {
    return (
      <section className="flex flex-col items-start gap-3" role="status">
        <div className="flex items-center gap-3 text-xl font-bold text-success">
          <svg
            aria-hidden
            className="flex-none"
            fill="none"
            height={28}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
            width={28}
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <h2>{successTitle}</h2>
        </div>
        <p className="text-base leading-[1.55] text-muted-foreground">{successMessage}</p>
        {successResetText && (
          <Button
            fullWidth={false}
            onClick={onSuccessReset}
            variant="outline"
          >
            {successResetText}
          </Button>
        )}
      </section>
    );
  }

  const hasErrorBanner = !!error && !!errorTitle;

  return (
    <FormProvider {...form}>
      {successMessage && (
        <Alert variant="success">{successMessage}</Alert>
      )}
      {error && !hasErrorBanner && (
        <Alert variant="destructive">{error}</Alert>
      )}
      <form
        className={cn('space-y-6', className)}
        id={formId}
        noValidate={noValidate}
        ref={formRef}
        {...getOtherProps({ form, action, schema, onSubmit, useFormData })}
      >
        {/* CASE failure: icon + text, never the color alone, with a single way to try again */}
        {hasErrorBanner && (
          <div
            role="alert"
            className={`
              flex items-start gap-3 rounded-lg bg-danger-subtle px-4 py-3.5 text-sm leading-[1.45]
              text-foreground
            `}
          >
            <CircleAlert aria-hidden className="flex-none text-destructive-text" size={20} />
            <div>
              <b className="block text-[15px] font-bold">{errorTitle}</b>
              {error}
              {retryText && (
                <>
                  {' '}
                  <button
                    onClick={() => formRef.current?.requestSubmit()}
                    type="button"
                    className={`
                      cursor-pointer font-semibold underline decoration-[1.5px] underline-offset-4
                      focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring
                    `}
                  >
                    {retryText}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {children}

        {withButton && (
          <div>
            {!formId && (
              <FormSubmitButton
                className={buttonClassName}
                disabled={disabled}
                fullWidth={buttonFullWidth}
                loading={loading}
                loadingText={loadingText}
                text={primaryButtonText || 'Save'}
              />
            )}
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export default Form;
