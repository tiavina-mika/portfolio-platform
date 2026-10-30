import {
  Alert, AlertTitle, Box, Button, Typography,
} from '@mui/material';
import { BanTypeEnum } from '@shared/types';
import { useTranslation } from 'react-i18next';

import { USER_SUSPENSION_BANNER_GAP } from '@/constants/_core/ui/entity.constants';
import { IBan } from '@/types/_core/user.type';
import { DateType } from '@/types/_core/utils.type';
import { displayDate } from '@/utils/_core/date.utils';
import { UserSuspension } from '@/utils/_core/user.utils';

type Props = {
  // the ban the team put on the account that is in force, if any
  teamBan?: IBan;
  // the suspensions a domain policy put on it (repeated cancellations…), active ones only
  policySuspensions: UserSuspension[];
  // set on a deleted account: nothing is kept out any more, the account is gone
  deletedAt?: DateType;
  canLift: boolean;
  onLift: () => void;
};

const classes = {
  causes: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: USER_SUSPENSION_BANNER_GAP,
  },
};

/**
 * What is true of the whole account before any of its blocks is read: that it is kept out of the
 * platform — by whom, until when and why — or that it was deleted. Both causes of a suspension are
 * stated when both are active, since lifting it lifts both.
 */
const UserSuspensionBanner = ({
  teamBan, policySuspensions, deletedAt, canLift, onLift,
}: Props) => {
  const { t } = useTranslation(['user']);

  if (deletedAt) {
    return (
      <Alert severity="error">
        <AlertTitle>{t('user:detail.banner.deleted', { date: displayDate(deletedAt) })}</AlertTitle>
        {t('user:detail.banner.deletedDescription')}
      </Alert>
    );
  }

  if (!teamBan && policySuspensions.length === 0) return null;

  const isPermanent = teamBan?.type === BanTypeEnum.PERMANENT;
  const hasBothCauses = !!teamBan && policySuspensions.length > 0;

  const renderTeamBan = (ban: IBan) => {
    const facts = [
      t(`user:bans.reasons.${ban.reason}`),
      ban.reasonDetails && `« ${ban.reasonDetails} »`,
      ban.bannedBy && t('user:detail.banner.by', { name: ban.bannedBy.name }),
    ].filter(Boolean).join(' · ');

    return (
      <div>
        <AlertTitle>
          {isPermanent
            ? t('user:detail.banner.teamPermanent', { date: displayDate(ban.bannedAt, false) })
            : t('user:detail.banner.teamUntil', { date: displayDate(ban.until) })}
        </AlertTitle>
        <Typography variant="body2">{facts}</Typography>
      </div>
    );
  };

  return (
    <Alert
      severity={isPermanent ? 'error' : 'warning'}
      action={canLift && (
        <Button
          color="inherit"
          onClick={onLift}
          size="small"
          variant="outlined"
        >
          {t('user:detail.banner.liftSuspension')}
        </Button>
      )}
    >
      <Box css={classes.causes}>
        {teamBan && renderTeamBan(teamBan)}
        {policySuspensions.map((suspension) => (
          <div key={suspension.cause}>
            <AlertTitle>
              {t('user:detail.banner.policyUntil', { date: displayDate(suspension.until) })}
            </AlertTitle>
            <Typography variant="body2">{suspension.cause}</Typography>
          </div>
        ))}
        {hasBothCauses && <Typography variant="caption">{t('user:detail.banner.bothCauses')}</Typography>}
      </Box>
    </Alert>
  );
};

export default UserSuspensionBanner;
