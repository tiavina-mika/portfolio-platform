'use client';

import { CircleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';

import { Label } from '@/components/ui/Label';

export type FormFieldProps = {
  /**
   * The visible name of the field
   */
  label?: ReactNode;
  /**
   * The `id` of the control the label names
   */
  htmlFor?: string;
  /**
   * Help shown under the control; replaced by the error when there is one
   */
  description?: ReactNode;
  /**
   * The error message; announced as soon as it appears
   */
  error?: ReactNode;
  /**
   * The `id` of the error, for the `aria-describedby` of the control
   */
  errorId?: string;
  /**
   * Adds a star after the label
   * @default false
   */
  required?: boolean;
  /**
   * Adds "optional" after the label
   * @default false
   */
  optional?: boolean;
  /**
   * The control (an `Input`, a `Select`…)
   */
  children: ReactNode;
};

/**
 * A control with its label, its help and its error message. The error takes the place of the help.
 */
const FormField = ({
  label, htmlFor, description, error, errorId, required = false, optional = false, children,
}: FormFieldProps) => {
  const t = useTranslations('Common');

  return (
    <div className="grid min-w-0 gap-1.5">
      {label && (
        <Label className="items-baseline gap-1" htmlFor={htmlFor}>
          {label}
          {required && <span aria-hidden className="text-brand-text">*</span>}
          {optional && (
            <span className="text-[13px] font-normal text-muted-foreground">({t('optional').toLowerCase()})</span>
          )}
        </Label>
      )}
      {children}
      {error
        ? (
          <div
            className="flex items-start gap-1.5 text-[13px] leading-[1.45] text-destructive-text"
            id={errorId}
            role="alert"
          >
            <CircleAlert
              aria-hidden
              className="mt-0.5 shrink-0"
              size={14}
              strokeWidth={2}
            />
            <span>{error}</span>
          </div>
        )
        : description && (
          <div className="text-[13px] leading-[1.45] text-muted-foreground">{description}</div>
        )}
    </div>
  );
};

export default FormField;
