import { Chip, Stack, Typography } from '@mui/material';
import { BanTypeEnum } from '@shared/types';
import { useTranslation } from 'react-i18next';

import SectionFooter from '@/components/SectionFooter';
import StatusDot from '@/components/StatusDot';
import CompactTable, { CompactTableColumn } from '@/components/table/CompactTable';
import { IBan } from '@/types/_core/user.type';
import { displayDate } from '@/utils/_core/date.utils';
import { BanStatus, getBanStatus } from '@/utils/_core/user.utils';

type Props = {
  bans: IBan[] | undefined;
};

type BanRow = IBan & { id: string; status: BanStatus };

const BAN_STATUS_COLORS: Record<BanStatus, 'error' | 'success' | 'default'> = {
  active: 'error',
  lifted: 'success',
  expired: 'default',
};

/**
 * Every ban the account went through, newest first: how long, why, who decided it, and how it
 * ended — lifted by hand (by whom, when) or run out. Bans older than the traceability change carry
 * neither their author nor their lift, and say so instead of leaving the cells blank.
 */
const UserBans = ({ bans = [] }: Props) => {
  const { t } = useTranslation(['user']);

  const rows: BanRow[] = bans
    .map((ban, index) => ({ ...ban, id: String(index), status: getBanStatus(ban) }))
    .reverse();

  const renderPeriod = (ban: BanRow) => {
    const start = displayDate(ban.bannedAt, false);

    if (ban.type === BanTypeEnum.PERMANENT) {
      return (
        <Stack>
          <span>{t('user:detail.bans.since', { date: start })}</span>
          <Typography color="textSecondary" variant="caption">{t('user:detail.bans.noEndDate')}</Typography>
        </Stack>
      );
    }

    return (
      <Stack>
        <span>{`${start} → ${displayDate(ban.until, false)}`}</span>
        {ban.status === 'active' && (
          <Typography color="textSecondary" variant="caption">{t('user:detail.bans.ongoing')}</Typography>
        )}
      </Stack>
    );
  };

  const renderLift = (ban: BanRow) => {
    if (ban.liftedBy) {
      return t('user:detail.bans.liftedBy', {
        name: ban.liftedBy.name,
        date: displayDate(ban.liftedAt, false),
      });
    }
    if (ban.liftedAt) return t('user:detail.bans.liftedOn', { date: displayDate(ban.liftedAt, false) });
    if (ban.status === 'active') return '—';

    return t('user:detail.bans.unknown');
  };

  const columns: CompactTableColumn<BanRow>[] = [
    { id: 'period', label: t('user:detail.bans.period'), render: renderPeriod },
    {
      id: 'type',
      label: t('user:detail.bans.type'),
      render: (ban) => (
        <Chip
          color={ban.type === BanTypeEnum.PERMANENT ? 'error' : 'warning'}
          label={t(`user:bans.types.${ban.type === BanTypeEnum.PERMANENT ? 'permanent' : 'temporary'}`)}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      id: 'reason',
      label: t('user:detail.bans.reason'),
      render: (ban) => (
        <Stack>
          <span>{t(`user:bans.reasons.${ban.reason}`)}</span>
          {ban.reasonDetails && (
            <Typography color="textSecondary" variant="caption">{`« ${ban.reasonDetails} »`}</Typography>
          )}
        </Stack>
      ),
    },
    {
      id: 'bannedBy',
      label: t('user:detail.bans.bannedBy'),
      render: (ban) => ban.bannedBy?.name ?? t('user:detail.bans.unknown'),
    },
    { id: 'lift', label: t('user:detail.bans.lift'), render: renderLift },
    {
      id: 'status',
      label: t('user:detail.bans.status'),
      nowrap: true,
      render: (ban) => (
        <StatusDot
          color={BAN_STATUS_COLORS[ban.status]}
          label={t(`user:detail.bans.statuses.${ban.status}`)}
        />
      ),
    },
  ];

  const hasUntracedBan = rows.some((ban) => !ban.bannedBy);

  return (
    <Stack>
      <CompactTable columns={columns} emptyTitle={t('user:detail.bans.empty')} rows={rows} />
      {rows.length > 0 && hasUntracedBan && <SectionFooter note={t('user:detail.bans.note')} />}
    </Stack>
  );
};

export default UserBans;
