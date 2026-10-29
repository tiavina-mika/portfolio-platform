/**
 * MetaTextField component is a custom text field input designed
 * for handling meta title and meta description fields.
 * It integrates with react-hook-form for form state management and validation.
 * The component provides helper text, error messages, and character count feedback to the user.
 * It also supports translations using react-i18next.
 *
 * @param {TextFieldProps} props - The properties for the MetaTextField component.
 * either 'metaTitle' or 'metaDescription'.
 * @param {'metaTitle' | 'metaDescription'} props.name - The name of the field,
 * Additional properties for the TextFieldInput component.
 * @param {CustomTextFieldInputProps} props.inputProps
 *
 * @returns {JSX.Element} The rendered MetaTextField component.
 */

import { Stack, FormHelperText, type Theme } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import i18n from '@/config/i18n';
import { cutText } from '@/utils/utils';

import TextFieldInput, { CustomTextFieldInputProps } from '../inputs/TextFieldInput';

export type TextFieldProps = {
  name: string;
  type: 'metaTitle' | 'metaDescription';
} & CustomTextFieldInputProps;

// helper text for meta title and meta description
const getTranslatedDescription = (type: TextFieldProps['type']): string => {
  return type === 'metaTitle'
    ? i18n.t('common:infoMessages.metaTitleHelper')
    : i18n.t('common:infoMessages.metaDescriptionHelper');
};

// translated label for meta title and meta description
const getTranslatedLabel = (type: TextFieldProps['type']): string => {
  return type === 'metaTitle'
    ? i18n.t('common:metaTitle')
    : i18n.t('common:metaDescription');
};

const getMaxLength = (type: TextFieldProps['type']): number => {
  return type === 'metaTitle'
    ? 70
    : 160;
};

// check if the value is valid
const checkIsSuccess = (value: string, maxLength: number): boolean => {
  if (value && value.length > 10 && value.length <= maxLength) {
    return true;
  }
  return false;
};

const classes = { filledHelperText: (theme: Theme) => ({ '&.MuiFormHelperText-root': { color: theme.palette.success.main } }) };

const MetaTextField = ({
  name, type, ...inputProps
}: TextFieldProps) => {
  const {
    t,
  } = useTranslation();
  // hooks
  const {
    control,
    formState: {
      errors,
    },
  } = useFormContext();

  const errorMessage = (errors as any)?.[name]?.message;
  const maxLength = getMaxLength(type);

  const getCharactersLength = (length: number, value: string): string => {
    return `${value.length}/${length} ${t('characters')}`;
  };

  return (
    <Controller
      control={control}
      defaultValue=""
      name={name}
      render={({
        field,
      }) => (
        <Stack>
          <TextFieldInput
            {...field}
            {...inputProps}
            multiline
            error={!!errors[name]}
            label={getTranslatedLabel(type)}
            tooltip={t('common:infoMessages.cutText', { length: maxLength })}
            rows={type === 'metaDescription'
              ? 3
              : 2}
          />
          <Stack direction="row" justifyContent="space-between">
            {/* display error message if any */}
            {errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}

            {/* text */}
            {!errorMessage && (
              field.value
                // display preview
                ? (
                  <FormHelperText>
                    <span css={{ marginRight: 10, fontWeight: 500 }}>{t('preview')} :</span>
                    {cutText(field.value, maxLength)}
                  </FormHelperText>
                )
                // display helper text
                : <FormHelperText> {getTranslatedDescription(type)}</FormHelperText>
            )}

            {/* characters length */}
            <FormHelperText
              error={!(checkIsSuccess(field.value, maxLength))}
              filled={checkIsSuccess(field.value, maxLength)}
              css={checkIsSuccess(field.value, maxLength)
                ? classes.filledHelperText
                : null}
            >
              {getCharactersLength(maxLength, field.value)}
            </FormHelperText>
          </Stack>
        </Stack>
      )}
    />
  );
};

export default MetaTextField;
