import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import StatusDot from '@/components/StatusDot';
import { CLIENT_STATUS_TONES } from '@/constants/_domain/client.constants';
import { IClient } from '@/types/_domain/client.type';

type Props = {
  client: IClient;
};

// whether the client is still worked with, archived, or erased
const ClientStatusCell = ({ client }: Props) => {
  const { t } = useTranslation(['project']);

  return (
    <Typography component="span" variant="subtitle1">
      <StatusDot
        color={CLIENT_STATUS_TONES[client.status]}
        label={t(`project:client.statuses.${client.status}`)}
      />
    </Typography>
  );
};

export default ClientStatusCell;
