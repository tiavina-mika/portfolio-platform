import { Alert, AlertTitle, Typography } from '@mui/material';
import { useFormContext, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { localeOptions } from '@/utils/_core/settings.utils';

type Props = {
  className?: string;
};

/**
 * The banner over a CMS form naming everything the schema refuses, in one place. A form split
 * into four sections can hold a refused field in a section nobody has opened, so the count alone
 * is what tells an editor the save did not go through — the summary rail then says which section
 * to go to.
 *
 * It reads the errors itself rather than being handed them: the form re-renders on every
 * keystroke, and this way the subscription stays inside the one band that displays them.
 */
const CmsFormErrorsAlert = ({ className }: Props) => {
  const {
    t,
  } = useTranslation('cms');
  const {
    control,
  } = useFormContext();
  const {
    errors,
  } = useFormState({ control });

  /*
   * `errors` is keyed by field name and its values are typed as a union wide enough to include a
   * nested error tree, which the flat `<locale>:<field>` names this form registers never produce
   */
  const entries = Object.entries(errors) as [string, { message?: string } | undefined][];

  if (!entries.length) return null;

  /*
   * a translated field is registered as `<locale>:<field>`, so its message says what is wrong
   * without saying in which language — the locale is prefixed back onto the line here
   */
  const messages = entries.map(([name, error]) => {
    const message = error?.message ?? '';
    const [prefix] = name.split(':');
    const locale = localeOptions.find((option) => option.value === prefix);

    return locale
      ? `${locale.label} — ${message}`
      : message;
  }).filter((message) => !!message);

  return (
    <Alert className={className} severity="error">
      <AlertTitle>{t('cms:cmsForm.fieldsToFix', { count: entries.length })}</AlertTitle>
      {messages.map((message, index) => (
        <Typography key={index} variant="body2">{message}</Typography>
      ))}
    </Alert>
  );
};

export default CmsFormErrorsAlert;
