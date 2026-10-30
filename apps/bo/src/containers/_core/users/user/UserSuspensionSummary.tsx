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
import { UserSuspension } from '@/utils/_core/user.utils';

// one way the account can be kept out, with what it holds right now
export type UserSuspensionRow = {
  label: string;
  suspension: UserSuspension | null;
};

type Props = {
  teamBan?: IBan;
  // the causes a domain policy can put on the account, active or not — each is stated either way
  policyRows: UserSuspensionRow[];
};

/**
 * Whether the account is kept out of the platform, and by each of the ways it can be: a ban by the
 * team (temporary or permanent, with its reason and author) and every automatic suspension a
 * policy can put on it. Each one is named even when it holds nothing, so "none" is read as a fact
 * rather than as a missing row.
 */
const UserSuspensionSummary = ({ teamBan, policyRows }: Props) => {
  const { t } = useTranslation(['user']);
  const isSuspended = !!teamBan || policyRows.some((row) => !!row.suspension);

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

  const renderPolicy = (suspension: UserSuspension | null): ReactNode => {
    if (!suspension) return t('user:detail.suspension.none');

    return (
      <Stack>
        <span>{t('user:detail.suspension.temporaryUntil', { date: displayDate(suspension.until) })}</span>
        <Typography color="textSecondary" variant="caption">{suspension.cause}</Typography>
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
    ...policyRows.map((row) => ({ label: row.label, value: renderPolicy(row.suspension) })),
  ];

  return (
    <Stack>
      <Items items={items} />
      <SectionFooter note={t('user:detail.suspension.note')} />
    </Stack>
  );
};

export default UserSuspensionSummary;
