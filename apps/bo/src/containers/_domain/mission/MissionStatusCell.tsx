import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import StatusDot from '@/components/StatusDot';
import { MISSION_STATUS_TONES } from '@/constants/_domain/mission.constants';
import { IMission } from '@/types/_domain/mission.type';

type Props = {
  mission: IMission;
};

// where the mission stands: its status, and under it the phase inside that status when one is set
const MissionStatusCell = ({ mission }: Props) => {
  const { t } = useTranslation(['project']);

  return (
    <Stack spacing={0.5} sx={{ alignItems: 'flex-start' }}>
      <Typography component="span" variant="subtitle1">
        <StatusDot
          color={MISSION_STATUS_TONES[mission.status]}
          label={t(`project:mission.statuses.${mission.status}`)}
        />
      </Typography>
      {mission.phase && (
        <Typography color="text.secondary" component="span" variant="caption">
          {t(`project:mission.phases.${mission.phase}`)}
        </Typography>
      )}
    </Stack>
  );
};

export default MissionStatusCell;
