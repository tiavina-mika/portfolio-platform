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
  /** shows the table of contents built from the headings next to the editor (off by default) */
  withTableOfContents?: boolean;
} & Omit<TextEditorProps, 'onChange'>;

const TextEditorField = ({
  name, required, withTableOfContents, ...inputProps
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
          disableTableOfContents={!withTableOfContents}
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
          labels={withTableOfContents
            ? {
              ...inputProps.labels,
              tableOfContent: {
                label: t('cms:tableOfContents'),
                noContentLabel: t('cms:tableOfContentsEmpty'),
              },
            }
            : inputProps.labels}
        />
      )}
    />
  );
};

export default TextEditorField;
