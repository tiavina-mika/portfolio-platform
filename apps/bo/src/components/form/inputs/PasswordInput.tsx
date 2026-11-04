import { IconButton, type Theme } from '@mui/material';
import { MouseEvent, forwardRef } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

import { COLORS, PASSWORD_TOGGLE_ICON_SIZE } from '@/constants/_core/ui/ui.constants';
import { useToggle } from '@/hooks/_core/useToggle';

import TextFieldInput, { CustomTextFieldInputProps } from './TextFieldInput';

const PasswordInput = forwardRef<HTMLDivElement, CustomTextFieldInputProps>(({
  ...otherProps
}, ref) => {
  const {
    open: isPasswordShowed, toggle: toggleIsPasswordShowed,
  } = useToggle();
  const mode = otherProps.mode || 'light';

  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <div>
      <TextFieldInput
        ref={ref}
        {...otherProps}
        right={(
          /*
           * no `edge`: the end adornment is already flush with the field, so MUI's negative
           * edge margin would pull the eye past the outline
           */
          <IconButton
            aria-label="toggle password visibility"
            onClick={toggleIsPasswordShowed}
            onMouseDown={handleMouseDownPassword}
            size="small"
            css={(theme: Theme) => ({
              color: mode === 'light'
                ? theme.palette.text.secondary
                : COLORS.authTextFieldPlaceholder,
            })}
          >
            {/* toggle eye icon */}
            {isPasswordShowed
              ? <FiEyeOff size={PASSWORD_TOGGLE_ICON_SIZE} />
              : <FiEye size={PASSWORD_TOGGLE_ICON_SIZE} />}
          </IconButton>
        )}
        type={isPasswordShowed
          ? 'text'
          : 'password'}
      />
    </div>
  );
});

export default PasswordInput;
