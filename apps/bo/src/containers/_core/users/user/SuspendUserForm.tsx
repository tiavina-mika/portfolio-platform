import { zodResolver } from '@hookform/resolvers/zod';
import { Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import ToggleButtonsField from '@/components/form/inputs/ToggleButtonsField';
import {
  DEFAULT_SESSION_SUSPENSION_DURATION_HOURS, SESSION_SUSPENSION_DURATION_HOURS,
} from '@/constants/_core/user.constants';
import { ISelectOption } from '@/types/_core/app.type';
import { SuspendUserInput } from '@/types/_core/userSession.type';
import { suspendUserFormSchema } from '@/validations/_core/userSession.validations';

type Props = {
  formId: string;
  onSubmit: (input: SuspendUserInput) => void;
};

/**
 * The short suspension support applies from the sessions block of a user file — a stolen phone,
 * the time for the carrier to block the SIM. Only a duration and a reason: it is recorded as a
 * temporary ban, the full ban form (type, category, end date) stays in the account's menu.
 */
const SuspendUserForm = ({ formId, onSubmit }: Props) => {
  const { t } = useTranslation(['common', 'user']);

  const form = useForm<SuspendUserInput>({
    resolver: zodResolver(suspendUserFormSchema),
    defaultValues: { durationHours: DEFAULT_SESSION_SUSPENSION_DURATION_HOURS, reason: '' },
  });

  const durationOptions: ISelectOption[] = SESSION_SUSPENSION_DURATION_HOURS.map((hours) => ({
    label: t(`user:sessions.suspension.durations.${hours}`),
    value: hours,
  }));

  return (
    <Form
      form={form}
      formId={formId}
      onSubmit={onSubmit}
    >
      <ToggleButtonsField
        disableDeselect
        label={t('user:sessions.suspension.duration')}
        name="durationHours"
        options={durationOptions}
        size="small"
      />
      <TextField
        required
        label={t('user:sessions.suspension.reason')}
        name="reason"
        placeholder={t('user:sessions.suspension.reasonPlaceholder')}
        type="text"
      />
      <Typography color="textSecondary" variant="caption">
        {t('user:sessions.suspension.auditNote')}
      </Typography>
    </Form>
  );
};

export default SuspendUserForm;
