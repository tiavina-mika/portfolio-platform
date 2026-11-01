import { Stack, Typography } from '@mui/material';
import { BanTypeEnum } from '@shared/types';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Items from '@/components/Items';
import SectionFooter from '@/components/SectionFooter';
import StatusDot from '@/components/StatusDot';
import { ISelectOption } from '@/types/_core/app.type';
import { IBan } from '@/types/_core/user.type';
import { displayDate } from '@/utils/_core/date.utils';

type Props = {
  teamBan?: IBan;
};

/**
 * Whether the account is kept out of the platform: a ban by the team (temporary or permanent, with
 * its reason and author). It is named even when it holds nothing, so "none" is read as a fact
 * rather than as a missing row.
 */
const UserSuspensionSummary = ({ teamBan }: Props) => {
  const { t } = useTranslation(['user']);
  const isSuspended = !!teamBan;

  const renderTeamBan = (): ReactNode => {
    if (!teamBan) return t('user:detail.suspension.none');

    const author = teamBan.bannedBy
      ? t('user:detail.suspension.since', {
        name: teamBan.bannedBy.name,
        date: displayDate(teamBan.bannedAt, false),
      })
      : t('user:detail.suspension.sinceNoAuthor', { date: displayDate(teamBan.bannedAt, false) });

    return (
      <Stack>
        <span>
          {teamBan.type === BanTypeEnum.PERMANENT
            ? t('user:detail.suspension.permanent')
            : t('user:detail.suspension.temporaryUntil', { date: displayDate(teamBan.until) })}
        </span>
        <Typography color="textSecondary" variant="caption">
          {[
            t(`user:bans.reasons.${teamBan.reason}`),
            teamBan.reasonDetails && `« ${teamBan.reasonDetails} »`,
            author,
          ].filter(Boolean).join(' · ')}
        </Typography>
      </Stack>
    );
  };

  const items: ISelectOption<ReactNode>[] = [
    {
      label: t('user:detail.suspension.state'),
      value: (
        <StatusDot
          color={isSuspended ? 'error' : 'success'}
          label={isSuspended ? t('user:detail.suspension.suspended') : t('user:detail.suspension.active')}
        />
      ),
    },
    { label: t('user:detail.suspension.teamBan'), value: renderTeamBan() },
  ];

  return (
    <Stack>
      <Items items={items} />
      <SectionFooter note={t('user:detail.suspension.note')} />
    </Stack>
  );
};

export default UserSuspensionSummary;
