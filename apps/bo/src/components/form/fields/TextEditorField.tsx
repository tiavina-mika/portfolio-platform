import { type Theme } from '@mui/material';
import { TextEditor, type TextEditorProps } from 'mui-tiptap-editor';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FONT_SIZE_META } from '@/constants/_core/ui/ui.constants';

const classes = {
  required: (theme: Theme) => ({
    color: theme.palette.text.secondary,
    marginRight: 6,
    marginLeft: 6,
    [theme.breakpoints.down('sm')]: { fontSize: FONT_SIZE_META },
  }),
};

type Props = {
  name: string;
  required?: boolean;
} & Omit<TextEditorProps, 'onChange'>;

const TextEditorField = ({
  name, required, ...inputProps
}: Props) => {
  const {
    t,
  } = useTranslation();

  const {
    control,
    formState: {
      errors,
    },
  } = useFormContext();

  return (
    <Controller
      control={control}
      defaultValue=""
      name={name}
      render={({
        field,
      }) => (
        <TextEditor
          {...field}
          {...inputProps}
          error={(errors as any)[name]?.message}
          label={required
            ? (
              <>
                {inputProps.label}
                {' '}
                <span css={classes.required}>({t('required')})</span>
              </>
            )
            : inputProps.label}
        />
      )}
    />
  );
};

export default TextEditorField;
