import { useTranslation } from 'react-i18next';

import Dialog from '@/components/Dialog';
import { CLIENT_FORM_ID } from '@/constants/_domain/client.constants';
import { IClient, IClientInput } from '@/types/_domain/client.type';

import ClientForm from './ClientForm';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: IClientInput) => void;
  // the client edited, left out to create one
  client?: IClient | null;
  loading?: boolean;
};

/**
 * The client form in a dialog, shared by "New client" and "Edit". The dialog stays open on a refusal
 * (an e-mail already used, for one), so nothing typed is lost; the page closes it once saved.
 */
const ClientFormDialog = ({
  open, onClose, onSubmit, client, loading,
}: Props) => {
  const { t } = useTranslation(['project', 'common']);

  return (
    <Dialog
      fullWidth
      formId={CLIENT_FORM_ID}
      loading={loading}
      maxWidth="sm"
      open={open}
      primaryButtonText={t('common:save')}
      title={client ? t('project:client.editClient', { name: client.name }) : t('project:client.createClient')}
      toggle={onClose}
    >
      {/* keyed on the client, so the form starts again from it each time the dialog opens */}
      {open && <ClientForm client={client} key={client?.id ?? 'new'} onSubmit={onSubmit} />}
    </Dialog>
  );
};

export default ClientFormDialog;
