import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Stack, Typography } from '@mui/material';
import { ClientKindEnum } from '@shared/domain-types';
import pick from 'lodash/pick';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import ToggleButtonsField from '@/components/form/inputs/ToggleButtonsField';
import {
  CLIENT_ADDRESS_FIELDS, CLIENT_FORM_ID, CLIENT_INPUT_FIELDS, CLIENT_KIND_OPTIONS,
} from '@/constants/_domain/client.constants';
import { IClient, IClientInput } from '@/types/_domain/client.type';
import { clientSchema } from '@/validations/_domain/client.validations';

type Props = {
  onSubmit: (values: IClientInput) => void;
  // the client edited, left out to create one
  client?: IClient | null;
};

const twoColumns = { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 };

/**
 * Who the client is, how to reach them and where to send the paperwork. Mounted each time the dialog
 * opens, so it starts from the client edited — or from an empty company — never from what was typed
 * and cancelled the time before.
 */
const ClientForm = ({ onSubmit, client }: Props) => {
  const { t } = useTranslation(['project', 'common']);

  const form = useForm<IClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: client
      ? pick(client, CLIENT_INPUT_FIELDS)
      : { kind: ClientKindEnum.COMPANY },
  });

  return (
    <Form form={form} formId={CLIENT_FORM_ID} onSubmit={onSubmit}>
      <Stack spacing={2.5}>
        <ToggleButtonsField
          disableDeselect
          label={t('project:client.kind')}
          name="kind"
          options={CLIENT_KIND_OPTIONS}
        />
        <TextField
          fullWidth
          required
          label={t('common:name')}
          name="name"
        />
        <Box sx={twoColumns}>
          <TextField
            fullWidth
            required
            label={t('project:client.email')}
            name="email"
            type="email"
          />
          <TextField
            fullWidth
            label={t('project:client.phone')}
            name="phone"
            type="tel"
          />
        </Box>
        <TextField fullWidth label={t('project:client.taxId')} name="taxId" />
        <Stack component="fieldset" spacing={2} sx={{ border: 0, m: 0, p: 0 }}>
          <Typography component="legend" variant="subtitle2">
            {t('common:address')}
          </Typography>
          <Box sx={twoColumns}>
            {CLIENT_ADDRESS_FIELDS.map((field) => (
              <TextField
                fullWidth
                key={field}
                label={t(`project:client.addressFields.${field}`)}
                name={`address.${field}`}
              />
            ))}
          </Box>
        </Stack>
        <TextField
          fullWidth
          multiline
          helperText={t('project:client.notesHelper')}
          label={t('project:client.notes')}
          minRows={3}
          name="notes"
        />
      </Stack>
    </Form>
  );
};

export default ClientForm;
