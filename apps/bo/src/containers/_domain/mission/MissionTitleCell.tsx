import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { IMission } from '@/types/_domain/mission.type';

type Props = {
  mission: IMission;
};

// which mission it is: its title, and the quote it carries out, named by its number
const MissionTitleCell = ({ mission }: Props) => {
  const { t } = useTranslation(['project']);

  return (
    <Stack spacing={0.25} sx={{ minWidth: 0 }}>
      <Typography
        noWrap
        component="span"
        sx={{ fontWeight: 'fontWeightMedium' }}
        variant="body2"
      >
        {mission.title}
      </Typography>
      <Typography color="text.secondary" component="span" variant="caption">
        {mission.quote
          ? t('project:mission.fromQuote', { number: mission.quote.number })
          : t('project:mission.withoutQuote')}
      </Typography>
    </Stack>
  );
};

export default MissionTitleCell;
