
import {
  Alert, Box, Button, Stack,
} from '@mui/material';
import {
  FormEvent, ReactNode, useEffect, useMemo, useRef,
} from 'react';
import {
  FormProvider, type FieldValues, type SubmitHandler, type UseFormReturn,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { ResponsiveStyleValue, SxProps, Theme } from '@mui/system';

import { useBreakpoint } from '@/hooks/_core/useBreakpoint';

const classes = {
  buttons: (
    direction: 'row' | 'column',
    fixedButtons: boolean,
    stickyButtons: boolean
  ) => (theme: Theme) => {
    const values: Record<string, any> = {
      position: 'fixed' as const,
      top: 4,
      zIndex: 2000,
      right: '16vw',
      flexDirection: 'row' as const,
      [theme.breakpoints.down('xl')]: { right: '22vw' },
    };
    const stickyValues: Record<string, any> = {
      position: 'sticky' as const,
      bottom: 0,
      zIndex: 1,
      backgroundColor: theme.palette.background.paper,
      borderTop: `1px solid ${theme.palette.divider}`,
      paddingTop: theme.spacing(1.5),
      paddingBottom: theme.spacing(1.5),
    };

    if (direction === 'row') {
      return {
        [theme.breakpoints.up('md')]: {
          display: 'flex',
          flexDirection: 'row' as const,
          justifyContent: 'space-between' as const,
          ...(fixedButtons
            ? values
            : {}),
        },
        ...(stickyButtons
          ? stickyValues
          : {}),
      };
    }
    return {
      display: 'flex',
      flexDirection: 'column' as const,
      ...(fixedButtons
        ? values
        : {}),
      ...(stickyButtons
        ? stickyValues
        : {}),
    };
  },
  secondaryButton: (direction: 'row' | 'column', fixedButtons: boolean) => (theme: Theme) => {
    if (direction === 'row' || fixedButtons) {
      return { [theme.breakpoints.up('md')]: { order: -1 } };
    }
    return {};
  },
};

export interface IFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues = TFieldValues
> {

  /**
   * Used to identify the form when the submit button is outside the form
   * e.g: when the form is in a dialog
   */
  formId?: string;
  onSubmit: SubmitHandler<TTransformedValues>;
  form: UseFormReturn<TFieldValues, TContext, TTransformedValues>;

  /**
   * loading state in the form button
   * @default false
   */
  loading?: boolean;

  /**
   * If the button should be full width
   * @default true
   */
  buttonFullWidth?: boolean;
  children?: ReactNode;
  primaryButtonText?: string;
  error?: string;
  width?: string | number;
  sx?: SxProps<Theme>;
  buttonClassName?: string;

  /**
   * The direction of the form elements (alignment of the fields)
   * @default 'column'
   */
  direction?: ResponsiveStyleValue<'row' | 'row-reverse' | 'column' | 'column-reverse'>;
  /**
   * Enable or disable the form submit button externally
   * @default true
   */
  isDisabled?: boolean;
  /**
   * Text for the secondary button (e.g. Cancel)
   */
  secondaryButtonText?: string;
  /**
   * Action to perform when clicking on the secondary button (e.g. cancel button)
   * @example reset the form, close the dialog, go back to the previous page...
   * @returns
   */
  onSecondaryButtonClick?: () => void;
  /**
   * Class name for the secondary button (e.g. cancel button)
   */
  secondaryButtonClassName?: string;

  /**
   * if the buttons should be displayed in a row (horizontal) or column (vertical)
   * @default 'column'
   */
  buttonDirection?: 'row' | 'column';

  /**
   * Fixed buttons on the top right of the screen
   * @default false
   */
  fixedButtons?: boolean;

  /**
   * Sticky buttons at the bottom of the viewport (useful for long multi-block/multi-step forms)
   * @default false
   */
  stickyButtons?: boolean;

  /**
   * When provided, the primary button becomes a manual trigger (`type="button"`) instead of a
   * native form submit, and native form submission (e.g. pressing Enter in a field) is
   * redirected to it as well. Use this for an intermediate step of a multi-step wizard sharing
   * one `useForm` across steps — `handleSubmit` always validates the *entire* schema, so wiring
   * it to a "Next" button would validate not-yet-visited steps' fields too and block navigation
   * on their required fields. Call `form.trigger([...currentStepFieldNames])` yourself inside
   * this handler to validate only the current step before advancing.
   * @default undefined — falls back to the normal type="submit" + handleSubmit(onSubmit) behavior
   */
  onPrimaryButtonClick?: () => void;
}

const Form = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues = TFieldValues
>({
  formId,
  onSubmit,
  form,
  loading,
  children,
  primaryButtonText,
  onSecondaryButtonClick,
  secondaryButtonText,
  error,
  direction = 'column',
  width = '100%',
  sx,
  buttonClassName,
  secondaryButtonClassName,
  isDisabled = true,
  buttonFullWidth = true,
  buttonDirection = 'column',
  fixedButtons = false,
  stickyButtons = false,
  onPrimaryButtonClick,
  ...formProps
}: IFormProps<TFieldValues, TContext, TTransformedValues>) => {
  const isSmallScreen = useBreakpoint();
  const {
    t,
  } = useTranslation();

  const {
    formState: {
      isDirty, isValid, errors, submitCount,
    },
  } = form;

  const formRef = useRef<HTMLFormElement>(null);

  // DOM query, not RHF's setFocus/shouldFocusError — our field refs point to MUI's non-focusable root div
  useEffect(() => {
    if (!submitCount || !Object.keys(errors).length) return;

    const invalidFieldSelector = [
      'input[aria-invalid="true"]',
      'textarea[aria-invalid="true"]',
      'select[aria-invalid="true"]',
      '[role="combobox"][aria-invalid="true"]',
    ].join(', ');
    const firstInvalidField = formRef.current?.querySelector<HTMLElement>(invalidFieldSelector);

    firstInvalidField?.focus();
    firstInvalidField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [submitCount, errors]);

  const isFullWidth = useMemo(() => {
    if (isSmallScreen) return true;
    if (buttonDirection === 'row') return false;
    return isSmallScreen || buttonFullWidth;
  }, [isSmallScreen, buttonFullWidth, buttonDirection]);

  /*
   * a block action closing a card (login, sign-up, a one-column form) is the large step of the
   * button scale — at the base row height a full-width slab reads as a thin strip. A footer laying
   * its actions out in a row is a toolbar instead, and stands on the normal button row.
   */
  const buttonSize = buttonDirection === 'row'
    ? 'medium'
    : 'large';

  /*
   * native submit (e.g. Enter key in a field) must go through the same manual handler as the
   * primary button — otherwise it would fall back to handleSubmit and validate the whole schema
   *
   * stopPropagation is required because a <form> rendered inside a Dialog (e.g. the category
   * creation dialog opened from a page/article form) is portaled to document.body in the DOM,
   * but React still bubbles the "submit" event through the *React* tree — so without this, saving
   * that inner form would also trigger the outer page/article form's onSubmit
   */
  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.stopPropagation();

    if (onPrimaryButtonClick) {
      event.preventDefault();
      onPrimaryButtonClick();
      return;
    }

    form.handleSubmit(onSubmit)(event);
  };

  const formComponent = (
    <Box
      noValidate
      autoComplete="off"
      component="form"
      id={formId}
      onSubmit={handleFormSubmit}
      ref={formRef}
      {...formProps}
      sx={[{ width }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {error}
        </Alert>
      )}
      <Stack direction={direction} spacing={2}>
        {children}
        {/* the footer is dropped entirely when the form is submitted from outside it (formId) and
            has no secondary action — an empty row would still take the stack's own spacing */}
        {(!formId || onSecondaryButtonClick) && (
          <div css={classes.buttons(buttonDirection, fixedButtons, stickyButtons)}>
            {!onSecondaryButtonClick && buttonDirection === 'row' && !isSmallScreen && <div />}
            {/* buttons */}
            {!formId && (
              <Button
                className={buttonClassName}
                disabled={isDisabled && (!isDirty || !isValid)}
                fullWidth={isFullWidth}
                loading={loading}
                onClick={onPrimaryButtonClick}
                size={buttonSize}
                type={onPrimaryButtonClick ? 'button' : 'submit'}
                variant="contained"
              >
                {primaryButtonText ?? t('save')}
              </Button>
            )}
            {onSecondaryButtonClick && (
              <Button
                className={secondaryButtonClassName}
                css={classes.secondaryButton(buttonDirection, fixedButtons)}
                disabled={loading}
                fullWidth={isFullWidth}
                onClick={onSecondaryButtonClick}
                size={buttonSize}
              >
                {secondaryButtonText ?? t('cancel')}
              </Button>
            )}
          </div>
        )}
      </Stack>
    </Box>
  );

  return <FormProvider {...form}>{formComponent}</FormProvider>;
};

export default Form;
