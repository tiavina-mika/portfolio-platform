import { Stack, Typography } from '@mui/material';

import { IClient } from '@/types/_domain/client.type';

type Props = {
  client: IClient;
};

// who the client is and how to reach them: the name, with the e-mail it is known by under it
const ClientNameCell = ({ client }: Props) => (
  <Stack spacing={0.25} sx={{ minWidth: 0 }}>
    <Typography component="span" sx={{ fontWeight: 'fontWeightMedium' }} variant="body2">
      {client.name}
    </Typography>
    <Typography
      noWrap
      color="text.secondary"
      component="span"
      variant="caption"
    >
      {client.email}
    </Typography>
  </Stack>
);

export default ClientNameCell;
