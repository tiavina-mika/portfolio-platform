import { IconButton } from '@mui/material';
import { MouseEvent, forwardRef } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

import { useToggle } from '@/hooks/useToggle';
import { COLORS } from '@/utils/constants';

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
          <IconButton
            aria-label="toggle password visibility"
            edge="end"
            onClick={toggleIsPasswordShowed}
            onMouseDown={handleMouseDownPassword}
            css={{
              color: mode === 'light'
                ? '#000'
                : COLORS.authTextFieldPlaceholder,
            }}
          >
            {/* toggle eye icon */}
            {isPasswordShowed
              ? <FiEyeOff />
              : <FiEye />}
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
