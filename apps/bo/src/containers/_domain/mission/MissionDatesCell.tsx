import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { IMission } from '@/types/_domain/mission.type';
import { displayDate } from '@/utils/_core/date.utils';

type Props = {
  mission: IMission;
};

// when the work starts and ends; a date not set yet says so instead of showing nothing
const MissionDatesCell = ({ mission }: Props) => {
  const { t } = useTranslation(['project']);
  const notSet = t('project:mission.dateNotSet');

  return (
    <Stack spacing={0.25}>
      <Typography component="span" variant="body2">
        {t('project:mission.startsOn', {
          date: mission.startDate ? displayDate(mission.startDate, false, true) : notSet,
        })}
      </Typography>
      <Typography color="text.secondary" component="span" variant="caption">
        {t('project:mission.endsOn', {
          date: mission.endDate ? displayDate(mission.endDate, false, true) : notSet,
        })}
      </Typography>
    </Stack>
  );
};

export default MissionDatesCell;
