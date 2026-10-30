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

import {
  Stack, FormHelperText, Typography, type Theme,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import i18n from '@/config/i18n';
import { META_DESCRIPTION_MAX_LENGTH, META_TITLE_MAX_LENGTH } from '@/constants/_core/cms.constants';
import { FONT_SIZE_META } from '@/constants/_core/ui.constants';

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
    ? META_TITLE_MAX_LENGTH
    : META_DESCRIPTION_MAX_LENGTH;
};

// check if the value is valid
const checkIsSuccess = (value: string, maxLength: number): boolean => {
  if (value && value.length > 10 && value.length <= maxLength) {
    return true;
  }
  return false;
};

const classes = {
  /*
   * how much of the budget the value has used, on the label's own row. Tabular figures so the
   * count does not jog sideways as it is typed into
   */
  count: {
    fontSize: FONT_SIZE_META,
    fontVariantNumeric: 'tabular-nums',
  },
  // long enough to be worth indexing and still short enough to be printed whole
  countSuccess: (theme: Theme) => ({ color: theme.palette.success.main }),
  // either too short to say anything, or past what the search engine will print
  countRefused: (theme: Theme) => ({ color: theme.palette.error.main }),
};

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
            labelEnd={(
              <Typography
                component="span"
                css={[classes.count, checkIsSuccess(field.value, maxLength)
                  ? classes.countSuccess
                  : classes.countRefused]}
              >
                {getCharactersLength(maxLength, field.value)}
              </Typography>
            )}
            rows={type === 'metaDescription'
              ? 3
              : 2}
          />
          {/*
            * what the field is for, kept in place while it is being filled. It used to be swapped
            * for an echo of the value as soon as anything was typed, which restated the line the
            * admin was already looking at and took away the one sentence saying how much of it a
            * search engine will actually print
            */}
          {errorMessage
            ? <FormHelperText error>{errorMessage}</FormHelperText>
            : <FormHelperText>{getTranslatedDescription(type)}</FormHelperText>}
        </Stack>
      )}
    />
  );
};

export default MetaTextField;
