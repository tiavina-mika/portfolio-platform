import {
  Autocomplete, Button, Stack, TextField, Typography,
} from '@mui/material';
import debounce from 'lodash/debounce';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FiPlus } from 'react-icons/fi';
import { useDispatch } from 'react-redux';

import { AUTOCOMPLETE_SEARCH_DEBOUNCE_MS } from '@/constants/_core/app.constants';
import { CLIENT_COLLECTION } from '@/constants/_domain/client.constants';
import ClientFormDialog from '@/containers/_domain/client/ClientFormDialog';
import { useProtect } from '@/hooks/_core/useProtect';
import { createOrUpdateClient, searchActiveClients } from '@/redux/actions/_domain/client.action';
import { IClient, IClientInput } from '@/types/_domain/client.type';
import { IQuoteClient, IQuoteFormValues } from '@/types/_domain/quote.type';

type Props = {
  // the client of the quote edited, shown before any search
  initialClient?: IQuoteClient | null;
};

const toQuoteClient = ({ id, name, email }: IClient): IQuoteClient => ({ id, name, email });

/**
 * The client the quote is written for, picked among the active clients by a part of the name or of
 * the e-mail. A client met for the first time is created from here, without leaving the quote: the
 * "New client" shortcut opens the client form and picks the client once saved.
 */
const QuoteClientField = ({ initialClient }: Props) => {
  const { t } = useTranslation(['project', 'common']);
  const dispatch = useDispatch();
  const { canCreate } = useProtect(CLIENT_COLLECTION);
  const { control, setValue, formState: { errors } } = useFormContext<IQuoteFormValues>();

  const [selected, setSelected] = useState<IQuoteClient | null>(initialClient ?? null);
  const [options, setOptions] = useState<IQuoteClient[]>(initialClient ? [initialClient] : []);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isSavingClient, setIsSavingClient] = useState(false);

  const search = useMemo(() => debounce((text: string) => {
    dispatch(searchActiveClients(text, (clients: IClient[]) => setOptions(clients.map(toQuoteClient))));
  }, AUTOCOMPLETE_SEARCH_DEBOUNCE_MS), [dispatch]);

  // the first clients are proposed as soon as the form opens, before anything is typed
  useEffect(() => {
    search('');
    return () => search.cancel();
  }, [search]);

  const pick = (client: IQuoteClient | null): void => {
    setSelected(client);
    setValue('client', client?.id ?? '', { shouldValidate: true, shouldDirty: true });
  };

  // the dialog stays open on a refusal (an e-mail already used), so nothing typed is lost
  const handleCreateClient = async (values: IClientInput): Promise<void> => {
    setIsSavingClient(true);
    const error = await dispatch(createOrUpdateClient(values, null, (client: IClient) => {
      const created = toQuoteClient(client);

      setOptions((previous) => [created, ...previous]);
      pick(created);
    }));

    setIsSavingClient(false);
    if (!error) setIsClientDialogOpen(false);
  };

  return (
    <Stack spacing={1}>
      <Controller
        control={control}
        name="client"
        render={() => (
          <Autocomplete
            fullWidth
            filterOptions={(clients) => clients}
            getOptionLabel={(client: IQuoteClient) => client.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText={t('project:quote.noClient')}
            onChange={(_, client) => pick(client)}
            options={options}
            value={selected}
            onInputChange={(_, text, reason) => {
              if (reason === 'input') search(text);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                error={!!errors.client}
                helperText={errors.client?.message}
                label={t('project:quote.client')}
              />
            )}
            renderOption={({ key, ...optionProps }, client) => (
              <li key={key} {...optionProps}>
                <Stack>
                  <Typography component="span" variant="body2">{client.name}</Typography>
                  <Typography color="text.secondary" component="span" variant="caption">{client.email}</Typography>
                </Stack>
              </li>
            )}
          />
        )}
      />
      {canCreate && (
        <div>
          <Button
            onClick={() => setIsClientDialogOpen(true)}
            size="small"
            startIcon={<FiPlus aria-hidden />}
          >
            {t('project:quote.newClient')}
          </Button>
        </div>
      )}
      <ClientFormDialog
        loading={isSavingClient}
        onClose={() => setIsClientDialogOpen(false)}
        onSubmit={handleCreateClient}
        open={isClientDialogOpen}
      />
    </Stack>
  );
};

export default QuoteClientField;
