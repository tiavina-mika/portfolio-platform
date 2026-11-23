import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Stack } from '@mui/material';
import { MissionStatusEnum } from '@shared/domain-types';
import { canChangeMissionParties, getMissionPhases } from '@shared/domain-utils';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import DatePickerField from '@/components/form/fields/DatePickerField';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { MISSION_FORM_ID } from '@/constants/_domain/mission.constants';
import ClientPickerField from '@/containers/_domain/client/ClientPickerField';
import { ISelectOption } from '@/types/_core/app.type';
import { IMission, IMissionFormValues, IMissionPrefill } from '@/types/_domain/mission.type';
import { missionSchema } from '@/validations/_domain/mission.validation';

import MissionAssigneeField from './MissionAssigneeField';
import MissionQuoteField from './MissionQuoteField';

type Props = {
  onSubmit: (values: IMissionFormValues) => void;
  // the mission edited, left out to create one
  mission?: IMission | null;
  // on a new mission created from an accepted quote: its client, title and quote
  prefill?: IMissionPrefill | null;
};

const twoColumns = { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 };

const toFormValues = (mission: IMission): IMissionFormValues => ({
  client: mission.client.id,
  title: mission.title,
  quote: mission.quote?.id ?? null,
  assignee: mission.assignee?.id ?? null,
  phase: mission.phase ?? null,
  startDate: mission.startDate ? new Date(mission.startDate) : null,
  endDate: mission.endDate ? new Date(mission.endDate) : null,
  description: mission.description ?? '',
});

/**
 * The work done for a client: what it is, for which accepted quote, who does it, where it stands
 * inside its status and when. The status itself moves from the list, never from here. Mounted each
 * time the dialog opens, so it starts from the mission edited, the quote it is created from, or empty.
 */
const MissionForm = ({ onSubmit, mission, prefill }: Props) => {
  const { t } = useTranslation(['project', 'common']);
  const status = mission?.status ?? MissionStatusEnum.PLANNED;

  const getDefaultValues = (): Partial<IMissionFormValues> => {
    if (mission) return toFormValues(mission);
    if (prefill) {
      return {
        client: prefill.client.id,
        title: prefill.title,
        quote: prefill.quote.id,
        startDate: null,
        endDate: null,
      };
    }

    return { startDate: null, endDate: null };
  };

  const form = useForm<IMissionFormValues>({
    resolver: zodResolver(missionSchema),
    defaultValues: getDefaultValues(),
  });

  // only the phases of the mission's own status: a phase of another status would be refused
  const phaseOptions = useMemo((): ISelectOption[] => getMissionPhases(status).map((phase) => ({
    label: t(`project:mission.phases.${phase}`),
    value: phase,
  })), [status, t]);

  // once the work started, the client and the quote stay: the server holds it too
  const lockedHelperText = canChangeMissionParties(status)
    ? undefined
    : t('project:mission.partiesLocked', { status: t(`project:mission.statuses.${status}`) });

  return (
    <Form form={form} formId={MISSION_FORM_ID} onSubmit={onSubmit}>
      <Stack spacing={2.5}>
        <ClientPickerField
          initialClient={mission?.client ?? prefill?.client}
          lockedHelperText={lockedHelperText}
        />
        <TextField
          fullWidth
          required
          label={t('project:mission.title')}
          name="title"
        />
        <MissionQuoteField
          initialQuote={mission?.quote ?? prefill?.quote}
          lockedHelperText={lockedHelperText}
        />
        <Box sx={twoColumns}>
          <MissionAssigneeField initialAssignee={mission?.assignee} />
          <SelectField
            isClearable
            helperText={t('project:mission.phaseHelper', { status: t(`project:mission.statuses.${status}`) })}
            label={t('project:mission.phase')}
            name="phase"
            options={phaseOptions}
            placeholder={t('project:mission.noPhase')}
          />
        </Box>
        <Box sx={twoColumns}>
          <DatePickerField label={t('project:mission.startDate')} name="startDate" />
          <DatePickerField label={t('project:mission.endDate')} name="endDate" />
        </Box>
        <TextField
          fullWidth
          multiline
          label={t('project:mission.description')}
          minRows={3}
          name="description"
        />
      </Stack>
    </Form>
  );
};

export default MissionForm;
