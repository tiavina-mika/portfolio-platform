import {
  IconButton, List, ListItem, ListItemIcon, ListItemText, TextField, useTheme, type TextFieldProps,
} from '@mui/material';
import {
  forwardRef, type ReactNode, useState,
} from 'react';
import {
  FiCheck, FiEye, FiEyeOff, FiX,
} from 'react-icons/fi';
import {
  validatePasswordChecklist, type CheckPasswordOptions, type PasswordCheckListResult, type ValidationMessages,
} from 'validate-password-checklist';

type PasswordComplexityPass = PasswordCheckListResult['validationMessages'][number];

export type PasswordChecklistInputProps = {
  options?: CheckPasswordOptions;
  hidePasswordIcon?: ReactNode;
  showPasswordIcon?: ReactNode;
  validationMessages?: ValidationMessages;
} & TextFieldProps;

const PasswordChecklistInput = forwardRef<HTMLDivElement, PasswordChecklistInputProps>(({
  options,
  hidePasswordIcon,
  showPasswordIcon,
  validationMessages,
  onChange,
  ...inputProps
}, ref) => {
  const [rules, setRules] = useState<PasswordComplexityPass[]>([]);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const theme = useTheme();

  const toggleShowPassword = () => setIsPasswordVisible(prev => !prev);

  const handleChange: TextFieldProps['onChange'] = event => {
    const result = validatePasswordChecklist(event.target.value, validationMessages, options);

    setRules(result.validationMessages);
    onChange?.(event);
  };

  return (
    <>
      <TextField
        ref={ref}
        {...inputProps}
        onChange={handleChange}
        slotProps={{
          input: {
            endAdornment: (
              <IconButton aria-label="toggle password visibility" edge="end" onClick={toggleShowPassword}>
                {isPasswordVisible
                  ? hidePasswordIcon ?? <FiEyeOff />
                  : showPasswordIcon ?? <FiEye />}
              </IconButton>
            ),
          },
        }}
        type={isPasswordVisible
          ? 'text'
          : 'password'}
      />

      {rules.length > 0 && (
        <List sx={{ p: 0, mt: 1 }}>
          {rules.map((rule, index) => (
            <ListItem key={rule.key ?? index} sx={{ padding: 0 }}>
              <ListItemIcon sx={{ minWidth: 24, '& svg': { width: 18 } }}>
                {rule.passed
                  ? <FiCheck color={theme.palette.success.main} />
                  : <FiX color={theme.palette.error.main} />}
              </ListItemIcon>
              <ListItemText
                sx={{
                  color: rule.passed
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                }}
              >
                {rule.message}
              </ListItemText>
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
});

PasswordChecklistInput.displayName = 'PasswordChecklistInput';

export default PasswordChecklistInput;
