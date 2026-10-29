
import {
  Alert, Box, Button, Stack, useTheme,
} from '@mui/material';
import { FormEvent, ReactNode, useMemo } from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { ResponsiveStyleValue, SxProps, Theme } from '@mui/system';

import { useBreakpoint } from '@/hooks/useBreakpoint';

const classes = {
  buttons: (direction: 'row' | 'column', fixedButtons: boolean) => (theme: Theme) => {
    const values: Record<string, any> = {
      position: 'fixed' as const,
      top: 4,
      zIndex: 2000,
      right: '16vw',
      flexDirection: 'row' as const,
      [theme.breakpoints.down('xl')]: { right: '22vw' },
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
      };
    }
    return {
      display: 'flex',
      flexDirection: 'column' as const,
      ...(fixedButtons
        ? values
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

export interface IFormProps {

  /**
   * Used to identify the form when the submit button is outside the form
   * e.g: when the form is in a dialog
   */
  formId?: string;
  onSubmit?: (() => void) | ((event: FormEvent<HTMLFormElement>) => void);
  form?: any;

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
}

const Form = ({
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
  ...formProps
}: IFormProps) => {
  const theme = useTheme();
  const isSmallScreen = useBreakpoint();
  const {
    t,
  } = useTranslation();

  const {
    formState: {
      isDirty, isValid,
    },
    getFieldState,
  } = form;

  const isFullWidth = useMemo(() => {
    if (isSmallScreen) return true;
    if (buttonDirection === 'row') return false;
    return isSmallScreen || buttonFullWidth;
  }, [isSmallScreen, buttonFullWidth, buttonDirection]);

  const formComponent = (
    <Box
      noValidate
      autoComplete="off"
      component="form"
      id={formId}
      onSubmit={onSubmit}
      sx={[{ width }, ...(Array.isArray(sx) ? sx : [sx ?? {}])]}
      {...formProps}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {error}
        </Alert>
      )}
      <Stack direction={direction} spacing={2}>
        {children}
        {/* use the local id if no id is defined */}
        <div css={classes.buttons(buttonDirection, fixedButtons)}>
          {!onSecondaryButtonClick && buttonDirection === 'row' && !isSmallScreen && <div />}
          {/* buttons */}
          {!formId && (
            <Button
              className={buttonClassName}
              disabled={isDisabled && (!isDirty || getFieldState().invalid || !isValid)}
              fullWidth={isFullWidth}
              type="submit"
              variant="contained"
              css={{
                fontSize: 18,
                fontWeight: 500,
                py: direction === 'column'
                  ? '0.7rem'
                  : 0,
                bgcolor: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.primary.main,
                  opacity: 0.8,
                },
              }}
            >
              {loading
                ? '...'
                : primaryButtonText ?? t('save')}
            </Button>
          )}
          {onSecondaryButtonClick && (
            <Button
              className={secondaryButtonClassName}
              css={classes.secondaryButton(buttonDirection, fixedButtons)}
              fullWidth={isFullWidth}
              onClick={onSecondaryButtonClick}
            >
              {secondaryButtonText ?? t('cancel')}
            </Button>
          )}
        </div>
      </Stack>
    </Box>
  );

  if (!form) return formComponent;

  return <FormProvider {...form}>{formComponent}</FormProvider>;
};

export default Form;
