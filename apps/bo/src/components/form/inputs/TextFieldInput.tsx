
import {
  InputAdornment, TextField as MUITextField, type TextFieldProps, type Theme,
} from '@mui/material';
import { ReactNode, forwardRef } from 'react';

import { COLORS, INPUT_ADORNMENT_GAP, INPUT_ADORNMENT_INSET } from '@/constants/_core/ui/ui.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

import InputLabel from '../InputLabel';

/**
 * add "*" to placeholder
 * @param placeholder
 * @param required
 * @returns
 */
const getPlaceholder = (placeholder?: string, required?: boolean): string => {
  if (!placeholder) return '';

  if (required) {
    return placeholder + ' *';
  }

  return placeholder;
};

const classes = {
  // border/focus-ring/label colors come from the theme's MuiOutlinedInput override
  lightTextField: (theme: Theme) => ({
    '& .MuiInput-underline:after': { borderBottomColor: theme.palette.primary.main },
  }),
  darkTextField: (theme: Theme) => ({
    '& .MuiInputLabel-root': {
      color: '#fff',
      fontSize: 18,
    },
    '& label.Mui-focused': { color: '#fff' },
    '& .MuiInput-underline:after': { borderBottomColor: 'none' },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        border: '1px solid rgba(225, 225, 255, 0.27)',
        fontSize: 15,
        borderRadius: 10,
        transition: 'all 0.125s ease 0s',
      },
      '& .MuiOutlinedInput-input': {
        color: '#fff',
        '&::placeholder': {
          color: COLORS.authTextFieldPlaceholder,
          opacity: 1,
        },
      },
      '&:hover fieldset': {
        border: '1px solid rgba(225, 225, 255, 0.4)',
        backgroundColor: 'rgba(185, 216, 233, 0.07)',
      },
      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
    },
  }),
  /*
   * an adorned control keeps the same inset as a plain one: the padding moves from the field up to
   * the row, so the icon — not the text — is what sits against the outline, and the two stay a
   * fixed gap apart whichever side the adornment is on
   */
  rootWithIcons: (theme: Theme) => ({
    '& .MuiInputBase-root': {
      paddingLeft: INPUT_ADORNMENT_INSET,
      paddingRight: INPUT_ADORNMENT_INSET,
    },
    '& .MuiInputBase-input': { padding: 0 },
    '& .MuiInputAdornment-root': {
      height: 'auto',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      color: getDesignTokens(theme).textMuted,
    },
    '& .MuiInputAdornment-positionStart': { marginRight: INPUT_ADORNMENT_GAP },
    '& .MuiInputAdornment-positionEnd': { marginLeft: INPUT_ADORNMENT_GAP },
  }),
};

export type CustomTextFieldInputProps = {
  bgcolor?: string;
  // if true, the label will not be set to shrink (useful for fixed labels)
  fixedLabel?: boolean;
  tooltip?: string;
  /*
   * what closes the label's row on the right — a character count, a limit. Only drawn with
   * `fixedLabel`: a floating MUI label sits inside the outline and has no row to carry it
   */
  labelEnd?: ReactNode;
  mode?: 'light' | 'dark';
  // left icon
  left?: ReactNode | string;
  // right icon
  right?: ReactNode;
  // right icon class name
  rightClassName?: string;
  // left icon class name
  leftClassName?: string;
  className?: string;

  /**
   * if true, the label will not be set to shrink (useful for fixed labels)
   */
  shrinkLabel?: boolean;
  placeholder?: string;
} & TextFieldProps;

/**
 * should use `forwardRef` if using an refactored component with emotion
 * issue: https://stackoverflow.com/questions/66312566/how-to-multiple-forwardref-in-separate-select-component
 */
const TextFieldInput = forwardRef<HTMLDivElement, CustomTextFieldInputProps>(
  (
    {
      left,
      right,
      className,
      tooltip,
      fixedLabel,
      labelEnd,
      rightClassName,
      leftClassName,
      placeholder,
      shrinkLabel,
      bgcolor,
      mode = 'light',
      ...otherProps
    },
    ref
  ) => {
    return (
      <div
        className="flexColumn stretchSelf"
        css={{
          flex: otherProps.fullWidth
            ? 1
            : 'initial', gap: 2,
        }}
      >
        {fixedLabel && (
          <InputLabel
            end={labelEnd}
            label={otherProps.label}
            required={otherProps.required}
            tooltip={tooltip}
          />
        )}
        <MUITextField
          className={className}
          placeholder={getPlaceholder(placeholder, otherProps.required)}
          ref={ref}
          css={[
            mode === 'light'
              ? classes.lightTextField
              : classes.darkTextField,
            // bgcolor,
            Boolean(left || right) && classes.rootWithIcons,
            { backgroundColor: bgcolor },
          ]}
          slotProps={{
            inputLabel: {
              ...(shrinkLabel && { shrink: shrinkLabel }),
              ...otherProps.slotProps?.inputLabel,
            },
            input: {
              ...otherProps.slotProps?.input,
              startAdornment: left
                ? (
                  <InputAdornment className={leftClassName} position="start">
                    <div className="flex1 flexCenter">{left}</div>
                  </InputAdornment>
                )
                : null,
              endAdornment: right
                ? (
                  <InputAdornment className={rightClassName} position="end">
                    <div className="flex1 flexCenter">{right}</div>
                  </InputAdornment>
                )
                : null,
            },
          }}
          {...otherProps}
          label={fixedLabel
            ? ''
            : otherProps.label}
        />
      </div>
    );
  }
);

export default TextFieldInput;
