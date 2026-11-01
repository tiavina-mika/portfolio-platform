import {
  Alert, AlertTitle, Button, Typography,
} from '@mui/material';
import { BanTypeEnum } from '@shared/types';
import { useTranslation } from 'react-i18next';

import { IBan } from '@/types/_core/user.type';
import { DateType } from '@/types/_core/utils.type';
import { displayDate } from '@/utils/_core/date.utils';

type Props = {
  // the ban the team put on the account that is in force, if any
  teamBan?: IBan;
  // set on a deleted account: nothing is kept out any more, the account is gone
  deletedAt?: DateType;
  canLift: boolean;
  onLift: () => void;
};

/**
 * What is true of the whole account before any of its blocks is read: that it is kept out of the
 * platform — by whom, until when and why — or that it was deleted.
 */
const UserSuspensionBanner = ({
  teamBan, deletedAt, canLift, onLift,
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

  if (!teamBan) return null;

  const isPermanent = teamBan?.type === BanTypeEnum.PERMANENT;

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
      {renderTeamBan(teamBan)}
    </Alert>
  );
};

export default UserSuspensionBanner;
